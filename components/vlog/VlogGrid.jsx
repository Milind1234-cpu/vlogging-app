import VlogCard from './VlogCard';

export default function VlogGrid({ vlogs, loading }) {

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-900/60 rounded-2xl overflow-hidden border border-white/5">
            <div className="aspect-video shimmer" />
            <div className="p-4 space-y-3">
              <div className="h-4 shimmer rounded-lg w-3/4" />
              <div className="h-3 shimmer rounded-lg w-1/2" />
              <div className="h-3 shimmer rounded-lg w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!vlogs || vlogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="text-7xl mb-6" style={{ animation: 'float 3s ease-in-out infinite' }}>🎬</div>
        <h3 className="text-white text-2xl font-bold mb-2">No vlogs yet</h3>
        <p className="text-gray-400 text-sm max-w-xs">
          Be the first to share your story with the world
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {vlogs.map((vlog) => (
        <VlogCard key={vlog._id} vlog={vlog} />
      ))}
    </div>
  );
}