import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  success,
  unauthorized,
  notFound,
  internalError,
  getAuthUser,
  validateBody,
  validateResponse,
  rateLimitByUser,
} from '../../_lib';
import { client } from '@/lib/prisma';

/**
 * ============================================
 * CONTRACT: Request/Response Schemas
 * ============================================
 */

// Response schema for GET /api/v1/users/me
const UserProfileResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  createdAt: z.date().or(z.string()),
  subscription: z.object({
    plan: z.string(),
    customerId: z.string().nullable(),
    createdAt: z.date().or(z.string()),
    updatedAt: z.date().or(z.string()),
  }).nullable(),
  integrations: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    instagramId: z.string().nullable(),
    expiresAt: z.date().or(z.string()).nullable(),
    createdAt: z.date().or(z.string()),
  })),
  stats: z.object({
    automationsCount: z.number(),
    unreadNotifications: z.number(),
  }),
  isAdmin: z.boolean(),
});

// Request schema for PUT /api/v1/users/me
const UpdateUserRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

// Response schema for PUT /api/v1/users/me
const UpdateUserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  updatedAt: z.date().or(z.string()),
});

// Export types
export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;

/**
 * ============================================
 * GET /api/v1/users/me
 * Get current authenticated user profile
 * ============================================
 */
export async function GET() {
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

    // 3. Fetch user profile (IDOR: only fetch own data)
    const profile = await client.user.findUnique({
      where: { email: authUser.email },
      include: {
        subscription: {
          select: {
            plan: true,
            customerId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        integrations: {
          select: {
            id: true,
            name: true,
            instagramId: true,
            expiresAt: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            automations: true,
            notification: true,
          },
        },
      },
    });

    if (!profile) {
      return notFound('User');
    }

    // 4. Check admin status
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase());
    const isAdmin = adminEmails.includes(authUser.email.toLowerCase());

    // 5. Build response (validated to prevent data leakage)
    const responseData = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      createdAt: profile.createdAt,
      subscription: profile.subscription,
      integrations: profile.integrations,
      stats: {
        automationsCount: profile._count.automations,
        unreadNotifications: profile._count.notification,
      },
      isAdmin,
    };

    // 6. Validate response schema (prevents accidental data leakage)
    const validatedResponse = validateResponse(responseData, UserProfileResponseSchema);

    return success(validatedResponse);
  } catch (error) {
    console.error('GET /api/v1/users/me error:', error);
    return internalError();
  }
}

/**
 * ============================================
 * PUT /api/v1/users/me
 * Update current user profile
 * ============================================
 */
export async function PUT(request: NextRequest) {
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

    // 3. Validate request body
    const validation = await validateBody(request, UpdateUserRequestSchema);
    if (!validation.success) {
      return validation.response;
    }
    const data = validation.data;

    // 4. Update user (IDOR: only update own data via email match)
    const updated = await client.user.update({
      where: { email: authUser.email },
      data: {
        ...(data.name && { name: data.name }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true,
      },
    });

    // 5. Validate response
    const validatedResponse = validateResponse(updated, UpdateUserResponseSchema);

    return success(validatedResponse);
  } catch (error) {
    console.error('PUT /api/v1/users/me error:', error);
    return internalError();
  }
}
