import { onCurrentUser } from "@/actions/user";
import { client } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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