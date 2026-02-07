"use client";
import React from "react";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  useQueryAutomations,
  useQueryInstagramProfile,
} from "@/hooks/user-queries";
import { useParams } from "next/navigation";
import {
  Send,
  MessageCircle,
  TrendingUp,
  Zap,
  Users,
  BarChart3,
} from "lucide-react";
import { usePlatform } from "@/context/platform-context";

/**
 * ============================================
 * METRIC CARD COMPONENT
 * Zero-Patchwork: Types defined at file level
 * ============================================
 */

type MetricCardProps = {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  gradient: string;
  isLoading?: boolean;
  sublabel?: string;
};

const MetricCard = ({
  label,
  value,
  change,
  icon,
  gradient,
  isLoading = false,
  sublabel,
}: MetricCardProps) => {
  const isPositive = (change ?? 0) >= 0;

  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-700 mb-4" />
        <div className="h-8 w-16 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
        <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
      </div>
    );
  }

  return (
    <div className="group p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-300">
      <div
        className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {label}
          </p>
          {sublabel && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {sublabel}
            </p>
          )}
        </div>
        {change !== undefined && change !== 0 && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              isPositive
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {change.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Format large numbers for display
 */
const formatValue = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
};

/**
 * ============================================
 * ANALYTICS SUMMARY - INTERNAL TELEMETRY
 * Uses database analytics instead of Instagram API
 * ============================================
 */
const AnalyticsSummary = () => {
  const params = useParams();
  const { data: analytics, isLoading: isLoadingAnalytics } = useAnalytics(
    params.slug as string,
  );
  const { data: instagramProfile, isLoading: isLoadingProfile } =
    useQueryInstagramProfile();
  const { data: automationsData, isLoading: isLoadingAutomations } =
    useQueryAutomations();
  const { activePlatform } = usePlatform();

  const isLoading =
    isLoadingAnalytics || isLoadingProfile || isLoadingAutomations;
  const followerCount =
    instagramProfile?.status === 200
      ? (instagramProfile.data?.follower_count ?? 0)
      : 0;

  /**
   * Calculate metrics from internal telemetry
   * Following Zero-Patchwork: All data is pre-validated
   */
  const processedMetrics = React.useMemo(() => {
    // Platform filter - other platforms coming soon
    if (activePlatform !== "all" && activePlatform !== "instagram") {
      return {
        followers: { value: "0", change: undefined },
        totalDms: { value: "0", change: undefined },
        totalComments: { value: "0", change: undefined },
        automations: { value: "0", change: undefined },
        recentDms: { value: "0", change: undefined },
        engagementRate: { value: "0%", change: undefined },
      };
    }

    // Get automation count
    const automationCount = Array.isArray(automationsData?.data)
      ? automationsData.data.length
      : 0;

    // Fallback if no analytics data
    if (!analytics?.data) {
      return {
        followers: { value: formatValue(followerCount), change: undefined },
        totalDms: { value: "0", change: undefined },
        totalComments: { value: "0", change: undefined },
        automations: { value: automationCount.toString(), change: undefined },
        recentDms: { value: "0", change: undefined },
        engagementRate: { value: "0%", change: undefined },
      };
    }

    const totalDms = analytics.data.totalDms ?? 0;
    const totalComments = analytics.data.totalComments ?? 0;
    const totalInteractions = totalDms + totalComments;

    // Calculate engagement rate: (total interactions / followers) * 100
    const engagementRate =
      followerCount > 0
        ? ((totalInteractions / followerCount) * 100).toFixed(2)
        : "0.00";

    // Calculate 30-day change from chart data if available
    const chartData = analytics.data.chartData ?? [];
    let dmChange: number | undefined = undefined;

    if (chartData.length >= 2) {
      const recent = chartData.slice(-7).reduce((sum, d) => sum + d.dmCount, 0);
      const previous = chartData
        .slice(-14, -7)
        .reduce((sum, d) => sum + d.dmCount, 0);
      if (previous > 0) {
        dmChange = ((recent - previous) / previous) * 100;
      }
    }

    return {
      followers: { value: formatValue(followerCount), change: undefined },
      totalDms: { value: formatValue(totalDms), change: undefined },
      totalComments: { value: formatValue(totalComments), change: undefined },
      automations: { value: automationCount.toString(), change: undefined },
      recentDms: { value: formatValue(totalDms), change: dmChange },
      engagementRate: { value: `${engagementRate}%`, change: undefined },
    };
  }, [analytics?.data, automationsData?.data, followerCount, activePlatform]);

  const metrics = [
    {
      label: "Followers",
      ...processedMetrics.followers,
      icon: <Users className="w-5 h-5 text-white" />,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      sublabel: "Instagram",
    },
    {
      label: "Total DMs",
      ...processedMetrics.totalDms,
      icon: <Send className="w-5 h-5 text-white" />,
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
      sublabel: "Lifetime",
    },
    {
      label: "Comments",
      ...processedMetrics.totalComments,
      icon: <MessageCircle className="w-5 h-5 text-white" />,
      gradient: "bg-gradient-to-br from-pink-500 to-pink-600",
      sublabel: "Lifetime",
    },
    {
      label: "Automations",
      ...processedMetrics.automations,
      icon: <Zap className="w-5 h-5 text-white" />,
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
      sublabel: "Active",
    },
    {
      label: "30-Day DMs",
      ...processedMetrics.recentDms,
      icon: <TrendingUp className="w-5 h-5 text-white" />,
      gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      sublabel: "Recent activity",
    },
    {
      label: "Engagement",
      ...processedMetrics.engagementRate,
      icon: <BarChart3 className="w-5 h-5 text-white" />,
      gradient: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      sublabel: "Interactions / Followers",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} isLoading={isLoading} />
      ))}
    </div>
  );
};

export default AnalyticsSummary;
