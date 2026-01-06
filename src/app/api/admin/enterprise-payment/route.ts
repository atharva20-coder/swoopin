/**
 * Admin Enterprise Payment Route
 * 
 * Generate a Cashfree payment link with custom amount for enterprise user.
 * Stores payment info in DB and sends email via nodemailer.
 * 
 * POST /api/admin/enterprise-payment
 */

import { client } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { sendEmailAction } from "@/actions/send-email.action";
import { getCashfreeBaseUrl, getApiHeaders } from "@/lib/payments/cashfree/client";

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
 * Generate a Cashfree payment link with custom amount for enterprise user
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

    // Generate unique link ID
    const linkId = `enterprise_${enquiryId}_${Date.now()}`;

    // Create Cashfree Payment Link
    const baseUrl = process.env.NEXT_PUBLIC_HOST_URL;
    const linkRequest = {
      link_id: linkId,
      link_amount: amount,
      link_currency: currency,
      link_purpose: description || `Enterprise Plan for ${enquiry.company || enquiry.name || enquiry.email}`,
      link_expiry_time: expiresAt.toISOString(),
      link_auto_reminders: true,
      link_notify: {
        send_email: false, // We'll send our own email
        send_sms: false,
      },
      customer_details: {
        customer_email: enquiry.email,
        customer_phone: enquiry.phone || "9999999999",
        customer_name: enquiry.name || "Enterprise Customer",
      },
      link_meta: {
        return_url: `${baseUrl}/payment-success?order_id={order_id}`,
        notify_url: `${baseUrl}/api/cashfree/webhook`,
      },
      link_notes: {
        enquiryId: enquiry.id,
        userId: enquiry.userId,
        type: "enterprise",
        customDmsLimit: enquiry.customDmsLimit?.toString() || "",
        customAutomationsLimit: enquiry.customAutomationsLimit?.toString() || "",
        customScheduledLimit: enquiry.customScheduledLimit?.toString() || "",
        customAiLimit: enquiry.customAiLimit?.toString() || "",
      },
    };

    const response = await fetch(`${getCashfreeBaseUrl()}/links`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(linkRequest),
    });

    const linkData = await response.json();

    if (!response.ok) {
      console.error("Cashfree payment link creation failed:", linkData);
      return NextResponse.json(
        { error: linkData.message || "Failed to create payment link" },
        { status: 500 }
      );
    }

    // Update enquiry with payment session info
    await client.enterpriseEnquiry.update({
      where: { id: enquiryId },
      data: {
        cashfreeOrderId: linkData.link_id || linkId,
        paymentLinkUrl: linkData.link_url,
        paymentLinkExpiresAt: expiresAt,
        paymentStatus: "PENDING",
      },
    });

    // Send email if requested
    if (sendEmail && linkData.link_url) {
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
          link: linkData.link_url,
        },
      });
    }

    return NextResponse.json({
      success: true,
      paymentUrl: linkData.link_url,
      linkId: linkData.link_id || linkId,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error: unknown) {
    console.error("Error creating enterprise payment:", error);
    const message = error instanceof Error ? error.message : "Failed to create payment link";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
