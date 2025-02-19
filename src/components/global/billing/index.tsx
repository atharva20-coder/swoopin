"use client";
import React from "react";
import PaymentCard from "./payment-card";
import { useQueryUser } from "@/hooks/user-queries";
import { useUser } from "@clerk/nextjs";

type Props = {};

const Billing = (props: Props) => {
  const { data } = useQueryUser();
  const { user } = useUser();

  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-center mb-12">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">EXPLORE OUR BEST PRICING IN ALL OTHERS</p>
        <h1 className="text-4xl font-bold mb-4">Best plans specially curated for, {user?.firstName || 'You'}!</h1>
        <p className="text-gray-600 dark:text-gray-400">Powerful AI automation tools and social media management features to grow your business.</p>
      </div>
      <div className="flex lg:flex-row flex-col gap-5 w-full lg:w-10/12 xl:w-8/12 container">
        <PaymentCard current={data?.data?.subscription?.plan!} label="PRO" />
        <PaymentCard current={data?.data?.subscription?.plan!} label="FREE" />
      </div>
    </div>
  );
};

export default Billing;