import React from "react";
import dynamic from "next/dynamic";
import AnalyticsSummary from "./_components/metrics/analytics-summary";

// Dynamic imports for heavy chart components - reduces initial bundle size
const Chart = dynamic(() => import("./_components/metrics"), {
  loading: () => (
    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 h-[400px] animate-pulse">
      <div className="h-6 w-40 bg-gray-200 dark:bg-neutral-700 rounded mb-4" />
      <div className="h-[300px] bg-gray-100 dark:bg-neutral-800 rounded-xl" />
    </div>
  ),
});

const PostPerformance = dynamic(
  () => import("./_components/post-performance"),
  {
    loading: () => (
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 h-[400px] animate-pulse">
        <div className="h-6 w-40 bg-gray-200 dark:bg-neutral-700 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 dark:bg-neutral-800 rounded-lg"
            />
          ))}
        </div>
      </div>
    ),
  },
);

const PostReachPanel = dynamic(() => import("./_components/post-reach-panel"), {
  loading: () => (
    <div className="space-y-4">
      <div className="h-6 w-48 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 animate-pulse overflow-hidden"
          >
            <div className="aspect-square bg-neutral-200 dark:bg-neutral-700" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded" />
              <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
});

const AutomationInsights = dynamic(
  () => import("./_components/automation-insights"),
  {
    loading: () => (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 animate-pulse"
            >
              <div className="w-9 h-9 rounded-xl bg-neutral-200 dark:bg-neutral-700 mb-3" />
              <div className="h-6 w-12 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
              <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 animate-pulse" />
          <div className="h-64 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 animate-pulse" />
        </div>
      </div>
    ),
  },
);

const Page = () => {
  return (
    <div className="flex flex-col gap-8 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Key Metrics - Load immediately as it's above the fold */}
      <AnalyticsSummary />

      {/* Automation Insights - Health cards, keywords, scheduler */}
      <AutomationInsights />

      {/* Activity Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart />
        <PostPerformance />
      </div>

      {/* Post Reach - Posts ranked by automation hits */}
      <PostReachPanel />
    </div>
  );
};

export default Page;
