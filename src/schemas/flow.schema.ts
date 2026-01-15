import { z } from "zod";
import { Prisma } from "@prisma/client";

/**
 * ============================================
 * FLOW BUILDER SCHEMAS (Contract-Driven Design)
 * All normalization happens here via .transform()
 * Zero patchwork - schemas are the single source of truth
 * ============================================
 */

// ============================================
// TRANSFORMERS
// ============================================

const nullishStringToNull = z
  .string()
  .nullish()
  .transform((val): string | null => val ?? null);

const configTransformer = z
  .record(z.unknown())
  .optional()
  .transform((val): Prisma.InputJsonValue | undefined =>
    val ? (val as Prisma.InputJsonValue) : undefined
  );

// ============================================
// ENUMS
// ============================================

export const TriggerTypeSchema = z.enum(["DM", "COMMENT", "MENTION"]);

export const ListenerTypeSchema = z.enum(["MESSAGE", "SMARTAI", "CAROUSEL"]);

// ============================================
// NODE SCHEMA
// ============================================

export const FlowNodeInputSchema = z.object({
  nodeId: z.string().min(1),
  type: z.string().min(1),
  subType: z.string().min(1),
  label: z.string().min(1),
  description: nullishStringToNull,
  positionX: z.number(),
  positionY: z.number(),
  config: configTransformer,
});

export const FlowNodeOutputSchema = z.object({
  id: z.string(),
  type: z.literal("custom"),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.object({
    label: z.string(),
    type: z.string(),
    subType: z.string(),
    description: nullishStringToNull,
    config: z.record(z.unknown()).default({}),
    nodeId: z.string(),
  }),
});

// ============================================
// EDGE SCHEMA
// ============================================

export const FlowEdgeInputSchema = z.object({
  edgeId: z.string().min(1),
  sourceNodeId: z.string().min(1),
  targetNodeId: z.string().min(1),
  sourceHandle: nullishStringToNull,
  targetHandle: nullishStringToNull,
});

export const FlowEdgeOutputSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: nullishStringToNull,
  targetHandle: nullishStringToNull,
  animated: z.boolean().default(true),
  type: z.literal("smoothstep"),
  style: z.object({
    stroke: z.string(),
    strokeWidth: z.number(),
  }),
});

// ============================================
// LISTENER SCHEMA
// ============================================

export const ListenerInputSchema = z.object({
  type: ListenerTypeSchema,
  prompt: z.string().min(1),
  reply: z.string().min(1),
  carouselTemplateId: nullishStringToNull,
});

// ============================================
// REQUEST SCHEMAS
// ============================================

export const SaveFlowDataRequestSchema = z.object({
  nodes: z.array(FlowNodeInputSchema),
  edges: z.array(FlowEdgeInputSchema),
});

export const SaveFlowBatchRequestSchema = z.object({
  nodes: z.array(FlowNodeInputSchema),
  edges: z.array(FlowEdgeInputSchema),
  triggers: z.array(TriggerTypeSchema),
  keywords: z.array(z.string()),
  listener: ListenerInputSchema.optional().transform((val) => val ?? null),
});

export const DeleteNodeRequestSchema = z.object({
  nodeId: z.string().min(1, "Node ID is required"),
});

export const GetExecutionPathRequestSchema = z.object({
  triggerType: TriggerTypeSchema,
});

// ============================================
// RESPONSE SCHEMAS
// ============================================

export const FlowDataResponseSchema = z.object({
  nodes: z.array(FlowNodeOutputSchema),
  edges: z.array(FlowEdgeOutputSchema),
});

export const ExecutionPathNodeSchema = z.object({
  nodeId: z.string(),
  type: z.string(),
  subType: z.string(),
  label: z.string(),
  config: z.record(z.unknown()).default({}),
});

export const ExecutionPathResponseSchema = z.object({
  path: z.array(ExecutionPathNodeSchema),
});

// ============================================
// EXPORTED TYPES
// ============================================

export type TriggerType = z.infer<typeof TriggerTypeSchema>;
export type ListenerType = z.infer<typeof ListenerTypeSchema>;
export type FlowNodeInput = z.infer<typeof FlowNodeInputSchema>;
export type FlowEdgeInput = z.infer<typeof FlowEdgeInputSchema>;
export type ListenerInput = z.infer<typeof ListenerInputSchema>;
export type SaveFlowDataRequest = z.infer<typeof SaveFlowDataRequestSchema>;
export type SaveFlowBatchRequest = z.infer<typeof SaveFlowBatchRequestSchema>;
export type DeleteNodeRequest = z.infer<typeof DeleteNodeRequestSchema>;
export type GetExecutionPathRequest = z.infer<
  typeof GetExecutionPathRequestSchema
>;
export type FlowDataResponse = z.infer<typeof FlowDataResponseSchema>;
export type ExecutionPathResponse = z.infer<typeof ExecutionPathResponseSchema>;
