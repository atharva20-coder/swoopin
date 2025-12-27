export default function Loading() {
  return (
    <div className="flex flex-col h-full p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-48 bg-gray-200 dark:bg-neutral-800 rounded" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-neutral-800 rounded-lg" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-100 dark:border-neutral-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-800" />
              <div className="space-y-2">
                <div className="h-6 w-12 bg-gray-200 dark:bg-neutral-800 rounded" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-neutral-800 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="flex-1 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-4">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-neutral-800 last:border-0">
              <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-neutral-800" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 bg-gray-200 dark:bg-neutral-800 rounded" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-neutral-800 rounded" />
              </div>
              <div className="h-8 w-20 bg-gray-200 dark:bg-neutral-800 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
