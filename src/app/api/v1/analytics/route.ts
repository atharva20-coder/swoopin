import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  internalError,
  getAuthUser,
  validateQuery,
  validateBody,
  rateLimitByUser,
} from "@/app/api/v1/_lib";
import { analyticsService } from "@/services/analytics.service";
import {
  AnalyticsQuerySchema,
  TrackEventRequestSchema,
} from "@/schemas/analytics.schema";
import { client } from "@/lib/prisma";

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
 * GET /api/v1/analytics
 * Get analytics dashboard data
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
    const validation = validateQuery(searchParams, AnalyticsQuerySchema);
    if (!validation.success) {
      return validation.response;
    }

    // 5. Get dashboard data
    const dashboard = await analyticsService.getDashboard(
      userId,
      validation.data
    );

    return success(dashboard);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("GET /api/v1/analytics error:", error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * POST /api/v1/analytics
 * Track an analytics event (internal/webhook use)
 * ============================================
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
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

    // 4. Validate request body
    const validation = await validateBody(request, TrackEventRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 5. Track event
    const result = await analyticsService.trackEvent(
      userId,
      validation.data.type
    );

    if (!result) {
      return internalError("Failed to track event");
    }

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("POST /api/v1/analytics error:", error.message);
    }
    return internalError();
  }
}
