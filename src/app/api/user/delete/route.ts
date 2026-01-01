import { NextRequest, NextResponse } from "next/server";
import { client as prisma } from "@/lib/prisma";
import { applyRateLimit } from "@/lib/rate-limiter";
import { requireAuth } from "@/lib/admin";
import { validateBody, deleteUserSchema } from "@/schemas/api";

/**
 * DELETE /api/user/delete
 * 
 * Securely delete a user account.
 * - Requires authentication
 * - User can only delete their own account
 * - Rate limited to prevent abuse
 */
export async function DELETE(request: NextRequest) {
  // Apply STRICT rate limiting (5 requests/minute) - destructive operation
  const rateLimitResult = await applyRateLimit(request, "STRICT");
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  // Require authentication
  const authResult = await requireAuth();
  if ("response" in authResult) {
    return authResult.response;
  }
  const { session } = authResult;

  // Validate request body
  const validation = await validateBody(request, deleteUserSchema);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation Error", message: validation.error },
      { status: 400 }
    );
  }

  const { email } = validation.data;

  // Security: Users can only delete their own account
  if (session.user.email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json(
      { error: "Forbidden", message: "You can only delete your own account" },
      { status: 403 }
    );
  }

  try {
    // Find user from database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Not Found", message: "User not found" },
        { status: 404 }
      );
    }

    // Verify the authenticated user matches the database user
    if (user.email.toLowerCase() !== session.user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Forbidden", message: "Account mismatch" },
        { status: 403 }
      );
    }

    // Delete all related data in a transaction
    await prisma.$transaction([
      // Delete automations and related data
      prisma.automation.deleteMany({
        where: { userId: user.id },
      }),
      // Delete notifications
      prisma.notification.deleteMany({
        where: { userId: user.id },
      }),
      // Delete subscription
      prisma.subscription.deleteMany({
        where: { userId: user.id },
      }),
      // Delete integrations
      prisma.integrations.deleteMany({
        where: { userId: user.id },
      }),
      // Delete sessions
      prisma.session.deleteMany({
        where: { userId: user.id },
      }),
      // Delete accounts (OAuth connections)
      prisma.account.deleteMany({
        where: { userId: user.id },
      }),
      // Finally delete the user
      prisma.user.delete({
        where: { id: user.id },
      }),
    ]);

    return NextResponse.json(
      { success: true, message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Server Error", message: "Failed to delete account" },
      { status: 500 }
    );
  }
}