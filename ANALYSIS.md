# プロジェクト構造分析

## 概要
**game-compare-site** — ゲーム価格比較サイト（Next.js 16 + Supabase）

## 技術スタック
| レイヤー | 技術 |
|---------|------|
| フレームワーク | Next.js 16.2.6, React 19.2.4 |
| DB/Auth | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) |
| CSS | Tailwind CSS v4 (PostCSS) |
| 言語 | TypeScript 5 |
| Lint | ESLint 9 (next core-web-vitals + typescript) |

## ディレクトリ構成
```
game-compare-site/
├── app/
│   ├── layout.tsx          # ルートレイアウト (Geistフォント)
│   ├── page.tsx            # トップページ（クライアントサイド）
│   ├── globals.css         # Tailwind + カスタムCSS変数
│   └── favicon.ico
├── scripts/
│   ├── sync_games.js       # Steamセール + FreeToGame同期
│   └── sync_free_games.js  # FreeToGameのみ同期
├── public/                 # 静的アセット (SVG)
├── .env / .env.local       # 環境変数
└── [config files]
```

## アプリケーション内容

### `app/page.tsx` — シングルページのゲーム価格テーブル
- Supabaseの`game_price_history`テーブルからデータ取得
- 無料ゲームフィルター切替ボタン
- タイトル/ストア/価格/割引率のテーブル表示
- クライアントサイドレンダリング（`'use client'`）

### `scripts/sync_*.js` — データ同期スクリプト
- `sync_games.js`: CheapShark API (Steamセール100件) + FreeToGame API (PC無料ゲーム100件) → Supabaseにupsert
- `sync_free_games.js`: FreeToGame API のみ → 最初の5件をinsert

## 環境変数
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — syncスクリプト用

## 注意点
- `sync_free_games.js`は`NEXT_PUBLIC_`プレフィックスの変数を使っているが、サーバーサイドスクリプトなので`SUPABASE_URL`等に統一すべき
- ページはクライアントサイドのみでデータ取得（SSR未活用）
- メタデータがまだデフォルトのまま（"Create Next App"）
