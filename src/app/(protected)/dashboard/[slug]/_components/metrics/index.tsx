"use client";
import React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useAnalytics } from "@/hooks/use-analytics";
import { useParams } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { usePlatform } from "@/context/platform-context";

/**
 * Data is properly typed from Zod parsing in the hook layer
 * No local type definitions needed - Zero-Patchwork Protocol
 */

const PLATFORM_COLORS: Record<string, string> = {
  all: "#6366F1",
  instagram: "#E1306C",
  facebook: "#1877F2",
  twitter: "#1DA1F2",
  linkedin: "#0A66C2",
  youtube: "#FF0000",
  whatsapp: "#25D366",
  gmail: "#EA4335",
};

const PLATFORM_NAMES: Record<string, string> = {
  all: "All Platforms",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "Twitter",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
  gmail: "Gmail",
};

const Chart = () => {
  const params = useParams();
  const { data: analytics, isLoading } = useAnalytics(params.slug as string);
  const { activePlatform } = usePlatform();

  const platformColor = PLATFORM_COLORS[activePlatform] || PLATFORM_COLORS.all;
  const platformName = PLATFORM_NAMES[activePlatform] || "All Platforms";

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-40 bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
        </div>
        <div className="h-[300px] bg-gradient-to-b from-neutral-50 to-transparent dark:from-neutral-800/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  // Data is properly typed from Zod parsing in hook - no type assertions needed
  const chartData =
    analytics?.data?.chartData?.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("default", {
        month: "short",
        day: "numeric",
      }),
    })) ?? [];

  const totalDms = analytics?.data?.totalDms || 0;
  const totalComments = analytics?.data?.totalComments || 0;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Activity Overview
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activePlatform === "all"
              ? "Cross-platform analytics"
              : `${platformName} analytics`}
          </p>
        </div>

        {/* Platform Badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
          style={{
            backgroundColor: `${platformColor}15`,
            color: platformColor,
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: platformColor }}
          />
          {platformName}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: platformColor }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Messages ({totalDms})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Responses ({totalComments})
          </span>
        </div>
      </div>

      {/* Chart */}
      {(() => {
        // Always show the graph - use sample data if empty
        const displayData =
          chartData.length === 0
            ? [
                { date: "Day 1", dmCount: 0, commentCount: 0 },
                { date: "Day 2", dmCount: 0, commentCount: 0 },
                { date: "Day 3", dmCount: 0, commentCount: 0 },
                { date: "Day 4", dmCount: 0, commentCount: 0 },
                { date: "Day 5", dmCount: 0, commentCount: 0 },
                { date: "Day 6", dmCount: 0, commentCount: 0 },
                { date: "Day 7", dmCount: 0, commentCount: 0 },
              ]
            : chartData;

        return (
          <ResponsiveContainer height={300} width="100%">
            <AreaChart
              data={displayData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="primaryGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={platformColor}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={platformColor}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="secondaryGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                  padding: "12px 16px",
                }}
                labelStyle={{
                  color: "#111",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
                itemStyle={{ color: "#666", padding: "2px 0" }}
              />
              <Area
                type="monotone"
                dataKey="dmCount"
                name="Messages"
                stroke={platformColor}
                strokeWidth={2.5}
                fill="url(#primaryGradient)"
              />
              <Area
                type="monotone"
                dataKey="commentCount"
                name="Responses"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#secondaryGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      })()}
    </div>
  );
};

export default Chart;
