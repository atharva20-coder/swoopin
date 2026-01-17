import { client } from "@/lib/prisma";
import {
  UserProfileResponseSchema,
  UpdateUserResponseSchema,
  UserUpdatePrismaInputSchema,
  type UserProfileResponse,
  type UpdateUserRequest,
  type UpdateUserResponse,
} from "@/schemas/user.schema";

/**
 * ============================================
 * USER SERVICE
 * Business logic - accepts only validated data
 * All normalization happens in schemas layer
 * ============================================
 */

class UserService {
  /**
   * Get user profile by email
   * @param email - Validated email string
   * @returns Validated UserProfileResponse or null
   */
  async getProfileByEmail(email: string): Promise<UserProfileResponse | null> {
    const profile = await client.user.findUnique({
      where: { email },
      include: {
        subscription: {
          select: {
            plan: true,
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
      return null;
    }

    // Check admin status
    const isAdmin = this.checkIsAdmin(email);

    // Build raw response data
    const rawData = {
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

    // Parse through schema - normalization happens here
    const result = UserProfileResponseSchema.safeParse(rawData);
    if (!result.success) {
      console.error("User profile validation failed:", result.error.format());
      return null;
    }

    return result.data;
  }

  /**
   * Update user profile
   * @param email - Validated email identifying the user
   * @param input - Already validated UpdateUserRequest
   * @returns Validated UpdateUserResponse or null
   */
  async updateProfile(
    email: string,
    input: UpdateUserRequest,
  ): Promise<UpdateUserResponse | null> {
    // Parse input through Prisma schema - handles normalization
    const prismaInputResult = UserUpdatePrismaInputSchema.safeParse(input);
    if (!prismaInputResult.success) {
      console.error(
        "Prisma input validation failed:",
        prismaInputResult.error.format(),
      );
      return null;
    }

    const prismaInput = prismaInputResult.data;

    // Only update if there's data to update
    if (Object.keys(prismaInput).length === 0) {
      // Return current user without changes
      const current = await client.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          updatedAt: true,
        },
      });

      if (!current) {
        return null;
      }

      const result = UpdateUserResponseSchema.safeParse(current);
      return result.success ? result.data : null;
    }

    const updated = await client.user.update({
      where: { email },
      data: prismaInput,
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true,
      },
    });

    // Parse through response schema
    const result = UpdateUserResponseSchema.safeParse(updated);
    if (!result.success) {
      console.error(
        "Update user response validation failed:",
        result.error.format(),
      );
      return null;
    }

    return result.data;
  }

  /**
   * Check if email is admin
   */
  checkIsAdmin(email: string): boolean {
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    return adminEmails.includes(email.toLowerCase());
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await client.user.count({
      where: { email },
    });
    return count > 0;
  }

  /**
   * Get user by ID
   */
  async getById(userId: string) {
    return client.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        integrations: true,
      },
    });
  }
}

// Export singleton instance
export const userService = new UserService();
