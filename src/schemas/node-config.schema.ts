/**
 * ============================================
 * NODE CONFIG SCHEMAS
 * Strict per-node-type configuration schemas
 * following Zero-Patchwork Protocol.
 *
 * Each node type has its own schema with required
 * fields properly validated at the gateway.
 * ============================================
 */

import { z } from "zod";

// =============================================================================
// TRIGGER NODE CONFIGS
// =============================================================================

/**
 * DM trigger - no additional config needed
 */
export const DMTriggerConfigSchema = z.object({}).optional();

/**
 * Comment trigger - no additional config needed
 */
export const CommentTriggerConfigSchema = z.object({}).optional();

/**
 * Story Reply trigger - no additional config needed
 */
export const StoryReplyTriggerConfigSchema = z.object({}).optional();

/**
 * Mention trigger - no additional config needed
 */
export const MentionTriggerConfigSchema = z.object({}).optional();

/**
 * Keywords trigger - requires keywords array
 */
export const KeywordsTriggerConfigSchema = z.object({
  keywords: z
    .array(z.string().min(1, "Keyword cannot be empty"))
    .min(1, "At least one keyword is required"),
});

/**
 * Select Posts trigger - requires attached posts
 */
export const SelectPostsTriggerConfigSchema = z.object({
  postIds: z.array(z.string()).optional(),
});

/**
 * Postback trigger - requires payload pattern
 */
export const PostbackTriggerConfigSchema = z.object({
  payload: z.string().optional(),
});

// =============================================================================
// ACTION NODE CONFIGS
// =============================================================================

/**
 * Send DM action - requires message text
 */
export const MessageActionConfigSchema = z.object({
  message: z.string().min(1, "Message text is required"),
});

/**
 * Reply Comment action - requires reply text
 */
export const ReplyCommentActionConfigSchema = z.object({
  commentReply: z.string().min(1, "Reply text is required"),
});

/**
 * Reply Mention action - requires reply text
 */
export const ReplyMentionActionConfigSchema = z.object({
  replyText: z.string().min(1, "Reply text is required"),
});

/**
 * Smart AI action - requires prompt
 */
export const SmartAIActionConfigSchema = z
  .object({
    // Allow either 'message' or 'prompt' for flexibility
    message: z.string().optional(),
    prompt: z
      .string()
      .max(750, "Context must be 750 characters or less")
      .optional(),
  })
  .refine((data) => !!data.message || !!data.prompt, {
    message: "Either message or prompt is required for Smart AI",
  });

/**
 * Carousel action - requires template
 */
export const CarouselActionConfigSchema = z.object({
  carouselTemplateId: z.string().uuid().optional(),
  elements: z
    .array(
      z.object({
        title: z.string().max(80),
        subtitle: z.string().max(80).optional(),
        imageUrl: z.string().url().optional(),
        buttons: z
          .array(
            z.object({
              type: z.enum(["WEB_URL", "POSTBACK"]),
              title: z.string().max(20),
              url: z.string().url().optional(),
              payload: z.string().optional(),
            }),
          )
          .max(3)
          .optional(),
      }),
    )
    .max(10)
    .optional(),
});

/**
 * Button Template action
 */
export const ButtonTemplateActionConfigSchema = z.object({
  text: z.string().max(640, "Text must be 640 characters or less"),
  buttons: z
    .array(
      z.object({
        type: z.enum(["WEB_URL", "POSTBACK"]),
        title: z.string().max(20),
        url: z.string().url().optional(),
        payload: z.string().optional(),
      }),
    )
    .min(1)
    .max(3),
});

/**
 * Quick Replies action
 */
export const QuickRepliesActionConfigSchema = z.object({
  text: z.string().min(1, "Text is required"),
  quickReplies: z
    .array(
      z.object({
        title: z.string().max(20),
        payload: z.string().optional(),
        imageUrl: z.string().url().optional(),
      }),
    )
    .max(13)
    .optional(),
});

/**
 * Product Template action
 */
export const ProductTemplateActionConfigSchema = z.object({
  productIds: z.array(z.string()).min(1),
});

/**
 * Ice Breakers action
 */
export const IceBreakersActionConfigSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().max(80),
        payload: z.string(),
      }),
    )
    .max(4),
});

/**
 * Persistent Menu action
 */
