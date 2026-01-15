import { z } from "zod";

/**
 * ============================================
 * EVENTS SCHEMAS (Contract-Driven Design)
 * All normalization happens here via .transform()
 * ============================================
 */

// ============================================
// TRANSFORMERS
// ============================================

const nullishToNull = z
  .string()
  .nullish()
  .transform((val): string | null => val ?? null);

// ============================================
// ENUMS
// ============================================

export const EventStatusSchema = z.enum([
  "SCHEDULED",
  "LIVE",
  "COMPLETED",
  "CANCELLED",
]);

// ============================================
// EVENT SCHEMA
// ============================================

export const EventSchema = z.object({
  id: z.string().uuid(),
  eventId: nullishToNull,
  title: z.string(),
  description: nullishToNull,
  startTime: z.coerce.date(),
  endTime: z.coerce.date().nullable(),
  status: EventStatusSchema,
  coverImage: nullishToNull,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const EventListSchema = z.array(EventSchema);

// ============================================
// REQUEST SCHEMAS
// ============================================

export const CreateEventRequestSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z
    .string()
    .max(2000)
    .optional()
    .transform((val): string | null => val ?? null),
  startTime: z.coerce.date(),
  endTime: z.coerce
    .date()
    .optional()
    .transform((val): Date | null => val ?? null),
  coverImage: z
    .string()
    .url()
    .optional()
    .transform((val): string | null => val ?? null),
  syncToInstagram: z.boolean().default(false),
});

export const UpdateEventRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z
    .string()
    .max(2000)
    .optional()
    .transform((val): string | null | undefined =>
      val === undefined ? undefined : val ?? null
    ),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce
    .date()
    .optional()
    .transform((val): Date | null | undefined =>
      val === undefined ? undefined : val ?? null
    ),
  coverImage: z
    .string()
    .url()
    .optional()
    .transform((val): string | null | undefined =>
      val === undefined ? undefined : val ?? null
    ),
  status: EventStatusSchema.optional(),
});

// ============================================
// EXPORTED TYPES
// ============================================

export type EventStatus = z.infer<typeof EventStatusSchema>;
export type Event = z.infer<typeof EventSchema>;
export type CreateEventRequest = z.infer<typeof CreateEventRequestSchema>;
export type UpdateEventRequest = z.infer<typeof UpdateEventRequestSchema>;
