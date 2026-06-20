import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function syncFreeGames() {
  console.log("期間限定無料ゲーム情報を取得中...");

  // 1. CheapSharkから無料セールを取得
  const cheapRes = await fetch('https://www.cheapshark.com/api/1.0/deals?pageSize=100&storeID=1&onSale=1');
  const cheapDeals = await cheapRes.json();

  const limitedFreeFromCheap = cheapDeals
    .filter(deal => parseFloat(deal.salePrice) === 0)
    .map(deal => ({
      game_title: deal.title,
      store: 'Steam',
      price: 0,
      original_price: parseFloat(deal.normalPrice),
      is_free: true,
      is_free_limited: true,
      free_end_date: deal.expiry ? new Date(deal.expiry * 1000).toISOString() : null,
      store_url: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`
    }));

  console.log(`CheapShark: ${limitedFreeFromCheap.length}件の期間限定無料を検出`);

  // 2. Epic Games Storeから無料プロモーションを取得
  const epicRes = await fetch('https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions?locale=ja&country=JP&allowCountries=JP');
  const epicData = await epicRes.json();

  const limitedFreeFromEpic = [];
  const elements = epicData?.data?.Catalog?.searchStore?.elements || [];

  for (const game of elements) {
    if (game.promotions) {
      const currentPromo = game.promotions.promotionalOffers?.find(
        p => p.promotionalOffers?.some(o => o.discountSetting?.discountPercentage === 0)
      );

      if (currentPromo) {
        const offer = currentPromo.promotionalOffers.find(o => o.discountSetting?.discountPercentage === 0);
        limitedFreeFromEpic.push({
          game_title: game.title,
          store: 'Epic Games Store',
          price: 0,
          original_price: 0,
          is_free: true,
          is_free_limited: true,
          free_end_date: offer?.endDate || null,
          store_url: `https://store.epicgames.com/ja/p/${game.productSlug || ''}`
        });
      }
    }
  }

  console.log(`Epic Games: ${limitedFreeFromEpic.length}件の期間限定無料を検出`);

  // 3. FreeToGameから常時無料を取得
  const freeRes = await fetch('https://www.freetogame.com/api/games?platform=pc');
  const freeGames = await freeRes.json();

  const alwaysFree = freeGames.slice(0, 50).map(g => ({
    game_title: g.title,
    store: 'FreeToGame',
    price: 0,
    original_price: 0,
    is_free: true,
    is_free_limited: false,
    free_end_date: null,
    store_url: g.game_url
  }));

  // 4. 全データをDBに保存
  const allData = [...limitedFreeFromCheap, ...limitedFreeFromEpic, ...alwaysFree];

  for (const item of allData) {
    const { error } = await supabase.from('game_price_history').upsert(item, { onConflict: 'game_title' });
    if (error) console.error(`保存エラー (${item.game_title}):`, error.message);
    else console.log(`保存成功: ${item.game_title}`);
    await delay(100);
  }

  console.log("データ同期完了！");
}

syncFreeGames();
