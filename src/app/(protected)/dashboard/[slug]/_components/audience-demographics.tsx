'use client'
import React from 'react'
import { useInstagramInsights } from '@/hooks/use-instagram-insights'
import { MapPin, Users2 } from 'lucide-react'
import type { AudienceDemographic } from '@/lib/instagram/insights'

const AudienceDemographics = () => {
  const { data: insights, isLoading } = useInstagramInsights()
  
  const audience = insights?.status === 200 ? insights.data?.audience : null
  
  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
        <div className="animate-pulse">
          <div className="h-6 w-40 bg-neutral-200 dark:bg-neutral-700 rounded mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
                <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // If no audience data (permission not granted), show placeholder
  if (!audience || audience.followerDemographics.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
        <div className="flex items-center gap-2 mb-4">
          <Users2 className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Audience Demographics
          </h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Connect Instagram with insights permission to see your audience breakdown.
        </p>
      </div>
    )
  }

  const renderDemographicList = (items: AudienceDemographic[], colorFrom: string, colorTo: string) => (
    <div className="space-y-2">
      {items.slice(0, 5).map((item) => (
        <div key={item.dimension} className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
            {item.dimension}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${colorFrom} ${colorTo} rounded-full`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
              {item.percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
      <div className="flex items-center gap-2 mb-6">
        <Users2 className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Audience Demographics
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Follower Demographics */}
        {audience.followerDemographics.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Follower Breakdown
              </h4>
            </div>
            {renderDemographicList(audience.followerDemographics, 'from-blue-500', 'to-purple-500')}
          </div>
        )}

        {/* Reached Audience */}
        {audience.reachedDemographics.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Reached Audience
              </h4>
            </div>
            {renderDemographicList(audience.reachedDemographics, 'from-emerald-500', 'to-teal-500')}
          </div>
        )}

        {/* Engaged Audience */}
        {audience.engagedDemographics.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Engaged Audience
              </h4>
            </div>
            {renderDemographicList(audience.engagedDemographics, 'from-pink-500', 'to-rose-500')}
          </div>
        )}
      </div>
    </div>
  )
}

export default AudienceDemographics
