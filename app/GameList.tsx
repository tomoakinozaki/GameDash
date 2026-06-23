'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getAffiliateUrl } from './utils/affiliate';

type FilterType = 'all' | 'free' | 'free_limited' | 'discounted';
type StoreFilter = 'all' | 'Epic Games Store' | 'FreeToGame' | 'GOG' | 'Steam';
type SortKey = 'game_title' | 'store' | 'price' | 'discount_rate';
type SortDirection = 'asc' | 'desc';

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

export default function GameList({ initialData }: { initialData: Game[] }) {
  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  ), []);

  const [games, setGames] = useState(initialData);
  const [filter, setFilter] = useState<FilterType>('all');
  const [storeFilter, setStoreFilter] = useState<StoreFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('game_title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const itemsPerPage = 20;

  const filteredGames = useMemo(() => {
    const filtered = games.filter(game =>
      game.game_title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [games, searchQuery, sortKey, sortDirection]);

  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
  const paginatedGames = filteredGames.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchData = async (filterType: FilterType, store: StoreFilter) => {
    let query = supabase.from('game_price_history').select('*');

    if (filterType === 'free') {
      query = query.eq('is_free', true);
    } else if (filterType === 'free_limited') {
      query = query.eq('is_free_limited', true);
    } else if (filterType === 'discounted') {
      query = query.eq('is_discounted', true);
    }

    if (store !== 'all') {
      query = query.eq('store', store);
    }

    const { data } = await query.order('created_at', { ascending: false });
    setGames(data || []);
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setCurrentPage(1);
    fetchData(newFilter, storeFilter);
  };

  const handleStoreChange = (newStore: StoreFilter) => {
    setStoreFilter(newStore);
    setCurrentPage(1);
    fetchData(filter, newStore);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <main className="p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">ゲーム価格比較</h1>
        <span className="text-sm text-gray-500">{filteredGames.length} 件の情報を表示中</span>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="ゲーム名で検索..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-2 mb-4">
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

      <div className="flex gap-2 mb-6">
        <span className="px-3 py-2 text-sm font-semibold text-gray-500">ストア:</span>
        {(['all', 'Epic Games Store', 'FreeToGame', 'GOG', 'Steam'] as StoreFilter[]).map((store) => (
          <button
            key={store}
            onClick={() => handleStoreChange(store)}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              storeFilter === store
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {store === 'all' ? 'すべて' : store}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white text-gray-900">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th
                onClick={() => handleSort('game_title')}
                className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
              >
                タイトル {getSortIcon('game_title')}
              </th>
              <th
                onClick={() => handleSort('store')}
                className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
              >
                ストア {getSortIcon('store')}
              </th>
              <th
                onClick={() => handleSort('price')}
                className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
              >
                価格 {getSortIcon('price')}
              </th>
              <th className="px-6 py-4 text-left font-semibold">状態</th>
              <th className="px-6 py-4 text-left font-semibold">有効期限</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedGames.map((game) => (
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg font-medium bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            前へ
          </button>
          <span className="px-4 py-2 text-gray-700">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg font-medium bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ
          </button>
        </div>
      )}
    </main>
  );
}
