'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

function formatCount(num) {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function VlogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [vlog, setVlog] = useState(null);
  const [relatedVlogs, setRelatedVlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchVlog = async () => {
      try {
        const res = await fetch(`/api/vlogs/${id}`);
        const data = await res.json();

        if (!data.success) {
          setError(data.error);
          return;
        }

        setVlog(data.data.vlog);
        setRelatedVlogs(data.data.relatedVlogs);
        setLiked(data.data.vlog.isLikedByCurrentUser);
        setLikeCount(data.data.vlog.likeCount);
      } catch (err) {
        setError('Failed to load vlog');
      } finally {
        setLoading(false);
      }
    };

    fetchVlog();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const viewKey = `viewed_${id}`;
    if (sessionStorage.getItem(viewKey)) return;
    fetch(`/api/vlogs/${id}/view`, { method: 'POST' })
      .then(() => sessionStorage.setItem(viewKey, 'true'))
      .catch(() => {});
  }, [id]);

  const handleLike = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    const wasLiked = liked;
    setLiked(!liked);
    setLikeCount(wasLiked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await fetch(`/api/vlogs/${id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLiked(data.data.liked);
        setLikeCount(data.data.likeCount);
      } else {
        setLiked(wasLiked);
        setLikeCount(wasLiked ? likeCount : likeCount - 1);
      }
    } catch {
      setLiked(wasLiked);
      setLikeCount(wasLiked ? likeCount : likeCount - 1);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/vlogs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        router.push('/');
      } else {
        alert(data.error);
        setDeleting(false);
      }
    } catch {
      alert('Failed to delete vlog');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="aspect-video bg-gray-800/60 rounded-3xl shimmer" />
        <div className="h-8 shimmer rounded-xl w-3/4" />
        <div className="h-4 shimmer rounded-xl w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-6xl mb-4">😕</p>
        <p className="text-red-400 text-lg font-semibold mb-2">{error}</p>
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          ← Back to feed
        </Link>
      </div>
    );
  }

  const isOwner = session?.user?.id === vlog?.creator?._id?.toString();

  return (
    <div className="flex flex-col lg:flex-row gap-8">

      {/* Main Content */}
      <div className="flex-1 min-w-0">

        {/* Video Player */}
        <div className="aspect-video bg-black rounded-3xl overflow-hidden mb-5 shadow-2xl shadow-black/50">
          <video
            src={vlog.videoUrl}
            controls
            className="w-full h-full rounded-3xl"
            poster={vlog.thumbnailUrl}
          />
        </div>

        {/* Title */}
        <h1 className="text-white text-2xl font-black mb-3 leading-tight">{vlog.title}</h1>

        {/* Stats + Actions */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5 pb-5 border-b border-white/5">
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <span className="flex items-center gap-1.5">
              <span>👁</span>
              <span>{formatCount(vlog.viewCount)} views</span>
            </span>
            <span className="text-gray-700">·</span>
            <span>{timeAgo(vlog.createdAt)}</span>
            {vlog.category && (
              <>
                <span className="text-gray-700">·</span>
                <span className="bg-indigo-600/20 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full capitalize border border-indigo-500/20">
                  {vlog.category}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                liked
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/10'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {liked ? '❤️' : '🤍'} {formatCount(likeCount)}
            </button>

            {/* Owner Actions */}
            {isOwner && (
              <>
                <Link
                  href={`/vlog/${id}/edit`}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-full text-sm border border-white/10 transition-all"
                >
                  ✏️ Edit
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full text-sm border border-red-500/20 transition-all"
                >
                  🗑️ Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Creator Card */}
        <div className="glass rounded-2xl p-4 mb-5 flex items-center gap-4 border border-white/5">
          <Link href={`/profile/${vlog.creator._id}`}>
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 ring-2 ring-indigo-500/20">
              {vlog.creator.avatar ? (
                <img src={vlog.creator.avatar} alt={vlog.creator.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl">
                  {vlog.creator.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </Link>
          <div className="flex-1">
            <Link href={`/profile/${vlog.creator._id}`}>
              <p className="text-white font-bold hover:text-indigo-300 transition-colors">
                {vlog.creator.name}
              </p>
            </Link>
            {vlog.creator.bio && (
              <p className="text-gray-400 text-sm mt-0.5">{vlog.creator.bio}</p>
            )}
          </div>
        </div>

        {/* Description */}
        {vlog.description && (
          <div className="glass rounded-2xl p-5 mb-5 border border-white/5">
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {vlog.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {vlog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {vlog.tags.map((tag) => (
              <span
                key={tag}
                className="bg-white/5 text-gray-400 text-xs px-3 py-1.5 rounded-full border border-white/10 hover:border-indigo-500/30 hover:text-indigo-400 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Related Vlogs Sidebar */}
      {relatedVlogs.length > 0 && (
        <div className="lg:w-80 shrink-0">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="gradient-text">Related Vlogs</span>
          </h3>
          <div className="space-y-3">
            {relatedVlogs.map((related) => (
              <Link key={related._id} href={`/vlog/${related._id}`}>
                <div className="flex gap-3 glass rounded-2xl p-2.5 hover:border-indigo-500/20 transition-all border border-white/5 group">
                  <div className="relative w-32 aspect-video rounded-xl overflow-hidden bg-gray-800 shrink-0">
                    {related.thumbnailUrl && (
                      <Image
                        src={related.thumbnailUrl}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="128px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <p className="text-white text-xs font-semibold line-clamp-2 group-hover:text-indigo-300 transition-colors">
                      {related.title}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">{related.creator?.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">👁 {formatCount(related.viewCount)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="glass rounded-3xl p-8 max-w-sm w-full border border-white/10 shadow-2xl">
            <div className="text-4xl mb-4 text-center">🗑️</div>
            <h3 className="text-white font-black text-xl mb-2 text-center">Delete Vlog?</h3>
            <p className="text-gray-400 text-sm mb-8 text-center leading-relaxed">
              This will permanently delete your vlog and remove it from Cloudinary. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-2xl text-sm font-semibold transition-all border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-2xl text-sm font-semibold transition-all"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}