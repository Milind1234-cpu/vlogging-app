'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

// Format numbers
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

  // Fetch vlog data
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

  // Increment view count once when page loads
  useEffect(() => {
    if (!id) return;

    // Check sessionStorage to avoid duplicate counts
    const viewKey = `viewed_${id}`;
    if (sessionStorage.getItem(viewKey)) return;

    fetch(`/api/vlogs/${id}/view`, { method: 'POST' })
      .then(() => sessionStorage.setItem(viewKey, 'true'))
      .catch(() => {});
  }, [id]);

  // Like toggle with optimistic UI
  const handleLike = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    // Optimistic update — update UI immediately
    const wasLiked = liked;
    setLiked(!liked);
    setLikeCount(wasLiked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await fetch(`/api/vlogs/${id}/like`, { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        // Sync with server truth
        setLiked(data.data.liked);
        setLikeCount(data.data.likeCount);
      } else {
        // Revert on failure
        setLiked(wasLiked);
        setLikeCount(wasLiked ? likeCount : likeCount - 1);
      }
    } catch {
      // Revert on error
      setLiked(wasLiked);
      setLikeCount(wasLiked ? likeCount : likeCount - 1);
    }
  };

  // Delete vlog
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
      <div className="animate-pulse">
        <div className="aspect-video bg-gray-800 rounded-xl mb-4" />
        <div className="h-6 bg-gray-800 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-800 rounded w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-red-400 text-lg">{error}</p>
        <Link href="/" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
          ← Back to feed
        </Link>
      </div>
    );
  }

  const isOwner = session?.user?.id === vlog?.creator?._id?.toString();

  return (
    <div className="flex flex-col lg:flex-row gap-6">

      {/* Main Content */}
      <div className="flex-1 min-w-0">

        {/* Video Player */}
        <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
          <video
            src={vlog.videoUrl}
            controls
            className="w-full h-full"
            poster={vlog.thumbnailUrl}
          />
        </div>

        {/* Title */}
        <h1 className="text-white text-xl font-bold mb-2">{vlog.title}</h1>

        {/* Stats + Actions Row */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <span>👁 {formatCount(vlog.viewCount)} views</span>
            <span>·</span>
            <span>{timeAgo(vlog.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                liked
                  ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              {liked ? '❤️' : '🤍'} {formatCount(likeCount)}
            </button>

            {/* Edit/Delete — owner only */}
            {isOwner && (
              <>
                <Link
                  href={`/vlog/${id}/edit`}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-sm border border-gray-700 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-full text-sm border border-red-600/30 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Creator Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4 flex items-center gap-3">
          <Link href={`/profile/${vlog.creator._id}`}>
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0">
              {vlog.creator.avatar ? (
                <img src={vlog.creator.avatar} alt={vlog.creator.name} className="w-full h-full object-cover" />
              ) : (
                vlog.creator.name?.[0]?.toUpperCase()
              )}
            </div>
          </Link>
          <div>
            <Link href={`/profile/${vlog.creator._id}`}>
              <p className="text-white font-semibold hover:text-blue-400 transition-colors">
                {vlog.creator.name}
              </p>
            </Link>
            {vlog.creator.bio && (
              <p className="text-gray-400 text-sm">{vlog.creator.bio}</p>
            )}
          </div>
        </div>

        {/* Description */}
        {vlog.description && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{vlog.description}</p>
          </div>
        )}

        {/* Tags */}
        {vlog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {vlog.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full border border-gray-700"
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
          <h3 className="text-white font-semibold mb-3">Related Vlogs</h3>
          <div className="space-y-3">
            {relatedVlogs.map((related) => (
              <Link key={related._id} href={`/vlog/${related._id}`}>
                <div className="flex gap-3 bg-gray-900 border border-gray-800 rounded-xl p-2 hover:border-gray-600 transition-colors">
                  <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-gray-800 shrink-0">
                    {related.thumbnailUrl && (
                      <Image
                        src={related.thumbnailUrl}
                        alt={related.title}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium line-clamp-2">{related.title}</p>
                    <p className="text-gray-400 text-xs mt-1">{related.creator?.name}</p>
                    <p className="text-gray-500 text-xs">👁 {formatCount(related.viewCount)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-bold text-lg mb-2">Delete Vlog?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This will permanently delete your vlog and remove it from Cloudinary. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm transition-colors"
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