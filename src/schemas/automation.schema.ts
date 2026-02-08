import { z } from "zod";

/**
 * ============================================
 * AUTOMATION SCHEMAS (Contract-Driven Design)
 * All normalization happens here via .transform()
 * ============================================
 */

// ============================================
// TRANSFORMERS (Reusable normalizations)
// ============================================

const nullishToNull = z
  .string()
  .nullish()
  .transform((val): string | null => val ?? null);
const emptyToNull = z
  .string()
  .nullish()
  .transform((val): string | null => {
    if (val === undefined || val === null || val.trim() === "") {
      return null;
    }
    return val;
  });

// ============================================
// ENUMS
// ============================================

export const ListenerTypeSchema = z.enum(["SMARTAI", "MESSAGE", "CAROUSEL"]);
export const TriggerTypeSchema = z.enum(["COMMENT", "DM"]);
export const MediaTypeSchema = z.enum(["IMAGE", "VIDEO", "CAROUSEL_ALBUM"]);
export const ButtonTypeSchema = z.enum(["WEB_URL", "POSTBACK"]);

// ============================================
// KEYWORD SCHEMAS
// ============================================

export const KeywordSchema = z.object({
  id: z.string().uuid(),
  word: z.string(),
  automationId: nullishToNull,
});

// ============================================
// TRIGGER SCHEMAS
// ============================================

export const TriggerSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  automationId: nullishToNull,
});

// ============================================
// LISTENER SCHEMAS
// ============================================

export const ListenerSchema = z.object({
  id: z.string().uuid(),
  listener: ListenerTypeSchema,
  prompt: z.string(),
  commentReply: nullishToNull,
  dmCount: z.number().int(),
  commentCount: z.number().int(),
  automationId: nullishToNull,
});

// ============================================
// AUTOMATION LIST RESPONSE SCHEMA
// ============================================

export const AutomationListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  keywords: z.array(KeywordSchema).default([]),
  listener: ListenerSchema.nullish().transform((v) => v ?? null),
  // Flow nodes for platform detection (minimal fields)
  flowNodes: z
    .array(
      z.object({
        subType: z.string(),
      }),
    )
    .default([]),
});

export const AutomationListResponseSchema = z.array(AutomationListItemSchema);

// ============================================
// AUTOMATION DETAIL RESPONSE SCHEMA
// ============================================

export const PostSchema = z.object({
  id: z.string().uuid(),
  postid: z.string(),
  caption: nullishToNull,
  media: z.string(),
  mediaType: MediaTypeSchema,
  automationId: nullishToNull,
});

export const CarouselButtonSchema = z.object({
  id: z.string().uuid(),
  type: ButtonTypeSchema,
  title: z.string(),
  url: emptyToNull,
  payload: emptyToNull,
});

export const CarouselElementSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  subtitle: emptyToNull,
  imageUrl: emptyToNull,
  defaultAction: emptyToNull,
  order: z.number().int(),
  buttons: z.array(CarouselButtonSchema),
});

export const CarouselTemplateSchema = z.object({
  id: z.string().uuid(),
  elements: z.array(CarouselElementSchema),
});

// ============================================
// FLOW NODE & EDGE SCHEMAS
// ============================================

export const FlowNodeSchema = z.object({
  id: z.string().uuid(),
  nodeId: z.string(),
  type: z.string(),
  subType: z.string(),
  label: z.string(),
  description: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  positionX: z.number(),
  positionY: z.number(),
  config: z
    .unknown()
    .nullish()
    .transform((v) => v ?? null),
  automationId: z
    .string()
    .uuid()
    .nullish()
    .transform((v) => v ?? null),
});

export const FlowEdgeSchema = z.object({
  id: z.string().uuid(),
  edgeId: z.string(),
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  sourceHandle: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  targetHandle: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  automationId: z
    .string()
    .uuid()
    .nullish()
    .transform((v) => v ?? null),
});

export const AutomationDetailResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  keywords: z.array(KeywordSchema),
  trigger: z.array(TriggerSchema),
  posts: z.array(PostSchema),
  listener: ListenerSchema.nullable(),
  carouselTemplates: z.array(CarouselTemplateSchema),
  // Flow builder nodes and edges
  flowNodes: z.array(FlowNodeSchema).default([]),
  flowEdges: z.array(FlowEdgeSchema).default([]),
  // User subscription info for feature gating
  hasProPlan: z.boolean(),
  hasIntegration: z.boolean(),
});

// ============================================
// REQUEST SCHEMAS
// ============================================

export const CreateAutomationRequestSchema = z.object({
  id: z.string().uuid().optional(),
});

export const UpdateAutomationRequestSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => data.name !== undefined || data.active !== undefined, {
    message: "At least one field (name or active) must be provided",
  });

export const SaveListenerRequestSchema = z
  .object({
    listener: ListenerTypeSchema,
    prompt: z.string().min(1),
    reply: z
      .string()
      .optional()
      .transform((val): string | null => val ?? null),
    carouselTemplateId: z
      .string()
      .uuid()
      .optional()
      .transform((val): string | null => val ?? null),
  })
  .refine(
    (data) => data.listener !== "CAROUSEL" || data.carouselTemplateId !== null,
    { message: "carouselTemplateId is required for CAROUSEL listener" },
  );

export const SaveTriggerRequestSchema = z.object({
  triggers: z.array(TriggerTypeSchema).min(1).max(2),
});

export const SaveKeywordRequestSchema = z.object({
  keyword: z.string().min(1).max(100),
});

export const EditKeywordRequestSchema = z.object({
  keyword: z.string().min(1).max(100),
  keywordId: z.string().uuid(),
});

