import { client } from "@/lib/prisma";
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
 * POST /api/admin/users/upgrade
 * Upgrade/downgrade a user's plan
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, plan } = body;

    if (!email || !plan) {
      return NextResponse.json({ error: "Email and plan are required" }, { status: 400 });
    }

    if (!["FREE", "PRO", "ENTERPRISE"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const user = await client.user.findUnique({
      where: { email },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.subscription) {
      await client.subscription.update({
        where: { id: user.subscription.id },
        data: { plan },
      });
    } else {
      await client.subscription.create({
        data: {
          userId: user.id,
          plan,
        },
      });
    }

    // Create notification
    await client.notification.create({
      data: {
        userId: user.id,
        content: `Your plan has been updated to ${plan}.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully changed ${email} to ${plan}`,
    });
  } catch (error) {
    console.error("Error upgrading user:", error);
    return NextResponse.json({ error: "Failed to upgrade user" }, { status: 500 });
  }
}
