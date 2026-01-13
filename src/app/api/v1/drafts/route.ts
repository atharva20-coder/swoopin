import { NextRequest, NextResponse } from 'next/server';
import {
  success,
  unauthorized,
  internalError,
  getAuthUser,
  validateBody,
  rateLimitByUser,
} from '@/app/api/v1/_lib';
import { schedulerService } from '@/services/scheduler.service';
import { CreateDraftRequestSchema } from '@/schemas/scheduler.schema';
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
 * GET /api/v1/drafts
 * List content drafts
 * ============================================
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Get user ID
    const userId = await getDbUserId(authUser.email);
    if (!userId) {
      return unauthorized('User not found');
    }

    // 3. Rate limiting
    const rateLimitResponse = await rateLimitByUser(userId, 'standard');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 4. Fetch drafts
    const drafts = await schedulerService.getDrafts(userId);

    return success(drafts);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('GET /api/v1/drafts error:', error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * POST /api/v1/drafts
 * Create content draft
 * ============================================
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Get user ID
    const userId = await getDbUserId(authUser.email);
    if (!userId) {
      return unauthorized('User not found');
    }

    // 3. Rate limiting
    const rateLimitResponse = await rateLimitByUser(userId, 'standard');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 4. Validate request body
    const validation = await validateBody(request, CreateDraftRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 5. Create draft
    const result = await schedulerService.createDraft(userId, validation.data);

    if (!result) {
      return internalError('Failed to create draft');
    }

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('POST /api/v1/drafts error:', error.message);
    }
    return internalError();
  }
}
