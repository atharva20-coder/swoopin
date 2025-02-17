'use client'
import { useQueryAutomations } from '@/hooks/user-queries'
import React from 'react'

const MetricsCard = () => {
  const { data } = useQueryAutomations({
    refetchInterval: 5000, // Refresh data every 5 seconds
  })
  const comments = data?.data.reduce((current, next) => {
    return current + next.listener?.commentCount!
  }, 0)

  const dms = data?.data?.reduce((current, next) => {
    return current + next.listener?.dmCount!
  }, 0)

  return (
    <div className="h-full flex lg:flex-row flex-col gap-3">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="py-1.5 px-6 bg-gray-50/80 flex flex-row items-center justify-between rounded-full w-full lg:w-6/12"
        >
          {i === 1 ? (
            <div>
              <h2 className="text-base text-black font-semibold">Comments</h2>
              <p className="text-xs text-text-secondary">On your posts</p>
            </div>
          ) : (
            <div>
              <h2 className="text-base text-black font-semibold">Direct Messages</h2>
              <p className="text-xs text-text-secondary">On your account</p>
            </div>
          )}
          {i === 1 ? (
            <div className="text-right">
              <h3 className="text-lg font-semibold">100%</h3>
              <p className="text-xs text-text-secondary">
                {comments} out of {comments} comments
              </p>
            </div>
          ) : (
            <div className="text-right">
              <h3 className="text-lg font-semibold">100%</h3>
              <p className="text-xs text-text-secondary">
                {dms} out of {dms} DMs
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default MetricsCard