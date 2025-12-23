"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Check, ArrowUpRight, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";

interface BillingTabProps {
  slug: string;
}

export default function BillingTab({ slug }: BillingTabProps) {
  const plan = "PRO";

  return (
    <div className="space-y-4">
      {/* Current Plan */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Current Plan</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800">
            {plan} Plan
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
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Payment</h3>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">Dec 28, 2025</p>
        </div>

        {/* Amount */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</h3>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">$29.00</p>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Check className="w-4 h-4 text-green-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Subscription Status</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Your subscription is active and auto-renewing.
        </p>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
            Active
          </span>
          <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 text-xs font-medium">
            Auto-renewal On
          </span>
        </div>
      </div>

      {/* Manage Subscription */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Manage Subscription</p>
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
