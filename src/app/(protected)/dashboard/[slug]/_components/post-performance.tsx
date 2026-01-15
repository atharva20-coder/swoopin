"use client";
import React, { useState, useMemo } from "react";
import {
  useQueryAutomations,
  useQueryInstagramProfile,
} from "@/hooks/user-queries";
import {
  Link2,
  MessageSquare,
  MessageCircle,
  TrendingUp,
  Sparkles,
  X,
} from "lucide-react";

/**
 * Type definitions following Zero-Patchwork protocol
 * - Automation: Output type for display
 * - AutomationItem: Input type from API/hook
 */
type Automation = {
  id: string;
  name: string;
  linkRequests: number;
  dms: number;
  comments: number;
  keywords: string[];
  isActive: boolean;
};

type AutomationItem = {
  id: string;
  name?: string | null;
  active: boolean;
  listener?: {
    dmCount?: number;
    commentCount?: number;
  };
  keywords?: Array<{ word: string }>;
};

const PostPerformance = () => {
  const { data: automationsData, isLoading } = useQueryAutomations({
    refetchInterval: 60000,
  });
  const { data: instagramProfile } = useQueryInstagramProfile();
  const [selectedAutomation, setSelectedAutomation] =
    useState<Automation | null>(null);

  const followerCount =
    instagramProfile?.status === 200
      ? instagramProfile.data?.follower_count || 0
      : 0;

  const performanceData = useMemo(() => {
    if (!automationsData?.data) return [];
    // Apply type assertion following Zero-Patchwork protocol
    return (automationsData.data as AutomationItem[])
      .map(
        (automation): Automation => ({
          id: automation.id,
          name: automation.name || "Untitled Automation",
          linkRequests: automation.listener?.dmCount || 0,
          dms: automation.listener?.dmCount || 0,
          comments: automation.listener?.commentCount || 0,
          keywords: automation.keywords?.map((k) => k.word) || [],
          isActive: automation.active,
        })
      )
      .sort((a, b) => b.dms + b.comments - (a.dms + a.comments));
  }, [automationsData?.data]);

  // Stats for selected automation or all
  const displayStats = useMemo(() => {
    if (selectedAutomation) {
      const engagement =
        followerCount > 0
          ? (
              ((selectedAutomation.dms + selectedAutomation.comments) /
                followerCount) *
              100
            ).toFixed(2)
          : "0.00";
      return {
        linkRequests: selectedAutomation.linkRequests,
        dms: selectedAutomation.dms,
        comments: selectedAutomation.comments,
        engagementRate: engagement,
      };
    }

    const totals = performanceData.reduce(
      (acc, item) => ({
        linkRequests: acc.linkRequests + item.linkRequests,
        dms: acc.dms + item.dms,
        comments: acc.comments + item.comments,
      }),
      { linkRequests: 0, dms: 0, comments: 0 }
    );
    const engagementRate =
      followerCount > 0
        ? (((totals.dms + totals.comments) / followerCount) * 100).toFixed(2)
        : "0.00";
    return { ...totals, engagementRate };
  }, [selectedAutomation, performanceData, followerCount]);

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 animate-pulse h-[500px]">
        <div className="h-6 w-48 bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 bg-neutral-100 dark:bg-neutral-800 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 h-[500px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance Analytics
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedAutomation ? (
              <span className="flex items-center gap-2">
                Showing:{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {selectedAutomation.name}
                </span>
                <button
                  onClick={() => setSelectedAutomation(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ) : (
              "Click an automation to filter stats"
            )}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </div>

      {/* Stats Grid - Updates based on selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 shrink-0">
        {[
          {
            label: "Link Requests",
            value: displayStats.linkRequests,
            icon: Link2,
            color: "text-blue-500",
          },
          {
            label: "DMs Generated",
            value: displayStats.dms,
            icon: MessageSquare,
            color: "text-purple-500",
          },
          {
            label: "Comments",
            value: displayStats.comments,
            icon: MessageCircle,
            color: "text-green-500",
          },
          {
            label: "Engagement",
            value: `${displayStats.engagementRate}%`,
            icon: TrendingUp,
            color: "text-orange-500",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {stat.label}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Scrollable Automations List */}
      <div className="flex-1 overflow-hidden">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
          Top Performers{" "}
          <span className="text-xs text-gray-400">(by engagement)</span>
        </h4>

        {performanceData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Sparkles className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No automations yet</p>
            <p className="text-xs mt-1">Create one to start tracking</p>
          </div>
        ) : (
          <div className="overflow-y-auto h-[calc(100%-2rem)] pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
            {performanceData.map((automation, index) => {
              const totalEngagement = automation.dms + automation.comments;
              const isSelected = selectedAutomation?.id === automation.id;

              return (
                <div
                  key={automation.id}
                  onClick={() =>
                    setSelectedAutomation(isSelected ? null : automation)
                  }
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      : "hover:bg-gray-50 dark:hover:bg-neutral-800/50 border border-transparent"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      index === 0
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                        : index === 1
                        ? "bg-gray-200 text-gray-600 dark:bg-neutral-700 dark:text-gray-300"
                        : index === 2
                        ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                        : "bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {automation.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {automation.keywords.slice(0, 2).map((kw, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {totalEngagement}
                    </p>
                    <p className="text-[10px] text-gray-500">engagement</p>
                  </div>
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      automation.isActive ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPerformance;
