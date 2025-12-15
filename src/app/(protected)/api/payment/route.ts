import { stripe } from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/rate-limiter";
import { client } from "@/lib/prisma";

// Price IDs for different plans (you'll need to create these in Stripe)
const PRICE_IDS = {
  PRO: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
  },
  ENTERPRISE: {
    monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
    annual: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID,
  },
};

export async function GET(req: NextRequest) {
  // Apply rate limiting (API tier - 100 requests/minute)
  const rateLimitResult = await applyRateLimit(req, "API");
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  const user = await currentUser();
  if (!user) return NextResponse.json({ status: 404 });

  // Get plan and cycle from query params
  const { searchParams } = new URL(req.url);
  const plan = searchParams.get("plan") || "PRO";
  const cycle = searchParams.get("cycle") || "monthly";

  // Validate plan
  if (plan !== "PRO" && plan !== "ENTERPRISE") {
    return NextResponse.json({ status: 400, error: "Invalid plan" });
  }

  // Get price ID based on plan and cycle
  const priceId = PRICE_IDS[plan][cycle as "monthly" | "annual"];
  
  if (!priceId) {
    // Fallback to legacy price ID if specific ones not configured
    const fallbackPriceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
    if (!fallbackPriceId) {
      return NextResponse.json({ status: 500, error: "Price not configured" });
    }
  }

  // Get or create Stripe customer
  let customerId: string | undefined;
  
  const dbUser = await client.user.findUnique({
    where: { clerkId: user.id },
    include: { subscription: true },
  });

  if (dbUser?.subscription?.customerId) {
    customerId = dbUser.subscription.customerId;
  } else {
    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: user.emailAddresses[0]?.emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      metadata: {
        clerkId: user.id,
      },
    });
    customerId = customer.id;
    
    // Save customer ID
    if (dbUser?.subscription) {
      await client.subscription.update({
        where: { id: dbUser.subscription.id },
        data: { customerId },
      });
    }
  }

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: priceId || process.env.STRIPE_SUBSCRIPTION_PRICE_ID,
        quantity: 1,
      },
    ],
    payment_method_types: ["card"],
    success_url: `${process.env.NEXT_PUBLIC_HOST_URL}/payment?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_HOST_URL}/payment?cancel=true`,
    metadata: {
      clerkId: user.id,
      plan,
      cycle,
    },
  });

  if (session) {
    return NextResponse.json({
      status: 200,
      session_url: session.url,
    });
  }

  return NextResponse.json({ status: 400 });
}
