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

const PostPerformance = dynamic(() => import("./_components/post-performance"), {
  loading: () => (
    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 h-[400px] animate-pulse">
      <div className="h-6 w-40 bg-gray-200 dark:bg-neutral-700 rounded mb-4" />
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-neutral-800 rounded-lg" />)}
      </div>
    </div>
  ),
});

const AudienceDemographics = dynamic(() => import("./_components/audience-demographics"), {
  loading: () => (
    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 h-[300px] animate-pulse">
      <div className="h-6 w-48 bg-gray-200 dark:bg-neutral-700 rounded mb-4" />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 dark:bg-neutral-800 rounded-lg" />)}
      </div>
    </div>
  ),
});

const Page = () => {
  return (
    <div className="flex flex-col gap-8 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Key Metrics - Load immediately as it's above the fold */}
      <AnalyticsSummary />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart />
        <PostPerformance />
      </div>

      {/* Audience Demographics */}
      <AudienceDemographics />
    </div>
  );
};

export default Page;