import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  internalError,
  getAuthUser,
  rateLimitByUser,
} from "@/app/api/v1/_lib";
import { eventsService } from "@/services/events.service";
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
 * POST /api/v1/events/sync
 * Sync events with Instagram
 * ============================================
 */
export async function POST(_request: NextRequest): Promise<NextResponse> {
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

    // 3. Rate limiting (heavy operation)
    const rateLimitResponse = await rateLimitByUser(userId, "heavy");
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 4. Sync events
    const result = await eventsService.syncEvents(userId);

    if ("error" in result) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SYNC_FAILED",
            message: result.error,
            details: {},
          },
        },
        { status: 400 }
      );
    }

    return success(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("POST /api/v1/events/sync error:", error.message);
    }
    return internalError();
  }
}
