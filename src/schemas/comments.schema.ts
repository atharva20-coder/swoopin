import { z } from "zod";

/**
 * ============================================
 * COMMENTS SCHEMAS (Contract-Driven Design)
 * ============================================
 */

// ============================================
// COMMENT SCHEMA
// ============================================

export const CommentSchema = z.object({
  id: z.string(),
  text: z.string(),
  username: z.string(),
  timestamp: z.string(),
  hidden: z.boolean().optional(),
  replies: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        username: z.string(),
        timestamp: z.string(),
      })
    )
    .optional(),
});

export const MediaWithCommentsSchema = z.object({
  id: z.string(),
  caption: z.string().nullable(),
  media_type: z.string(),
  media_url: z.string().nullable(),
  thumbnail_url: z.string().nullable(),
  timestamp: z.string(),
  comments_count: z.number().int(),
  comments: z.array(CommentSchema),
});

// ============================================
// REQUEST SCHEMAS
// ============================================

export const ReplyToCommentRequestSchema = z.object({
  commentId: z.string().min(1, "Comment ID is required"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(2200, "Message too long"),
});

export const HideCommentRequestSchema = z.object({
  commentId: z.string().min(1, "Comment ID is required"),
  hide: z.boolean().default(true),
});

export const DeleteCommentRequestSchema = z.object({
  commentId: z.string().min(1, "Comment ID is required"),
});

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const CommentsDataSchema = z.object({
  media: z.array(MediaWithCommentsSchema),
  totalComments: z.number().int(),
});

export const ReplySuccessSchema = z.object({
  replyId: z.string(),
});

// ============================================
// EXPORTED TYPES
// ============================================

export type Comment = z.infer<typeof CommentSchema>;
export type MediaWithComments = z.infer<typeof MediaWithCommentsSchema>;
export type CommentsData = z.infer<typeof CommentsDataSchema>;
export type ReplyToCommentRequest = z.infer<typeof ReplyToCommentRequestSchema>;
export type HideCommentRequest = z.infer<typeof HideCommentRequestSchema>;
export type DeleteCommentRequest = z.infer<typeof DeleteCommentRequestSchema>;
