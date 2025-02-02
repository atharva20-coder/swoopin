'use server'

import { client } from '@/lib/prisma'

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
  })
}

export const getIntegration = async (email: string) => {
  return await client.user.findUnique({
    where: {
      email,
    },
    select: {
      integrations: {
        where: {
          name: 'INSTAGRAM',
        },
      },
    },
  })
}

export const createIntegration = async (
  email: string,
  token: string,
  expire: Date,
  igId?: string
) => {
  return await client.user.update({
    where: {
      email,
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
      firstname: true,
      lastname: true,
    },
  })
}
