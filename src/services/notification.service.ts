import { client } from '@/lib/prisma';
import {
  NotificationListSchema,
  NotificationSchema,
  type Notification,
  type NotificationQuery,
  type PaginatedNotifications,
} from '@/schemas/notification.schema';

/**
 * ============================================
 * NOTIFICATION SERVICE
 * Business logic with IDOR protection
 * ============================================
 */

class NotificationService {
  /**
   * Get paginated notifications for a user
   */
  async listByUser(
    userId: string,
    query: NotificationQuery
  ): Promise<PaginatedNotifications> {
    const { cursor, limit } = query;

    const notifications = await client.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    const hasMore = notifications.length > limit;
    const data = hasMore ? notifications.slice(0, limit) : notifications;
    const nextCursor = hasMore ? data[data.length - 1]?.id ?? null : null;

    const validated = NotificationListSchema.safeParse(data);
    if (!validated.success) {
      console.error('Notification list validation failed:', validated.error.format());
      return { data: [], meta: { nextCursor: null, hasMore: false } };
    }

    return {
      data: validated.data,
      meta: { nextCursor, hasMore },
    };
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return client.notification.count({
      where: {
        userId,
        isSeen: false,
      },
    });
  }

  /**
   * Mark notification as read with ownership check
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification | null> {
    // IDOR check
    const existing = await client.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return null;
    }

    const updated = await client.notification.update({
      where: { id: notificationId },
      data: { isSeen: true },
    });

    const validated = NotificationSchema.safeParse(updated);
    return validated.success ? validated.data : null;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await client.notification.updateMany({
      where: {
        userId,
        isSeen: false,
      },
      data: { isSeen: true },
    });

    return result.count;
  }

  /**
   * Delete notification with ownership check
   */
  async delete(notificationId: string, userId: string): Promise<boolean> {
    // IDOR check
    const existing = await client.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return false;
    }

    await client.notification.delete({ where: { id: notificationId } });
    return true;
  }

  /**
   * Create notification (internal use - no auth check)
   * Used by background jobs and system events
   */
  async create(content: string, userId: string): Promise<Notification | null> {
    const notification = await client.notification.create({
      data: {
        content,
        userId,
      },
    });

    const validated = NotificationSchema.safeParse(notification);
    return validated.success ? validated.data : null;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
