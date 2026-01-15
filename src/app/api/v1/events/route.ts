import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  internalError,
  getAuthUser,
  validateBody,
  rateLimitByUser,
} from "@/app/api/v1/_lib";
import { eventsService } from "@/services/events.service";
import { CreateEventRequestSchema } from "@/schemas/events.schema";
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
 * GET /api/v1/events
 * Get all events for current user
 * ============================================
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
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

    // 4. Get events
    const events = await eventsService.getEvents(userId);

    return success(events);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("GET /api/v1/events error:", error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * POST /api/v1/events
 * Create a new event
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

    // 3. Rate limiting (heavy operation)
    const rateLimitResponse = await rateLimitByUser(userId, "heavy");
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 4. Validate request body
    const validation = await validateBody(request, CreateEventRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 5. Create event
    const result = await eventsService.createEvent(userId, validation.data);

    if ("error" in result) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CREATE_FAILED",
            message: result.error,
            details: {},
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("POST /api/v1/events error:", error.message);
    }
    return internalError();
  }
}
