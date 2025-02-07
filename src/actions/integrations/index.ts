"use server";

import { onCurrentUser } from "../user";
import { generateTokens } from "@/lib/fetch";
import { client } from "@/lib/prisma";

export const onIntegrate = async (code: string) => {
  const user = await onCurrentUser();
  try {
    // Check for existing integration
    const existingIntegration = await client.integrations.findFirst({
      where: { 
        userId: user.id,
        name: "INSTAGRAM" 
      }
    });

    if (existingIntegration) {
      return { status: 403, message: 'Integration already exists' };
    }

    // Generate tokens
    const { access_token, instagram_id } = await generateTokens(code);
    
    if (!access_token) {
      return { status: 500, message: 'Token generation failed' };
    }

    // Create new integration
    const integration = await client.integrations.create({
      data: {
        userId: user.id,
        token: access_token,
        instagramId: instagram_id,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
      },
      select: {
        User: {
          select: {
            firstname: true,
            lastname: true
          }
        }
      }
    });

    return { 
      status: 200, 
      data: integration.User 
    };
  } catch (error) {
    console.error('Instagram Integration Error', error);
    return { status: 500, message: 'Internal server error' };
  }
};