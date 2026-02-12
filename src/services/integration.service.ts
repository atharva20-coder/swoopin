import { client } from "@/lib/prisma";
import { generateTokens } from "@/lib/fetch";
import { capitalize } from "@/lib/utils";
import { notificationService } from "./notification.service";
import {
  IntegrationListSchema,
  IntegrationConnectedSchema,
  type Integration,
  type IntegrationConnected,
} from "@/schemas/integration.schema";
import axios from "axios";

/**
 * ============================================
 * INTEGRATION SERVICE
 * Business logic for platform integrations
 * IDOR protection via userId ownership checks
 * ============================================
 */

class IntegrationService {
  /**
   * Get all integrations for a user
   */
  async getByUser(userId: string): Promise<Integration[]> {
    const integrations = await client.integrations.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const validated = IntegrationListSchema.safeParse(integrations);
    return validated.success ? validated.data : [];
  }

  /**
   * Get Instagram OAuth URL
   * Constructed dynamically so the redirect_uri always matches
   * NEXT_PUBLIC_HOST_URL (same as generateTokens uses for the token exchange).
   */
  getInstagramOAuthUrl(): string {
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const hostUrl = process.env.NEXT_PUBLIC_HOST_URL;

    if (!clientId || !hostUrl) {
      console.error(
        "[IntegrationService] Missing INSTAGRAM_CLIENT_ID or NEXT_PUBLIC_HOST_URL",
      );
      return "";
    }

    const params = new URLSearchParams({
      enable_fb_login: "0",
      force_authentication: "1",
      client_id: clientId,
      redirect_uri: `${hostUrl}/callback/instagram`,
      response_type: "code",
      scope: [
        "instagram_business_basic",
        "instagram_business_manage_messages",
        "instagram_business_manage_comments",
        "instagram_business_content_publish",
      ].join(","),
    });

    return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Connect Instagram using OAuth code
   */
  async connectInstagram(
    userId: string,
    code: string,
  ): Promise<IntegrationConnected | { error: string }> {
    // Check if user already has Instagram integration
    const existing = await client.integrations.findFirst({
      where: {
        userId,
        name: "INSTAGRAM",
      },
    });

    if (existing) {
      return { error: "Instagram already connected" };
    }

    // Exchange code for token
    const tokenResult = await generateTokens(code);
    if (!tokenResult) {
      return { error: "Failed to exchange OAuth code" };
    }

    // Get Instagram user ID
    let instagramUserId: string | null = null;
    try {
      const response = await axios.get(
        `${process.env.INSTAGRAM_BASE_URL}/me?fields=user_id&access_token=${tokenResult.access_token}`,
      );
      instagramUserId = response.data.user_id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to get Instagram user ID:", error.message);
      }
      return { error: "Failed to get Instagram account info" };
    }

    // Calculate expiry (60 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    // Create integration
    const integration = await client.integrations.create({
      data: {
        userId,
        token: tokenResult.access_token,
        expiresAt,
        instagramId: instagramUserId,
        name: "INSTAGRAM",
      },
      select: {
        id: true,
        name: true,
        instagramId: true,
        expiresAt: true,
      },
    });

    // Create notification
    await notificationService.create(
      "You have connected your Instagram account",
      userId,
    );

    const result = {
      id: integration.id,
      platform: integration.name,
      instagramId: integration.instagramId,
      expiresAt: integration.expiresAt,
    };

    const validated = IntegrationConnectedSchema.safeParse(result);
    return validated.success ? validated.data : { error: "Validation failed" };
  }

  /**
   * Disconnect integration with ownership check
   */
  async disconnect(integrationId: string, userId: string): Promise<boolean> {
    // IDOR check - verify ownership
    const integration = await client.integrations.findUnique({
      where: { id: integrationId },
      select: {
        userId: true,
        name: true,
      },
    });

    if (!integration || integration.userId !== userId) {
      return false;
    }

    await client.integrations.delete({
      where: { id: integrationId },
    });

    // Create notification
    const platformName = capitalize(integration.name);
    await notificationService.create(
      `You have disconnected your ${platformName} account`,
      userId,
    );

    return true;
  }

  /**
   * Refresh Instagram token (internal use)
   */
  async refreshToken(integrationId: string, token: string): Promise<boolean> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    await client.integrations.update({
      where: { id: integrationId },
      data: {
        token,
        expiresAt,
      },
    });

    return true;
  }

  /**
   * Get YouTube OAuth URL
   * Uses same Google OAuth credentials as Sheets/Signin
   */
  getYouTubeOAuthUrl(): string {
    const clientId = process.env.GOOGLE_CLIENT_ID || "";
    const redirectUri =
      process.env.YOUTUBE_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/integrations/youtube/oauth`;
    const scopes = ["https://www.googleapis.com/auth/youtube.force-ssl"];

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Connect YouTube using OAuth code
   */
  async connectYouTube(
    userId: string,
    code: string,
  ): Promise<IntegrationConnected | { error: string }> {
    // Check if user already has YouTube integration
    const existing = await client.integrations.findFirst({
      where: {
        userId,
        name: "YOUTUBE",
      },
    });

    if (existing) {
      return { error: "YouTube already connected" };
    }

    try {
      // Exchange code for tokens (uses same Google credentials)
      const tokenResponse = await axios.post(
        "https://oauth2.googleapis.com/token",
        {
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri:
            process.env.YOUTUBE_REDIRECT_URI ||
            `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/integrations/youtube/oauth`,
          grant_type: "authorization_code",
        },
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // Get YouTube channel ID
      const channelResponse = await axios.get(
        "https://www.googleapis.com/youtube/v3/channels",
        {
          params: {
            part: "id",
            mine: true,
          },
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      const channelId = channelResponse.data.items?.[0]?.id;

      if (!channelId) {
        return { error: "No YouTube channel found for this account" };
      }

      // Calculate expiry
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

      // Store integration (we'll use instagramId field as a generic platformId)
      const integration = await client.integrations.create({
        data: {
          userId,
          token: refresh_token || access_token, // Store refresh token for long-term access
          expiresAt,
          instagramId: channelId, // Reusing this field for YouTube channel ID
          name: "YOUTUBE",
        },
        select: {
          id: true,
          name: true,
          instagramId: true,
          expiresAt: true,
        },
      });

      // Create notification
      await notificationService.create(
        "You have connected your YouTube account",
        userId,
      );

      const result = {
        id: integration.id,
        platform: integration.name,
        instagramId: integration.instagramId,
        expiresAt: integration.expiresAt,
      };

      const validated = IntegrationConnectedSchema.safeParse(result);
      return validated.success
        ? validated.data
        : { error: "Validation failed" };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("YouTube OAuth error:", error.response?.data);
        return {
          error:
            error.response?.data?.error_description ||
            "Failed to connect YouTube",
        };
      }
      return { error: "Failed to connect YouTube" };
    }
  }

  /**
   * Get integration by platform for a user
   */
  async getByPlatform(
    userId: string,
    platform: "INSTAGRAM" | "YOUTUBE",
  ): Promise<Integration | null> {
    const integration = await client.integrations.findFirst({
      where: {
        userId,
        name: platform,
      },
    });

    if (!integration) return null;

    const validated = IntegrationListSchema.safeParse([integration]);
    return validated.success ? (validated.data[0] ?? null) : null;
  }
}

// Export singleton instance
export const integrationService = new IntegrationService();
