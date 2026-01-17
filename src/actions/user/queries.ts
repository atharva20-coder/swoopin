"use server";

import { client } from "@/lib/prisma";
import { getOrSetCache, invalidateUserCache } from "@/lib/cache";

// Find user by email (primary lookup for Better-Auth)
export const findUserByEmail = async (email: string) => {
  return await client.user.findUnique({
    where: {
      email,
    },
    include: {
      notification: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          isSeen: true,
        },
        where: {
          isSeen: false,
        },
      },
      subscription: true,
      integrations: {
        select: {
          id: true,
          token: true,
          expiresAt: true,
          name: true,
          instagramId: true,
        },
      },
    },
  });
};

// Legacy findUser - now uses id (UUID) instead of clerkId
// Cached for 5 minutes
export const findUser = async (userId: string) => {
  return await getOrSetCache(
    `user:${userId}:profile`,
    async () => {
      return await client.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          notification: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              id: true,
              isSeen: true,
            },
            where: {
              isSeen: false,
            },
          },
          subscription: true,
          integrations: {
            select: {
              id: true,
              token: true,
              expiresAt: true,
              name: true,
              instagramId: true,
            },
          },
        },
      });
    },
    300 // 5 minutes TTL
  );
};

export const createUser = async (
  id: string,
  firstname: string,
  lastname: string,
  email: string
) => {
  // Check if user already exists by email
  const existing = await client.user.findUnique({
    where: { email },
    select: { name: true },
  });

  if (existing) {
    return {
      name: existing.name,
    };
  }

  return await client.user.create({
    data: {
      id,
      name: `${firstname} ${lastname}`.trim(),
      email,
      subscription: {
        create: {},
      },
    },
    select: {
      name: true,
    },
  });
};

export const updateSubscription = async (
  userId: string,
  props: { cashfreeCustomerId?: string; plan?: "PRO" | "FREE" }
) => {
  // First check if subscription exists
  const existingSubscription = await client.subscription.findUnique({
    where: { userId },
  });

  if (existingSubscription) {
    // Update existing subscription
    return await client.user.update({
      where: { id: userId },
      data: {
        subscription: {
          update: {
            data: {
              ...props,
            },
          },
        },
      },
    });
  } else {
    // Create new subscription for the user
    return await client.user.update({
      where: { id: userId },
      data: {
        subscription: {
          create: {
            ...props,
            plan: props.plan || "PRO",
          },
        },
      },
    });
  }
};
