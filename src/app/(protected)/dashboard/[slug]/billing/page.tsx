"use client";
import React from "react";
import PaymentCard from "./payment-card";
import { useQueryUser } from "@/hooks/user-queries";
import { useUser } from "@clerk/nextjs";
import { Sigmar } from 'next/font/google'
import { useParams } from "next/navigation";

type Props = {};

const sigmar = Sigmar({ weight: '400', subsets: ['latin'] })

const Billing = (props: Props) => {
  const { data } = useQueryUser();
  const { user } = useUser();
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-center mb-12">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">EXPLORE OUR BEST PRICING IN ALL OTHERS</p>
        <h2 className={`${sigmar.className} text-4xl font-bold text-gray-900 mb-4`}>Best plans specially curated for, <span className="text-[#2E329F]">{user?.firstName || 'You'}!</span></h2>
        <p className="text-gray-600 dark:text-gray-400">Powerful AI automation tools and social media management features to grow your business.</p>
      </div>
      <div className="flex lg:flex-row flex-col gap-5 w-full lg:w-10/12 xl:w-8/12 container">
        <PaymentCard current={data?.data?.subscription?.plan!} label="PRO" />
        <PaymentCard current={data?.data?.subscription?.plan!} label="FREE" />
      </div>
      <div className="text-center mt-16">
        <button
          onClick={() => window.location.href = 'mailto:support@auctorn.com'}
          className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 rounded-full border border-gray-300 shadow-sm transition-all duration-300 flex items-center gap-2 mx-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2E329F]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Need help with payment?
        </button>
        <p className="text-sm text-gray-500 mt-2">Contact us for UPI payments or any payment-related issues</p>
        <p className="text-sm text-gray-500 mt-2">OR</p>
        <a
          href="https://www.instagram.com/sandipjoshi990/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:text-[#2E329F] transition-colors duration-300 mt-2 inline-block"
        >
          DM us on instagram
        </a>
      </div>
    </div>
  );
};

export default Billing;