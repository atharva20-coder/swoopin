'use client'
import { useQueryAutomations } from '@/hooks/user-queries'
import React from 'react'
import { Montserrat } from 'next/font/google'
import { useMemo } from 'react'
import { useParams } from 'next/navigation'

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
})

const MetricsCard = () => {
  const params = useParams()
  const { data, isLoading } = useQueryAutomations({
    refetchInterval: 5000, // Refresh data every 5 seconds
  })
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  
  const metrics = useMemo(() => {
    if (!data?.data) return { comments: 0, dms: 0, commentChange: 0, dmChange: 0 }

    const currentMonthData = data.data.filter(item => {
      const itemDate = new Date(item.createdAt)
      return itemDate.getMonth() === currentMonth
    })

    const previousMonthData = data.data.filter(item => {
      const itemDate = new Date(item.createdAt)
      return itemDate.getMonth() === (currentMonth - 1)
    })

    const currentComments = currentMonthData.reduce((sum, item) => sum + (item.listener?.commentCount || 0), 0)
    const previousComments = previousMonthData.reduce((sum, item) => sum + (item.listener?.commentCount || 0), 0)
    const commentChange = previousComments ? ((currentComments - previousComments) / previousComments) * 100 : 0

    const currentDms = currentMonthData.reduce((sum, item) => sum + (item.listener?.dmCount || 0), 0)
    const previousDms = previousMonthData.reduce((sum, item) => sum + (item.listener?.dmCount || 0), 0)
    const dmChange = previousDms ? ((currentDms - previousDms) / previousDms) * 100 : 0

    return {
      comments: currentComments,
      dms: currentDms,
      commentChange: commentChange,
      dmChange: dmChange
    }
  }, [data?.data, currentMonth])

  if (isLoading) {
    return (
      <div className="h-full flex lg:flex-row flex-col gap-5 items-end">
        {[
          { title: "Comments", subtitle: "On your posts" },
          { title: "Direct Messages", subtitle: "On your account" },
        ].map((item, i) => (
          <div
            key={i}
            className="p-5 border-[1px] flex flex-col gap-y-20 rounded-xl w-full lg:w-6/12"
          >
            <div>
              <h2 className="text-3xl text-white font-bold">{item.title}</h2>
              <p className="text-sm text-text-secondary">{item.subtitle}</p>
            </div>
            <div>
              <div className="h-9 w-24 bg-muted rounded-md animate-pulse" />
              <div className="h-5 w-48 bg-muted rounded-md mt-2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-col justify-center items-center py-2 px-4 gap-1 bg-white rounded-lg border border-gray-200 shadow-sm relative w-full"
        >
          <div className="flex flex-row items-center gap-2 w-full max-w-[320px] min-h-[40px]">
            <div className="flex justify-center items-center p-1 w-10 h-10 -mt-1 bg-[rgba(176,224,230,0.2)] rounded-full shrink-0">
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none" className="w-8 h-8">
                <path d="M30 6H6C4.35 6 3.015 7.35 3.015 9L3 27C3 28.65 4.35 30 6 30H30C31.65 30 33 28.65 33 27V9C33 7.35 31.65 6 30 6ZM30 27H6V12L18 19.5L30 12V27ZM18 16.5L6 9H30L18 16.5Z" fill={i === 1 ? "#F2994A" : "#4682B4"}/>
              </svg>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className={`${montserrat.className} text-xl font-semibold leading-7 text-[rgba(0,0,0,0.75)] truncate`}>
                {i === 1 ? metrics.comments : metrics.dms}
              </span>
              <span className={`${montserrat.className} text-sm leading-5 text-[rgba(0,0,0,0.5)] truncate`}>
                {i === 1 ? 'Comments' : "Message's"}
              </span>
            </div>
          </div>
          <div className="flex flex-row items-center justify-center gap-2 w-full max-w-[320px] h-4">
            <div className="flex flex-row items-center gap-0.5">
              {(i === 1 ? metrics.commentChange : metrics.dmChange) >= 0 ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4.5 11.5L11.5 4.5M11.5 4.5H6.5M11.5 4.5V9.5" stroke="#27AE60" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className={`${montserrat.className} text-xs leading-[15px] text-[#27AE60]`}>
                    {Math.abs(i === 1 ? metrics.commentChange : metrics.dmChange).toFixed(2)}%
                  </span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M11.5 4.5L4.5 11.5M4.5 11.5H9.5M4.5 11.5V6.5" stroke="#EB5757" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className={`${montserrat.className} text-xs leading-[15px] text-[#EB5757]`}>
                    {Math.abs(i === 1 ? metrics.commentChange : metrics.dmChange).toFixed(2)}%
                  </span>
                </>
              )}
            </div>
            <span className={`${montserrat.className} text-xs leading-[15px] text-[rgba(0,0,0,0.35)] whitespace-nowrap`}>Since last month</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MetricsCard
