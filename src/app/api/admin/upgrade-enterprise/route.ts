import { client } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Admin secret for authenticating admin requests
// Set this in your .env file: ADMIN_SECRET=your-secure-secret-here
const ADMIN_SECRET = process.env.ADMIN_SECRET;

// List of admin email addresses who can upgrade users
// Set in .env file: ADMIN_EMAILS=admin1@example.com,admin2@example.com
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter((email) => email.length > 0);

/**
 * POST /api/admin/upgrade-enterprise
 * 
 * Upgrade a user to Enterprise plan (admin only)
 * 
 * Body: { email: string, cashfreeCustomerId?: string }
 * Headers: x-admin-secret: your-admin-secret OR authenticated as an admin user
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication - either admin secret or authenticated admin user
    const adminSecret = req.headers.get("x-admin-secret");
    
    let isAuthorized = false;
    
    // Method 1: Admin secret in header
    if (adminSecret && ADMIN_SECRET && adminSecret === ADMIN_SECRET) {
      isAuthorized = true;
    }
    
    // Method 2: Authenticated admin user
    if (!isAuthorized) {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      
      if (session?.user && ADMIN_EMAILS.includes(session.user.email)) {
        isAuthorized = true;
      }
    }
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { email, cashfreeCustomerId, enquiryId, subscriptionDays = 30 } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await client.user.findUnique({
      where: { email },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: `User not found: ${email}` },
        { status: 404 }
      );
    }

    // Calculate subscription end date
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + subscriptionDays);

    // Update or create subscription
    if (user.subscription) {
      await client.subscription.update({
        where: { id: user.subscription.id },
        data: {
          plan: "ENTERPRISE",
          cashfreeCustomerId: cashfreeCustomerId || user.subscription.cashfreeCustomerId,
          cancelAtPeriodEnd: false,
          currentPeriodEnd: subscriptionEndDate,
        },
      });
    } else {
      await client.subscription.create({
        data: {
          userId: user.id,
          plan: "ENTERPRISE",
          cashfreeCustomerId: cashfreeCustomerId || null,
          currentPeriodEnd: subscriptionEndDate,
        },
      });
    }

    // Update enquiry with subscription info if enquiryId provided
    if (enquiryId) {
      await client.enterpriseEnquiry.update({
        where: { id: enquiryId },
        data: {
          subscriptionEndDate: subscriptionEndDate,
          isActive: true,
          status: "CLOSED_WON",
        },
      });
    }

    // Create notification for the user
    await client.notification.create({
      data: {
        userId: user.id,
        content: `🎉 Congratulations! You've been upgraded to the Enterprise plan! Valid until ${subscriptionEndDate.toLocaleDateString()}.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded ${email} to Enterprise plan for ${subscriptionDays} days`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: "ENTERPRISE",
      },
      subscriptionEndDate: subscriptionEndDate.toISOString(),
    });
  } catch (error) {
    console.error("Error upgrading user to enterprise:", error);
    return NextResponse.json(
      { error: "Failed to upgrade user" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/upgrade-enterprise
 * 
 * List all enterprise users (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const adminSecret = req.headers.get("x-admin-secret");
    
    let isAuthorized = false;
    
    if (adminSecret && ADMIN_SECRET && adminSecret === ADMIN_SECRET) {
      isAuthorized = true;
    }
    
    if (!isAuthorized) {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      
      if (session?.user && ADMIN_EMAILS.includes(session.user.email)) {
        isAuthorized = true;
      }
    }
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // Get all enterprise users
    const enterpriseUsers = await client.user.findMany({
      where: {
        subscription: {
          plan: "ENTERPRISE",
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        subscription: {
          select: {
            plan: true,
            cashfreeCustomerId: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: enterpriseUsers.length,
      users: enterpriseUsers,
    });
  } catch (error) {
    console.error("Error fetching enterprise users:", error);
    return NextResponse.json(
      { error: "Failed to fetch enterprise users" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/upgrade-enterprise
 * 
 * Downgrade a user from Enterprise to another plan (admin only)
 * 
 * Body: { email: string, newPlan?: "PRO" | "FREE" }
 */
export async function DELETE(req: NextRequest) {
  try {
    // Check authentication
    const adminSecret = req.headers.get("x-admin-secret");
    
    let isAuthorized = false;
    
    if (adminSecret && ADMIN_SECRET && adminSecret === ADMIN_SECRET) {
      isAuthorized = true;
    }
    
    if (!isAuthorized) {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      
      if (session?.user && ADMIN_EMAILS.includes(session.user.email)) {
        isAuthorized = true;
      }
    }
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { email, newPlan = "FREE" } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!["PRO", "FREE"].includes(newPlan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be PRO or FREE" },
        { status: 400 }
      );
    }

    // Find and update user
    const user = await client.user.findUnique({
      where: { email },
      include: { subscription: true },
    });

    if (!user || !user.subscription) {
      return NextResponse.json(
        { error: `User or subscription not found: ${email}` },
        { status: 404 }
      );
    }

    await client.subscription.update({
      where: { id: user.subscription.id },
      data: {
        plan: newPlan as "PRO" | "FREE",
      },
    });

    // Create notification
    await client.notification.create({
      data: {
        userId: user.id,
        content: `Your plan has been changed to ${newPlan}.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully changed ${email} to ${newPlan} plan`,
    });
  } catch (error) {
    console.error("Error downgrading user:", error);
    return NextResponse.json(
      { error: "Failed to downgrade user" },
      { status: 500 }
    );
  }
}
