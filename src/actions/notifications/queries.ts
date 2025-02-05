import { client } from "@/lib/prisma";

export const getNotifications = async (clerkId: string) => {
  return await client.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      notification: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
};
export const deleteNotifications = async (notificationId: string) => {
  return await client.notification.delete({
    where: {
      id: notificationId,
    },
  });
};
export const markAsReadNotifications = async (notificationId: string) => {
  return await client.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isSeen: true,
    },
  });
};