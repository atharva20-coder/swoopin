import { z } from 'zod';

/**
 * ============================================
 * NOTIFICATION SCHEMAS (Contract-Driven Design)
 * ============================================
 */

// ============================================
// TRANSFORMERS
// ============================================

const nullishToNull = z.string().nullish().transform((val): string | null => val ?? null);

// ============================================
// NOTIFICATION SCHEMA
// ============================================

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  isSeen: z.boolean(),
  userId: z.string().uuid(),
  createdAt: z.coerce.date(),
});

export const NotificationListSchema = z.array(NotificationSchema);

// ============================================
// REQUEST SCHEMAS
// ============================================

export const NotificationQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(50).default(8),
});

export const CreateNotificationRequestSchema = z.object({
  content: z.string().min(1).max(500),
  userId: z.string().uuid(),
});

export const MarkReadRequestSchema = z.object({
  isSeen: z.boolean().default(true),
});

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const PaginatedNotificationsSchema = z.object({
  data: NotificationListSchema,
  meta: z.object({
    nextCursor: z.string().uuid().nullable(),
    hasMore: z.boolean(),
  }),
});

// ============================================
// EXPORTED TYPES
// ============================================

export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationQuery = z.infer<typeof NotificationQuerySchema>;
export type CreateNotificationRequest = z.infer<typeof CreateNotificationRequestSchema>;
export type MarkReadRequest = z.infer<typeof MarkReadRequestSchema>;
export type PaginatedNotifications = z.infer<typeof PaginatedNotificationsSchema>;
