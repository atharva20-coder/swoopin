import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  forbidden,
  internalError,
  getAuthUser,
  validateBody,
  rateLimitByUser,
} from "@/app/api/v1/_lib";
import { eventsService } from "@/services/events.service";
import { UpdateEventRequestSchema } from "@/schemas/events.schema";
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
 * PUT /api/v1/events/{id}
 * Update an event
 * ============================================
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Await params (Next.js 15)
    const { id } = await params;

    // 3. Get user ID
    const userId = await getDbUserId(authUser.email);
    if (!userId) {
      return unauthorized("User not found");
    }

    // 4. Rate limiting
    const rateLimitResponse = await rateLimitByUser(userId, "standard");
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 5. Validate request body
    const validation = await validateBody(request, UpdateEventRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 6. Update event (IDOR check inside service)
    const result = await eventsService.updateEvent(userId, id, validation.data);

    if ("error" in result) {
      return forbidden(result.error);
    }

    return success(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("PUT /api/v1/events/[id] error:", error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * PATCH /api/v1/events/{id}
 * Cancel an event
 * ============================================
 */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Await params (Next.js 15)
    const { id } = await params;

    // 3. Get user ID
    const userId = await getDbUserId(authUser.email);
    if (!userId) {
      return unauthorized("User not found");
    }

    // 4. Rate limiting
    const rateLimitResponse = await rateLimitByUser(userId, "standard");
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 5. Cancel event (IDOR check inside service)
    const result = await eventsService.cancelEvent(userId, id);

    if ("error" in result) {
      return forbidden(result.error);
    }

    return success(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("PATCH /api/v1/events/[id] error:", error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * DELETE /api/v1/events/{id}
 * Delete an event
 * ============================================
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Await params (Next.js 15)
    const { id } = await params;

    // 3. Get user ID
    const userId = await getDbUserId(authUser.email);
    if (!userId) {
      return unauthorized("User not found");
    }

    // 4. Rate limiting
    const rateLimitResponse = await rateLimitByUser(userId, "standard");
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 5. Delete event (IDOR check inside service)
    const deleted = await eventsService.deleteEvent(userId, id);

    if (!deleted) {
      return forbidden("Not authorized to delete this event");
    }

    return success({ deleted: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("DELETE /api/v1/events/[id] error:", error.message);
    }
    return internalError();
  }
}
