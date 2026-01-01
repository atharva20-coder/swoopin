import { client } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { validateBody, upgradeUserSchema } from "@/schemas/api";

/**
 * POST /api/admin/users/upgrade
 * 
 * Upgrade/downgrade a user's plan.
 * Requires admin authentication.
 */
export async function POST(req: NextRequest) {
  // Require admin authentication
  const adminError = await requireAdmin();
  if (adminError) {
    return adminError;
  }

  // Validate request body
  const validation = await validateBody(req, upgradeUserSchema);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation Error", message: validation.error },
      { status: 400 }
    );
  }

  const { email, plan } = validation.data;

  try {
    const user = await client.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Not Found", message: "User not found" },
        { status: 404 }
      );
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
    return NextResponse.json(
      { error: "Server Error", message: "Failed to upgrade user" },
      { status: 500 }
    );
  }
}