export const PersistentMenuActionConfigSchema = z.object({
  menuItems: z
    .array(
      z.object({
        type: z.enum(["WEB_URL", "POSTBACK"]),
        title: z.string().max(30),
        url: z.string().url().optional(),
        payload: z.string().optional(),
      }),
    )
    .max(3),
});

/**
 * Log to Sheets action
 */
export const LogToSheetsActionConfigSchema = z.object({
  spreadsheetId: z.string().optional(),
  sheetName: z.string().optional(),
  columns: z.array(z.string()).optional(),
});

// =============================================================================
// CONDITION NODE CONFIGS
// =============================================================================

/**
 * Delay condition - requires duration
 */
export const DelayConditionConfigSchema = z.object({
  delaySeconds: z.number().min(1).max(86400).optional(), // Max 24 hours
  delayMinutes: z.number().min(1).max(1440).optional(),
});

/**
 * Has Tag condition
 */
export const HasTagConditionConfigSchema = z.object({
  hashtags: z.array(z.string()).min(1, "At least one hashtag required"),
});

/**
 * Is Follower condition
 */
export const IsFollowerConditionConfigSchema = z.object({}).optional();

/**
 * YES/NO branch nodes - no config needed
 */
export const BranchNodeConfigSchema = z.object({}).optional();

// =============================================================================
// CONFIG SCHEMA MAP
// =============================================================================

/**
 * Maps subType to its corresponding config schema.
 * Used for validation during save and runtime.
 */
export const NODE_CONFIG_SCHEMAS: Record<string, z.ZodType<any>> = {
  // Triggers
  DM: DMTriggerConfigSchema,
  COMMENT: CommentTriggerConfigSchema,
  STORY_REPLY: StoryReplyTriggerConfigSchema,
  MENTION: MentionTriggerConfigSchema,
  KEYWORDS: KeywordsTriggerConfigSchema,
  SELECT_POSTS: SelectPostsTriggerConfigSchema,
  POSTBACK: PostbackTriggerConfigSchema,

  // Actions
  MESSAGE: MessageActionConfigSchema,
  REPLY_COMMENT: ReplyCommentActionConfigSchema,
  REPLY_MENTION: ReplyMentionActionConfigSchema,
  SMARTAI: SmartAIActionConfigSchema,
  CAROUSEL: CarouselActionConfigSchema,
  BUTTON_TEMPLATE: ButtonTemplateActionConfigSchema,
  QUICK_REPLIES: QuickRepliesActionConfigSchema,
  PRODUCT_TEMPLATE: ProductTemplateActionConfigSchema,
  ICE_BREAKERS: IceBreakersActionConfigSchema,
  PERSISTENT_MENU: PersistentMenuActionConfigSchema,
  LOG_TO_SHEETS: LogToSheetsActionConfigSchema,

  // Conditions
  DELAY: DelayConditionConfigSchema,
  HAS_TAG: HasTagConditionConfigSchema,
  IS_FOLLOWER: IsFollowerConditionConfigSchema,
  YES: BranchNodeConfigSchema,
  NO: BranchNodeConfigSchema,
};

// =============================================================================
// VALIDATION FUNCTION
// =============================================================================

export interface NodeConfigValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a node's config against its schema.
 * Returns validation result with detailed errors.
 */
export function validateNodeConfig(
  subType: string,
  config: Record<string, unknown>,
): NodeConfigValidationResult {
  const schema = NODE_CONFIG_SCHEMAS[subType];

  if (!schema) {
    // Unknown node type - allow but warn
    console.warn(`[NodeConfig] No schema found for subType: ${subType}`);
    return { valid: true, errors: [] };
  }

  const result = schema.safeParse(config);

  if (result.success) {
    return { valid: true, errors: [] };
  }

  // Extract error messages
  const errors = result.error.errors.map((e) => {
    const path = e.path.join(".");
    return path ? `${path}: ${e.message}` : e.message;
  });

  return { valid: false, errors };
}

/**
 * Validate all nodes in a flow.
 */
export function validateAllNodeConfigs(
  nodes: Array<{
    subType: string;
    label: string;
    config: Record<string, unknown>;
  }>,
): { valid: boolean; nodeErrors: Record<string, string[]> } {
  const nodeErrors: Record<string, string[]> = {};
  let allValid = true;

  for (const node of nodes) {
    const result = validateNodeConfig(node.subType, node.config || {});
    if (!result.valid) {
      nodeErrors[node.label] = result.errors;
      allValid = false;
    }
  }

  return { valid: allValid, nodeErrors };
}
