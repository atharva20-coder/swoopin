import { redirect } from "next/navigation";
import React from "react";

type Props = {
  searchParams: Promise<{
    session_id?: string;
    cancel?: boolean;
    success?: boolean;
  }>;
};

/**
 * Payment callback page
 * Handles redirects from Cashfree payment gateway
 * Legacy Stripe handling removed - now uses /api/cashfree/* endpoints
 */
const Page = async ({ searchParams }: Props) => {
  const { cancel, session_id, success } = await searchParams;

  // Handle successful payment - redirect to dashboard
  if (success || session_id) {
    return redirect("/dashboard");
  }

  // Handle cancelled payment
  if (cancel) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-full">
        <h4 className="text-5xl font-bold">Payment Cancelled</h4>
        <p className="text-xl font-bold mt-4">Your payment was cancelled</p>
        <a href="/billing" className="mt-6 text-blue-500 hover:underline">
          Return to billing
        </a>
      </div>
    );
  }

  // Default: redirect to billing page
  return redirect("/billing");
};

export default Page;
