import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { client } from "@/lib/prisma";
import { youtubeService } from "@/services/youtube.service";
import { z } from "zod";

/**
 * Zero-Patchwork Protocol: Validate response at gateway
 */
const YouTubeVideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z
    .string()
    .nullish()
    .transform((v) => v ?? ""),
  thumbnail: z
    .string()
    .url()
    .nullish()
    .transform((v) => v ?? ""),
  publishedAt: z.string(),
});

const YouTubeVideosResponseSchema = z.array(YouTubeVideoSchema);

/**
 * Get database userId from auth email
 */
async function getDbUserId(email: string): Promise<string | null> {
  const user = await client.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * GET /api/v1/integrations/youtube/videos
 * Fetch user's published YouTube videos for flow builder selection
 */
export async function GET() {
  try {
    // 1. Authentication (Gateway Pattern)
    const authUser = await auth.api.getSession({ headers: await headers() });
    if (!authUser?.user?.email) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 },
      );
    }

    // 2. Get database user ID
    const userId = await getDbUserId(authUser.user.email);
    if (!userId) {
      return NextResponse.json(
        { error: { code: "USER_NOT_FOUND", message: "User not found" } },
        { status: 404 },
      );
    }

    // 3. Get YouTube integration
    const integration = await client.integrations.findFirst({
      where: {
        userId,
        name: "YOUTUBE",
      },
      select: {
        token: true,
        instagramId: true, // channelId stored here
      },
    });

    if (!integration?.token || !integration.instagramId) {
      return NextResponse.json(
        {
          error: {
            code: "NO_INTEGRATION",
            message: "YouTube not connected",
          },
        },
        { status: 404 },
      );
    }

    // 4. Refresh access token
    const accessToken = await youtubeService.refreshAccessToken(
      integration.token,
    );
    if (!accessToken) {
      return NextResponse.json(
        {
          error: {
            code: "TOKEN_REFRESH_FAILED",
            message: "Failed to refresh YouTube access token",
          },
        },
        { status: 401 },
      );
    }

    // 5. Fetch videos from YouTube
    const videos = await youtubeService.getUserVideos(
      accessToken,
      integration.instagramId,
    );

    // 6. Validate response (Zero-Patchwork Protocol)
    const validated = YouTubeVideosResponseSchema.safeParse(videos);
    if (!validated.success) {
      console.error("[YouTube Videos] Validation failed:", validated.error);
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid video data from YouTube",
          },
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: 200,
      data: { videos: validated.data },
    });
  } catch (error) {
    console.error("[YouTube Videos] Error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch videos",
        },
      },
      { status: 500 },
    );
  }
}
