"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Check,
  ArrowUpRight,
  Calendar,
  IndianRupee,
} from "lucide-react";
import Link from "next/link";

interface BillingTabProps {
  slug: string;
}

const PLAN_DISPLAY: Record<string, { name: string; monthlyPrice: string }> = {
  FREE: { name: "Starter", monthlyPrice: "₹0" },
  PRO: { name: "Plus", monthlyPrice: "₹1,499" },
  ENTERPRISE: { name: "Pro", monthlyPrice: "₹2,999" },
};

export default function BillingTab({ slug }: BillingTabProps) {
  const [plan, setPlan] = useState<string>("FREE");
  const [nextPaymentDate, setNextPaymentDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const response = await fetch("/api/user/usage");
        const data = await response.json();
        if (data.status === 200) {
          setPlan(data.data.plan || "FREE");
          if (data.data.currentPeriodEnd) {
            setNextPaymentDate(
              new Date(data.data.currentPeriodEnd).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            );
          }
        }
      } catch {
        // Silently fail — component will show defaults
      }
    };
    fetchBilling();
  }, []);

  const display = PLAN_DISPLAY[plan] ?? PLAN_DISPLAY.FREE;

  return (
    <div className="space-y-4">
      {/* Current Plan */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Current Plan
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800">
            {display.name} Plan
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your subscription and billing details.
        </p>
      </div>

      {/* Billing Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Next Payment Date */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Next Payment
            </h3>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {plan === "FREE" ? "N/A" : (nextPaymentDate ?? "—")}
          </p>
        </div>

        {/* Amount */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Amount
            </h3>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {display.monthlyPrice}/mo
          </p>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Check className="w-4 h-4 text-green-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Subscription Status
          </h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {plan === "FREE"
            ? "You\u0027re on the free Starter plan."
            : "Your subscription is active and auto-renewing."}
        </p>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-lg text-xs font-medium ${
              plan === "FREE"
                ? "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400"
                : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            }`}
          >
            {plan === "FREE" ? "Free" : "Active"}
          </span>
          {plan !== "FREE" && (
            <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 text-xs font-medium">
              Auto-renewal On
            </span>
          )}
        </div>
      </div>

      {/* Manage Subscription */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              Manage Subscription
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update payment method, download invoices, or cancel plan.
            </p>
          </div>
          <Link href={`/dashboard/${slug}/billing`}>
            <Button size="sm" className="h-8 text-xs">
              Go to Billing
              <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
