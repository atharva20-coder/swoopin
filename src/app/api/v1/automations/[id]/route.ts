import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  notFound,
  forbidden,
  internalError,
  getAuthUser,
  validateBody,
  rateLimitByUser,
} from "@/app/api/v1/_lib";
import { automationService } from "@/services/automation.service";
import { UpdateAutomationRequestSchema } from "@/schemas/automation.schema";
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
 * GET /api/v1/automations/{id}
 * Get automation details
 * ============================================
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    // 5. Get automation (IDOR check inside service)
    const automation = await automationService.getById(id, userId);

    if (!automation) {
      return notFound("Automation");
    }

    return success(automation);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("GET /api/v1/automations/[id] error:", error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * PUT /api/v1/automations/{id}
 * Update automation
 * ============================================
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
    const validation = await validateBody(
      request,
      UpdateAutomationRequestSchema,
    );
    if (!validation.success) {
      return validation.response;
    }

    // 6. Update automation (IDOR check inside service)
    const result = await automationService.update(id, userId, validation.data);

    if (!result) {
      return forbidden("Not authorized to update this automation");
    }

    return success(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("PUT /api/v1/automations/[id] error:", error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * DELETE /api/v1/automations/{id}
 * Delete automation
 * ============================================
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    // 5. Delete automation (IDOR check inside service)
    const deleted = await automationService.delete(id, userId);

    if (!deleted) {
      return forbidden("Not authorized to delete this automation");
    }

    return success({ deleted: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("DELETE /api/v1/automations/[id] error:", error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * PATCH /api/v1/automations/{id}
 * Update automation (name and/or active state)
 * ============================================
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    // 5. Validate request body - accepts name and/or active
    const validation = await validateBody(
      request,
      UpdateAutomationRequestSchema,
    );
    if (!validation.success) {
      return validation.response;
    }

    // 6. Update automation (IDOR check inside service)
    const result = await automationService.update(id, userId, validation.data);

    if (!result) {
      return forbidden("Not authorized to modify this automation");
    }

    return success(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("PATCH /api/v1/automations/[id] error:", error.message);
    }
    return internalError();
  }
}
