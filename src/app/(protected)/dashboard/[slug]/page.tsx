import DoubleGradientCard from "@/components/global/double-gradient-card";
import { DASHBOARD_CARDS } from "@/constants/dashboard";
import { BarDuoToneBlue } from "@/icons";
import React from "react";
import Chart from "./_components/metrics";
import MetricsCard from "./_components/metrics/metrics-card";

type Props = {};

const Page = (props: Props) => {
  return (
    <div className="flex flex-col gap-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-black">Start Here</h1>
        <a href="#" className="text-blue-500 hover:underline">Explore all Templates</a>
      </div>
      <div className="flex gap-5 lg:flex-row flex-col">
        {DASHBOARD_CARDS.map((card) => (
          <DoubleGradientCard key={card.id} {...card} />
        ))}
      </div>
      <div className="border-[1px] relative border-in-active/50 p-5 rounded-xl">
        <span className="flex gap-x-1 z-50 items-center">
          <BarDuoToneBlue />
          <div className="z-50">
            <h2 className="text-2xl font-medium text-black">
              Automated Activity
            </h2>
            <p className="text-text-secondary/70 text-sm">
              Automated 0 out of 1 interactions
            </p>
          </div>
        </span>
        <div className="w-full flex lg:flex-row flex-col gap-5">
          <div className="lg:w-6/12">
            <Chart />
          </div>
          <div className="lg:w-6/12">
            <MetricsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;