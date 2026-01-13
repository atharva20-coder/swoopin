import { NextRequest, NextResponse } from 'next/server';
import {
  success,
  unauthorized,
  notFound,
  internalError,
  getAuthUser,
  validateBody,
  rateLimitByUser,
} from '../../_lib';
import { userService } from '@/services/user.service';
import { 
  UpdateUserRequestSchema,
  type UserProfileResponse,
  type UpdateUserResponse,
} from '@/schemas/user.schema';

/**
 * ============================================
 * GET /api/v1/users/me
 * Get current authenticated user profile
 * ============================================
 */
export async function GET(): Promise<NextResponse> {
  try {
    // 1. Authentication check
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Rate limiting
    const rateLimitResponse = await rateLimitByUser(authUser.id, 'standard');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 3. Fetch user profile via service (IDOR: only fetch own data)
    const profile: UserProfileResponse | null = await userService.getProfileByEmail(authUser.email);

    if (!profile) {
      return notFound('User');
    }

    return success(profile);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('GET /api/v1/users/me error:', error.message);
    }
    return internalError();
  }
}

/**
 * ============================================
 * PUT /api/v1/users/me
 * Update current user profile
 * ============================================
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication check
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Rate limiting
    const rateLimitResponse = await rateLimitByUser(authUser.id, 'standard');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 3. Validate request body (normalization happens in schema)
    const validation = await validateBody(request, UpdateUserRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // 4. Update user via service (IDOR: only update own data via email match)
    const updated: UpdateUserResponse | null = await userService.updateProfile(
      authUser.email,
      validation.data
    );

    if (!updated) {
      return internalError('Failed to update profile');
    }

    return success(updated);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('PUT /api/v1/users/me error:', error.message);
    }
    return internalError();
  }
}
