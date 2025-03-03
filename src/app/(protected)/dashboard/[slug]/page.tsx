import DoubleGradientCard from "@/components/global/double-gradient-card";
import { DASHBOARD_CARDS } from "@/constants/dashboard";
import { BarDuoToneBlue } from "@/icons";
import React from "react";
import Chart from "./_components/metrics";
import AnalyticsSummary from "./_components/metrics/analytics-summary";
import MetricsCard from "./_components/metrics/metrics-card";
import AutomationSummaryCard from "./_components/automation-summary-card";


type Props = {};

const Page = (props: Props) => {
  return (
    <div className="flex flex-col gap-y-4 px-3 sm:px-6 lg:px-8 mt-2 sm:mt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-black">Start Here</h3>
        <a href="#" className="text-sm sm:text-base text-blue-500 hover:underline">Explore all Templates</a>
      </div>
      <div className="flex gap-4 sm:gap-6 lg:gap-8 lg:flex-row flex-col">
        {DASHBOARD_CARDS.map((card) => (
          <DoubleGradientCard key={card.id} {...card} />
        ))}
      </div>
      <div className="w-full">
        <AnalyticsSummary />
      </div>
      <div className="border-[1px] relative border-gray-200 p-3 sm:p-4 lg:p-5 rounded-md w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start w-full gap-3 sm:gap-4">
          <span className="flex gap-x-2 sm:gap-x-3 items-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
              <BarDuoToneBlue className="w-full h-full" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black">
                <strong>Automation Overview</strong>
              </h2>
              <p className="text-text-secondary/70 text-xs sm:text-sm lg:text-base">
                Automated 0 out of 1 interactions
              </p>
            </div>
          </span>
        </div>
        <div className="w-full mt-4 sm:mt-5 max-w-[1200px] px-0 sm:px-2">
          <div className="w-full">
            <Chart />
          </div>
        </div>
      </div>

      {/**
      <div className="border-[1px] relative border-gray-200 p-3 sm:p-5 rounded-md w-full max-w-full">
        <MetricsCard />
      </div>
      <div className="w-full max-w-[1200px] px-2">
        <AutomationSummaryCard />
      </div>
       */}
    </div>
  );
};

export default Page;