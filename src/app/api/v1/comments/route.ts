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
import {
  ReplyToCommentRequestSchema,
  HideCommentRequestSchema,
  DeleteCommentRequestSchema,
} from "@/schemas/comments.schema";
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
 * GET /api/v1/comments
 * Get all comments from Instagram media
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

    // 4. Get comments
    const result = await commentsService.getComments(userId);

    if ("error" in result) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INSTAGRAM_ERROR",
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
      console.error("GET /api/v1/comments error:", error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * POST /api/v1/comments
 * Reply to a comment
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
    const validation = await validateBody(request, ReplyToCommentRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 5. Reply to comment
    const result = await commentsService.replyToComment(
      userId,
      validation.data.commentId,
      validation.data.message
    );

    if ("error" in result) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "REPLY_FAILED",
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
      console.error("POST /api/v1/comments error:", error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * PATCH /api/v1/comments
 * Hide/unhide a comment
 * ============================================
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
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
    const validation = await validateBody(request, HideCommentRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 5. Hide/unhide comment
    const result = await commentsService.hideComment(
      userId,
      validation.data.commentId,
      validation.data.hide
    );

    if ("error" in result) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "HIDE_FAILED",
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
      console.error("PATCH /api/v1/comments error:", error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * DELETE /api/v1/comments
 * Delete a comment
 * ============================================
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
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

    // 4. Get comment ID from query
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Comment ID is required",
            details: {},
          },
        },
        { status: 422 }
      );
    }

    // 5. Delete comment
    const result = await commentsService.deleteComment(userId, commentId);

    if ("error" in result) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DELETE_FAILED",
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
      console.error("DELETE /api/v1/comments error:", error.message);
    }
    return internalError();
  }
}
