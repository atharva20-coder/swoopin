"use server";

import { client } from "@/lib/prisma";

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
export const findUser = async (userId: string) => {
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
  props: { customerId?: string; plan?: "PRO" | "FREE" }
) => {
  return await client.user.update({
    where: {
      id: userId,
    },
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
};