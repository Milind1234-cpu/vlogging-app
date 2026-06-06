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

const statCards = [
  { key: 'totalVlogs', label: 'Total Vlogs', icon: '🎬', color: 'from-indigo-600/20 to-indigo-600/5', border: 'border-indigo-500/20', text: 'text-indigo-400' },
  { key: 'totalViews', label: 'Total Views', icon: '👁', color: 'from-blue-600/20 to-blue-600/5', border: 'border-blue-500/20', text: 'text-blue-400' },
  { key: 'totalLikes', label: 'Total Likes', icon: '❤️', color: 'from-red-600/20 to-red-600/5', border: 'border-red-500/20', text: 'text-red-400' },
  { key: 'publishedVlogs', label: 'Published', icon: '✅', color: 'from-green-600/20 to-green-600/5', border: 'border-green-500/20', text: 'text-green-400' },
];

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
          if (json.success) setData(json.data);
          else setError(json.error);
        })
        .catch(() => setError('Failed to load dashboard'))
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 shimmer rounded-xl w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 shimmer rounded-2xl" />
          ))}
        </div>
        <div className="h-64 shimmer rounded-2xl" />
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
        <div>
          <h1 className="text-3xl font-black text-white">My Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Track your vlog performance</p>
        </div>
        <Link
          href="/create"
          className="btn-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-full"
        >
          + Create New Vlog
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 border ${card.border}`}
          >
            <div className="text-2xl mb-2">{card.icon}</div>
            <p className={`text-3xl font-black ${card.text}`}>
              {formatCount(data.stats[card.key])}
            </p>
            <p className="text-gray-400 text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Views this month */}
      <div className="glass rounded-2xl p-5 border border-white/5 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Views this month</p>
          <p className="text-white text-3xl font-black mt-1">
            {formatCount(data.stats.viewsThisMonth)}
          </p>
        </div>
        <div className="text-5xl opacity-20">📈</div>
      </div>

      {/* Top Performing Vlogs */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-white font-bold">🏆 Top Performing Vlogs</h2>
        </div>
        {data.topVlogs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-4xl mb-3">🎬</p>
            <p className="text-gray-400 text-sm">No vlogs yet. Create your first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3 font-medium">#</th>
                  <th className="text-left px-6 py-3 font-medium">Title</th>
                  <th className="text-right px-6 py-3 font-medium">Views</th>
                  <th className="text-right px-6 py-3 font-medium">Likes</th>
                  <th className="text-right px-6 py-3 font-medium">Created</th>
                  <th className="text-right px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.topVlogs.map((vlog, index) => (
                  <tr key={vlog._id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono">{index + 1}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/vlog/${vlog._id}`}
                        className="text-white hover:text-indigo-400 transition-colors font-medium line-clamp-1"
                      >
                        {vlog.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right text-blue-400 font-medium">
                      👁 {formatCount(vlog.viewCount)}
                    </td>
                    <td className="px-6 py-4 text-right text-red-400 font-medium">
                      ❤️ {formatCount(vlog.likeCount)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500 text-xs">
                      {timeAgo(vlog.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/vlog/${vlog._id}/edit`}
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                      >
                        Edit →
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
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-bold">🕐 Recent Vlogs</h2>
        </div>
        {data.recentVlogs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-400 text-sm">No vlogs yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {data.recentVlogs.map((vlog) => (
              <div key={vlog._id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-white/2 transition-colors">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/vlog/${vlog._id}`}
                    className="text-white text-sm font-semibold hover:text-indigo-400 transition-colors line-clamp-1"
                  >
                    {vlog.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-gray-500 text-xs">👁 {formatCount(vlog.viewCount)}</span>
                    <span className="text-gray-500 text-xs">❤️ {formatCount(vlog.likeCount)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      vlog.status === 'published'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                    }`}>
                      {vlog.status}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/vlog/${vlog._id}/edit`}
                  className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-xl transition-all border border-white/10 shrink-0"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}