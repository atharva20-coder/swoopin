"use server";

import { client } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import {
  generatePKCE,
  getCanvaAuthUrl,
  getUserDesigns as canvaGetDesigns,
  exportDesign as canvaExportDesign,
  getExportStatus as canvaGetExportStatus,
  refreshAccessToken,
} from "@/lib/canva";

// Helper to get current user from session
async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;
  
  const dbUser = await client.user.findFirst({
    where: { id: session.user.id },
    include: { canvaIntegration: true },
  });
  
  return dbUser;
}

// Check if user has connected Canva
export async function isCanvaConnected(): Promise<{
  connected: boolean;
  canvaUserId?: string;
}> {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) return { connected: false };

    if (!dbUser.canvaIntegration) return { connected: false };

    return {
      connected: true,
      canvaUserId: dbUser.canvaIntegration.canvaUserId || undefined,
    };
  } catch (error) {
    console.error("Error checking Canva connection:", error);
    return { connected: false };
  }
}

// Get Canva OAuth URL for connecting
export async function getCanvaConnectUrl(): Promise<{ url: string } | { error: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { error: "Not authenticated" };

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

    // Use 127.0.0.1 for localhost as required by Canva
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
    const redirectUri = `${baseUrl}/api/auth/callback/canva`;

    const url = getCanvaAuthUrl(redirectUri, state, codeChallenge);
    return { url };
  } catch (error) {
    console.error("Error generating Canva connect URL:", error);
    return { error: "Failed to generate connect URL" };
  }
}

// Get user's Canva designs
export async function getCanvaDesigns(options?: { limit?: number; continuation?: string }) {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) return { error: "Not authenticated" };

    if (!dbUser.canvaIntegration) return { error: "Canva not connected" };

    let accessToken = dbUser.canvaIntegration.accessToken;

    // Check if token is expired and refresh if needed
    if (dbUser.canvaIntegration.expiresAt && 
        new Date() > dbUser.canvaIntegration.expiresAt &&
        dbUser.canvaIntegration.refreshToken) {
      try {
        const refreshed = await refreshAccessToken(dbUser.canvaIntegration.refreshToken);
        accessToken = refreshed.accessToken;
        
        // Update tokens in database
        await client.canvaIntegration.update({
          where: { id: dbUser.canvaIntegration.id },
          data: {
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken || dbUser.canvaIntegration.refreshToken,
            expiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
          },
        });
      } catch (refreshError) {
        console.error("Failed to refresh Canva token:", refreshError);
        return { error: "Session expired. Please reconnect Canva." };
      }
    }

    const designs = await canvaGetDesigns(accessToken, options);
    return { designs: designs.designs, continuation: designs.continuation };
  } catch (error) {
    console.error("Error fetching Canva designs:", error);
    return { error: "Failed to fetch designs" };
  }
}

// Export a Canva design as image
export async function exportCanvaDesign(designId: string, format: "png" | "jpg" = "png") {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) return { error: "Not authenticated" };

    if (!dbUser.canvaIntegration) return { error: "Canva not connected" };

    const result = await canvaExportDesign(
      dbUser.canvaIntegration.accessToken,
      designId,
      format
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
        designId,
        result.exportId
      );

      if (status.status === "completed" && status.urls) {
        return { urls: status.urls };
      }

      if (status.status === "failed") {
        return { error: "Export failed" };
      }
    }

    return { error: "Export timed out" };
  } catch (error) {
    console.error("Error exporting Canva design:", error);
    return { error: "Failed to export design" };
  }
}

// Disconnect Canva
export async function disconnectCanva() {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) return { error: "Not authenticated" };

    if (!dbUser.canvaIntegration) return { success: true };

    await client.canvaIntegration.delete({
      where: { id: dbUser.canvaIntegration.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error disconnecting Canva:", error);
    return { error: "Failed to disconnect" };
  }
}
