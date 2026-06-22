import { createClient } from '@supabase/supabase-js';
import GameList from './GameList';

export const dynamic = 'force-dynamic';

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

  return <GameList initialData={games} />;
}
