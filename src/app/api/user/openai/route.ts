import { onCurrentUser } from "@/actions/user";
import { client } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  // Apply CONFIG rate limiting (20 requests/minute)
  const rateLimitResult = await applyRateLimit(req, "CONFIG");
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  try {
    const user = await onCurrentUser();
    const { apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { message: "API key is required" },
        { status: 400 }
      );
    }

    const updated = await client.user.update({
      where: { clerkId: user.id },
      data: { openAiKey: apiKey },
    });

    if (updated) {
      return NextResponse.json(
        { message: "OpenAI API key updated successfully" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update API key" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error updating OpenAI API key:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}