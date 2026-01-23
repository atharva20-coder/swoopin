import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/prisma";
import {
  success,
  unauthorized,
  internalError,
  getAuthUser,
} from "@/app/api/v1/_lib";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/v1/automations/:id/posts/:postid
 * Detach a post from an automation
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; postid: string }> },
): Promise<NextResponse> {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    const { id: automationId, postid } = await params;

    // Verify automation belongs to user
    const automation = await client.automation.findFirst({
      where: {
        id: automationId,
        User: { email: authUser.email },
      },
      select: { id: true },
    });

    if (!automation) {
      return unauthorized("Automation not found or not authorized");
    }

    // Delete the post
    await client.post.deleteMany({
      where: {
        automationId,
        postid,
      },
    });

    return success({ message: "Post detached successfully" });
  } catch (error) {
    console.error(
      "DELETE /api/v1/automations/[id]/posts/[postid] error:",
      error,
    );
    return internalError();
  }
}
