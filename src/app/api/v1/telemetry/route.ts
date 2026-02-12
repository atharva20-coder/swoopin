import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  internalError,
  getAuthUser,
  validateQuery,
  rateLimitByUser,
} from "@/app/api/v1/_lib";
import { telemetryService } from "@/services/telemetry.service";
import { TelemetryQuerySchema } from "@/schemas/telemetry.schema";
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
 * GET /api/v1/telemetry
 * Get telemetry dashboard data
 * (Automation health, post reach, scheduler, keywords)
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
    const validation = validateQuery(searchParams, TelemetryQuerySchema);
    if (!validation.success) {
      return validation.response;
    }

    // 5. Get telemetry dashboard
    const dashboard = await telemetryService.getDashboard(
      userId,
      validation.data,
    );

    return success(dashboard);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("GET /api/v1/telemetry error:", error.message);
    }
    return internalError();
  }
}
