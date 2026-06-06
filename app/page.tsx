'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import VlogGrid from '@/components/vlog/VlogGrid';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();

  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);
  const [vlogs, setVlogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';

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
      {/* Hero Section — shown when no search */}
      {!search && page === 1 && !loading && vlogs.length > 0 && (
        <div className="relative mb-10 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-600/10 via-transparent to-transparent" />
          <div className="relative px-8 py-12">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
              Share Your <span className="gradient-text">Story</span>
            </h1>
            <p className="text-gray-400 text-lg mb-6 max-w-md">
              Discover amazing vlogs from creators around the world
            </p>
            {session ? (
              <Link href="/create" className="btn-gradient text-white font-semibold px-6 py-3 rounded-full inline-block">
                + Upload Your Vlog
              </Link>
            ) : (
              <Link href="/register" className="btn-gradient text-white font-semibold px-6 py-3 rounded-full inline-block">
                Get Started Free
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Search result heading */}
      {search && (
        <div className="mb-6">
          <h2 className="text-white text-xl font-bold">
            Results for <span className="gradient-text">"{search}"</span>
          </h2>
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 text-sm hover:text-white mt-1 transition-colors"
          >
            ✕ Clear search
          </button>
        </div>
      )}

      {/* Filter Bar + Sort */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                category === cat
                  ? 'btn-gradient text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500/50"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} className="bg-gray-900">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Vlog Grid */}
      <VlogGrid vlogs={vlogs} loading={loading && page === 1} />

      {/* Load More */}
      {pagination?.hasNextPage && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={loading}
            className="bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-white px-8 py-3 rounded-full text-sm font-medium transition-all"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}