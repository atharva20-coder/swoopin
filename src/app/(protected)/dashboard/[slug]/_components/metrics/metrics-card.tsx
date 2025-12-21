'use client'
import { useQueryAutomations } from '@/hooks/user-queries'
import React, { useMemo } from 'react'

const MetricsCard = () => {
  const { data, isLoading } = useQueryAutomations({ refetchInterval: 5000 })
  const currentMonth = new Date().getMonth()
  
  const metrics = useMemo(() => {
    if (!data?.data) return { comments: 0, dms: 0, replies: 0 }

    const currentMonthData = data.data.filter(item => new Date(item.createdAt).getMonth() === currentMonth)
    return {
      comments: currentMonthData.reduce((sum, item) => sum + (item.listener?.commentCount || 0), 0),
      dms: currentMonthData.reduce((sum, item) => sum + (item.listener?.dmCount || 0), 0),
      replies: currentMonthData.reduce((sum, item) => sum + (item.listener?.commentReply ? 1 : 0), 0)
    }
  }, [data?.data, currentMonth])

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 animate-pulse">
        <div className="h-6 w-40 bg-gray-100 dark:bg-neutral-800 rounded mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-neutral-800 rounded-xl" />)}
        </div>
      </div>
    )
  }

  const platforms = [
    { name: 'Instagram', color: '#E1306C', isActive: true, stats: `${metrics.dms} DMs · ${metrics.comments} comments` },
    { name: 'Threads', color: '#000000', isActive: false },
    { name: 'Facebook', color: '#1877F2', isActive: false },
    { name: 'Newsletter', color: '#FFD700', isActive: false }
  ]

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Platform Breakdown</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {platforms.map((platform) => (
          <div 
            key={platform.name}
            className={`p-4 rounded-xl transition-all ${
              platform.isActive 
                ? 'bg-gradient-to-br from-pink-50 to-orange-50 dark:from-pink-900/10 dark:to-orange-900/10 border border-pink-200 dark:border-pink-900/30' 
                : 'bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: platform.color }} />
                <span className={`text-sm font-medium ${platform.isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                  {platform.name}
                </span>
              </div>
              {!platform.isActive && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-neutral-700 text-gray-500 dark:text-gray-400">
                  Soon
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {platform.isActive ? platform.stats : 'Coming soon'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MetricsCard
