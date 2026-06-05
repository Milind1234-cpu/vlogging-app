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
      console.error('Failed to load more vlogs');
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-gray-800" />
          <div className="space-y-2">
            <div className="h-6 bg-gray-800 rounded w-40" />
            <div className="h-4 bg-gray-800 rounded w-60" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-800 rounded-xl" />
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
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4 mb-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-2xl overflow-hidden shrink-0">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile.name?.[0]?.toUpperCase()
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-white text-2xl font-bold">{profile.name}</h1>
            {profile.bio && (
              <p className="text-gray-400 text-sm mt-1">{profile.bio}</p>
            )}
            <p className="text-gray-500 text-xs mt-2">
              Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-white text-2xl font-bold">{profile.totalVlogs}</p>
            <p className="text-gray-400 text-sm">Vlogs</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-white text-2xl font-bold">{formatCount(profile.totalViews)}</p>
            <p className="text-gray-400 text-sm">Views</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-white text-2xl font-bold">{formatCount(profile.totalLikes)}</p>
            <p className="text-gray-400 text-sm">Likes</p>
          </div>
        </div>
      </div>

      {/* Vlogs Grid */}
      <h2 className="text-white text-lg font-semibold mb-4">Vlogs</h2>
      <VlogGrid vlogs={vlogs} loading={false} />

      {/* Load More */}
      {pagination?.hasNextPage && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}