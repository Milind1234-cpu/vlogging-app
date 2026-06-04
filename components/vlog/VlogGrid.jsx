import VlogCard from './VlogCard';

export default function VlogGrid({ vlogs, loading }) {

  // Loading state — show skeleton cards
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 animate-pulse">
            {/* Thumbnail skeleton */}
            <div className="aspect-video bg-gray-800" />
            {/* Content skeleton */}
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-800 rounded w-3/4" />
              <div className="h-3 bg-gray-800 rounded w-1/2" />
              <div className="h-3 bg-gray-800 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!vlogs || vlogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-6xl mb-4">🎬</span>
        <h3 className="text-white text-xl font-semibold mb-2">No vlogs yet</h3>
        <p className="text-gray-400 text-sm">Be the first to upload a vlog!</p>
      </div>
    );
  }

  // Actual grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {vlogs.map((vlog) => (
        <VlogCard key={vlog._id} vlog={vlog} />
      ))}
    </div>
  );
}