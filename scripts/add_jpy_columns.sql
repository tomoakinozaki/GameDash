-- game_price_historyテーブルにJPY価格カラムを追加
ALTER TABLE game_price_history 
ADD COLUMN IF NOT EXISTS price_jpy NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_price_jpy NUMERIC DEFAULT 0;

-- 既存データのJPY価格を設定（USD → JPY変換: 1 USD = 150 JPY）
UPDATE game_price_history 
SET 
  price_jpy = ROUND(price * 150),
  original_price_jpy = ROUND(original_price * 150)
WHERE price_jpy IS NULL OR price_jpy = 0;
