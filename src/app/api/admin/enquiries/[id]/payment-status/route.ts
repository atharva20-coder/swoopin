import { client } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

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
 * GET /api/admin/enquiries/[id]/payment-status
 * Check payment status from Stripe and update DB
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the enquiry
    const enquiry = await client.enterpriseEnquiry.findUnique({
      where: { id: params.id },
    });

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    if (!enquiry.stripeSessionId) {
      return NextResponse.json({
        success: true,
        paymentStatus: enquiry.paymentStatus || "PENDING",
        message: "No payment session created yet",
      });
    }

    // Check Stripe session status
    const session = await stripe.checkout.sessions.retrieve(enquiry.stripeSessionId);
    
    let newPaymentStatus = enquiry.paymentStatus;
    let transactionId = enquiry.transactionId;

    if (session.payment_status === "paid") {
      newPaymentStatus = "PAID";
      // Get the subscription ID as transaction reference
      if (session.subscription) {
        transactionId = typeof session.subscription === 'string' 
          ? session.subscription 
          : session.subscription.id;
      }
    } else if (session.status === "expired") {
      newPaymentStatus = "EXPIRED";
    }

    // Update DB if status changed
    if (newPaymentStatus !== enquiry.paymentStatus || transactionId !== enquiry.transactionId) {
      await client.enterpriseEnquiry.update({
        where: { id: params.id },
        data: {
          paymentStatus: newPaymentStatus,
          transactionId: transactionId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      paymentStatus: newPaymentStatus,
      transactionId: transactionId,
      stripeStatus: session.status,
      stripePaymentStatus: session.payment_status,
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}
