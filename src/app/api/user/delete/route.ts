import { NextRequest, NextResponse } from "next/server";
import { client as prisma } from "@/lib/prisma";
import { applyRateLimit } from "@/lib/rate-limiter";

export async function DELETE(request: NextRequest) {
  // Apply STRICT rate limiting (5 requests/minute) - destructive operation
  const rateLimitResult = await applyRateLimit(request, "STRICT");
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Find and delete user from database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Delete all related data first
    await prisma.$transaction([
      prisma.automation.deleteMany({
        where: { userId: user.id },
      }),
      prisma.notification.deleteMany({
        where: { userId: user.id },
      }),
      prisma.subscription.deleteMany({
        where: { userId: user.id },
      }),
      // Finally delete the user
      prisma.user.delete({
        where: { id: user.id },
      }),
    ]);

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { message: "Failed to delete account" },
      { status: 500 }
    );
  }
}