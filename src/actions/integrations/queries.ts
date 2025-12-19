"use server";

import { client } from "@/lib/prisma";

export const updateIntegration = async (
  token: string,
  expire: Date,
  id: string
) => {
  return await client.integrations.update({
    where: { id },
    data: {
      token,
      expiresAt: expire,
    },
  });
};

export const getIntegration = async (userId: string) => {
  return await client.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      integrations: {
        where: {
          name: "INSTAGRAM",
        },
      },
    },
  });
};

export const createIntegration = async (
  userId: string,
  token: string,
  expire: Date,
  igId?: string
) => {
  return await client.user.update({
    where: {
      id: userId,
    },
    data: {
      integrations: {
        create: {
          token,
          expiresAt: expire,
          instagramId: igId,
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
  });
};

export const deleteIntegration = async (
  integrationId: string,
  userId: string
) => {
  return await client.integrations.delete({
    where: {
      id: integrationId,
      userId,
    },

    select: {
      userId: true,
      name: true,
    },
  });
};