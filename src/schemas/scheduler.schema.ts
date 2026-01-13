import { z } from 'zod';

/**
 * ============================================
 * SCHEDULER/POSTS SCHEMAS (Contract-Driven Design)
 * All normalization happens here via .transform()
 * ============================================
 */

// ============================================
// TRANSFORMERS
// ============================================

const nullishToNull = z.string().nullish().transform((val): string | null => val ?? null);
const emptyToNull = z.string().nullish().transform((val): string | null => {
  if (val === undefined || val === null || val.trim() === '') {
    return null;
  }
  return val;
});

// ============================================
// ENUMS
// ============================================

export const PostMediaTypeSchema = z.enum(['IMAGE', 'VIDEO', 'CAROUSEL']);
export const PostTypeSchema = z.enum(['POST', 'REEL', 'STORY']);
export const ScheduleStatusSchema = z.enum(['SCHEDULED', 'POSTED', 'FAILED', 'CANCELLED']);

// ============================================
// CAROUSEL ITEM SCHEMA
// ============================================

export const CarouselItemSchema = z.object({
  imageUrl: z.string().url().optional().transform((val): string | null => val ?? null),
  videoUrl: z.string().url().optional().transform((val): string | null => val ?? null),
});

// ============================================
// SCHEDULED POST SCHEMAS
// ============================================

export const ScheduledPostSchema = z.object({
  id: z.string().uuid(),
  caption: nullishToNull,
  mediaUrl: nullishToNull,
  mediaType: PostMediaTypeSchema,
  postType: PostTypeSchema,
  scheduledFor: z.coerce.date(),
  status: ScheduleStatusSchema,
  hashtags: z.array(z.string()),
  automationId: nullishToNull,
  igMediaId: nullishToNull,
  errorMessage: nullishToNull,
  altText: nullishToNull,
  location: nullishToNull,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const ScheduledPostListSchema = z.array(ScheduledPostSchema);

// ============================================
// REQUEST SCHEMAS
// ============================================

export const CreateScheduledPostRequestSchema = z.object({
  caption: emptyToNull.optional(),
  mediaUrl: z.string().url().optional().transform((val): string | null => val ?? null),
  mediaType: PostMediaTypeSchema.optional().default('IMAGE'),
  postType: PostTypeSchema.optional().default('POST'),
  scheduledFor: z.coerce.date(),
  hashtags: z.array(z.string()).optional().default([]),
  automationId: z.string().uuid().optional().transform((val): string | null => val ?? null),
  carouselItems: z.array(CarouselItemSchema).optional(),
  altText: emptyToNull.optional(),
  location: emptyToNull.optional(),
  locationId: emptyToNull.optional(),
  music: emptyToNull.optional(),
  taggedUsers: z.array(z.string()).optional().default([]),
  collaborators: z.array(z.string()).optional().default([]),
});

export const UpdateScheduledPostRequestSchema = z.object({
  caption: emptyToNull.optional(),
  mediaUrl: z.string().url().optional().transform((val): string | null => val ?? null),
  mediaType: PostMediaTypeSchema.optional(),
  postType: PostTypeSchema.optional(),
  scheduledFor: z.coerce.date().optional(),
  hashtags: z.array(z.string()).optional(),
  status: ScheduleStatusSchema.optional(),
  automationId: z.string().uuid().nullish().transform((val): string | null => val ?? null),
  carouselItems: z.array(CarouselItemSchema).optional(),
  altText: emptyToNull.optional(),
  location: emptyToNull.optional(),
  locationId: emptyToNull.optional(),
  music: emptyToNull.optional(),
  taggedUsers: z.array(z.string()).optional(),
  collaborators: z.array(z.string()).optional(),
});

// Query params for filtering posts
export const ScheduledPostsQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  status: ScheduleStatusSchema.optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

// ============================================
// CONTENT DRAFT SCHEMAS
// ============================================

export const ContentDraftSchema = z.object({
  id: z.string().uuid(),
  title: nullishToNull,
  caption: nullishToNull,
  mediaUrl: nullishToNull,
  mediaType: PostMediaTypeSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const ContentDraftListSchema = z.array(ContentDraftSchema);

export const CreateDraftRequestSchema = z.object({
  title: emptyToNull.optional(),
  caption: emptyToNull.optional(),
  mediaUrl: z.string().url().optional().transform((val): string | null => val ?? null),
  mediaType: PostMediaTypeSchema.optional().default('IMAGE'),
});

export const UpdateDraftRequestSchema = z.object({
  title: emptyToNull.optional(),
  caption: emptyToNull.optional(),
  mediaUrl: z.string().url().optional().transform((val): string | null => val ?? null),
  mediaType: PostMediaTypeSchema.optional(),
});

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const ScheduledPostCreatedSchema = z.object({
  id: z.string().uuid(),
  scheduledFor: z.coerce.date(),
  status: ScheduleStatusSchema,
  createdAt: z.coerce.date(),
});

export const PublishingLimitSchema = z.object({
  quotaUsage: z.number().int().min(0),
  quotaTotal: z.number().int().min(0),
});

export const PaginatedScheduledPostsSchema = z.object({
  data: ScheduledPostListSchema,
  meta: z.object({
    nextCursor: z.string().uuid().nullable(),
    hasMore: z.boolean(),
    total: z.number().int(),
  }),
});

// ============================================
// EXPORTED TYPES
// ============================================

export type PostMediaType = z.infer<typeof PostMediaTypeSchema>;
export type PostType = z.infer<typeof PostTypeSchema>;
export type ScheduleStatus = z.infer<typeof ScheduleStatusSchema>;
export type CarouselItem = z.infer<typeof CarouselItemSchema>;
export type ScheduledPost = z.infer<typeof ScheduledPostSchema>;
export type CreateScheduledPostRequest = z.infer<typeof CreateScheduledPostRequestSchema>;
export type UpdateScheduledPostRequest = z.infer<typeof UpdateScheduledPostRequestSchema>;
export type ScheduledPostsQuery = z.infer<typeof ScheduledPostsQuerySchema>;
export type ContentDraft = z.infer<typeof ContentDraftSchema>;
export type CreateDraftRequest = z.infer<typeof CreateDraftRequestSchema>;
export type UpdateDraftRequest = z.infer<typeof UpdateDraftRequestSchema>;
export type ScheduledPostCreated = z.infer<typeof ScheduledPostCreatedSchema>;
export type PublishingLimit = z.infer<typeof PublishingLimitSchema>;
export type PaginatedScheduledPosts = z.infer<typeof PaginatedScheduledPostsSchema>;
