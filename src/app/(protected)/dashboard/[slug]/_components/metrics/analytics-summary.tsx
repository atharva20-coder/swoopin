'use client'
import React from 'react'
import { useAnalytics } from '@/hooks/use-analytics'
import { useQueryInstagramProfile } from '@/hooks/user-queries'
import { useParams } from 'next/navigation'
import { Send, MessageCircle, TrendingUp, Zap, Users, Link2 } from 'lucide-react'
import { usePlatform } from '@/context/platform-context'

type MetricCardProps = {
  label: string
  value: string | number
  change: number
  icon: React.ReactNode
  gradient: string
  isLoading?: boolean
}

const MetricCard = ({ label, value, change, icon, gradient, isLoading = false }: MetricCardProps) => {
  const isPositive = change >= 0
  
  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 mb-4" />
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    )
  }
  
  return (
    <div className="group p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300">
      <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
        </div>
        {change !== 0 && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            isPositive 
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
              : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  )
}

const formatValue = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}

const AnalyticsSummary = () => {
  const params = useParams()
  const { data: analytics, isLoading: isLoadingAnalytics } = useAnalytics(params.slug as string)
  const { data: instagramProfile, isLoading: isLoadingProfile } = useQueryInstagramProfile()
  const { activePlatform } = usePlatform()
  
  const isLoading = isLoadingAnalytics || isLoadingProfile
  const followerCount = instagramProfile?.status === 200 ? instagramProfile.data?.follower_count || 0 : 0
  
  const processedMetrics = React.useMemo(() => {
    // If specific platform selected but not Instagram, show zeros (other platforms coming soon)
    if (activePlatform !== 'all' && activePlatform !== 'instagram') {
      return {
        totalMessages: { value: '0', change: 0 },
        totalResponses: { value: '0', change: 0 },
        engagement: { value: '0%', change: 0 },
        automations: { value: '0', change: 0 },
        reach: { value: '0', change: 0 },
        conversions: { value: '0', change: 0 }
      }
    }

    if (!analytics?.data) {
      return {
        totalMessages: { value: '0', change: 0 },
        totalResponses: { value: '0', change: 0 },
        engagement: { value: '0%', change: 0 },
        automations: { value: '0', change: 0 },
        reach: { value: '0', change: 0 },
        conversions: { value: '0', change: 0 }
      }
    }

    const chartData = analytics.data.chartData || []
    const currentMonth = new Date().getMonth()
    
    const currentData = chartData.find(item => new Date(item.date).getMonth() === currentMonth) || { dmCount: 0, commentCount: 0, activity: 0 }
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousData = chartData.find(item => new Date(item.date).getMonth() === previousMonth) || { dmCount: 0, commentCount: 0, activity: 0 }

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const totalInteractions = currentData.dmCount + currentData.commentCount
    const previousInteractions = previousData.dmCount + previousData.commentCount
    const engagementRate = followerCount > 0 ? (totalInteractions / followerCount) * 100 : 0

    return {
      totalMessages: { value: formatValue(analytics.data.totalDms || 0), change: calculateChange(currentData.dmCount, previousData.dmCount) },
      totalResponses: { value: formatValue(analytics.data.totalComments || 0), change: calculateChange(currentData.commentCount, previousData.commentCount) },
      engagement: { value: `${engagementRate.toFixed(1)}%`, change: 0 },
      automations: { value: formatValue(0), change: 0 },
      reach: { value: formatValue(totalInteractions), change: calculateChange(totalInteractions, previousInteractions) },
      conversions: { value: formatValue(analytics.data.totalDms || 0), change: 0 }
    }
  }, [analytics?.data, followerCount, activePlatform])
  
  const metrics = [
    { label: 'Messages Sent', ...processedMetrics.totalMessages, icon: <Send className="w-5 h-5 text-white" />, gradient: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { label: 'Responses', ...processedMetrics.totalResponses, icon: <MessageCircle className="w-5 h-5 text-white" />, gradient: 'bg-gradient-to-br from-purple-500 to-purple-600' },
    { label: 'Engagement', ...processedMetrics.engagement, icon: <TrendingUp className="w-5 h-5 text-white" />, gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
    { label: 'Active Automations', ...processedMetrics.automations, icon: <Zap className="w-5 h-5 text-white" />, gradient: 'bg-gradient-to-br from-orange-500 to-orange-600' },
    { label: 'Total Reach', ...processedMetrics.reach, icon: <Users className="w-5 h-5 text-white" />, gradient: 'bg-gradient-to-br from-pink-500 to-pink-600' },
    { label: 'Conversions', ...processedMetrics.conversions, icon: <Link2 className="w-5 h-5 text-white" />, gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600' }
  ]
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} isLoading={isLoading} />
      ))}
    </div>
  )
}

export default AnalyticsSummary