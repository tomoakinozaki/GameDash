export interface GameForAffiliate {
  store: string;
  store_url: string;
  game_title: string;
  slug?: string;
}

export const getAffiliateUrl = (game: GameForAffiliate): string => {
  // GOGアフィリエイト
  if (game.store === 'GOG') {
    const affiliateId = process.env.NEXT_PUBLIC_GOG_AFFILIATE;
    if (affiliateId) {
      return `${game.store_url}?affiliate=${affiliateId}`;
    }
  }

  // Humble Bundleアフィリエイト
  if (game.store === 'Humble Bundle') {
    const affiliateId = process.env.NEXT_PUBLIC_HUMBLE_AFFILIATE;
    if (affiliateId) {
      return `${game.store_url}?partner=${affiliateId}`;
    }
  }

  // その他はそのまま返す
  return game.store_url;
};

// Amazonアフィリエイトリンクを生成
export const getAmazonUrl = (gameTitle: string): string => {
  const affiliateId = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE;
  const searchQuery = encodeURIComponent(gameTitle);
  
  if (affiliateId) {
    return `https://www.amazon.co.jp/s?k=${searchQuery}&tag=${affiliateId}`;
  }
  
  return `https://www.amazon.co.jp/s?k=${searchQuery}`;
};
