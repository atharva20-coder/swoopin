import { Button } from "@/components/ui/button";
import { PLANS } from "@/constants/pages";
import { useSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";
import { CircleCheck } from "lucide-react";
import React from "react";

type Props = {
  label: string;
  current: "PRO" | "FREE";
  landing?: boolean;
};

const PaymentCard = ({ current, label, landing }: Props) => {
  const { isProcessing, onSubscribe } = useSubscription();
  return (
    <div
      className={cn(
        label !== current
          ? "dark:bg-gray-900 bg-white border-2 dark:border-gray-800 border-gray-100"
          : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
        "p-[2px] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
      )}
    >
      <div
        className={cn(
          landing && "bg-gradient-to-br from-white dark:from-gray-900 dark:to-gray-800 to-gray-50",
          "flex flex-col rounded-2xl p-8 dark:bg-gray-900 bg-white h-full"
        )}
      >
        {landing ? (
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-4">
            {label === "PRO" && "Premium Plan"}
            {label === "FREE" && "Standard"}
          </h2>
        ) : (
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-4">
            {label === current
              ? "Your Current Plan"
              : current === "PRO"
              ? "Downgrade"
              : "Upgrade"}
          </h2>
        )}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          This is what your plan covers for automations and AI features
        </p>
        {label === "PRO" ? (
          <span className="bg-gradient-to-r text-4xl from-indigo-500 via-purple-500 font-bold to-pink-500 bg-clip-text text-transparent mb-2">
            Smart AI
          </span>
        ) : (
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Standard</p>
        )}
        {label === "PRO" ? (
          <p className="mb-6 flex items-baseline">
            <b className="text-4xl font-bold text-gray-900 dark:text-white">₹999</b>
            <span className="text-gray-600 dark:text-gray-400 ml-2">/month</span>
          </p>
        ) : (
          <p className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Free</p>
        )}

        <div className="space-y-4 mb-8">
          {PLANS[label === "PRO" ? 1 : 0].features.map((i) => (
            <p key={i} className="text-gray-600 dark:text-gray-400 flex items-center gap-3">
              <CircleCheck className="text-green-500 h-5 w-5 flex-shrink-0" />
              {i}
            </p>
          ))}
        </div>

        {landing ? (
          <Button
            className={cn(
              "rounded-full py-6 text-lg font-semibold transition-all duration-300",
              label === "PRO"
                ? "bg-gradient-to-r from-indigo-500 text-white via-purple-500 to-pink-500 hover:opacity-90"
                : "bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:bg-gray-800 dark:hover:bg-gray-100"
            )}
          >
            {label === current
              ? "Get Started"
              : current === "PRO"
              ? "Free"
              : "Get Started"}
          </Button>
        ) : (
          <Button
            onClick={onSubscribe}
            disabled={label === current || isProcessing}
            className="rounded-full py-6 text-lg font-semibold bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing
              ? "Processing..."
              : label === current
              ? "Active"
              : current === "PRO"
              ? "Downgrade"
              : "Upgrade"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PaymentCard;
