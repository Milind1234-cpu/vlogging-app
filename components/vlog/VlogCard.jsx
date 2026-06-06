import Link from 'next/link';
import Image from 'next/image';

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

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
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function VlogCard({ vlog }) {
  return (
    <Link href={`/vlog/${vlog._id}`} className="group block vlog-card">
      <div className="bg-gray-900/60 rounded-2xl overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all duration-300">

        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-800 overflow-hidden">
          {vlog.thumbnailUrl ? (
            <Image
              src={vlog.thumbnailUrl}
              alt={vlog.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <span className="text-gray-600 text-4xl">🎬</span>
            </div>
          )}

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Duration Badge */}
          {vlog.duration > 0 && (
            <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-lg font-mono font-medium">
              {formatDuration(vlog.duration)}
            </span>
          )}

          {/* Category Badge */}
          {vlog.category && (
            <span className="absolute top-2 left-2 bg-indigo-600/80 backdrop-blur-sm text-white text-xs px-2.5 py-0.5 rounded-full capitalize font-medium">
              {vlog.category}
            </span>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 mb-3 group-hover:text-indigo-300 transition-colors">
            {vlog.title}
          </h3>

          {/* Creator Row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 ring-1 ring-white/10">
              {vlog.creator?.avatar ? (
                <img src={vlog.creator.avatar} alt={vlog.creator.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs text-white font-bold">
                  {vlog.creator?.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-gray-400 text-xs truncate">{vlog.creator?.name}</span>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span>👁</span> {formatCount(vlog.viewCount)}
              </span>
              <span className="flex items-center gap-1">
                <span>❤️</span> {formatCount(vlog.likeCount)}
              </span>
            </div>
            <span>{timeAgo(vlog.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}