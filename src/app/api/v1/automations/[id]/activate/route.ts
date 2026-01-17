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
import { automationService } from "@/services/automation.service";
import { ActivateRequestSchema } from "@/schemas/automation.schema";
import { client } from "@/lib/prisma";

// Force dynamic rendering
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
 * POST /api/v1/automations/{id}/activate
 * Toggle automation active state
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
    const validation = await validateBody(request, ActivateRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 6. Update automation active state (IDOR check inside service)
    const result = await automationService.setActive(
      id,
      userId,
      validation.data.active,
    );

    if (!result) {
      return forbidden("Not authorized to modify this automation");
    }

    return success(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        "POST /api/v1/automations/[id]/activate error:",
        error.message,
      );
    }
    return internalError();
  }
}
