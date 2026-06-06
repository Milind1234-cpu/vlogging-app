'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import VlogGrid from '@/components/vlog/VlogGrid';

function formatCount(num) {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function ProfilePage() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [vlogs, setVlogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${id}?page=1&limit=9`);
        const data = await res.json();

        if (!data.success) {
          setError(data.error);
          return;
        }

        setProfile(data.data.user);
        setVlogs(data.data.vlogs);
        setPagination(data.data.pagination);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/users/${id}?page=${nextPage}&limit=9`);
      const data = await res.json();

      if (data.success) {
        setVlogs((prev) => [...prev, ...data.data.vlogs]);
        setPagination(data.data.pagination);
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Failed to load more');
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-48 shimmer rounded-3xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 shimmer rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Profile Header */}
      <div className="relative mb-8 rounded-3xl overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-gray-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-600/10 via-transparent to-transparent" />

        <div className="relative p-8">
          <div className="flex items-start gap-6 mb-8">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-3xl overflow-hidden shrink-0 ring-4 ring-indigo-500/20 shadow-2xl shadow-indigo-500/10">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-3xl">
                  {profile.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 pt-2">
              <h1 className="text-white text-3xl font-black mb-1">{profile.name}</h1>
              {profile.bio && (
                <p className="text-gray-300 text-sm mb-2">{profile.bio}</p>
              )}
              <p className="text-gray-500 text-xs">
                🗓 Member since {new Date(profile.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-4 text-center border border-white/5">
              <p className="text-white text-2xl font-black">{profile.totalVlogs}</p>
              <p className="text-gray-400 text-xs mt-1">Vlogs</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center border border-white/5">
              <p className="text-blue-400 text-2xl font-black">{formatCount(profile.totalViews)}</p>
              <p className="text-gray-400 text-xs mt-1">Total Views</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center border border-white/5">
              <p className="text-red-400 text-2xl font-black">{formatCount(profile.totalLikes)}</p>
              <p className="text-gray-400 text-xs mt-1">Total Likes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vlogs Section */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-white text-lg font-bold">
          Vlogs <span className="text-gray-500 font-normal text-sm">({profile.totalVlogs})</span>
        </h2>
      </div>

      <VlogGrid vlogs={vlogs} loading={false} />

      {/* Load More */}
      {pagination?.hasNextPage && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-white px-8 py-3 rounded-full text-sm font-medium transition-all"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}