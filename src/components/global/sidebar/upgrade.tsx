import React from "react";
import PaymentButton from "../payment-button";
import { Separator } from "@/components/ui/separator";

type Props = {};

export default function UpgradeCard(props: Props) {
  return (
    <>
      <Separator className="my-4 opacity-80 bg-gray-300" />
      <div className="bg-white p-3 rounded-xl flex flex-col items-center text-center gap-y-3 shadow-sm mt-4 mb-2">
      <span className="text-[#111827] text-sm font-medium">
        Upgrade to {""}
        <span
          className="bg-gradient-to-r 
        from-[#06984F] 
        to-[#06984F] 
        font-semibold 
        bg-clip-text 
        text-transparent"
        >
          Smart AI
        </span>
      </span>
      <p className="text-[#4B5563] text-sm">
        Unlock all features <br /> including AI and more
      </p>
      <PaymentButton />
    </div>
    </>
  );
}
