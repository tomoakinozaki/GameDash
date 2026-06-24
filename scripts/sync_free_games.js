import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function syncFreeGames() {
  console.log("期間限定無料ゲーム情報を取得中...");

  // 1. CheapSharkからSteamのセール情報を取得（無料+割引、USD → JPY変換）
  const USD_TO_JPY = 150; // 固定レート（定期的に更新推奨）
  const cheapRes = await fetch('https://www.cheapshark.com/api/1.0/deals?pageSize=100&storeID=1&onSale=1');
  const cheapDeals = await cheapRes.json();

  const steamGames = cheapDeals
    .filter(deal => parseFloat(deal.normalPrice) > 0)
    .map(deal => {
      const salePriceUsd = parseFloat(deal.salePrice);
      const normalPriceUsd = parseFloat(deal.normalPrice);
      const isFree = salePriceUsd === 0;
      const discountRate = isFree ? 0 : Math.round((1 - salePriceUsd / normalPriceUsd) * 100);

      return {
        game_title: deal.title,
        store: 'Steam',
        price: salePriceUsd,
        price_jpy: Math.round(salePriceUsd * USD_TO_JPY),
        original_price: normalPriceUsd,
        original_price_jpy: Math.round(normalPriceUsd * USD_TO_JPY),
        is_free: isFree,
        is_free_limited: isFree && deal.expiry ? true : false,
        is_discounted: !isFree && discountRate > 0,
        discount_rate: discountRate,
        free_end_date: deal.expiry ? new Date(deal.expiry * 1000).toISOString() : null,
        store_url: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`
      };
    });

  console.log(`CheapShark: ${steamGames.length}件のSteamセールを検出`);

  // 2. Epic Games Storeからプロモーションを取得（無料+割引+今後のプロモーション）
  const epicRes = await fetch('https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions?locale=ja&country=JP&allowCountries=JP');
  const epicData = await epicRes.json();

  const limitedFreeFromEpic = [];
  const discountedFromEpic = [];
  const upcomingFromEpic = [];
  const elements = epicData?.data?.Catalog?.searchStore?.elements || [];

  for (const game of elements) {
    const pageSlug = game.catalogNs?.mappings?.[0]?.pageSlug || game.productSlug || '';
    const price = game.price?.totalPrice;
    const currentPriceJpy = price?.discountPrice || 0;
    const originalPriceJpy = price?.originalPrice || 0;

    // 現在のプロモーション
    if (game.promotions?.promotionalOffers?.length > 0) {
      const currentPromo = game.promotions.promotionalOffers.find(
        p => p.promotionalOffers?.some(o => o.discountSetting?.discountPercentage !== undefined)
      );

      if (currentPromo) {
        const offer = currentPromo.promotionalOffers.find(o => o.discountSetting?.discountPercentage !== undefined);
        const discountPercent = offer?.discountSetting?.discountPercentage || 0;
        const isFree = discountPercent === 0 || currentPriceJpy === 0;

        if (isFree) {
          limitedFreeFromEpic.push({
            game_title: game.title,
            store: 'Epic Games Store',
            price: 0,
            price_jpy: 0,
            original_price: Math.round(originalPriceJpy / 150),
            original_price_jpy: originalPriceJpy,
            is_free: true,
            is_free_limited: true,
            is_discounted: false,
            discount_rate: 0,
            free_end_date: offer?.endDate || null,
            store_url: `https://store.epicgames.com/ja/p/${pageSlug}`
          });
        } else {
          discountedFromEpic.push({
            game_title: game.title,
            store: 'Epic Games Store',
            price: Math.round(currentPriceJpy / 150),
            price_jpy: currentPriceJpy,
            original_price: Math.round(originalPriceJpy / 150),
            original_price_jpy: originalPriceJpy,
            is_free: false,
            is_free_limited: false,
            is_discounted: true,
            discount_rate: discountPercent,
            free_end_date: null,
            store_url: `https://store.epicgames.com/ja/p/${pageSlug}`
          });
        }
      }
    }

    // 今後のプロモーション（無料+割引）
    if (game.promotions?.upcomingPromotionalOffers?.length > 0) {
      const upcomingPromo = game.promotions.upcomingPromotionalOffers.find(
        p => p.promotionalOffers?.some(o => o.discountSetting?.discountPercentage !== undefined)
      );

      if (upcomingPromo) {
        const offer = upcomingPromo.promotionalOffers.find(o => o.discountSetting?.discountPercentage !== undefined);
        const discountPercent = offer?.discountSetting?.discountPercentage || 0;
        const isFree = discountPercent === 0;

        upcomingFromEpic.push({
          game_title: game.title + ' (近日無料)',
          store: 'Epic Games Store',
          price: isFree ? 0 : Math.round(currentPriceJpy / 150),
          price_jpy: isFree ? 0 : currentPriceJpy,
          original_price: Math.round(originalPriceJpy / 150),
          original_price_jpy: originalPriceJpy,
          is_free: isFree,
          is_free_limited: isFree,
          is_discounted: !isFree && discountPercent > 0,
          discount_rate: discountPercent,
          free_end_date: offer?.endDate || null,
          store_url: `https://store.epicgames.com/ja/p/${pageSlug}`
        });
      }
    }
  }

  console.log(`Epic Games: ${limitedFreeFromEpic.length}件の無料, ${discountedFromEpic.length}件の割引, ${upcomingFromEpic.length}件の今後無料予定を検出`);

  // 2-2. CheapSharkからEpic Games Storeの通常セール情報を取得
  const epicCheapRes = await fetch('https://www.cheapshark.com/api/1.0/deals?pageSize=100&storeID=25&upperPrice=50');
  const epicCheapDeals = await epicCheapRes.json();

  const epicCheapGames = epicCheapDeals
    .filter(deal => parseFloat(deal.savings) > 5)
    .map(deal => {
      const salePriceUsd = parseFloat(deal.salePrice);
      const normalPriceUsd = parseFloat(deal.normalPrice);
      const discountRate = Math.round(parseFloat(deal.savings));

      // Epic Games Storeの検索URLを使用
      const searchUrl = `https://store.epicgames.com/ja/browse?q=${encodeURIComponent(deal.title)}`;

      return {
        game_title: deal.title,
        store: 'Epic Games Store',
        price: salePriceUsd,
        price_jpy: Math.round(salePriceUsd * USD_TO_JPY),
        original_price: normalPriceUsd,
        original_price_jpy: Math.round(normalPriceUsd * USD_TO_JPY),
        is_free: salePriceUsd === 0,
        is_free_limited: false,
        is_discounted: salePriceUsd > 0 && discountRate > 0,
        discount_rate: discountRate,
        free_end_date: null,
        store_url: searchUrl
      };
    });

  console.log(`Epic Games (CheapShark): ${epicCheapGames.length}件のセールを検出`);

  // 3. GOGから無料・割引ゲームを取得（USD → JPY変換）
  const gogGames = [];
  for (let page = 1; page <= 10; page++) {
    const gogRes = await fetch(`https://www.gog.com/games/ajax/filtered?mediaType=game&page=${page}`);
    const gogData = await gogRes.json();
    const products = gogData.products || [];
    if (products.length === 0) break;
    gogGames.push(...products);
    await delay(100);
  }

  // 無料ゲーム
  const limitedFreeFromGog = gogGames
    .filter(game => game.price?.isFree === true)
    .map(game => {
      const originalPriceUsd = parseFloat(game.price?.baseAmount) || 0;
      return {
        game_title: game.title,
        store: 'GOG',
        price: 0,
        price_jpy: 0,
        original_price: originalPriceUsd,
        original_price_jpy: Math.round(originalPriceUsd * USD_TO_JPY),
        is_free: true,
        is_free_limited: true,
        is_discounted: false,
        discount_rate: 0,
        free_end_date: game.salesVisibility?.to ? new Date(game.salesVisibility.to * 1000).toISOString() : null,
        store_url: `https://www.gog.com${game.url}`
      };
    });

  // 割引ゲーム（無料ではないもの）
  const discountedFromGog = gogGames
    .filter(game => game.price?.isDiscounted === true && game.price?.isFree !== true)
    .map(game => {
      const finalPriceUsd = parseFloat(game.price?.finalAmount) || 0;
      const basePriceUsd = parseFloat(game.price?.baseAmount) || 0;
      return {
        game_title: game.title,
        store: 'GOG',
        price: finalPriceUsd,
        price_jpy: Math.round(finalPriceUsd * USD_TO_JPY),
        original_price: basePriceUsd,
        original_price_jpy: Math.round(basePriceUsd * USD_TO_JPY),
        is_free: false,
        is_free_limited: false,
        is_discounted: true,
        discount_rate: game.price?.discountPercentage || 0,
        free_end_date: null,
        store_url: `https://www.gog.com${game.url}`
      };
    });

  console.log(`GOG: ${limitedFreeFromGog.length}件の無料, ${discountedFromGog.length}件の割引を検出`);

  // 4. FreeToGameから常時無料を取得
  const freeRes = await fetch('https://www.freetogame.com/api/games?platform=pc');
  const freeGames = await freeRes.json();

  const alwaysFree = freeGames.slice(0, 50).map(g => ({
    game_title: g.title,
    store: 'FreeToGame',
    price: 0,
    price_jpy: 0,
    original_price: 0,
    original_price_jpy: 0,
    is_free: true,
    is_free_limited: false,
    free_end_date: null,
    store_url: g.game_url
  }));

  // 5. itch.ioから無料ゲームを取得（RSSフィード）
  const itchRes = await fetch('https://itch.io/games/price-free.xml');
  const itchXml = await itchRes.text();
  
  // XMLからゲーム情報を抽出
  const itchGames = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(itchXml)) !== null) {
    const item = match[1];
    const title = item.match(/<plainTitle>(.*?)<\/plainTitle>/)?.[1] || '';
    const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
    const price = item.match(/<price>(.*?)<\/price>/)?.[1] || '$0.00';
    const discountpercent = item.match(/<discountpercent>(.*?)<\/discountpercent>/)?.[1] || '0';
    const saleends = item.match(/<saleends>(.*?)<\/saleends>/)?.[1] || null;
    
    // プラットフォームを抽出
    const platforms = [];
    if (item.includes('<windows>yes</windows>')) platforms.push('Windows');
    if (item.includes('<osx>yes</osx>')) platforms.push('macOS');
    if (item.includes('<linux>yes</linux>')) platforms.push('Linux');
    if (item.includes('<html>yes</html>')) platforms.push('Web');
    if (item.includes('<android>yes</android>')) platforms.push('Android');
    
    itchGames.push({
      game_title: title,
      store: 'itch.io',
      price: 0,
      price_jpy: 0,
      original_price: 0,
      original_price_jpy: 0,
      is_free: true,
      is_free_limited: saleends ? true : false,
      is_discounted: parseInt(discountpercent) > 0,
      discount_rate: parseInt(discountpercent),
      free_end_date: saleends ? new Date(saleends).toISOString() : null,
      store_url: link
    });
  }

  console.log(`itch.io: ${itchGames.length}件の無料ゲームを検出`);

  // 6. Indiegalaから無料ゲームを取得
  const indiegalaRes = await fetch('https://freebies.indiegala.com');
  const indiegalaHtml = await indiegalaRes.text();
  
  const indiegalaGames = [];
  const igItemRegex = /<div class="col-3 products-col">(.*?)<\/div>\s*<\/div>\s*<\/div>/gs;
  let igMatch;
  
  while ((igMatch = igItemRegex.exec(indiegalaHtml)) !== null) {
    const item = igMatch[1];
    const title = item.match(/<div class="left product-title">(.*?)<\/div>/)?.[1] || '';
    const link = item.match(/<a class="fit-click" href="(.*?)" title="/)?.[1] || '';
    
    if (title && link) {
      indiegalaGames.push({
        game_title: title,
        store: 'Indiegala',
        price: 0,
        price_jpy: 0,
        original_price: 0,
        original_price_jpy: 0,
        is_free: true,
        is_free_limited: false,
        is_discounted: false,
        discount_rate: 0,
        free_end_date: null,
        store_url: link
      });
    }
  }

  console.log(`Indiegala: ${indiegalaGames.length}件の無料ゲームを検出`);

  // 7. Indiegalaからセール情報を取得（JPY直接取得）
  const indiegalaSaleRes = await fetch('https://www.indiegala.com/games/ajax/on-sale/release-date', {
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
  });
  const indiegalaSaleData = await indiegalaSaleRes.json();
  const indiegalaSaleHtml = indiegalaSaleData.html || '';

  const indiegalaSaleGames = [];
  // Extract game data from data attributes
  const igTitleRegex = /data-prod-title="([^"]+)"/g;
  const igSlugRegex = /data-prod-slugged="([^"]+)"/g;
  const igIdRegex = /data-prod-id="([^"]+)"/g;
  const igTitles = [], igSlugs = [], igIds = [];
  let igM;
  while ((igM = igTitleRegex.exec(indiegalaSaleHtml)) !== null) igTitles.push(igM[1]);
  while ((igM = igSlugRegex.exec(indiegalaSaleHtml)) !== null) igSlugs.push(igM[1]);
  while ((igM = igIdRegex.exec(indiegalaSaleHtml)) !== null) igIds.push(igM[1]);

  // Extract prices and discounts
  const igDiscountRegex = /main-list-results-item-discount[^>]*>([^<]+)/g;
  const igPriceOldRegex = /main-list-results-item-price-old[^>]*>([^<]+)/g;
  const igPriceNewRegex = /main-list-results-item-price-new[^>]*>([^<]+)/g;
  const igDiscounts = [], igPriceOlds = [], igPriceNews = [];
  while ((igM = igDiscountRegex.exec(indiegalaSaleHtml)) !== null) igDiscounts.push(igM[1].trim());
  while ((igM = igPriceOldRegex.exec(indiegalaSaleHtml)) !== null) igPriceOlds.push(igM[1].trim());
  while ((igM = igPriceNewRegex.exec(indiegalaSaleHtml)) !== null) igPriceNews.push(igM[1].trim());

  for (let i = 0; i < igTitles.length; i++) {
    const title = igTitles[i];
    const slug = igSlugs[i];
    const prodId = igIds[i];
    const discountStr = igDiscounts[i] || '';
    const priceOldStr = igPriceOlds[i] || '';
    const priceNewStr = igPriceNews[i] || '';

    // Parse JPY prices (¥1234 → 1234)
    const parseJpy = (str) => parseInt(str.replace(/[¥,]/g, '')) || 0;
    const priceJpy = parseJpy(priceNewStr);
    const originalPriceJpy = parseJpy(priceOldStr);
    const discountRate = parseInt(discountStr.replace(/[^0-9]/g, '')) || 0;
    const isFree = priceJpy === 0;

    indiegalaSaleGames.push({
      game_title: title,
      store: 'Indiegala',
      price: Math.round(priceJpy / 150),
      price_jpy: priceJpy,
      original_price: Math.round(originalPriceJpy / 150),
      original_price_jpy: originalPriceJpy,
      is_free: isFree,
      is_free_limited: false,
      is_discounted: discountRate > 0 && !isFree,
      discount_rate: discountRate,
      free_end_date: null,
      store_url: `https://www.indiegala.com/store/game/${slug}/${prodId}`
    });
  }

  console.log(`Indiegala セール: ${indiegalaSaleGames.length}件を検出`);

  // 8. 全データをDBに保存
  const allData = [...steamGames, ...limitedFreeFromEpic, ...discountedFromEpic, ...upcomingFromEpic, ...epicCheapGames, ...limitedFreeFromGog, ...discountedFromGog, ...alwaysFree, ...itchGames, ...indiegalaGames, ...indiegalaSaleGames];

  for (const item of allData) {
    const { error } = await supabase.from('game_price_history').upsert(item, { onConflict: 'game_title' });
    if (error) console.error(`保存エラー (${item.game_title}):`, error.message);
    else console.log(`保存成功: ${item.game_title}`);
    await delay(100);
  }

  console.log("データ同期完了！");
}

syncFreeGames();
