import { client } from "@/lib/prisma";
import { cookies } from "next/headers";
import {
  generatePKCE,
  getCanvaAuthUrl,
  getUserDesigns as canvaGetDesigns,
  exportDesign as canvaExportDesign,
  getExportStatus as canvaGetExportStatus,
  refreshAccessToken,
} from "@/lib/canva";
import {
  CanvaConnectionStatusSchema,
  CanvaDesignsResponseSchema,
  type CanvaConnectionStatus,
  type CanvaDesign,
  type GetDesignsRequest,
  type ExportDesignRequest,
  type ExportFormat,
} from "@/schemas/canva.schema";

/**
 * ============================================
 * CANVA SERVICE
 * Business logic for Canva integration
 * IDOR protection via userId ownership checks
 * Zero patchwork - all transformations via Zod schemas
 * ============================================
 */

class CanvaService {
  /**
   * Check if user has Canva connected
   * IDOR: Only returns connection for authenticated user
   */
  async getConnectionStatus(userId: string): Promise<CanvaConnectionStatus> {
    const dbUser = await client.user.findFirst({
      where: { id: userId },
      include: { canvaIntegration: true },
    });

    const result = CanvaConnectionStatusSchema.safeParse({
      connected: !!dbUser?.canvaIntegration,
      canvaUserId: dbUser?.canvaIntegration?.canvaUserId,
    });

    return result.success
      ? result.data
      : { connected: false, canvaUserId: null };
  }

  /**
   * Generate OAuth URL for connecting Canva
   */
  async getConnectUrl(): Promise<{ url: string } | { error: string }> {
    try {
      // Generate PKCE
      const { codeVerifier, codeChallenge } = generatePKCE();

      // Store code_verifier in cookie for callback
      const cookieStore = await cookies();
      cookieStore.set("canva_code_verifier", codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 600, // 10 minutes
      });

      // Generate state for CSRF protection
      const state = crypto.randomUUID();
      cookieStore.set("canva_oauth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 600,
      });

      // Use the app URL directly - on production this will be the correct domain
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://swoopin.vercel.app";
      const redirectUri = `${baseUrl}/api/auth/callback/canva`;

      const url = getCanvaAuthUrl(redirectUri, state, codeChallenge);
      return { url };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error generating Canva connect URL:", error.message);
      }
      return { error: "Failed to generate connect URL" };
    }
  }

  /**
   * Get user's Canva designs
   * IDOR: Only returns designs for user's connected account
   */
  async getDesigns(
    userId: string,
    input: GetDesignsRequest,
  ): Promise<
    { designs: CanvaDesign[]; continuation: string | null } | { error: string }
  > {
    const dbUser = await client.user.findFirst({
      where: { id: userId },
      include: { canvaIntegration: true },
    });

    if (!dbUser?.canvaIntegration) {
      return { error: "Canva not connected" };
    }

    let accessToken = dbUser.canvaIntegration.accessToken;

    // Check if token is expired and refresh if needed
    if (
      dbUser.canvaIntegration.expiresAt &&
      new Date() > dbUser.canvaIntegration.expiresAt &&
      dbUser.canvaIntegration.refreshToken
    ) {
      try {
        const refreshed = await refreshAccessToken(
          dbUser.canvaIntegration.refreshToken,
        );
        accessToken = refreshed.accessToken;

        // Update tokens in database
        await client.canvaIntegration.update({
          where: { id: dbUser.canvaIntegration.id },
          data: {
            accessToken: refreshed.accessToken,
            refreshToken:
              refreshed.refreshToken || dbUser.canvaIntegration.refreshToken,
            expiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
          },
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Failed to refresh Canva token:", error.message);
        }
        return { error: "Session expired. Please reconnect Canva." };
      }
    }

    try {
      const result = await canvaGetDesigns(accessToken, {
        limit: input.limit,
        continuation: input.continuation ?? undefined,
      });

      const validated = CanvaDesignsResponseSchema.safeParse(result);
      if (validated.success) {
        return {
          designs: validated.data.designs,
          continuation: validated.data.continuation,
        };
      }

      return { designs: result.designs || [], continuation: null };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching Canva designs:", error.message);
      }
      return { error: "Failed to fetch designs" };
    }
  }

  /**
   * Export a Canva design as image
   * IDOR: Verifies user has Canva connected
   */
  async exportDesign(
    userId: string,
    input: ExportDesignRequest,
  ): Promise<{ urls: string[] } | { error: string }> {
    const dbUser = await client.user.findFirst({
      where: { id: userId },
      include: { canvaIntegration: true },
    });

    if (!dbUser?.canvaIntegration) {
      return { error: "Canva not connected" };
    }

    try {
      const result = await canvaExportDesign(
        dbUser.canvaIntegration.accessToken,
        input.designId,
        input.format,
      );

      // If export is already complete, return URLs
      if (result.status === "completed" && result.urls) {
        return { urls: result.urls };
      }

      // Poll for completion (up to 30 seconds)
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const status = await canvaGetExportStatus(
          dbUser.canvaIntegration.accessToken,
          input.designId,
          result.exportId,
        );

        if (status.status === "completed" && status.urls) {
          return { urls: status.urls };
        }

        if (status.status === "failed") {
          return { error: "Export failed" };
        }
      }

      return { error: "Export timed out" };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error exporting Canva design:", error.message);
      }
      return { error: "Failed to export design" };
    }
  }

  /**
   * Disconnect Canva integration
   * IDOR: Only disconnects for authenticated user
   */
  async disconnect(userId: string): Promise<{ disconnected: boolean }> {
    const dbUser = await client.user.findFirst({
      where: { id: userId },
      include: { canvaIntegration: true },
    });

    if (!dbUser?.canvaIntegration) {
      return { disconnected: true };
    }

    try {
      await client.canvaIntegration.delete({
        where: { id: dbUser.canvaIntegration.id },
      });
      return { disconnected: true };
    } catch {
      return { disconnected: true };
    }
  }
}

export const canvaService = new CanvaService();
