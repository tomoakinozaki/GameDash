import { createClient } from '@supabase/supabase-js';
import GameList from './GameList';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "ゲーム価格比較 - GameDash",
  description: "Steam、Epic Games Store、GOG、itch.io、Indiegalaのゲーム価格を比較。無料ゲームや割引情報をリアルタイムで確認できます。",
  openGraph: {
    title: "ゲーム価格比較 - GameDash",
    description: "Steam、Epic Games Store、GOG、itch.io、Indiegalaのゲーム価格を比較。",
  },
};

async function getGames() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from('game_price_history')
    .select('*')
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function Home() {
  const games = await getGames();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GameDash",
    "url": "https://gamedash.vercel.app",
    "description": "Steam、Epic Games Store、GOG、itch.io、Indiegalaのゲーム価格を比較",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://gamedash.vercel.app/?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GameList initialData={games} />
    </>
  );
}
