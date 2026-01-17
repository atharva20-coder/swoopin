import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { client } from "@/lib/prisma";
import { exchangeCodeForTokens, getUserProfile } from "@/lib/canva";

// Force dynamic rendering - this route uses request.url and cookies
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Handle OAuth error
    if (error) {
      console.error("Canva OAuth error:", error);
      return NextResponse.redirect(
        new URL("/dashboard/integrations?error=canva_denied", url.origin),
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/dashboard/integrations?error=canva_no_code", url.origin),
      );
    }

    // Verify state
    const cookieStore = await cookies();
    const storedState = cookieStore.get("canva_oauth_state")?.value;

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL(
          "/dashboard/integrations?error=canva_invalid_state",
          url.origin,
        ),
      );
    }

    // Get code verifier from cookie
    const codeVerifier = cookieStore.get("canva_code_verifier")?.value;
    if (!codeVerifier) {
      return NextResponse.redirect(
        new URL("/dashboard/integrations?error=canva_no_verifier", url.origin),
      );
    }

    // Get current user from Better Auth session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/sign-in", url.origin));
    }

    // Build redirect URI (must match what was sent in authorization request)
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;
    const redirectUri = `${baseUrl}/api/auth/callback/canva`;

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, codeVerifier, redirectUri);

    // Get Canva user profile
    let canvaUserId: string | undefined;
    try {
      const profile = await getUserProfile(tokens.accessToken);
      canvaUserId = profile.userId;
    } catch (profileError) {
      console.error("Failed to get Canva profile:", profileError);
    }

    // Find database user
    const dbUser = await client.user.findFirst({
      where: { id: session.user.id },
      select: { id: true, name: true },
    });

    if (!dbUser) {
      return NextResponse.redirect(
        new URL("/dashboard/integrations?error=user_not_found", url.origin),
      );
    }

    // Save or update Canva integration
    await client.canvaIntegration.upsert({
      where: { userId: dbUser.id },
      create: {
        userId: dbUser.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
        canvaUserId: canvaUserId,
      },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
        canvaUserId: canvaUserId,
      },
    });

    // Clear OAuth cookies
    cookieStore.delete("canva_oauth_state");
    cookieStore.delete("canva_code_verifier");

    // Get slug from already-fetched dbUser
    const slug = dbUser.name?.replace(/\s+/g, "") || "user";

    // Redirect to integrations page with success
    return NextResponse.redirect(
      new URL(`/dashboard/${slug}/integrations?canva=connected`, url.origin),
    );
  } catch (error) {
    console.error("Canva callback error:", error);
    const url = new URL(req.url);
    return NextResponse.redirect(
      new URL(
        "/dashboard/integrations?error=canva_callback_failed",
        url.origin,
      ),
    );
  }
}
