import { NextRequest, NextResponse } from 'next/server';
import {
  success,
  unauthorized,
  forbidden,
  internalError,
  getAuthUser,
  validateBody,
  rateLimitByUser,
} from '@/app/api/v1/_lib';
import { automationService } from '@/services/automation.service';
import { SavePostsRequestSchema } from '@/schemas/automation.schema';
import { client } from '@/lib/prisma';

/**
 * Helper to get db user ID
 */
async function getDbUserId(email: string): Promise<string | null> {
  const user = await client.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * ============================================
 * POST /api/v1/automations/{id}/posts
 * Attach posts to automation
 * ============================================
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Await params (Next.js 15)
    const { id } = await params;

    // 3. Get user ID
    const userId = await getDbUserId(authUser.email);
    if (!userId) {
      return unauthorized('User not found');
    }

    // 4. Rate limiting
    const rateLimitResponse = await rateLimitByUser(userId, 'standard');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 5. Validate request body
    const validation = await validateBody(request, SavePostsRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 6. Save posts (IDOR check inside service)
    const saved = await automationService.savePosts(id, userId, validation.data);

    if (!saved) {
      return forbidden('Not authorized to modify this automation');
    }

    return NextResponse.json(
      { success: true, data: { message: 'Posts attached' } },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('POST /api/v1/automations/[id]/posts error:', error.message);
    }
    return internalError();
  }
}
