import { stripe } from "@/lib/stripe";
import { client } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Stripe webhook secret - add this to your .env file
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("No Stripe signature found");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // Handle successful checkout
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === "subscription" && session.subscription) {
          await handleSubscriptionCreated(session);
        }
        break;
      }

      // Handle subscription updates (including renewals)
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      // Handle subscription cancellation (when period actually ends)
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      // Handle successful invoice payment (subscription renewal)
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await handleInvoicePaid(invoice);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  
  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const periodEnd = new Date(subscription.current_period_end * 1000);
  
  console.log(`Processing new subscription for customer: ${customerId}`);

  // Find user by customer ID or email
  const subscriptionRecord = await client.subscription.findFirst({
    where: {
      OR: [
        { customerId },
        { User: { email: session.customer_email || undefined } },
      ],
    },
  });

  if (!subscriptionRecord) {
    console.error("Subscription record not found for customer:", customerId);
    return;
  }

  // Update subscription with PRO plan and period end
  await client.subscription.update({
    where: { id: subscriptionRecord.id },
    data: {
      plan: "PRO",
      customerId: customerId,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    },
  });

  console.log(`Subscription created for subscription: ${subscriptionRecord.id}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const periodEnd = new Date(subscription.current_period_end * 1000);
  
  const subscriptionRecord = await client.subscription.findFirst({
    where: { customerId },
  });

  if (!subscriptionRecord) {
    console.error("Subscription not found for customer:", customerId);
    return;
  }

  // Check if subscription is active
  const isActive = ["active", "trialing"].includes(subscription.status);
  
  await client.subscription.update({
    where: { id: subscriptionRecord.id },
    data: {
      plan: isActive ? "PRO" : "FREE",
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  console.log(`Subscription ${subscription.id} updated, status: ${subscription.status}, cancel_at_period_end: ${subscription.cancel_at_period_end}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  const subscriptionRecord = await client.subscription.findFirst({
    where: { customerId },
    include: { User: true },
  });

  if (!subscriptionRecord) {
    console.error("Subscription not found for customer:", customerId);
    return;
  }

  // Downgrade to FREE - the subscription period has actually ended
  await client.subscription.update({
    where: { id: subscriptionRecord.id },
    data: {
      plan: "FREE",
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
    },
  });

  // Create notification
  if (subscriptionRecord.userId) {
    await client.notification.create({
      data: {
        userId: subscriptionRecord.userId,
        content: "Your subscription has ended. You've been moved to the FREE plan.",
      },
    });
  }

  console.log(`Subscription ended for user: ${subscriptionRecord.userId}`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;
  
  // Get updated subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const periodEnd = new Date(subscription.current_period_end * 1000);
  
  const subscriptionRecord = await client.subscription.findFirst({
    where: { customerId },
  });

  if (!subscriptionRecord) {
    console.error("Subscription not found for customer:", customerId);
    return;
  }

  // Update period end on successful renewal
  await client.subscription.update({
    where: { id: subscriptionRecord.id },
    data: {
      plan: "PRO",
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  console.log(`Invoice paid, subscription renewed until: ${periodEnd.toISOString()}`);
}
