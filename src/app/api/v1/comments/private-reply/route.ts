import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  internalError,
  getAuthUser,
  validateBody,
  rateLimitByUser,
} from "@/app/api/v1/_lib";
import { commentsService } from "@/services/comments.service";
import { PrivateReplyRequestSchema } from "@/schemas/comments.schema";
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
 * POST /api/v1/comments/private-reply
 * Send a private reply to a comment
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
    // Using 'heavy' limit because it involves external API calls and messaging
    const rateLimitResponse = await rateLimitByUser(userId, "heavy");
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 4. Validate request body
    const validation = await validateBody(request, PrivateReplyRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 5. Send private reply
    const result = await commentsService.sendPrivateReply(
      userId,
      validation.data.commentId,
      validation.data.message,
    );

    if ("error" in result) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PRIVATE_REPLY_FAILED",
            message: result.error,
            details: {},
          },
        },
        { status: 400 },
      );
    }

    return success(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        "POST /api/v1/comments/private-reply error:",
        error.message,
      );
    }
    return internalError();
  }
}