export const SavePostsRequestSchema = z.object({
  posts: z
    .array(
      z.object({
        postid: z.string(),
        caption: z
          .string()
          .optional()
          .transform((val): string | null => val ?? null),
        media: z.string().url(),
        mediaType: MediaTypeSchema,
      }),
    )
    .min(1),
});

export const ActivateRequestSchema = z.object({
  active: z.boolean(),
});

// ============================================
// FLOW BUILDER REQUEST SCHEMAS
// ============================================

export const FlowNodeInputSchema = z.object({
  nodeId: z.string(),
  type: z.string(),
  subType: z.string(),
  label: z.string(),
  description: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  positionX: z.number(),
  positionY: z.number(),
  config: z
    .record(z.any())
    .nullish()
    .transform((v) => v ?? null),
});

export const FlowEdgeInputSchema = z.object({
  edgeId: z.string(),
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  sourceHandle: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  targetHandle: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
});

export const ListenerConfigSchema = z.object({
  type: ListenerTypeSchema,
  prompt: z.string(),
  reply: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  carouselTemplateId: z
    .string()
    .uuid()
    .nullish()
    .transform((v) => v ?? null),
});

export const FlowBatchPayloadSchema = z.object({
  nodes: z.array(FlowNodeInputSchema),
  edges: z.array(FlowEdgeInputSchema),
  triggers: z.array(z.string()),
  keywords: z.array(z.string()),
  listener: ListenerConfigSchema.optional(),
});

export const SaveFlowRequestSchema = z.object({
  nodes: z.array(FlowNodeInputSchema),
  edges: z.array(FlowEdgeInputSchema),
});

export const SyncTriggersRequestSchema = z.object({
  triggers: z.array(z.string()).min(1),
});

export const CreateCarouselRequestSchema = z.object({
  elements: z
    .array(
      z.object({
        title: z.string().min(1).max(80),
        subtitle: z
          .string()
          .nullish()
          .transform((v) => v ?? null),
        imageUrl: z
          .string()
          .url()
          .nullish()
          .transform((v) => v ?? null),
        defaultAction: z
          .string()
          .nullish()
          .transform((v) => v ?? null),
        buttons: z
          .array(
            z.object({
              type: ButtonTypeSchema,
              title: z.string().min(1).max(20),
              url: z
                .string()
                .url()
                .nullish()
                .transform((v) => v ?? null),
              payload: z
                .string()
                .nullish()
                .transform((v) => v ?? null),
            }),
          )
          .max(3),
      }),
    )
    .min(1)
    .max(10),
});

// ============================================
// PAGINATION SCHEMAS (Cursor-based)
// ============================================

export const AutomationsPaginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const PaginatedAutomationsResponseSchema = z.object({
  data: AutomationListResponseSchema,
  meta: z.object({
    nextCursor: z.string().uuid().nullable(),
    hasMore: z.boolean(),
    total: z.number().int(),
  }),
});

// ============================================
// SIMPLE RESPONSE SCHEMAS
// ============================================

export const AutomationCreatedResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.coerce.date(),
});

export const AutomationUpdatedResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
});

// ============================================
// EXPORTED TYPES
// ============================================

export type ListenerType = z.infer<typeof ListenerTypeSchema>;
export type TriggerType = z.infer<typeof TriggerTypeSchema>;
export type MediaType = z.infer<typeof MediaTypeSchema>;
export type ButtonType = z.infer<typeof ButtonTypeSchema>;
export type Keyword = z.infer<typeof KeywordSchema>;
export type Trigger = z.infer<typeof TriggerSchema>;
export type Listener = z.infer<typeof ListenerSchema>;
export type AutomationListItem = z.infer<typeof AutomationListItemSchema>;
export type AutomationDetail = z.infer<typeof AutomationDetailResponseSchema>;
export type CreateAutomationRequest = z.infer<
  typeof CreateAutomationRequestSchema
>;
export type UpdateAutomationRequest = z.infer<
  typeof UpdateAutomationRequestSchema
>;
export type SaveListenerRequest = z.infer<typeof SaveListenerRequestSchema>;
export type SaveTriggerRequest = z.infer<typeof SaveTriggerRequestSchema>;
export type SaveKeywordRequest = z.infer<typeof SaveKeywordRequestSchema>;
export type EditKeywordRequest = z.infer<typeof EditKeywordRequestSchema>;
export type SavePostsRequest = z.infer<typeof SavePostsRequestSchema>;
export type ActivateRequest = z.infer<typeof ActivateRequestSchema>;
export type AutomationsPagination = z.infer<typeof AutomationsPaginationSchema>;
export type PaginatedAutomationsResponse = z.infer<
  typeof PaginatedAutomationsResponseSchema
>;
export type AutomationCreatedResponse = z.infer<
  typeof AutomationCreatedResponseSchema
>;
export type AutomationUpdatedResponse = z.infer<
  typeof AutomationUpdatedResponseSchema
>;

// Flow Builder Types
export type FlowNodeInput = z.infer<typeof FlowNodeInputSchema>;
export type FlowEdgeInput = z.infer<typeof FlowEdgeInputSchema>;
export type ListenerConfig = z.infer<typeof ListenerConfigSchema>;
export type FlowBatchPayload = z.infer<typeof FlowBatchPayloadSchema>;
export type SaveFlowRequest = z.infer<typeof SaveFlowRequestSchema>;
export type SyncTriggersRequest = z.infer<typeof SyncTriggersRequestSchema>;
export type CreateCarouselRequest = z.infer<typeof CreateCarouselRequestSchema>;
