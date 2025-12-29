import { client } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { sendEmailAction } from "@/actions/send-email.action";

// List of admin email addresses
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter((email) => email.length > 0);

async function isAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session?.user) return false;
  return ADMIN_EMAILS.includes(session.user.email.toLowerCase());
}

/**
 * POST /api/admin/enterprise-payment
 * Generate a Stripe payment link with custom amount for enterprise user
 * Stores payment info in DB and sends email via nodemailer
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { enquiryId, amount, currency = "INR", description, sendEmail = true } = body;

    if (!enquiryId || !amount) {
      return NextResponse.json(
        { error: "enquiryId and amount are required" },
        { status: 400 }
      );
    }

    // Find the enquiry
    const enquiry = await client.enterpriseEnquiry.findUnique({
      where: { id: enquiryId },
      include: { User: true },
    });

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    // Set expiry to 48 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Create Stripe Checkout Session with inline price_data
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: "NinthNode Enterprise Plan",
              description: description || `Custom enterprise plan for ${enquiry.company || enquiry.name || enquiry.email}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to paise
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_HOST_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_HOST_URL}/billing?canceled=true`,
      customer_email: enquiry.email,
      metadata: {
        enquiryId: enquiry.id,
        userId: enquiry.userId,
        type: "enterprise",
      },
      subscription_data: {
        metadata: {
          enquiryId: enquiry.id,
          userId: enquiry.userId,
          type: "enterprise",
          customDmsLimit: enquiry.customDmsLimit?.toString() || "",
          customAutomationsLimit: enquiry.customAutomationsLimit?.toString() || "",
          customScheduledLimit: enquiry.customScheduledLimit?.toString() || "",
          customAiLimit: enquiry.customAiLimit?.toString() || "",
        },
      },
    });

    // Update enquiry with payment session info
    await client.enterpriseEnquiry.update({
      where: { id: enquiryId },
      data: {
        stripeSessionId: session.id,
        paymentLinkUrl: session.url,
        paymentLinkExpiresAt: expiresAt,
        paymentStatus: "PENDING",
      },
    });

    // Send email if requested
    if (sendEmail && session.url) {
      const formattedAmount = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount);

      await sendEmailAction({
        to: enquiry.email,
        subject: "Your Enterprise Plan Payment Link",
        meta: {
          description: `Your custom Enterprise plan is ready! Amount: ${formattedAmount}/month. Click below to complete payment. This link expires in 48 hours.`,
          link: session.url,
        },
      });
    }

    return NextResponse.json({
      success: true,
      paymentUrl: session.url,
      sessionId: session.id,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error: any) {
    console.error("Error creating enterprise payment:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create payment link" },
      { status: 500 }
    );
  }
}
