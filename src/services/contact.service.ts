import { client as db } from "@/lib/prisma";
import { ContactInput } from "@/schemas/contact.schema";

/**
 * Upsert a contact based on Instagram Interaction.
 * This should be called whenever a user interacts (message/comment).
 */
export async function upsertContact(
  instagramId: string,
  pageId: string,
  data: Partial<ContactInput>,
) {
  // If verifying follower status, we only want to set it to TRUE if explicitly confirmed.
  // We generally don't want to set it to false unless we are sure, but here we just update what we have.
  // Ideally, if data.isFollower is undefined, we don't touch it.

  const updateData: any = {
    lastInteraction: new Date(),
    ...data,
  };

  // Remove undefined keys to avoid overriding with null/undefined if not intended
  Object.keys(updateData).forEach(
    (key) => updateData[key] === undefined && delete updateData[key],
  );

  return await db.contact.upsert({
    where: {
      instagramId_pageId: {
        instagramId,
        pageId,
      },
    },
    update: updateData,
    create: {
      instagramId,
      pageId,
      name: data.name ?? null,
      username: data.username ?? null,
      isFollower: data.isFollower ?? false,
      lastInteraction: new Date(),
    },
  });
}

/**
 * Get a contact by Instagram ID and Page ID.
 */
export async function getContact(instagramId: string, pageId: string) {
  return await db.contact.findUnique({
    where: {
      instagramId_pageId: {
        instagramId,
        pageId,
      },
    },
  });
}

/**
 * Explicitly update follower status.
 */
export async function updateFollowerStatus(
  instagramId: string,
  pageId: string,
  isFollower: boolean,
) {
  return await db.contact.update({
    where: {
      instagramId_pageId: {
        instagramId,
        pageId,
      },
    },
    data: {
      isFollower,
    },
  });
}
