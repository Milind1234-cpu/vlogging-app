'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import VlogGrid from '@/components/vlog/VlogGrid';

const CATEGORIES = ['all', 'travel', 'tech', 'lifestyle', 'food', 'music', 'sports', 'education', 'other'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'most_liked', label: 'Most Liked' },
];

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read filters from URL params
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);

  const [vlogs, setVlogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';

  // Fetch vlogs whenever filters change
  useEffect(() => {
    const fetchVlogs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '12',
          sort,
          ...(category !== 'all' && { category }),
          ...(search && { search }),
        });

        const res = await fetch(`/api/vlogs?${params}`);
        const data = await res.json();

        if (data.success) {
          // If loading more (page > 1), append to existing vlogs
          // If new filter, replace
          if (page === 1) {
            setVlogs(data.data.vlogs);
          } else {
            setVlogs((prev) => [...prev, ...data.data.vlogs]);
          }
          setPagination(data.data.pagination);
        }
      } catch (error) {
        console.error('Failed to fetch vlogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVlogs();
  }, [category, sort, page, search]);

  // When category or sort changes, reset to page 1
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
  };

  return (
    <div>
      {/* Search result heading */}
      {search && (
        <div className="mb-4">
          <h2 className="text-white text-lg">
            Search results for <span className="text-blue-400">"{search}"</span>
          </h2>
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 text-sm hover:text-white mt-1"
          >
            ✕ Clear search
          </button>
        </div>
      )}

      {/* Filter Bar + Sort */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Vlog Grid */}
      <VlogGrid vlogs={vlogs} loading={loading && page === 1} />

      {/* Load More Button */}
      {pagination?.hasNextPage && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={loading}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}