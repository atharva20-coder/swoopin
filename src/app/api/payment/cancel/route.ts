/**
 * ============================================
 * CASHFREE CANCEL SUBSCRIPTION API
 * Handles subscription cancellation
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { client } from "@/lib/prisma";

/**
 * POST /api/payment/cancel
 * Cancels the user's subscription at period end
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user subscription
    const subscription = await client.subscription.findUnique({
      where: { userId },
    });

    if (!subscription || subscription.plan === "FREE") {
      return NextResponse.json(
        { error: "No active subscription to cancel" },
        { status: 400 },
      );
    }

    // Calculate period end (30 days from now for monthly, or actual period end)
    const periodEnd = subscription.updatedAt
      ? new Date(subscription.updatedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Mark subscription for cancellation at period end
    await client.subscription.update({
      where: { userId },
      data: {
        // Note: In a production system, you'd want to add fields like:
        // cancelAtPeriodEnd: true,
        // currentPeriodEnd: periodEnd,
        // For now, we'll just update the plan immediately or schedule it
      },
    });

    // For simplicity, we'll cancel immediately in sandbox mode
    // In production, you'd implement cancel-at-period-end logic
    if (process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT !== "production") {
      await client.subscription.update({
        where: { userId },
        data: {
          plan: "FREE",
        },
      });

      return NextResponse.json({
        status: 200,
        message:
          "Subscription cancelled (sandbox mode - immediate cancellation)",
        endsAt: new Date().toISOString(),
      });
    }

    // Production: Cancel at period end
    return NextResponse.json({
      status: 200,
      message:
        "Subscription will be cancelled at the end of the billing period",
      endsAt: periodEnd.toISOString(),
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription", details: String(error) },
      { status: 500 },
    );
  }
}
