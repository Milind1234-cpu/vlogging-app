import Link from 'next/link';
import Image from 'next/image';

// Helper — converts seconds to "8:07" format
function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Helper — converts 3820 to "3.8K", 1200000 to "1.2M"
function formatCount(num) {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Helper — converts date to "3 days ago"
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
    <Link href={`/vlog/${vlog._id}`} className="group block">
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-all duration-200 hover:transform hover:scale-[1.02]">

        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-800">
          {vlog.thumbnailUrl ? (
            <Image
              src={vlog.thumbnailUrl}
              alt={vlog.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            // Fallback if no thumbnail
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-600 text-4xl">🎬</span>
            </div>
          )}

          {/* Duration Badge — bottom right of thumbnail */}
          {vlog.duration > 0 && (
            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded font-mono">
              {formatDuration(vlog.duration)}
            </span>
          )}

          {/* Category Badge — top left */}
          {vlog.category && (
            <span className="absolute top-2 left-2 bg-blue-600/80 text-white text-xs px-2 py-0.5 rounded-full capitalize">
              {vlog.category}
            </span>
          )}
        </div>

        {/* Card Body */}
        <div className="p-3">

          {/* Title — max 2 lines */}
          <h3 className="text-white font-medium text-sm leading-snug line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
            {vlog.title}
          </h3>

          {/* Creator Row */}
          <div className="flex items-center gap-2 mb-2">
            {/* Avatar */}
            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white font-semibold shrink-0 overflow-hidden">
              {vlog.creator?.avatar ? (
                <img src={vlog.creator.avatar} alt={vlog.creator.name} className="w-full h-full object-cover" />
              ) : (
                vlog.creator?.name?.[0]?.toUpperCase()
              )}
            </div>
            <span className="text-gray-400 text-xs truncate">{vlog.creator?.name}</span>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              {/* Views */}
              <span>👁 {formatCount(vlog.viewCount)}</span>
              {/* Likes */}
              <span>❤ {formatCount(vlog.likeCount)}</span>
            </div>
            {/* Time ago */}
            <span>{timeAgo(vlog.createdAt)}</span>
          </div>

        </div>
      </div>
    </Link>
  );
}   