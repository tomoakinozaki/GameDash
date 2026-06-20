'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getAffiliateUrl } from './utils/affiliate';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type FilterType = 'all' | 'free' | 'free_limited' | 'discounted';

interface Game {
  id: number;
  game_title: string;
  store: string;
  price: number;
  original_price: number;
  is_free: boolean;
  is_free_limited: boolean;
  is_discounted: boolean;
  discount_rate: number;
  free_end_date: string | null;
  store_url: string;
}

export default function Home({ initialData }: { initialData?: Game[] }) {
  const [games, setGames] = useState(initialData || []);
  const [filter, setFilter] = useState<FilterType>('all');

  const fetchData = async (filterType: FilterType) => {
    let query = supabase.from('game_price_history').select('*');

    if (filterType === 'free') {
      query = query.eq('is_free', true);
    } else if (filterType === 'free_limited') {
      query = query.eq('is_free_limited', true);
    } else if (filterType === 'discounted') {
      query = query.eq('is_discounted', true);
    }

    const { data } = await query.order('created_at', { ascending: false });
    setGames(data || []);
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    fetchData(newFilter);
  };

  return (
    <main className="p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">ゲーム価格比較</h1>
        <span className="text-sm text-gray-500">{games.length} 件の情報を表示中</span>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-4 py-2 rounded-lg font-bold shadow-sm transition-all ${
            filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800 border border-gray-300'
          }`}
        >
          すべて
        </button>
        <button
          onClick={() => handleFilterChange('free')}
          className={`px-4 py-2 rounded-lg font-bold shadow-sm transition-all ${
            filter === 'free' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-800 border border-gray-300'
          }`}
        >
          無料ゲーム
        </button>
        <button
          onClick={() => handleFilterChange('free_limited')}
          className={`px-4 py-2 rounded-lg font-bold shadow-sm transition-all ${
            filter === 'free_limited' ? 'bg-orange-500 text-white' : 'bg-white text-gray-800 border border-gray-300'
          }`}
        >
          期間限定無料
        </button>
        <button
          onClick={() => handleFilterChange('discounted')}
          className={`px-4 py-2 rounded-lg font-bold shadow-sm transition-all ${
            filter === 'discounted' ? 'bg-red-500 text-white' : 'bg-white text-gray-800 border border-gray-300'
          }`}
        >
          割引ゲーム
        </button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white text-gray-900">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">タイトル</th>
              <th className="px-6 py-4 text-left font-semibold">ストア</th>
              <th className="px-6 py-4 text-left font-semibold">価格</th>
              <th className="px-6 py-4 text-left font-semibold">状態</th>
              <th className="px-6 py-4 text-left font-semibold">有効期限</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {games.map((game) => (
              <tr key={game.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium">
                  <a
                    href={getAffiliateUrl(game)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline hover:text-indigo-800"
                  >
                    {game.game_title} ↗
                  </a>
                </td>
                <td className="px-6 py-4 text-gray-600">{game.store}</td>
                <td className="px-6 py-4">
                  {game.is_free ? (
                    <span className="font-bold text-emerald-600">無料</span>
                  ) : (
                    <div>
                      <span className="text-gray-400 line-through text-sm mr-2">${game.original_price}</span>
                      <span className="font-bold text-indigo-700">${game.price}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {game.is_free_limited ? (
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">
                      期間限定
                    </span>
                  ) : game.is_free ? (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
                      常時無料
                    </span>
                  ) : game.is_discounted ? (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                      {game.discount_rate}% OFF
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
