import { client } from "@/lib/prisma";
import axios from "axios";

/**
 * ============================================
 * YOUTUBE SERVICE
 * Business logic for YouTube API interactions
 * Zero-Patchwork Protocol: Validation at gateway
 * ============================================
 */

interface YouTubeComment {
  id: string;
  snippet: {
    videoId: string;
    textDisplay: string;
    textOriginal: string;
    authorDisplayName: string;
    authorChannelId: {
      value: string;
    };
    publishedAt: string;
  };
}

interface YouTubeCommentThread {
  id: string;
  snippet: {
    videoId: string;
    topLevelComment: YouTubeComment;
    totalReplyCount: number;
  };
}

class YouTubeService {
  /**
   * Refresh YouTube access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      const response = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      });

      return response.data.access_token;
    } catch (error) {
      console.error("[YouTubeService] Token refresh failed:", error);
      return null;
    }
  }

  /**
   * Fetch recent comments on a channel's videos
   */
  async fetchRecentComments(
    accessToken: string,
    channelId: string,
    maxResults: number = 25,
  ): Promise<YouTubeCommentThread[]> {
    try {
      // Get comment threads for the channel
      const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/commentThreads",
        {
          params: {
            part: "snippet",
            allThreadsRelatedToChannelId: channelId,
            maxResults,
            order: "time", // Most recent first
            moderationStatus: "published",
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data.items || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "[YouTubeService] Fetch comments failed:",
          error.response?.data,
        );
      }
      return [];
    }
  }

  /**
   * Reply to a YouTube comment
   */
  async replyToComment(
    accessToken: string,
    parentId: string,
    text: string,
  ): Promise<{ success: boolean; replyId?: string; error?: string }> {
    try {
      const response = await axios.post(
        "https://www.googleapis.com/youtube/v3/comments",
        {
          snippet: {
            parentId,
            textOriginal: text,
          },
        },
        {
          params: {
            part: "snippet",
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return {
        success: true,
        replyId: response.data.id,
      };
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error?.message || error.message
        : "Unknown error";

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get user's published YouTube videos
   * Zero-Patchwork Protocol: Returns raw data, validation at gateway
   */
  async getUserVideos(
    accessToken: string,
    channelId: string,
    maxResults: number = 50,
  ): Promise<
    Array<{
      id: string;
      title: string;
      description: string | null;
      thumbnail: string | null;
      publishedAt: string;
    }>
  > {
    try {
      // First, get the uploads playlist ID for the channel
      const channelResponse = await axios.get(
        "https://www.googleapis.com/youtube/v3/channels",
        {
          params: {
            part: "contentDetails",
            id: channelId,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const uploadsPlaylistId =
        channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists
          ?.uploads;

      if (!uploadsPlaylistId) {
        console.error("[YouTubeService] No uploads playlist found");
        return [];
      }

      // Fetch videos from uploads playlist
      const playlistResponse = await axios.get(
        "https://www.googleapis.com/youtube/v3/playlistItems",
        {
          params: {
            part: "snippet",
            playlistId: uploadsPlaylistId,
            maxResults,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      type PlaylistItem = {
        snippet: {
          resourceId: { videoId: string };
          title: string;
          description: string;
          thumbnails?: {
            medium?: { url: string };
            default?: { url: string };
          };
          publishedAt: string;
        };
      };

      return (playlistResponse.data.items || []).map((item: PlaylistItem) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description || null,
        thumbnail:
          item.snippet.thumbnails?.medium?.url ||
          item.snippet.thumbnails?.default?.url ||
          null,
        publishedAt: item.snippet.publishedAt,
      }));
    } catch (error) {
      console.error("[YouTubeService] Failed to fetch videos:", error);
      return [];
    }
  }

  /**
   * Get all YouTube integrations for polling
   * Zero-Patchwork Protocol: Filter invalid data at query/gateway level
   */
  async getActiveIntegrations(): Promise<
    Array<{
      id: string;
      userId: string;
      channelId: string;
      refreshToken: string;
    }>
  > {
    const integrations = await client.integrations.findMany({
      where: {
        name: "YOUTUBE",
        // Zero-Patchwork: Filter nullable fields at query level
        // Note: token is non-nullable in schema, no need to filter
        NOT: [{ userId: null }, { instagramId: null }],
      },
      select: {
        id: true,
        userId: true,
        instagramId: true,
        token: true,
      },
    });

    // Zero-Patchwork: Type guard filter ensures all required fields are present
    type IntegrationRow = (typeof integrations)[number];
    type ValidIntegration = IntegrationRow & {
      userId: string;
      instagramId: string;
    };

    return integrations
      .filter(
        (i: IntegrationRow): i is ValidIntegration =>
          i.userId !== null && i.instagramId !== null,
      )
      .map((integration: ValidIntegration) => ({
        id: integration.id,
        userId: integration.userId,
        channelId: integration.instagramId,
        refreshToken: integration.token,
      }));
  }

  /**
   * Find YouTube automations for a user
   */
  async findYouTubeAutomations(userId: string): Promise<
    Array<{
      id: string;
      flowNodes: any[];
      flowEdges: any[];
    }>
  > {
    const automations = await client.automation.findMany({
      where: {
        userId,
        active: true,
        flowNodes: {
          some: {
            subType: "YOUTUBE_COMMENT",
          },
        },
      },
      select: {
        id: true,
        flowNodes: true,
        flowEdges: true,
      },
    });

    return automations;
  }
}

export const youtubeService = new YouTubeService();
