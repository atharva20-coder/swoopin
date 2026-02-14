import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  forbidden,
  internalError,
  getAuthUser,
  validateBody,
  rateLimitByUserWithPlan,
} from "@/app/api/v1/_lib";
import { automationService } from "@/services/automation.service";
import { SaveListenerRequestSchema } from "@/schemas/automation.schema";
import { client } from "@/lib/prisma";
import { canPerformAction } from "@/lib/access-control";
import type { SUBSCRIPTION_PLAN } from "@prisma/client";

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
    plan: (user.subscription?.plan ?? "FREE") as SUBSCRIPTION_PLAN,
  };
}

/**
 * ============================================
 * POST /api/v1/automations/{id}/listener
 * Save or update listener for automation
 * ============================================
 */
export async function POST(
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
      return forbidden(
        editCheck.reason ?? "Edit limit reached. Upgrade your plan.",
      );
    }

    // 6. Validate request body
    const validation = await validateBody(request, SaveListenerRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 7. Save listener (IDOR check inside service)
    const saved = await automationService.saveListener(
      id,
      dbUser.id,
      validation.data,
    );

    if (!saved) {
      return forbidden("Not authorized to modify this automation");
    }

    // 8. Track edit
    await automationService.incrementEditCount(id, dbUser.id);

    return success({ message: "Listener saved" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        "POST /api/v1/automations/[id]/listener error:",
        error.message,
      );
    }
    return internalError();
  }
}
