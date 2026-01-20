/**
 * ============================================
 * SMARTAI NODE EXECUTOR
 * Generates AI responses using Gemini.
 * Stores result in context.aiResponse for downstream nodes.
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

export class SmartAINodeExecutor implements INodeExecutor {
  readonly type = "action";
  readonly subType = "SMARTAI";
  readonly description = "Generate AI-powered responses using Gemini";

  async execute(
    config: Record<string, unknown>,
    items: ItemData[],
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    const logs: ExecutionLogEntry[] = [];
    const startTime = Date.now();

    logs.push({
      timestamp: startTime,
      level: "info",
      message: "Starting SMARTAI node execution",
    });

    const { token, pageId, senderId, userSubscription } = context;

    // Subscription check
    if (userSubscription !== "PRO" && userSubscription !== "ENTERPRISE") {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Smart AI requires PRO or ENTERPRISE subscription",
        data: { currentPlan: userSubscription },
      });

      return {
        success: false,
        items: [],
        message: "Smart AI requires PRO or ENTERPRISE subscription",
        logs,
      };
    }

    // Dynamic imports to avoid circular dependencies
    const { checkRateLimit } = await import("@/lib/rate-limiter");
    const { generatePersonifiedResponse } = await import("@/lib/gemini");
    const { webhookService } = await import("@/services/webhook.service");

    // Rate limit check
    const rateLimitResult = await checkRateLimit(`ai:${senderId}`, "AI");
    if (!rateLimitResult.success) {
      logs.push({
        timestamp: Date.now(),
        level: "warn",
        message: "AI rate limited",
      });

      return {
        success: false,
        items: [],
        message: "AI rate limited",
        logs,
      };
    }

    // Get prompt
    const prompt =
      (config.message as string) || (config.prompt as string) || "";
    if (!prompt) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "No prompt configured",
      });

      return {
        success: false,
        items: [],
        message: "No prompt configured",
        logs,
      };
    }

    logs.push({
      timestamp: Date.now(),
      level: "debug",
      message: "Prompt loaded",
      data: { promptPreview: prompt.substring(0, 50) + "..." },
    });

    // Show typing indicator
    try {
      await sendSenderAction(pageId, senderId, "mark_seen", token);
      await sendSenderAction(pageId, senderId, "typing_on", token);
    } catch {
      // Ignore indicator errors
    }

    // Fetch chat history
    let chatHistory: { role: "user" | "model"; text: string }[] = [];
    try {
      const historyResult = await webhookService.getChatHistory(
        pageId,
        senderId,
      );
      if (historyResult.history && historyResult.history.length > 0) {
        chatHistory = historyResult.history.slice(-10).map((msg) => ({
          role: msg.role === "user" ? ("user" as const) : ("model" as const),
          text: msg.content,
        }));
      }

      logs.push({
        timestamp: Date.now(),
        level: "debug",
        message: "Chat history fetched",
        data: { historyLength: chatHistory.length },
      });
    } catch {
      logs.push({
        timestamp: Date.now(),
        level: "warn",
        message: "Could not fetch chat history",
      });
    }

    // Generate response
    const userMessage = context.messageText || "";
    let generatedResponse: string | null = null;

    try {
      generatedResponse = await generatePersonifiedResponse(
        prompt,
        userMessage,
        chatHistory,
      );

      logs.push({
        timestamp: Date.now(),
        level: "info",
        message: "AI response generated",
        data: {
          responsePreview: generatedResponse?.substring(0, 50) + "...",
          generationTimeMs: Date.now() - startTime,
        },
      });
    } catch (error) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Gemini generation failed",
        data: { error: error instanceof Error ? error.message : String(error) },
      });
    }

    // Turn off typing
    try {
      await sendSenderAction(pageId, senderId, "typing_off", token);
    } catch {
      // Ignore
    }

    if (!generatedResponse) {
      return {
        success: false,
        items: [],
        message: "No AI response generated",
        logs,
      };
    }

    // Store AI response for downstream nodes
    context.aiResponse = generatedResponse;

    // Store chat history
    try {
      await webhookService.createChatHistory(
        context.automationId,
        senderId,
        pageId,
        userMessage,
      );
      await webhookService.createChatHistory(
        context.automationId,
        pageId,
        senderId,
        generatedResponse,
      );
    } catch {
      logs.push({
        timestamp: Date.now(),
        level: "warn",
        message: "Could not store chat history",
      });
    }

    // Output items with AI response
    const outputItems: ItemData[] = items.map((item) => ({
      ...item,
      json: {
        ...item.json,
        aiResponse: generatedResponse,
        prompt,
        userMessage,
      },
      meta: {
        sourceNodeId: "SMARTAI",
        timestamp: Date.now(),
      },
    }));

    logs.push({
      timestamp: Date.now(),
      level: "info",
      message: "SMARTAI execution complete",
      data: { executionTimeMs: Date.now() - startTime },
    });

    return {
      success: true,
      items:
        outputItems.length > 0
          ? outputItems
          : [{ json: { aiResponse: generatedResponse } }],
      message: "AI response generated - will be sent by downstream action",
      logs,
    };
  }
}

export const smartAINodeExecutor = new SmartAINodeExecutor();
