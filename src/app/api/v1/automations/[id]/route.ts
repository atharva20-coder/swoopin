import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  notFound,
  forbidden,
  internalError,
  getAuthUser,
  validateBody,
  rateLimitByUserWithPlan,
} from "@/app/api/v1/_lib";
import { automationService } from "@/services/automation.service";
import { UpdateAutomationRequestSchema } from "@/schemas/automation.schema";
import { client } from "@/lib/prisma";
import { getUserPlanLimits, canPerformAction } from "@/lib/access-control";

/**
 * Helper to get db user ID + subscription plan
 */
async function getDbUserWithPlan(email: string) {
  const user = await client.user.findUnique({
    where: { email },
    select: { id: true, subscription: { select: { plan: true } } },
  });
  if (!user) return null;
  return {
    id: user.id,
    plan: user.subscription?.plan ?? ("FREE" as const),
  };
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

    // 3. Get user ID + plan
    const dbUser = await getDbUserWithPlan(authUser.email);
    if (!dbUser) {
      return unauthorized("User not found");
    }

    // 4. Tier-aware rate limiting
    const rateLimitResponse = await rateLimitByUserWithPlan(
      dbUser.id,
      dbUser.plan,
      "standard",
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 5. Get automation (IDOR check inside service)
    const automation = await automationService.getById(id, dbUser.id);

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

    // 3. Get user ID + plan
    const dbUser = await getDbUserWithPlan(authUser.email);
    if (!dbUser) {
      return unauthorized("User not found");
    }

    // 4. Tier-aware rate limiting
    const rateLimitResponse = await rateLimitByUserWithPlan(
      dbUser.id,
      dbUser.plan,
      "standard",
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 5. Edit limit guard
    const editCheck = await canPerformAction(dbUser.id, "edit_automation", id);
    if (!editCheck.allowed) {
      return forbidden(editCheck.reason ?? "Edit limit reached");
    }

    // 6. Validate request body
    const validation = await validateBody(
      request,
      UpdateAutomationRequestSchema,
    );
    if (!validation.success) {
      return validation.response;
    }

    // 7. Update automation (IDOR check inside service)
    const result = await automationService.update(
      id,
      dbUser.id,
      validation.data,
    );

    if (!result) {
      return forbidden("Not authorized to update this automation");
    }

    // 8. Track edit
    await automationService.incrementEditCount(id, dbUser.id);

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

    // 3. Get user ID + plan
    const dbUser = await getDbUserWithPlan(authUser.email);
    if (!dbUser) {
      return unauthorized("User not found");
    }

    // 4. Tier-aware rate limiting
    const rateLimitResponse = await rateLimitByUserWithPlan(
      dbUser.id,
      dbUser.plan,
      "standard",
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 5. Delete automation (IDOR check inside service)
    const deleted = await automationService.delete(id, dbUser.id);

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

    // 3. Get user ID + plan
    const dbUser = await getDbUserWithPlan(authUser.email);
    if (!dbUser) {
      return unauthorized("User not found");
    }

    // 4. Tier-aware rate limiting
    const rateLimitResponse = await rateLimitByUserWithPlan(
      dbUser.id,
      dbUser.plan,
      "standard",
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 5. Edit limit guard
    const editCheck = await canPerformAction(dbUser.id, "edit_automation", id);
    if (!editCheck.allowed) {
      return forbidden(editCheck.reason ?? "Edit limit reached");
    }

    // 6. Validate request body - accepts name and/or active
    const validation = await validateBody(
      request,
      UpdateAutomationRequestSchema,
    );
    if (!validation.success) {
      return validation.response;
    }

    // 7. Update automation (IDOR check inside service)
    const result = await automationService.update(
      id,
      dbUser.id,
      validation.data,
    );

    if (!result) {
      return forbidden("Not authorized to modify this automation");
    }

    // 8. Track edit
    await automationService.incrementEditCount(id, dbUser.id);

    return success(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("PATCH /api/v1/automations/[id] error:", error.message);
    }
    return internalError();
  }
}
