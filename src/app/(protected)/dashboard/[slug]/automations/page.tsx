'use client'

import dynamic from 'next/dynamic'
import CreateAutomation from '@/components/global/create-automation'
import Search from '@/components/global/infobar/search'
import { Zap } from 'lucide-react'
import React from 'react'

// Loading skeleton for automation list
const AutomationListSkeleton = () => (
  <div className="flex flex-col gap-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div 
        key={i} 
        className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5 animate-pulse"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-neutral-700" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/3 bg-gray-200 dark:bg-neutral-700 rounded" />
              <div className="h-4 w-1/2 bg-gray-100 dark:bg-neutral-800 rounded" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="h-6 w-16 bg-gray-100 dark:bg-neutral-800 rounded-full" />
            <div className="h-4 w-24 bg-gray-100 dark:bg-neutral-800 rounded" />
          </div>
        </div>
      </div>
    ))}
  </div>
)

// Dynamic import for AutomationList - code split for faster initial load
const AutomationList = dynamic(
  () => import('@/components/global/automation-list'),
  {
    loading: () => <AutomationListSkeleton />,
    ssr: true, // Keep SSR for SEO
  }
)

const Page = () => {
  return (
    <div className="flex flex-col gap-6 w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Automations</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage your automated workflows</p>
            </div>
          </div>
        </div>
        <CreateAutomation />
      </div>

      {/* Search Bar */}
      <div className="w-full">
        <Search slug="" />
      </div>

      {/* Automations List - Dynamically loaded */}
      <AutomationList />
    </div>
  )
}

export default Page
