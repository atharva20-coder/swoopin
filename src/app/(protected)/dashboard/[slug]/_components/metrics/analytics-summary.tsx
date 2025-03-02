'use client'
import React from 'react'
import { useAnalytics } from '@/hooks/use-analytics'
import { useParams } from 'next/navigation'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
})

type MetricCardProps = {
  label: string
  value: string | number
  change: number
  previousValue: string | number
  isLoading?: boolean
}

const MetricCard = ({ label, value, change, previousValue, isLoading = false }: MetricCardProps) => {
  const isPositive = change >= 0
  const formattedChange = Math.abs(change).toFixed(1)
  
  if (isLoading) {
    return (
      <div className="flex flex-col gap-1">
        <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-10 w-24 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-40 bg-gray-200 animate-pulse rounded"></div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col">
      <span className="text-gray-600 text-xs">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-black">{value}</span>
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${isPositive ? 'bg-[#ECFDF3] text-[#27AE60]' : 'bg-[#FEE4E2] text-[#EB5757]'}`}>
          {isPositive ? '+' : '-'}{formattedChange}%
        </span>
      </div>
      <span className="text-gray-500 text-xs">{previousValue} from previous month</span>
    </div>
  )
}

const formatValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }
  return value.toString()
}

const AnalyticsSummary = () => {
  const params = useParams()
  const { data: analytics, isLoading } = useAnalytics(params.slug as string)
  
  const processedMetrics = React.useMemo(() => {
    if (!analytics?.data) {
      return {
        totalDms: { value: '0', change: 0, previousValue: '0' },
        totalComments: { value: '0', change: 0, previousValue: '0' },
        engagement: { value: '0%', change: 0, previousValue: '0%' },
        activity: { value: '0', change: 0, previousValue: '0' },
        interactions: { value: '0', change: 0, previousValue: '0' }
      }
    }

    const chartData = analytics.data.chartData || []
    const currentMonth = new Date().getMonth()
    
    const currentData = chartData.find(item => new Date(item.date).getMonth() === currentMonth) || {
      dmCount: 0,
      commentCount: 0,
      activity: 0
    }

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousData = chartData.find(item => new Date(item.date).getMonth() === previousMonth) || {
      dmCount: 0,
      commentCount: 0,
      activity: 0
    }

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 0
      return ((current - previous) / previous) * 100
    }

    const totalInteractions = currentData.dmCount + currentData.commentCount
    const previousInteractions = previousData.dmCount + previousData.commentCount
    const engagementRate = totalInteractions > 0 ? (currentData.activity / totalInteractions) : 0
    const previousEngagementRate = previousInteractions > 0 ? (previousData.activity / previousInteractions) : 0

    return {
      totalDms: {
        value: formatValue(analytics.data.totalDms || 0),
        change: calculateChange(currentData.dmCount, previousData.dmCount),
        previousValue: formatValue(previousData.dmCount)
      },
      totalComments: {
        value: formatValue(analytics.data.totalComments || 0),
        change: calculateChange(currentData.commentCount, previousData.commentCount),
        previousValue: formatValue(previousData.commentCount)
      },
      engagement: {
        value: `${(engagementRate * 100).toFixed(1)}%`,
        change: calculateChange(engagementRate, previousEngagementRate),
        previousValue: `${(previousEngagementRate * 100).toFixed(1)}%`
      },
      activity: {
        value: formatValue(currentData.activity || 0),
        change: calculateChange(currentData.activity, previousData.activity),
        previousValue: formatValue(previousData.activity)
      },
      interactions: {
        value: formatValue(totalInteractions),
        change: calculateChange(totalInteractions, previousInteractions),
        previousValue: formatValue(previousInteractions)
      }
    }
  }, [analytics?.data])
  
  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="p-3 sm:p-0 bg-white rounded-lg border border-gray-100 sm:border-0 shadow-sm sm:shadow-none">
          <MetricCard 
            label="Total DMs" 
            value={processedMetrics.totalDms.value} 
            change={processedMetrics.totalDms.change} 
            previousValue={processedMetrics.totalDms.previousValue}
            isLoading={isLoading} 
          />
        </div>
        <div className="p-3 sm:p-0 bg-white rounded-lg border border-gray-100 sm:border-0 shadow-sm sm:shadow-none">
          <MetricCard 
            label="Total Comments" 
            value={processedMetrics.totalComments.value} 
            change={processedMetrics.totalComments.change} 
            previousValue={processedMetrics.totalComments.previousValue}
            isLoading={isLoading} 
          />
        </div>
        <div className="p-3 sm:p-0 bg-white rounded-lg border border-gray-100 sm:border-0 shadow-sm sm:shadow-none">
          <MetricCard 
            label="Engagement Rate" 
            value={processedMetrics.engagement.value} 
            change={processedMetrics.engagement.change} 
            previousValue={processedMetrics.engagement.previousValue}
            isLoading={isLoading} 
          />
        </div>
        <div className="p-3 sm:p-0 bg-white rounded-lg border border-gray-100 sm:border-0 shadow-sm sm:shadow-none">
          <MetricCard 
            label="Activity" 
            value={processedMetrics.activity.value} 
            change={processedMetrics.activity.change} 
            previousValue={processedMetrics.activity.previousValue}
            isLoading={isLoading} 
          />
        </div>
        <div className="p-3 sm:p-0 bg-white rounded-lg border border-gray-100 sm:border-0 shadow-sm sm:shadow-none">
          <MetricCard 
            label="Total Interactions" 
            value={processedMetrics.interactions.value} 
            change={processedMetrics.interactions.change} 
            previousValue={processedMetrics.interactions.previousValue}
            isLoading={isLoading} 
          />
        </div>
      </div>
    </div>
  )
}

export default AnalyticsSummary