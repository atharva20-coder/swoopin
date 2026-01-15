import { NextRequest, NextResponse } from 'next/server';
import {
  success,
  unauthorized,
  internalError,
  getAuthUser,
  rateLimitByUser,
} from '@/app/api/v1/_lib';
import { integrationService } from '@/services/integration.service';
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
 * GET /api/v1/integrations
 * List all integrations for current user
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

    // 4. Fetch integrations
    const integrations = await integrationService.getByUser(userId);

    return success(integrations);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('GET /api/v1/integrations error:', error.message);
    }
    return internalError();
  }
}
