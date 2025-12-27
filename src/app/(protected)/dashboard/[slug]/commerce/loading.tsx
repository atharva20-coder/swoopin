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

      {/* Search and filters skeleton */}
      <div className="flex items-center gap-4 mb-4">
        <div className="h-10 w-64 bg-gray-200 dark:bg-neutral-800 rounded-lg" />
        <div className="flex gap-2 ml-auto">
          <div className="h-10 w-10 bg-gray-200 dark:bg-neutral-800 rounded-lg" />
          <div className="h-10 w-10 bg-gray-200 dark:bg-neutral-800 rounded-lg" />
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="flex-1 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-4">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-3">
              <div className="aspect-square rounded-lg bg-gray-200 dark:bg-neutral-700 mb-3" />
              <div className="h-5 w-full bg-gray-200 dark:bg-neutral-700 rounded mb-2" />
              <div className="h-4 w-16 bg-gray-200 dark:bg-neutral-700 rounded mb-2" />
              <div className="h-6 w-20 bg-gray-200 dark:bg-neutral-700 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
