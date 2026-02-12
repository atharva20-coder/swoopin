"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { notificationService } from "@/services/notification.service";
import {
  createUser,
  findUser,
  findUserByEmail,
  updateSubscription,
} from "./queries";
import { refreshToken } from "@/lib/fetch";
import { client } from "@/lib/prisma";

// Inline helper for creating notification (uses service)
const createNotification = (content: string, userId: string) =>
  notificationService.create(content, userId);

// Inline helper for updating integration
const updateIntegration = async (
  token: string,
  expiresAt: Date,
  id: string,
) => {
  return client.integrations.update({
    where: { id },
    data: {
      token,
      expiresAt,
    },
  });
};

// Get current authenticated user from Better-Auth session
export const onCurrentUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect("/sign-in");
  }

  return session.user;
};

// Get database user from Better-Auth session (returns user with database UUID)
export const getDbUser = async () => {
  const authUser = await onCurrentUser();
  const dbUser = await findUserByEmail(authUser.email);

  if (!dbUser) {
    return redirect("/sign-in");
  }

  return dbUser;
};

// Get session without redirect (for optional auth checks)
export const getSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
};

export const onBoardUser = async () => {
  const user = await onCurrentUser();
  try {
    // Parse admin emails from env
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0);

    // Find user by email instead of clerkId
    const found = await findUserByEmail(user.email);
    if (found) {
      if (found.integrations.length > 0) {
        try {
          const today = new Date();
          const time_left =
            found.integrations[0].expiresAt?.getTime()! - today.getTime();

          const days = Math.round(time_left / (1000 * 3600 * 24));
          if (days < 5) {
            const refresh = await refreshToken(found.integrations[0].token);

            const today = new Date();
            const expire_date = today.setDate(today.getDate() + 60);

            const update_token = await updateIntegration(
              refresh.access_token,
              new Date(expire_date),
              found.integrations[0].id,
            );
            if (!update_token) {
            } else if (update_token.userId) {
              createNotification(
                "You have been reintegrated!",
                update_token.userId,
              );
            }
          }
        } catch (tokenError) {
          // Token refresh failed — log but don't block dashboard access
          console.error("[onBoardUser] Token refresh failed:", tokenError);
        }
      }
      // Check if user is admin
      const isAdmin = adminEmails.includes(user.email.toLowerCase());

      return {
        status: 200,
        data: {
          name: found.name,
          isAdmin,
        },
      };
    }

    // Create new user if not found
    const nameParts = user.name?.split(" ") || [];
    const created = await createUser(
      user.id,
      nameParts[0] || "",
      nameParts.slice(1).join(" ") || "",
      user.email,
    );

    // Check if new user is admin
    const isAdmin = adminEmails.includes(user.email.toLowerCase());
    return { status: 201, data: { ...created, isAdmin } };
  } catch (error) {
    console.error("[onBoardUser] Error:", error);
    return { status: 500 };
  }
};

export const onUserInfo = async () => {
  const user = await onCurrentUser();
  try {
    const profile = await findUserByEmail(user.email);
    if (profile) {
      // Parse admin emails from env
      const adminEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0);

      const isAdmin = adminEmails.includes(user.email.toLowerCase());

      return {
        status: 200,
        data: { ...profile, isAdmin },
      };
    }

    return { status: 404 };
  } catch (error) {
    return { status: 500 };
  }
};

// Note: Subscription handling is now done via Cashfree payment gateway
// See /api/cashfree/* endpoints for payment processing

export const getInstagramProfile = async () => {
  const user = await onCurrentUser();
  try {
    const profile = await findUserByEmail(user.email);
    if (!profile || profile.integrations.length === 0) {
      return { status: 404, error: "No Instagram integration found" };
    }

    const token = profile.integrations[0].token;
    const { getInstagramUserProfile } = await import("@/lib/fetch");
    const result = await getInstagramUserProfile(token);

    if (result.success && result.data) {
      return {
        status: 200,
        data: {
          ...result.data,
          instagramId: profile.integrations[0].instagramId,
        },
      };
    }

    return { status: 400, error: result.error };
  } catch (error) {
    console.error("Error fetching Instagram profile:", error);
    return { status: 500, error: "Server error" };
  }
};
