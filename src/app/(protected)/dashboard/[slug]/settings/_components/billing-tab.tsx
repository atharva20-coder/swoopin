"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Check, Zap, ArrowUpRight, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";

interface BillingTabProps {
  slug: string;
}

export default function BillingTab({ slug }: BillingTabProps) {
  // Mock data for now, ideally fetch from subscription usage API
  const plan = "PRO"; // This should come from props or hook

  return (
    <div className="bg-white dark:bg-neutral-950 rounded-3xl border border-gray-200 dark:border-neutral-800 p-8 space-y-8">
      {/* Current Plan Section */}
      <div className="flex items-start justify-between pb-8 border-b border-gray-200 dark:border-neutral-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-500" />
            Current Plan
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your subscription and billing details.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium border border-indigo-200 dark:border-indigo-800">
          {plan} Plan
        </span>
      </div>

      {/* Next Payment Section */}
      <div className="flex items-start justify-between pb-8 border-b border-gray-200 dark:border-neutral-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Next Payment
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">
            Your next billing date and amount.
          </p>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Date</p>
              <p className="text-gray-900 dark:text-white font-medium">Dec 28, 2025</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Amount</p>
              <p className="text-gray-900 dark:text-white font-bold text-lg">$29.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="flex items-start justify-between pb-8 border-b border-gray-200 dark:border-neutral-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            Subscription Status
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">
            Your subscription is active and auto-renewing.
          </p>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
              Active
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 text-xs font-medium">
              Auto-renewal On
            </span>
          </div>
        </div>
      </div>

      {/* Manage Subscription */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-900 dark:text-white font-medium">Manage Subscription</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update payment method, download invoices, or cancel plan.
          </p>
        </div>
        <Link href={`/dashboard/${slug}/billing`}>
          <Button>
            Go to Billing
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
