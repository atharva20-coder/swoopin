import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/rate-limiter";
import { client } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(req, "API");
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session?.user) {
    return NextResponse.json({ status: 401, error: "Unauthorized" });
  }

  try {
    // Get user's subscription
    const dbUser = await client.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!dbUser?.subscription?.customerId) {
      return NextResponse.json({ 
        status: 400, 
        error: "No active subscription found" 
      });
    }

    // Get customer's subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: dbUser.subscription.customerId,
      status: "active",
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ 
        status: 400, 
        error: "No active subscription found" 
      });
    }

    // Cancel at period end (user keeps access until end of billing period)
    const subscription = await stripe.subscriptions.update(
      subscriptions.data[0].id,
      {
        cancel_at_period_end: true,
      }
    );

    // Update database to FREE plan (will take effect at period end)
    await client.subscription.update({
      where: { id: dbUser.subscription.id },
      data: {
        plan: "FREE",
      },
    });

    return NextResponse.json({
      status: 200,
      message: "Subscription will be cancelled at end of billing period",
      endsAt: new Date(subscription.current_period_end * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json({ 
      status: 500, 
      error: "Failed to cancel subscription" 
    });
  }
}
