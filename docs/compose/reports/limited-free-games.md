---
feature: limited-free-games
status: delivered
specs:
  - docs/compose/specs/2025-07-01-limited-free-games-design.md
plans:
  - docs/compose/plans/2025-07-01-limited-free-games.md
branch: main
commits: N/A
---

# 期間限定無料ゲーム機能 — Final Report

## What Was Built

期間限定で無料になるゲーム（Epic Games Storeの週間無料キャンペーン、Steamの無料セール）を取得し、フロントエンドでフィルタリング表示する機能を実装した。

データ取得スクリプト（`scripts/sync_free_games.js`）を拡張し、CheapShark APIとEpic Games Store APIから期間限定無料ゲームを自動取得。フロントエンド（`app/page.tsx`）に3つのフィルターボタン（「すべて」「無料ゲーム」「期間限定無料」）と有効期限カラムを追加した。

## Architecture

### データ取得フロー

```
CheapShark API ──┐
                 ├── sync_free_games.js ──→ Supabase DB
Epic Games API ──┘
```

- **CheapShark**: `salePrice === "0.00"` のセールを期間限定無料として抽出
- **Epic Games Store**: `promotions.promotionalOffers` から `discountPercentage === 0` を期間限定無料として抽出
- **FreeToGame**: 常時無料ゲームとして取得（既存）

### フロントエンド

- フィルター状態: `all` | `free` | `free_limited`
- テーブルに「状態」と「有効期限」カラムを追加
- 期間限定無料にはオレンジ色のラベル、常時無料には緑色のラベルを表示

## Usage

### データ同期

```bash
node scripts/sync_free_games.js
```

環境変数（`.env`）:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### フロントエンド

ブラウザでアクセスし、3つのボタンでフィルターを切り替え:
- **すべて**: 全ゲームを表示
- **無料ゲーム**: 常時無料のみ表示
- **期間限定無料**: 期間限定無料のみ表示

## Verification

- `npm run lint`: エラーなし
- `npm run build`: ビルド成功

## Journey Log

- [lesson] sync_free_games.jsの環境変数を`NEXT_PUBLIC_`プレフィックスから`SUPABASE_`に修正（サーバーサイドスクリプトのため）
- [pivot] フィルターをboolean（isFreeOnly）から3状態（all/free/free_limited）に変更

## Source Materials

| File | Role | Notes |
|------|------|-------|
| `docs/compose/specs/2025-07-01-limited-free-games-design.md` | 設計書 | 初期設計 |
| `docs/compose/plans/2025-07-01-limited-free-games.md` | 実装計画 | 完了 |
