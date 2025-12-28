import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { client } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL("/dashboard?error=google_auth_cancelled", req.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/dashboard?error=no_code", req.url)
      );
    }

    // Get current user
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.redirect(
        new URL("/sign-in", req.url)
      );
    }

    // Get origin from request URL
    const origin = new URL(req.url).origin;

    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${origin}/api/auth/callback/google-sheets`
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user email
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Save to database
    await client.googleIntegration.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        email: userInfo.data.email || "",
        refreshToken: tokens.refresh_token || "",
        accessToken: tokens.access_token || null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
      update: {
        email: userInfo.data.email || "",
        refreshToken: tokens.refresh_token || undefined,
        accessToken: tokens.access_token || null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });

    // Redirect back to integrations
    return NextResponse.redirect(
      new URL("/dashboard/google-connected/integrations?success=google", req.url)
    );
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=google_auth_failed", req.url)
    );
  }
}
