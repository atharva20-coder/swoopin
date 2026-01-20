/**
 * ============================================
 * FLOW RUNNER - Core Types
 * n8n-style architecture for flow execution
 * ============================================
 */

import { Prisma } from "@prisma/client";

// =============================================================================
// ITEM DATA MODEL
// =============================================================================

/**
 * Core data unit passed between nodes.
 * Every node receives ItemData[] and outputs ItemData[].
 * This enables predictable, chainable data flow.
 */
export interface ItemData {
  /** Primary JSON payload */
  json: Record<string, unknown>;
  /** Optional binary data (e.g., images, files) */
  binary?: Record<string, Buffer>;
  /** Metadata for debugging/logging */
  meta?: {
    sourceNodeId?: string;
    timestamp?: number;
  };
}

// =============================================================================
// EXECUTION CONTEXT
// =============================================================================

/**
 * Runtime context available to all node executors.
 * Contains authentication, user info, and trigger data.
 */
export interface ExecutionContext {
  // Automation identifiers
  automationId: string;
  userId: string;

  // Instagram API credentials
  token: string;
  pageId: string;

  // Trigger data
  senderId: string;
  messageText?: string;
  commentId?: string;
  mediaId?: string;
  triggerType: "DM" | "COMMENT" | "STORY_REPLY" | "MENTION";
  isStoryReply?: boolean;

  // User subscription (for feature gating)
  userSubscription?: string;
  userOpenAiKey?: string;

  // AI response passthrough (for SmartAI → Message chaining)
  aiResponse?: string;
}

// =============================================================================
// NODE EXECUTOR INTERFACE
// =============================================================================

/**
 * Result returned by every node executor.
 */
export interface NodeExecutionResult {
  success: boolean;
  items: ItemData[];
  message?: string;
  /** Detailed logs for debugging UI */
  logs?: ExecutionLogEntry[];
}

/**
 * Log entry for execution debugging.
 */
export interface ExecutionLogEntry {
  timestamp: number;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Interface that all node executors must implement.
 * Each node type (MESSAGE, SMARTAI, etc.) is a separate class.
 */
export interface INodeExecutor {
  /** Node category: "trigger", "action", "condition" */
  readonly type: string;
  /** Specific node type: "MESSAGE", "SMARTAI", "IS_FOLLOWER", etc. */
  readonly subType: string;
  /** Human-readable description */
  readonly description?: string;

  /**
   * Execute the node logic.
   * @param config - Node-specific configuration from the flow builder
   * @param items - Input data from the previous node
   * @param context - Runtime execution context
   */
  execute(
    config: Record<string, unknown>,
    items: ItemData[],
    context: ExecutionContext,
  ): Promise<NodeExecutionResult>;
}

// =============================================================================
// FLOW GRAPH TYPES
// =============================================================================

/**
 * Represents a node in the flow graph (runtime representation).
 */
export interface FlowNodeRuntime {
  nodeId: string;
  type: string;
  subType: string;
  label: string;
  config: Record<string, unknown>;
}

/**
 * Represents an edge in the flow graph.
 */
export interface FlowEdgeRuntime {
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

// =============================================================================
// EXECUTION RESULT
// =============================================================================

/**
 * Final result of a complete flow execution.
 */
export interface FlowExecutionResult {
  success: boolean;
  message: string;
  /** Execution logs for each node (for UI display) */
  nodeLogs?: Record<string, ExecutionLogEntry[]>;
  /** Total execution time in ms */
  executionTimeMs?: number;
  /** Error details if failed */
  error?: {
    nodeId?: string;
    code: string;
    message: string;
  };
}

// =============================================================================
// TEST RUN TYPES (Ephemeral Execution)
// =============================================================================

/**
 * Request schema for test run endpoint.
 * Accepts ephemeral flow data (not saved to DB).
 */
export interface TestRunRequest {
  nodes: FlowNodeRuntime[];
  edges: FlowEdgeRuntime[];
  triggerType: "DM" | "COMMENT" | "STORY_REPLY" | "MENTION";
  /** Mock input data for testing */
  mockInput?: {
    messageText?: string;
    commentId?: string;
    senderId?: string;
  };
}

/**
 * Response from test run endpoint.
 */
export interface TestRunResponse extends FlowExecutionResult {
  /** Whether this was a dry run (no side effects) */
  dryRun: boolean;
}
