import React from "react";
import PaymentButton from "../payment-button";
import { Separator } from "@/components/ui/separator";

type Props = {};

export default function UpgradeCard(props: Props) {
  return (
    <>
      <Separator className="my-4 opacity-80 bg-gray-300 dark:bg-neutral-700" />
      <div className="bg-white dark:bg-neutral-800 p-3 rounded-xl flex flex-col items-center text-center gap-y-3 shadow-sm dark:shadow-neutral-900/50 mt-4 mb-2">
      <a href="./billing" className="w-full hover:opacity-90 transition-all duration-300">
      <span className="text-[#111827] dark:text-gray-200 text-sm font-medium">
        Upgrade to {""}
        <span
          className="bg-gradient-to-r 
        from-purple-500 
        to-pink-500 
        font-semibold 
        bg-clip-text 
        text-transparent"
        >
          PRO
        </span>
      </span>
      </a>
      <p className="text-[#4B5563] dark:text-gray-400 text-sm">
        Unlock all features <br />including AI and more
      </p>
      {/*<PaymentButton />*/}
    </div>
    </>
  );
}
