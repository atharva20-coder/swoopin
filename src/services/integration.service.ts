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
   */
  getInstagramOAuthUrl(): string {
    return process.env.INSTAGRAM_EMBEDDED_OAUTH_URL || "";
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
   * Get integration by platform for a user
   */
  async getByPlatform(
    userId: string,
    platform: "INSTAGRAM",
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
