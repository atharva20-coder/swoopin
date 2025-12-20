import React from "react";
import Chart from "./_components/metrics";
import AnalyticsSummary from "./_components/metrics/analytics-summary";
import PostPerformance from "./_components/post-performance";

const Page = () => {
  return (
    <div className="flex flex-col gap-8 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Key Metrics */}
      <AnalyticsSummary />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart />
        <PostPerformance />
      </div>
    </div>
  );
};

export default Page;