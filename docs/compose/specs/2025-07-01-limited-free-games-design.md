# 期間限定無料ゲーム機能の設計書

> [!NOTE]
> This document may not reflect the current implementation.
> See the final report for up-to-date state:
> [Final Report](../reports/limited-free-games.md)

## [S1] Problem
現在のアプリケーションは常時無料ゲーム（FreeToGame API）とSteamセール情報のみを取得している。期間限定で無料になるゲーム（Epic Games Storeの週間無料キャンペーン等）を取得・表示する必要がある。

## [S2] Solution overview
CheapShark APIとEpic Games Store APIを組み合わせて期間限定無料ゲームを取得し、既存テーブルにフィルター切替で表示する。

## [S3] データ取得スクリプト

### CheapShark
- エンドポイント: `https://www.cheapshark.com/api/1.0/deals?pageSize=100&storeID=1&onSale=1`
- 判定条件: `salePrice === "0.00"` のゲームを期間限定無料として抽出
- 取得フィールド: `title`, `salePrice`, `normalPrice`, `dealID`, `releaseDate`(Unix), `expiry`(Unix)

### Epic Games Store
- エンドポイント: `https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions?locale=ja&country=JP&allowCountries=JP`
- 判定条件: `promotions` 配列から `startDate`, `endDate` を取得
- 取得フィールド: `title`, `endDate`

### DB保存
- `game_price_history` テーブルにカラム追加:
  - `is_free_limited BOOLEAN DEFAULT FALSE`
  - `free_end_date TIMESTAMPTZ`

## [S4] フロントエンド

### フィルター
- 既存の「無料ゲームのみ表示」ボタンを3状態に拡張:
  - `all`: すべて表示（デフォルト）
  - `free`: 常時無料のみ
  - `free_limited`: 期間限定無料のみ

### テーブル表示
- 既存カラム: タイトル, ストア, 価格, 状態（割引率）
- 新規カラム: 有効期限
- 期間限定無料ゲームには専用ラベル（例: `期間限定 〜6/30`）を表示

## [S5] エラーハンドリング
- API取得失敗時はコンソールにエラーログを出力し、既存データを維持
- 有効期限がnullの場合、「不明」と表示

## [S6] テスト
- スクリプトの動作確認: `node scripts/sync_free_games.js` を手動実行
- フロントエンドの動作確認: ブラウザでフィルター切り替えを検証
