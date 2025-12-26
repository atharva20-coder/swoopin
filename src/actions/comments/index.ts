"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUser, hasValidIntegration } from "@/lib/auth-helper";
import {
  getAllMediaWithComments,
  replyToComment as apiReplyToComment,
  setCommentVisibility,
  deleteComment as apiDeleteComment,
  type MediaWithComments,
} from "@/lib/instagram/comments";

// =============================================================================
// Types
// =============================================================================

export interface CommentsData {
  media: MediaWithComments[];
  totalComments: number;
}

interface ActionResult<T = unknown> {
  status: number;
  data?: T;
  error?: string;
}

// =============================================================================
// Get All Comments
// =============================================================================

/**
 * Get all comments across user's recent media posts
 */
export async function getComments(): Promise<ActionResult<CommentsData>> {
  try {
    const authResult = await getAuthenticatedUser();

    if (!authResult) {
      return { status: 401, error: "Unauthorized" };
    }

    if (!hasValidIntegration(authResult)) {
      return {
        status: 400,
        error: "Instagram not connected",
        data: { media: [], totalComments: 0 },
      };
    }

    const result = await getAllMediaWithComments(
      authResult.integration.instagramId!,
      authResult.integration.token!,
      10 // Limit to 10 posts for performance
    );

    if (!result.success) {
      return {
        status: 500,
        error: result.error,
        data: { media: [], totalComments: 0 },
      };
    }

    const media = result.data || [];
    const totalComments = media.reduce((sum, m) => sum + m.comments_count, 0);

    return {
      status: 200,
      data: { media, totalComments },
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Internal server error",
    };
  }
}

// =============================================================================
// Reply to Comment
// =============================================================================

export async function replyToComment(
  commentId: string,
  message: string
): Promise<ActionResult<{ replyId: string }>> {
  try {
    const authResult = await getAuthenticatedUser();

    if (!authResult) {
      return { status: 401, error: "Unauthorized" };
    }

    if (!hasValidIntegration(authResult)) {
      return { status: 400, error: "Instagram not connected" };
    }

    const result = await apiReplyToComment(
      commentId,
      message,
      authResult.integration.token!
    );

    if (!result.success) {
      return { status: 500, error: result.error };
    }

    revalidatePath("/dashboard/[slug]/inbox");

    return {
      status: 200,
      data: { replyId: result.data?.id || "" },
    };
  } catch (error) {
    console.error("Error replying to comment:", error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Failed to reply",
    };
  }
}

// =============================================================================
// Hide Comment
// =============================================================================

export async function hideComment(
  commentId: string,
  hide: boolean = true
): Promise<ActionResult> {
  try {
    const authResult = await getAuthenticatedUser();

    if (!authResult) {
      return { status: 401, error: "Unauthorized" };
    }

    if (!hasValidIntegration(authResult)) {
      return { status: 400, error: "Instagram not connected" };
    }

    const result = await setCommentVisibility(
      commentId,
      hide,
      authResult.integration.token!
    );

    if (!result.success) {
      return { status: 500, error: result.error };
    }

    revalidatePath("/dashboard/[slug]/inbox");

    return { status: 200 };
  } catch (error) {
    console.error("Error hiding comment:", error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Failed to hide comment",
    };
  }
}

// =============================================================================
// Delete Comment
// =============================================================================

export async function deleteComment(
  commentId: string
): Promise<ActionResult> {
  try {
    const authResult = await getAuthenticatedUser();

    if (!authResult) {
      return { status: 401, error: "Unauthorized" };
    }

    if (!hasValidIntegration(authResult)) {
      return { status: 400, error: "Instagram not connected" };
    }

    const result = await apiDeleteComment(
      commentId,
      authResult.integration.token!
    );

    if (!result.success) {
      return { status: 500, error: result.error };
    }

    revalidatePath("/dashboard/[slug]/inbox");

    return { status: 200 };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Failed to delete comment",
    };
  }
}

