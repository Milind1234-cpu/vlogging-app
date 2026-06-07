'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import VlogGrid from '@/components/vlog/VlogGrid';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const CATEGORIES = ['all', 'travel', 'tech', 'lifestyle', 'food', 'music', 'sports', 'education', 'other'];
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest'      },
  { value: 'oldest',     label: 'Oldest'      },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'most_liked',  label: 'Most Liked'  },
];
const LIMIT = 12;

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
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
          limit: LIMIT.toString(),
          sort,
          ...(category !== 'all' && { category }),
          ...(search && { search }),
        });

        const res = await fetch(`/api/vlogs?${params}`);
        const data = await res.json();

        if (data.success) {
          setVlogs(data.data.vlogs);
          setPagination(data.data.pagination);
        }
      } catch (err) {
        console.error('Failed to fetch vlogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVlogs();
  }, [category, sort, page, search]);

  // Push updated params into URL
  const updateUrl = (updates) => {
    const current = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) current.set(k, v);
      else current.delete(k);
    });
    router.push(`/vlogs?${current.toString()}`);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
    updateUrl({ category: cat === 'all' ? '' : cat, page: '1' });
  };

  const handleSortChange = (s) => {
    setSort(s);
    setPage(1);
    updateUrl({ sort: s, page: '1' });
  };

  const handlePage = (p) => {
    setPage(p);
    updateUrl({ page: String(p) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-indigo-400 text-xs uppercase tracking-widest font-semibold mb-1">Discover</p>
          <h1 className="text-white text-3xl font-black">Vlogs from creators</h1>
          {pagination && (
            <p className="text-gray-500 text-sm mt-1">
              {pagination.totalVlogs} vlogs published by creators worldwide
            </p>
          )}
        </div>
        {session && (
          <Link
            href="/create"
            className="btn-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-full"
          >
            + Upload a Vlog
          </Link>
        )}
      </div>

      {/* ── Search result heading ── */}
      {search && (
        <div className="mb-6">
          <h2 className="text-white text-xl font-bold">
            Results for <span className="gradient-text">"{search}"</span>
          </h2>
          <button
            onClick={() => router.push('/vlogs')}
            className="text-gray-400 text-sm hover:text-white mt-1 transition-colors"
          >
            ✕ Clear search
          </button>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
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
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-gray-900">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Grid ── */}
      <VlogGrid vlogs={vlogs} loading={loading} />

      {/* ── Pagination ── */}
      {pagination && pagination.totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => handlePage(page - 1)}
            disabled={!pagination.hasPrevPage}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                  p === page
                    ? 'btn-gradient text-white'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePage(page + 1)}
            disabled={!pagination.hasNextPage}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next →
          </button>
        </div>
      )}

    </div>
  );
}
