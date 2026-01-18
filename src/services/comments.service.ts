import { client } from "@/lib/prisma";
import {
  getAllMediaWithComments,
  replyToComment as apiReplyToComment,
  sendPrivateReply as apiSendPrivateReply,
  setCommentVisibility,
  deleteComment as apiDeleteComment,
} from "@/lib/instagram/comments";
import {
  CommentsDataSchema,
  type CommentsData,
} from "@/schemas/comments.schema";

/**
 * ============================================
 * COMMENTS SERVICE
 * Business logic for Instagram comment management
 * Requires valid Instagram integration
 * ============================================
 */

class CommentsService {
  /**
   * Get all comments across user's recent media
   */
  async getComments(userId: string): Promise<CommentsData | { error: string }> {
    // Get user's integration
    const integration = await client.integrations.findFirst({
      where: {
        userId,
        name: "INSTAGRAM",
      },
    });

    if (!integration?.token || !integration?.instagramId) {
      return { error: "Instagram not connected" };
    }

    const result = await getAllMediaWithComments(
      integration.instagramId,
      integration.token,
      10, // Limit to 10 posts for performance
    );

    if (!result.success) {
      return { error: result.error || "Failed to fetch comments" };
    }

    const media = result.data || [];
    const totalComments = media.reduce((sum, m) => sum + m.comments_count, 0);

    const data = { media, totalComments };
    const validated = CommentsDataSchema.safeParse(data);

    return validated.success ? validated.data : { error: "Validation failed" };
  }

  /**
   * Reply to a comment
   */
  async replyToComment(
    userId: string,
    commentId: string,
    message: string,
  ): Promise<{ replyId: string } | { error: string }> {
    // Get user's integration
    const integration = await client.integrations.findFirst({
      where: {
        userId,
        name: "INSTAGRAM",
      },
    });

    if (!integration?.token) {
      return { error: "Instagram not connected" };
    }

    const result = await apiReplyToComment(
      commentId,
      message,
      integration.token,
    );

    if (!result.success) {
      return { error: result.error || "Failed to reply to comment" };
    }

    return { replyId: result.data?.id || "" };
  }

  /**
   * Hide/unhide a comment
   */
  async hideComment(
    userId: string,
    commentId: string,
    hide: boolean,
  ): Promise<{ success: boolean } | { error: string }> {
    // Get user's integration
    const integration = await client.integrations.findFirst({
      where: {
        userId,
        name: "INSTAGRAM",
      },
    });

    if (!integration?.token) {
      return { error: "Instagram not connected" };
    }

    const result = await setCommentVisibility(
      commentId,
      hide,
      integration.token,
    );

    if (!result.success) {
      return { error: result.error || "Failed to update comment visibility" };
    }

    return { success: true };
  }

  /**
   * Delete a comment
   */
  async deleteComment(
    userId: string,
    commentId: string,
  ): Promise<{ success: boolean } | { error: string }> {
    // Get user's integration
    const integration = await client.integrations.findFirst({
      where: {
        userId,
        name: "INSTAGRAM",
      },
    });

    if (!integration?.token) {
      return { error: "Instagram not connected" };
    }

    const result = await apiDeleteComment(commentId, integration.token);

    if (!result.success) {
      return { error: result.error || "Failed to delete comment" };
    }

    // ... existing code ...
    return { success: true };
  }

  /**
   * Send a private reply to a comment
   */
  async sendPrivateReply(
    userId: string,
    commentId: string,
    message: string,
  ): Promise<{ recipientId: string; messageId: string } | { error: string }> {
    // Get user's integration
    const integration = await client.integrations.findFirst({
      where: {
        userId,
        name: "INSTAGRAM",
      },
    });

    if (!integration?.token) {
      return { error: "Instagram not connected" };
    }

    const result = await apiSendPrivateReply(
      commentId,
      message,
      integration.token,
    );

    if (!result.success || !result.data) {
      return { error: result.error || "Failed to send private reply" };
    }

    return {
      recipientId: result.data.recipient_id,
      messageId: result.data.message_id,
    };
  }
}

// Export singleton instance
export const commentsService = new CommentsService();
