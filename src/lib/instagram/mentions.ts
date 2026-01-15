import axios from "axios";

/**
 * Instagram Mentions API
 * For handling @mentions in captions and comments
 *
 * Limitations:
 * - Mentions on Stories are not supported
 * - Commenting on photos in which you were tagged is not supported
 * - Webhooks won't be sent for private accounts
 */

const BASE_URL = process.env.INSTAGRAM_BASE_URL;

/**
 * Get data about a comment where the Business/Creator was @mentioned
 *
 * @param userId - Instagram Business/Creator account ID
 * @param commentId - The comment ID from the webhook
 * @param token - Access token
 */
export async function getMentionedComment(
  userId: string,
  commentId: string,
  token: string
): Promise<{
  success: boolean;
  data?: {
    id: string;
    text: string;
    timestamp: string;
    username?: string;
    mediaId?: string;
  };
  error?: string;
}> {
  try {
    const response = await axios.get(`${BASE_URL}/v21.0/${userId}`, {
      params: {
        fields: `mentioned_comment.comment_id(${commentId}){id,text,timestamp,username,media{id}}`,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const commentData = response.data?.mentioned_comment;
    if (!commentData) {
      return { success: false, error: "Comment not found" };
    }

    return {
      success: true,
      data: {
        id: commentData.id,
        text: commentData.text,
        timestamp: commentData.timestamp,
        username: commentData.username,
        mediaId: commentData.media?.id,
      },
    };
  } catch (error) {
    console.error("Error fetching mentioned comment:", error);

    let errorMessage = "Failed to fetch mentioned comment";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Get data about media where the Business/Creator was @mentioned in caption
 *
 * @param userId - Instagram Business/Creator account ID
 * @param mediaId - The media ID from the webhook
 * @param token - Access token
 */
export async function getMentionedMedia(
  userId: string,
  mediaId: string,
  token: string
): Promise<{
  success: boolean;
  data?: {
    id: string;
    caption?: string;
    mediaType: string;
    mediaUrl?: string;
    timestamp: string;
    username?: string;
  };
  error?: string;
}> {
  try {
    const response = await axios.get(`${BASE_URL}/v21.0/${userId}`, {
      params: {
        fields: `mentioned_media.media_id(${mediaId}){id,caption,media_type,media_url,timestamp,username}`,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const mediaData = response.data?.mentioned_media;
    if (!mediaData) {
      return { success: false, error: "Media not found" };
    }

    return {
      success: true,
      data: {
        id: mediaData.id,
        caption: mediaData.caption,
        mediaType: mediaData.media_type,
        mediaUrl: mediaData.media_url,
        timestamp: mediaData.timestamp,
        username: mediaData.username,
      },
    };
  } catch (error) {
    console.error("Error fetching mentioned media:", error);

    let errorMessage = "Failed to fetch mentioned media";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Reply to a mention (comment on the media or reply to comment where mentioned)
 *
 * @param userId - Instagram Business/Creator account ID
 * @param mediaId - The media ID to comment on
 * @param message - The reply message
 * @param token - Access token
 * @param commentId - Optional: If replying to a specific comment
 */
export async function replyToMention(
  userId: string,
  mediaId: string,
  message: string,
  token: string,
  commentId?: string
): Promise<{
  success: boolean;
  commentId?: string;
  error?: string;
}> {
  try {
    if (!message || message.trim() === "") {
      return { success: false, error: "Message is required" };
    }

    const payload: Record<string, string> = {
      message: message.substring(0, 300), // Instagram comment limit
      media_id: mediaId,
    };

    // If replying to a specific comment, include comment_id
    if (commentId) {
      payload.comment_id = commentId;
    }

    const response = await axios.post(
      `${BASE_URL}/v21.0/${userId}/mentions`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      commentId: response.data?.id,
    };
  } catch (error) {
    console.error("Error replying to mention:", error);

    let errorMessage = "Failed to reply to mention";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Get media objects in which the Business/Creator has been tagged
 *
 * @param userId - Instagram Business/Creator account ID
 * @param token - Access token
 * @param limit - Number of results (default 25)
 */
export async function getTaggedMedia(
  userId: string,
  token: string,
  limit: number = 25
): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    caption?: string;
    mediaType: string;
    timestamp: string;
  }>;
  error?: string;
}> {
  try {
    const response = await axios.get(`${BASE_URL}/v21.0/${userId}/tags`, {
      params: {
        fields: "id,caption,media_type,timestamp",
        limit,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: true,
      data: response.data?.data || [],
    };
  } catch (error) {
    console.error("Error fetching tagged media:", error);

    let errorMessage = "Failed to fetch tagged media";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}
