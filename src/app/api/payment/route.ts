/**
 * ============================================
 * CASHFREE PAYMENT API
 * Handles payment session creation for subscriptions
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server";
import { Cashfree } from "cashfree-pg";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { client } from "@/lib/prisma";

// Initialize Cashfree SDK (v5+)
const cashfree = new Cashfree(
  process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "production"
    ? Cashfree.PRODUCTION
    : Cashfree.SANDBOX,
  process.env.CASHFREE_APP_ID!,
  process.env.CASHFREE_APP_SECRET!,
);

// Pricing configuration (in INR)
const PRICING = {
  PRO: {
    monthly: 999,
    annual: 9990,
  },
};

/**
 * GET /api/payment
 * Creates a Cashfree payment session for subscription
 */
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const plan = searchParams.get("plan") as "PRO" | null;
    const cycle = searchParams.get("cycle") as "monthly" | "annual" | null;

    // Validate inputs
    if (!plan || plan !== "PRO") {
      return NextResponse.json(
        { error: "Invalid plan. Only PRO plan is available for purchase." },
        { status: 400 },
      );
    }

    if (!cycle || !["monthly", "annual"].includes(cycle)) {
      return NextResponse.json(
        { error: "Invalid billing cycle" },
        { status: 400 },
      );
    }

    // Get user details
    const user = await client.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already on PRO
    if (user.subscription?.plan === "PRO") {
      return NextResponse.json(
        { error: "You are already on the PRO plan" },
        { status: 400 },
      );
    }

    // Generate unique order ID
    const orderId = `ORDER_${userId.slice(0, 8)}_${Date.now()}`;
    const amount = PRICING.PRO[cycle];

    // Build return URL
    const baseUrl =
      process.env.NEXT_PUBLIC_URL || `https://${req.headers.get("host")}`;
    const returnUrl = `${baseUrl}/payment?success=true&order_id=${orderId}`;

    // Create Cashfree order
    const orderRequest = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId.slice(0, 50), // Cashfree limits customer_id to 50 chars
        customer_email: user.email,
        customer_phone: "9999999999", // Placeholder - Cashfree requires phone
        customer_name: user.name || "Customer",
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: `${baseUrl}/api/payment/webhook`,
        payment_methods: "cc,dc,upi,nb,paylater",
      },
      order_note: `${plan} Plan - ${cycle === "monthly" ? "Monthly" : "Annual"} Subscription`,
      order_tags: {
        plan,
        cycle,
        userId,
      },
    };

    const response = await cashfree.PGCreateOrder(orderRequest);

    if (response.data?.payment_session_id) {
      // Store order in database for tracking
      await client.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan: "FREE", // Will be updated on successful payment
          cashfreeCustomerId: orderId,
        },
        update: {
          cashfreeCustomerId: orderId,
        },
      });

      // Return payment link
      const paymentLink = response.data.payment_link;

      return NextResponse.json({
        session_url: paymentLink,
        order_id: orderId,
        payment_session_id: response.data.payment_session_id,
      });
    }

    console.error("Cashfree order creation failed:", response);
    return NextResponse.json(
      { error: "Failed to create payment session" },
      { status: 500 },
    );
  } catch (error) {
    console.error("Payment API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
