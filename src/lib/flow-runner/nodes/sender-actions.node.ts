/**
 * ============================================
 * SENDER ACTION NODES
 * TYPING_ON, TYPING_OFF, MARK_SEEN
 * @see https://developers.facebook.com/docs/messenger-platform/send-messages/sender-actions
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";
import { sendSenderAction } from "@/lib/fetch";

// =============================================================================
// TYPING ON
// =============================================================================

export class TypingOnNodeExecutor implements INodeExecutor {
  readonly type = "action";
  readonly subType = "TYPING_ON";
  readonly description = "Show typing indicator";

  async execute(
    _config: Record<string, unknown>,
    items: ItemData[],
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    const logs: ExecutionLogEntry[] = [];
    const startTime = Date.now();

    logs.push({
      timestamp: startTime,
      level: "info",
      message: "Showing typing indicator",
    });

    const { token, pageId, senderId } = context;

    try {
      const result = await sendSenderAction(
        pageId,
        senderId,
        "typing_on",
        token,
      );

      if (result.success) {
        logs.push({
          timestamp: Date.now(),
          level: "info",
          message: "Typing indicator shown",
          data: { executionTimeMs: Date.now() - startTime },
        });

        return {
          success: true,
          items: items.length > 0 ? items : [{ json: {} }],
          message: "Typing indicator shown",
          logs,
        };
      }

      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Failed to show typing indicator",
        data: { error: result.error },
      });

      return {
        success: false,
        items: [],
        message: result.error || "Failed to show typing indicator",
        logs,
      };
    } catch (error) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Exception showing typing indicator",
        data: { error: error instanceof Error ? error.message : String(error) },
      });

      return {
        success: false,
        items: [],
        message: `Typing indicator failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        logs,
      };
    }
  }
}

// =============================================================================
// TYPING OFF
// =============================================================================

export class TypingOffNodeExecutor implements INodeExecutor {
  readonly type = "action";
  readonly subType = "TYPING_OFF";
  readonly description = "Hide typing indicator";

  async execute(
    _config: Record<string, unknown>,
    items: ItemData[],
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    const logs: ExecutionLogEntry[] = [];
    const startTime = Date.now();

    logs.push({
      timestamp: startTime,
      level: "info",
      message: "Hiding typing indicator",
    });

    const { token, pageId, senderId } = context;

    try {
      const result = await sendSenderAction(
        pageId,
        senderId,
        "typing_off",
        token,
      );

      if (result.success) {
        logs.push({
          timestamp: Date.now(),
          level: "info",
          message: "Typing indicator hidden",
          data: { executionTimeMs: Date.now() - startTime },
        });

        return {
          success: true,
          items: items.length > 0 ? items : [{ json: {} }],
          message: "Typing indicator hidden",
          logs,
        };
      }

      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Failed to hide typing indicator",
        data: { error: result.error },
      });

      return {
        success: false,
        items: [],
        message: result.error || "Failed to hide typing indicator",
        logs,
      };
    } catch (error) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Exception hiding typing indicator",
        data: { error: error instanceof Error ? error.message : String(error) },
      });

      return {
        success: false,
        items: [],
        message: `Typing off failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        logs,
      };
    }
  }
}

// =============================================================================
// MARK SEEN
// =============================================================================

export class MarkSeenNodeExecutor implements INodeExecutor {
  readonly type = "action";
  readonly subType = "MARK_SEEN";
  readonly description = "Mark message as seen";

  async execute(
    _config: Record<string, unknown>,
    items: ItemData[],
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    const logs: ExecutionLogEntry[] = [];
    const startTime = Date.now();

    logs.push({
      timestamp: startTime,
      level: "info",
      message: "Marking message as seen",
    });

    const { token, pageId, senderId } = context;

    try {
      const result = await sendSenderAction(
        pageId,
        senderId,
        "mark_seen",
        token,
      );

      if (result.success) {
        logs.push({
          timestamp: Date.now(),
          level: "info",
          message: "Message marked as seen",
          data: { executionTimeMs: Date.now() - startTime },
        });

        return {
          success: true,
          items: items.length > 0 ? items : [{ json: {} }],
          message: "Message marked as seen",
          logs,
        };
      }

      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Failed to mark message as seen",
        data: { error: result.error },
      });

      return {
        success: false,
        items: [],
        message: result.error || "Failed to mark message as seen",
        logs,
      };
    } catch (error) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Exception marking message as seen",
        data: { error: error instanceof Error ? error.message : String(error) },
      });

      return {
        success: false,
        items: [],
        message: `Mark seen failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        logs,
      };
    }
  }
}

// Export instances
export const typingOnNodeExecutor = new TypingOnNodeExecutor();
export const typingOffNodeExecutor = new TypingOffNodeExecutor();
export const markSeenNodeExecutor = new MarkSeenNodeExecutor();
