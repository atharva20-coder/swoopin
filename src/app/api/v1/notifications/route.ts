import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  internalError,
  getAuthUser,
  validateQuery,
  rateLimitByUser,
} from "@/app/api/v1/_lib";
import { notificationService } from "@/services/notification.service";
import { NotificationQuerySchema } from "@/schemas/notification.schema";
import { client } from "@/lib/prisma";

// Force dynamic rendering - this route uses headers for authentication
export const dynamic = "force-dynamic";

/**
 * Helper to get db user ID
 */
async function getDbUserId(email: string): Promise<string | null> {
  const user = await client.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * ============================================
 * GET /api/v1/notifications
 * List notifications (cursor-based pagination)
 * ============================================
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Get user ID
    const userId = await getDbUserId(authUser.email);
    if (!userId) {
      return unauthorized("User not found");
    }

    // 3. Rate limiting
    const rateLimitResponse = await rateLimitByUser(userId, "standard");
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 4. Validate query params
    const { searchParams } = new URL(request.url);
    const validation = validateQuery(searchParams, NotificationQuerySchema);
    if (!validation.success) {
      return validation.response;
    }

    // 5. Fetch notifications
    const result = await notificationService.listByUser(
      userId,
      validation.data
    );

    // Also get unread count
    const unreadCount = await notificationService.getUnreadCount(userId);

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        ...result.meta,
        unreadCount,
        version: "v1",
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("GET /api/v1/notifications error:", error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * PUT /api/v1/notifications
 * Mark all notifications as read
 * ============================================
 */
export async function PUT(_request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Get user ID
    const userId = await getDbUserId(authUser.email);
    if (!userId) {
      return unauthorized("User not found");
    }

    // 3. Rate limiting
    const rateLimitResponse = await rateLimitByUser(userId, "standard");
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 4. Mark all as read
    const count = await notificationService.markAllAsRead(userId);

    return success({ markedAsRead: count });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("PUT /api/v1/notifications error:", error.message);
    }
    return internalError();
  }
}
