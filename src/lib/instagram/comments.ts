import axios from "axios";

/**
 * Instagram Comments API Wrapper
 * Manages comments on Instagram media via Graph API v21.0
 * @see https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-comment
 * Requires: instagram_manage_comments permission
 */

// =============================================================================
// Types
// =============================================================================

export interface InstagramComment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  like_count: number;
  hidden: boolean;
  media_id: string;
  replies?: InstagramComment[];
  user?: {
    id: string;
    username: string;
    profile_picture_url?: string;
  };
}

export interface MediaWithComments {
  id: string;
  caption?: string;
  media_url?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  timestamp: string;
  comments_count: number;
  comments: InstagramComment[];
}

export interface CommentsResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// =============================================================================
// Get Comments
// =============================================================================

/**
 * Get replies for a specific comment
 */
async function getCommentReplies(
  commentId: string,
  token: string
): Promise<InstagramComment[]> {
  try {
    const response = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/${commentId}/replies`,
      {
        params: {
          fields: "id,text,username,timestamp,like_count,hidden,user{id,username,profile_picture_url}",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );

    return (response.data.data || []).map(
      (c: Record<string, unknown>) => ({
        id: c.id as string,
        text: c.text as string,
        username: c.username as string,
        timestamp: c.timestamp as string,
        like_count: (c.like_count as number) || 0,
        hidden: (c.hidden as boolean) || false,
        media_id: commentId,
        user: c.user as InstagramComment["user"],
        replies: [], // Replies don't have nested replies on Instagram
      })
    );
  } catch {
    // Silently fail - replies are optional
    return [];
  }
}

/**
 * Get comments for a specific media post (with nested replies)
 * Filters out replies from top-level to avoid duplicates
 */
export async function getMediaComments(
  mediaId: string,
  token: string,
  limit: number = 50
): Promise<CommentsResponse<InstagramComment[]>> {
  try {
    const response = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/${mediaId}/comments`,
      {
        params: {
          // Include parent_id to identify replies vs top-level comments
          fields: "id,text,username,timestamp,like_count,hidden,parent_id,user{id,username,profile_picture_url}",
          limit,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );

    const rawComments = response.data.data || [];

    // Filter to only top-level comments (those without parent_id)
    // Replies have parent_id set to their parent comment's ID
    const topLevelComments = rawComments.filter(
      (c: Record<string, unknown>) => !c.parent_id
    );

    // Fetch replies for each top-level comment in parallel
    const commentsWithReplies: InstagramComment[] = await Promise.all(
      topLevelComments.map(async (c: Record<string, unknown>) => {
        const replies = await getCommentReplies(c.id as string, token);
        
        return {
          id: c.id as string,
          text: c.text as string,
          username: c.username as string,
          timestamp: c.timestamp as string,
          like_count: (c.like_count as number) || 0,
          hidden: (c.hidden as boolean) || false,
          media_id: mediaId,
          user: c.user as InstagramComment["user"],
          replies,
        };
      })
    );

    return { success: true, data: commentsWithReplies };
  } catch (error) {
    if (!is403PermissionError(error)) {
      console.error("Error fetching comments:", error);
    }
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Process items in batches with concurrency limit
 */
async function processBatched<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 5
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  return results;
}

/**
 * Get all recent media with their comments
 * Uses batched processing to limit concurrent API calls
 */
export async function getAllMediaWithComments(
  userId: string,
  token: string,
  mediaLimit: number = 10
): Promise<CommentsResponse<MediaWithComments[]>> {
  try {
    // First, get recent media
    const mediaResponse = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/${userId}/media`,
      {
        params: {
          fields: "id,caption,media_url,media_type,timestamp,comments_count",
          limit: mediaLimit,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );

    const mediaList = mediaResponse.data.data || [];

    // Process media in batches of 5 to limit concurrent API calls
    const mediaWithComments = await processBatched<Record<string, unknown>, MediaWithComments>(
      mediaList,
      async (media) => {
        const commentsResult = await getMediaComments(
          media.id as string,
          token,
          10 // Limit to 10 comments per post for performance
        );

        return {
          id: media.id as string,
          caption: media.caption as string | undefined,
          media_url: media.media_url as string | undefined,
          media_type: media.media_type as MediaWithComments["media_type"],
          timestamp: media.timestamp as string,
          comments_count: (media.comments_count as number) || 0,
          comments: commentsResult.success ? commentsResult.data || [] : [],
        };
      },
      5 // Process 5 media items at a time
    );

    return { success: true, data: mediaWithComments };
  } catch (error) {
    if (!is403PermissionError(error)) {
      console.error("Error fetching media with comments:", error);
    }
    return { success: false, error: getErrorMessage(error) };
  }
}

// =============================================================================
// Reply to Comment
// =============================================================================

/**
 * Reply to a comment
 */
export async function replyToComment(
  commentId: string,
  message: string,
  token: string
): Promise<CommentsResponse<{ id: string }>> {
  try {
    const response = await axios.post(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/${commentId}/replies`,
      { message },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    return { success: true, data: { id: response.data.id } };
  } catch (error) {
    console.error("Error replying to comment:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

// =============================================================================
// Hide/Unhide Comment
// =============================================================================

/**
 * Hide or unhide a comment
 */
export async function setCommentVisibility(
  commentId: string,
  hide: boolean,
  token: string
): Promise<CommentsResponse<{ success: boolean }>> {
  try {
    await axios.post(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/${commentId}`,
      { hide },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("Error updating comment visibility:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

// =============================================================================
// Delete Comment
// =============================================================================

/**
 * Delete a comment (only works on comments on your own media)
 */
export async function deleteComment(
  commentId: string,
  token: string
): Promise<CommentsResponse<{ success: boolean }>> {
  try {
    await axios.delete(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/${commentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );

    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

// =============================================================================
// Helpers
// =============================================================================

function is403PermissionError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 403;
  }
  return false;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const fbError = error.response?.data?.error;
    if (fbError?.message) {
      return fbError.message;
    }
    if (error.response?.status === 403) {
      return "Missing instagram_manage_comments permission";
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error occurred";
}
