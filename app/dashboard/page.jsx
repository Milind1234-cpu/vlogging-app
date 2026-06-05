'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function formatCount(num) {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const days = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetch('/api/dashboard')
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setData(json.data);
          } else {
            setError(json.error);
          }
        })
        .catch(() => setError('Failed to load dashboard'))
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-800 rounded w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-800 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-center py-24">{error}</p>;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
        <Link
          href="/create"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
        >
          + Create New Vlog
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-white">{data.stats.totalVlogs}</p>
          <p className="text-gray-400 text-sm mt-1">Total Vlogs</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">{formatCount(data.stats.totalViews)}</p>
          <p className="text-gray-400 text-sm mt-1">Total Views</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{formatCount(data.stats.totalLikes)}</p>
          <p className="text-gray-400 text-sm mt-1">Total Likes</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{data.stats.publishedVlogs}</p>
          <p className="text-gray-400 text-sm mt-1">Published</p>
        </div>
      </div>

      {/* Views this month */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-gray-400 text-sm">Views this month</p>
        <p className="text-white text-2xl font-bold mt-1">
          {formatCount(data.stats.viewsThisMonth)}
        </p>
      </div>

      {/* Top Performing Vlogs */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Top Performing Vlogs</h2>
        {data.topVlogs.length === 0 ? (
          <p className="text-gray-400 text-sm">No vlogs yet. Create your first one!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left pb-3 font-medium">#</th>
                  <th className="text-left pb-3 font-medium">Title</th>
                  <th className="text-right pb-3 font-medium">Views</th>
                  <th className="text-right pb-3 font-medium">Likes</th>
                  <th className="text-right pb-3 font-medium">Created</th>
                  <th className="text-right pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.topVlogs.map((vlog, index) => (
                  <tr key={vlog._id} className="border-b border-gray-800/50">
                    <td className="py-3 text-gray-500">{index + 1}</td>
                    <td className="py-3">
                      <Link
                        href={`/vlog/${vlog._id}`}
                        className="text-white hover:text-blue-400 transition-colors line-clamp-1"
                      >
                        {vlog.title}
                      </Link>
                    </td>
                    <td className="py-3 text-right text-gray-300">
                      👁 {formatCount(vlog.viewCount)}
                    </td>
                    <td className="py-3 text-right text-gray-300">
                      ❤ {formatCount(vlog.likeCount)}
                    </td>
                    <td className="py-3 text-right text-gray-500">
                      {timeAgo(vlog.createdAt)}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/vlog/${vlog._id}/edit`}
                        className="text-blue-400 hover:text-blue-300 text-xs"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Vlogs */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Recent Vlogs</h2>
        {data.recentVlogs.length === 0 ? (
          <p className="text-gray-400 text-sm">No vlogs yet.</p>
        ) : (
          <div className="space-y-3">
            {data.recentVlogs.map((vlog) => (
              <div
                key={vlog._id}
                className="flex items-center justify-between gap-4 p-3 bg-gray-800 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/vlog/${vlog._id}`}
                    className="text-white text-sm font-medium hover:text-blue-400 transition-colors line-clamp-1"
                  >
                    {vlog.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-gray-500 text-xs">👁 {formatCount(vlog.viewCount)}</span>
                    <span className="text-gray-500 text-xs">❤ {formatCount(vlog.likeCount)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      vlog.status === 'published'
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-gray-600/20 text-gray-400'
                    }`}>
                      {vlog.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/vlog/${vlog._id}/edit`}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}