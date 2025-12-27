'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Loading skeleton for inbox
const InboxSkeleton = () => (
  <div className="w-full">
    <div className="animate-pulse">
      <div className="h-8 w-32 bg-gray-200 dark:bg-neutral-800 rounded mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-gray-200 dark:border-neutral-800">
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-neutral-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-neutral-700 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-neutral-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Dynamic import with loading state - only loads when component is rendered
const InboxView = dynamic(
  () => import('./_components/inbox-view'),
  {
    loading: () => <InboxSkeleton />,
    ssr: false, // Disable SSR for this heavy component
  }
)

export default function InboxPage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <InboxView />
    </div>
  )
}
