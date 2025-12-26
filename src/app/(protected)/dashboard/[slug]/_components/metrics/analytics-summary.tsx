'use client'
import React from 'react'
import { useAnalytics } from '@/hooks/use-analytics'
import { useQueryInstagramProfile } from '@/hooks/user-queries'
import { useInstagramInsights } from '@/hooks/use-instagram-insights'
import { useParams } from 'next/navigation'
import { Send, MessageCircle, TrendingUp, Zap, Users, Eye, MousePointer, UserPlus } from 'lucide-react'
import { usePlatform } from '@/context/platform-context'

type MetricCardProps = {
  label: string
  value: string | number
  change?: number
  icon: React.ReactNode
  gradient: string
  isLoading?: boolean
  sublabel?: string
}

const MetricCard = ({ label, value, change, icon, gradient, isLoading = false, sublabel }: MetricCardProps) => {
  const isPositive = (change ?? 0) >= 0
  
  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-700 mb-4" />
        <div className="h-8 w-16 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
        <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
      </div>
    )
  }
  
  return (
    <div className="group p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-300">
      <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
          {sublabel && (
            <p className="text-xs text-gray-400 dark:text-gray-500">{sublabel}</p>
          )}
        </div>
        {change !== undefined && change !== 0 && (
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
  const { data: insights, isLoading: isLoadingInsights } = useInstagramInsights()
  const { activePlatform } = usePlatform()
  
  const isLoading = isLoadingAnalytics || isLoadingProfile || isLoadingInsights
  const followerCount = instagramProfile?.status === 200 ? instagramProfile.data?.follower_count || 0 : 0
  
  // Instagram API Insights (real data from Meta)
  const accountInsights = insights?.status === 200 ? insights.data?.account : null
  
  const processedMetrics = React.useMemo(() => {
    // If specific platform selected but not Instagram, show zeros (other platforms coming soon)
    if (activePlatform !== 'all' && activePlatform !== 'instagram') {
      return {
        followers: { value: '0', change: 0 },
        reach: { value: '0', change: 0 },
        interactions: { value: '0', change: 0 },
        profileViews: { value: '0', change: 0 },
        websiteClicks: { value: '0', change: 0 },
        accountsEngaged: { value: '0', change: 0 },
      }
    }

    // Use real Instagram insights if available
    if (accountInsights) {
      const engagementRate = accountInsights.reach > 0 
        ? ((accountInsights.totalInteractions / accountInsights.reach) * 100).toFixed(1)
        : '0'
      return {
        followers: { value: formatValue(accountInsights.followerCount || followerCount), change: undefined },
        reach: { value: formatValue(accountInsights.reach), change: undefined },
        interactions: { value: formatValue(accountInsights.totalInteractions), change: undefined },
        profileViews: { value: formatValue(accountInsights.profileViews), change: undefined },
        websiteClicks: { value: formatValue(accountInsights.websiteClicks), change: undefined },
        accountsEngaged: { value: formatValue(accountInsights.accountsEngaged), change: undefined },
      }
    }

    // Fallback to internal analytics
    if (!analytics?.data) {
      return {
        followers: { value: formatValue(followerCount), change: undefined },
        reach: { value: '0', change: undefined },
        interactions: { value: '0', change: undefined },
        profileViews: { value: '0', change: undefined },
        websiteClicks: { value: '0', change: undefined },
        accountsEngaged: { value: '0', change: undefined },
      }
    }

    const totalInteractions = (analytics.data.totalDms || 0) + (analytics.data.totalComments || 0)

    return {
      followers: { value: formatValue(followerCount), change: undefined },
      reach: { value: formatValue(totalInteractions), change: undefined },
      interactions: { value: formatValue(totalInteractions), change: undefined },
      profileViews: { value: '—', change: undefined },
      websiteClicks: { value: '—', change: undefined },
      accountsEngaged: { value: '—', change: undefined },
    }
  }, [analytics?.data, followerCount, activePlatform, accountInsights])
  
  const metrics = [
    { 
      label: 'Followers', 
      ...processedMetrics.followers, 
      icon: <Users className="w-5 h-5 text-white" />, 
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      sublabel: 'Total'
    },
    { 
      label: 'Reach', 
      ...processedMetrics.reach, 
      icon: <UserPlus className="w-5 h-5 text-white" />, 
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      sublabel: 'Last 28 days'
    },
    { 
      label: 'Interactions', 
      ...processedMetrics.interactions, 
      icon: <Eye className="w-5 h-5 text-white" />, 
      gradient: 'bg-gradient-to-br from-pink-500 to-pink-600',
      sublabel: 'Last 28 days'
    },
    { 
      label: 'Profile Views', 
      ...processedMetrics.profileViews, 
      icon: <TrendingUp className="w-5 h-5 text-white" />, 
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      sublabel: 'Last 28 days'
    },
    { 
      label: 'Website Clicks', 
      ...processedMetrics.websiteClicks, 
      icon: <MousePointer className="w-5 h-5 text-white" />, 
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
      sublabel: 'Last 28 days'
    },
    { 
      label: 'Accounts Engaged', 
      ...processedMetrics.accountsEngaged, 
      icon: <Zap className="w-5 h-5 text-white" />, 
      gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      sublabel: 'Last 28 days'
    }
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