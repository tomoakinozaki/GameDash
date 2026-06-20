# 期間限定無料ゲーム機能 実装計画

> [!NOTE]
> This document may not reflect the current implementation.
> See the final report for up-to-date state:
> [Final Report](../reports/limited-free-games.md)

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 期間限定で無料のゲーム（Epic Games Store、CheapSharkの無料セール）を取得・表示し、フィルターで切り替え可能にする

**Architecture:** sync_free_games.jsを拡張してCheapSharkとEpic Games Store APIから期間限定無料ゲームを取得し、DBに保存。フロントエンドにフィルターボタンと有効期限カラムを追加。

**Tech Stack:** Next.js 16, Supabase, Tailwind CSS, JavaScript (Node.js)

---

### Task 1: sync_free_games.js にCheapShark API連携を追加

**Covers:** [S3]

**Files:**
- Modify: `scripts/sync_free_games.js`

- [ ] **Step 1: 既存コードを確認**

現在のsync_free_games.jsはFreeToGame APIのみを使用。環境変数も`NEXT_PUBLIC_`プレフィックスを使用（サーバーサイドスクリプトとして不適切）。

- [ ] **Step 2: 環境変数とクライアント初期化を修正**

```javascript
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

- [ ] **Step 3: 関数を定義**

```javascript
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
      const upcomingPromo = game.promotions.upcomingPromotionalOffers?.find(
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
```

- [ ] **Step 4: スクリプトを実行して動作確認**

Run: `node scripts/sync_free_games.js`
Expected: CheapSharkとEpic Games Storeから期間限定無料ゲームが取得され、DBに保存される

- [ ] **Step 5: Commit**

```bash
git add scripts/sync_free_games.js
git commit -m "feat: add CheapShark and Epic Games Store API integration for limited-free games"
```

---

### Task 2: フロントエンドにフィルターと有効期限カラムを追加

**Covers:** [S4]

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: フィルター状態を3状態に変更**

```typescript
const [filter, setFilter] = useState<'all' | 'free' | 'free_limited'>('all');
```

- [ ] **Step 2: fetchData関数を修正**

```typescript
const fetchData = async (filterType: 'all' | 'free' | 'free_limited') => {
  let query = supabase.from('game_price_history').select('*');

  if (filterType === 'free') {
    query = query.eq('is_free', true);
  } else if (filterType === 'free_limited') {
    query = query.eq('is_free_limited', true);
  }

  const { data } = await query.order('created_at', { ascending: false });
  setGames(data || []);
};
```

- [ ] **Step 3: フィルターボタンを追加**

```tsx
<div className="flex gap-2 mb-6">
  <button
    onClick={() => { setFilter('all'); fetchData('all'); }}
    className={`px-4 py-2 rounded-lg font-bold shadow-sm transition-all ${
      filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800 border border-gray-300'
    }`}
  >
    すべて
  </button>
  <button
    onClick={() => { setFilter('free'); fetchData('free'); }}
    className={`px-4 py-2 rounded-lg font-bold shadow-sm transition-all ${
      filter === 'free' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-800 border border-gray-300'
    }`}
  >
    無料ゲーム
  </button>
  <button
    onClick={() => { setFilter('free_limited'); fetchData('free_limited'); }}
    className={`px-4 py-2 rounded-lg font-bold shadow-sm transition-all ${
      filter === 'free_limited' ? 'bg-orange-500 text-white' : 'bg-white text-gray-800 border border-gray-300'
    }`}
  >
    期間限定無料
  </button>
</div>
```

- [ ] **Step 4: テーブルに有効期限カラムを追加**

```tsx
<thead className="bg-gray-100 border-b border-gray-200">
  <tr>
    <th className="px-6 py-4 text-left font-semibold">タイトル</th>
    <th className="px-6 py-4 text-left font-semibold">ストア</th>
    <th className="px-6 py-4 text-left font-semibold">価格</th>
    <th className="px-6 py-4 text-left font-semibold">状態</th>
    <th className="px-6 py-4 text-left font-semibold">有効期限</th>
  </tr>
</thead>
```

- [ ] **Step 5: テーブルボディに有効期限と期間限定ラベルを追加**

```tsx
<td className="px-6 py-4">
  {game.is_free_limited ? (
    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">
      期間限定
    </span>
  ) : game.is_free ? (
    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
      常時無料
    </span>
  ) : !game.is_free && game.original_price > 0 ? (
    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
      {Math.round(((game.original_price - game.price) / game.original_price) * 100)}% OFF
    </span>
  ) : (
    <span className="text-gray-400 text-xs">-</span>
  )}
</td>
<td className="px-6 py-4 text-sm text-gray-600">
  {game.free_end_date
    ? new Date(game.free_end_date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
    : '-'}
</td>
```

- [ ] **Step 6: ビルド確認**

Run: `npm run build`
Expected: ビルド成功

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add filter buttons and expiration date column for limited-free games"
```
