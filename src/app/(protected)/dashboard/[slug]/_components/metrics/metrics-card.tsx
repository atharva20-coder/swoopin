'use client'
import { useQueryAutomations } from '@/hooks/user-queries'
import React from 'react'
import { Montserrat } from 'next/font/google'
import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { CalendarIcon } from 'lucide-react'

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
    if (!data?.data) return { comments: 0, dms: 0, commentReply: 0, commentChange: 0, dmChange: 0, commentReplyChange: 0 }

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

    const currentCommentReply = currentMonthData.reduce((sum, item) => sum + (item.listener?.commentReply ? 1 : 0), 0)
    const previousCommentReply = previousMonthData.reduce((sum, item) => sum + (item.listener?.commentReply ? 1 : 0), 0)
    const commentReplyChange = previousCommentReply ? ((currentCommentReply - previousCommentReply) / previousCommentReply) * 100 : 0

    return {
      comments: currentComments,
      dms: currentDms,
      commentReply: currentCommentReply,
      commentChange: commentChange,
      dmChange: dmChange,
      commentReplyChange: commentReplyChange
    }
  }, [data?.data, currentMonth])

  if (isLoading) {
    return (
      <div className="h-full flex lg:flex-row flex-col gap-5 items-end">
        {[
          { title: "Comments", subtitle: "On your posts" },
          { title: "Direct Messages", subtitle: "On your account" },
          { title: "Comment Replies", subtitle: "On your comments" },
        ].map((item, i) => (
          <div
            key={i}
            className="p-5 border border-gray-200 flex flex-col gap-y-20 rounded-xl w-full lg:w-6/12"
          >
            <div>
              <h2 className="text-3xl text-gray-900 font-bold">{item.title}</h2>
              <p className="text-sm text-gray-500">{item.subtitle}</p>
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

  const ComingSoonCard = ({ platform, color }: { platform: string; color: string }) => (
    <div className="flex flex-col p-6 bg-white rounded-lg border border-gray-200 shadow-sm h-[200px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className={`${montserrat.className} text-lg font-semibold text-gray-900`}>{platform}</span>
        </div>
        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">Coming Soon</span>
      </div>
      <div className="flex-1 flex flex-col justify-center space-y-4">
        <div className="space-y-3">
          <div className="h-6 bg-gray-100 rounded-md w-24 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded-md w-32 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded-md w-20 animate-pulse" />
        </div>
      </div>
    </div>
  )

  return ( 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Instagram Card - Dynamic Data */}
        <div className="flex flex-col p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E1306C]" />
            <span className={`${montserrat.className} text-base font-semibold text-gray-900`}>Instagram</span>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Comments', value: metrics.comments, change: metrics.commentChange },
              { label: 'Direct Messages', value: metrics.dms, change: metrics.dmChange },
              { label: 'Comment Replies', value: metrics.commentReply, change: metrics.commentReplyChange }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className={`${montserrat.className} text-xs text-gray-500`}>{item.label}</span>
                <span className={`${montserrat.className} text-sm font-bold text-gray-900`}>{item.value}</span>
                <div className="flex items-center gap-1">
                  {item.change >= 0 ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M4.5 11.5L11.5 4.5M11.5 4.5H6.5M11.5 4.5V9.5" stroke="#27AE60" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className={`${montserrat.className} text-[10px] text-[#27AE60]`}>{Math.abs(item.change).toFixed(1)}%</span>
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M11.5 4.5L4.5 11.5M4.5 11.5H9.5M4.5 11.5V6.5" stroke="#EB5757" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className={`${montserrat.className} text-[10px] text-[#EB5757]`}>{Math.abs(item.change).toFixed(1)}%</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Coming Soon Cards */}
        <div className="flex flex-col p-4 bg-white rounded-lg border border-gray-200 shadow-sm h-[180px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-black" />
              <span className={`${montserrat.className} text-sm font-semibold text-gray-900`}>Threads</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">Coming Soon</span>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-3">
            <div className="space-y-2">
              <div className="h-5 bg-gray-100 rounded-md w-20 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded-md w-28 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded-md w-16 animate-pulse" />
            </div>
          </div>
        </div>
    
        <div className="flex flex-col p-4 bg-white rounded-lg border border-gray-200 shadow-sm h-[180px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1877F2]" />
              <span className={`${montserrat.className} text-sm font-semibold text-gray-900`}>Facebook</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">Coming Soon</span>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-3">
            <div className="space-y-2">
              <div className="h-5 bg-gray-100 rounded-md w-20 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded-md w-28 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded-md w-16 animate-pulse" />
            </div>
          </div>
        </div>
    
        <div className="flex flex-col p-4 bg-white rounded-lg border border-gray-200 shadow-sm h-[180px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFD700]" />
              <span className={`${montserrat.className} text-sm font-semibold text-gray-900`}>Newsletter</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">Coming Soon</span>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-3">
            <div className="space-y-2">
              <div className="h-5 bg-gray-100 rounded-md w-20 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded-md w-28 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded-md w-16 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

  )
}

export default MetricsCard
