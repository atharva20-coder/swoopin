import { client } from "@/lib/prisma";
import {
  sendDM,
  sendPrivateMessage,
  sendCarouselMessage,
  checkIfFollower,
  getMediaHashtags,
  sendButtonTemplate,
  setIceBreakers,
  setPersistentMenu,
  sendSenderAction,
  sendProductTemplate,
  sendQuickReplies,
} from "@/lib/fetch";
import { webhookService } from "@/services/webhook.service";
import { analyticsService } from "@/services/analytics.service";

// Re-export for backward compatibility
const trackResponses = webhookService.trackResponses.bind(webhookService);
const trackAnalytics = async (userId: string, type: "dm" | "comment") => {
  return analyticsService.trackEvent(userId, type);
};

type FlowNode = {
  nodeId: string;
  type: string;
  subType: string;
  label: string;
  config: Record<string, any>;
};

type ExecutionContext = {
  automationId: string;
  userId: string;
  token: string;
  pageId: string;
  senderId: string;
  messageText?: string;
  commentId?: string;
  mediaId?: string;
  triggerType: "DM" | "COMMENT" | "STORY_REPLY" | "MENTION";
  isStoryReply?: boolean;
  userSubscription?: string;
  userOpenAiKey?: string;
  aiResponse?: string; // AI-generated response to pass to downstream nodes
};

// Build adjacency list from edges
const buildAdjacencyList = (
  edges: { sourceNodeId: string; targetNodeId: string }[],
) => {
  const adjacencyList = new Map<string, string[]>();
  edges.forEach((edge) => {
    const current = adjacencyList.get(edge.sourceNodeId) || [];
    current.push(edge.targetNodeId);
    adjacencyList.set(edge.sourceNodeId, current);
  });
  return adjacencyList;
};

// Get execution path using BFS from trigger node
const getExecutionPath = (
  triggerNodeId: string,
  nodes: FlowNode[],
  adjacencyList: Map<string, string[]>,
): FlowNode[] => {
  const path: FlowNode[] = [];
  const visited = new Set<string>();
  const queue = [triggerNodeId];

  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;
    if (visited.has(currentNodeId)) continue;
    visited.add(currentNodeId);

    const node = nodes.find((n) => n.nodeId === currentNodeId);
    if (node) {
      path.push(node);
      const neighbors = adjacencyList.get(currentNodeId) || [];
      queue.push(...neighbors);
    }
  }

  return path;
};

// Check if message matches any keyword in the flow
const checkKeywordMatch = (messageText: string, nodes: FlowNode[]): boolean => {
  const keywordNodes = nodes.filter((n) => n.subType === "KEYWORDS");

  for (const node of keywordNodes) {
    const keywords = node.config?.keywords || [];
    for (const keyword of keywords) {
      if (messageText.toLowerCase().includes(keyword.toLowerCase())) {
        return true;
      }
    }
  }

  // If no keyword nodes, allow all messages
  return keywordNodes.length === 0;
};

// Evaluate a condition node
const evaluateCondition = async (
  node: FlowNode,
  context: ExecutionContext,
): Promise<boolean> => {
  const { token, pageId, senderId, mediaId, messageText } = context;

  try {
    switch (node.subType) {
      case "IS_FOLLOWER": {
        const isFollower = await checkIfFollower(pageId, senderId, token);
        return isFollower;
      }

      case "HAS_TAG": {
        const requiredTags =
          node.config?.hashtags || node.config?.keywords || [];
        if (requiredTags.length === 0) return true;

        let foundTags: string[] = [];

        if (mediaId) {
          const mediaTags = await getMediaHashtags(mediaId, token);
          foundTags = [...foundTags, ...mediaTags.map((t) => t.toLowerCase())];
        }

        if (messageText) {
          const messageHashtags = messageText.match(/#(\w+)/g) || [];
          foundTags = [
            ...foundTags,
            ...messageHashtags.map((t) => t.toLowerCase().replace("#", "")),
          ];
        }

        return requiredTags.some((tag: string) =>
          foundTags.includes(tag.toLowerCase().replace("#", "")),
        );
      }

      case "DELAY":
        return true;

      case "YES":
        return true;

      case "NO":
        return false;

      default:
        return true;
    }
  } catch (error) {
    console.error(`Error evaluating condition ${node.subType}:`, error);
    return false;
  }
};

// Execute a single action node
const executeActionNode = async (
  node: FlowNode,
  context: ExecutionContext,
): Promise<{ success: boolean; message: string }> => {
  const { token, pageId, senderId, automationId, userId, commentId } = context;

  try {
    switch (node.subType) {
      case "MESSAGE": {
        console.log(
          "MESSAGE node: context.aiResponse =",
          context.aiResponse
            ? context.aiResponse.substring(0, 30) + "..."
            : "none",
        );
        const messageText = context.aiResponse || node.config?.message || "";
        if (!messageText)
          return { success: false, message: "No message configured" };

        const usedAiResponse = !!context.aiResponse;
        if (context.aiResponse) delete context.aiResponse;

        // Show typing indicator before sending
        try {
          await sendSenderAction(pageId, senderId, "mark_seen", token);
          await sendSenderAction(pageId, senderId, "typing_on", token);
          // Brief delay to show typing animation (1 second)
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (e) {
          console.log("Could not show typing indicator:", e);
        }

        console.log(
          "MESSAGE node: Sending DM with text:",
          messageText.substring(0, 50) + "...",
        );
        const result = await sendDM(pageId, senderId, messageText, token);

        // Turn off typing indicator
        try {
          await sendSenderAction(pageId, senderId, "typing_off", token);
        } catch (e) {}

        if (result.status === 200) {
          await trackResponses(automationId, "DM");
          await trackAnalytics(userId, "dm").catch(console.error);
          return {
            success: true,
            message: usedAiResponse ? "DM sent with AI response" : "DM sent",
          };
        }
        return { success: false, message: "Failed to send DM" };
      }

      case "REPLY_COMMENT": {
        if (!commentId)
          return { success: false, message: "No comment to reply to" };

        const replyText = context.aiResponse || node.config?.commentReply || "";
        if (!replyText)
          return { success: false, message: "No reply text configured" };

        const usedAiResponse = !!context.aiResponse;
        if (context.aiResponse) delete context.aiResponse;

        // Use the robust instagram/comments library
        const { replyToComment } = await import("@/lib/instagram/comments");
        const result = await replyToComment(commentId, replyText, token);

        if (result.success) {
          await trackResponses(automationId, "COMMENT");
          await trackAnalytics(userId, "comment").catch(console.error);
          return {
            success: true,
            message: usedAiResponse
              ? "Comment reply sent with AI response"
              : "Comment reply sent",
          };
        }
        return {
          success: false,
          message: result.error || "Failed to reply to comment",
        };
      }

      case "SMARTAI": {
        if (
          context.userSubscription !== "PRO" &&
          context.userSubscription !== "ENTERPRISE"
        ) {
          return {
            success: false,
            message: "Smart AI requires PRO or ENTERPRISE subscription",
          };
        }

        const { checkRateLimit } = await import("@/lib/rate-limiter");
        const { generatePersonifiedResponse } = await import("@/lib/gemini");
        // Use webhookService instead of actions for consistency
        const getChatHistory =
          webhookService.getChatHistory.bind(webhookService);
        const createChatHistory =
          webhookService.createChatHistory.bind(webhookService);

        const rateLimitResult = await checkRateLimit(`ai:${senderId}`, "AI");
        if (!rateLimitResult.success) {
          return { success: false, message: "AI rate limited" };
        }

        const prompt = node.config?.message || node.config?.prompt || "";
        if (!prompt) {
          return { success: false, message: "No prompt configured" };
        }

        // Show typing indicator
        try {
          await sendSenderAction(pageId, senderId, "mark_seen", token);
        } catch (e) {}
        try {
          await sendSenderAction(pageId, senderId, "typing_on", token);
        } catch (e) {}

        // Fetch chat history
        let chatHistory: { role: "user" | "model"; text: string }[] = [];
        try {
          const historyResult = await getChatHistory(pageId, senderId);
          if (historyResult.history && historyResult.history.length > 0) {
            chatHistory = historyResult.history.slice(-10).map((msg) => ({
              role:
                msg.role === "user" ? ("user" as const) : ("model" as const),
              text: msg.content,
            }));
          }
        } catch (error) {}

        // Generate response using Gemini
        let generatedResponse = await generatePersonifiedResponse(
          prompt,
          context.messageText || "",
          chatHistory,
        );

        if (!generatedResponse) {
          console.error("SmartAI: Gemini failed to generate response");
        }

        try {
          await sendSenderAction(pageId, senderId, "typing_off", token);
        } catch (e) {}

        if (!generatedResponse) {
          return { success: false, message: "No AI response generated" };
        }

        // Store chat history
        try {
          await createChatHistory(
            automationId,
            senderId,
            pageId,
            context.messageText || "",
          );
          await createChatHistory(
            automationId,
            pageId,
            senderId,
            generatedResponse,
          );
        } catch (e) {}

        // Store AI response for downstream nodes (MESSAGE or REPLY_COMMENT)
        context.aiResponse = generatedResponse;
        console.log(
          "SmartAI: Generated response, passing to downstream node:",
          generatedResponse.substring(0, 50) + "...",
        );

        return {
          success: true,
          message: "AI response generated - will be sent by downstream action",
        };
      }

      case "CAROUSEL": {
        // Get carousel template from automation
        const automation = await client.automation.findUnique({
          where: { id: automationId },
          include: {
            listener: {
              include: {
                carouselTemplate: {
                  include: {
                    elements: {
                      include: { buttons: true },
                      orderBy: { order: "asc" },
                    },
                  },
                },
              },
            },
          },
        });

        const template = automation?.listener?.carouselTemplate;
        if (!template || template.elements.length === 0) {
          return { success: false, message: "No carousel template found" };
        }

        const carouselElements = template.elements.map(
          (element: {
            title: string;
            subtitle?: string | null;
            imageUrl?: string | null;
            defaultAction?: string | null;
            buttons: {
              type: string;
              title: string;
              url?: string | null;
              payload?: string | null;
            }[];
          }) => ({
            title: element.title,
            subtitle: element.subtitle || undefined,
            imageUrl: element.imageUrl || undefined,
            defaultAction: element.defaultAction || undefined,
            buttons: element.buttons.map(
              (button: {
                type: string;
                title: string;
                url?: string | null;
                payload?: string | null;
              }) => ({
                type: button.type.toLowerCase() as "web_url" | "postback",
                title: button.title,
                url: button.url || undefined,
                payload: button.payload || undefined,
              }),
            ),
          }),
        );

        const result = await sendCarouselMessage(
          pageId,
          senderId,
          carouselElements,
          token,
        );
        if (result) {
          await trackResponses(automationId, "CAROUSEL");
          await trackAnalytics(userId, "dm").catch(console.error);
          return { success: true, message: "Carousel sent" };
        }
        return { success: false, message: "Failed to send carousel" };
      }

      case "REPLY_MENTION": {
        // Reply to a mention (comment on their media)
        const mediaId = context.mediaId;
        if (!mediaId)
          return { success: false, message: "No media to reply to" };

        const replyText = context.aiResponse || node.config?.message || "";
        if (!replyText)
          return { success: false, message: "No reply text configured" };

        const usedAiResponse = !!context.aiResponse;
        if (context.aiResponse) delete context.aiResponse;

        const { replyToMention } = await import("@/lib/instagram/mentions");
        const result = await replyToMention(
          pageId,
          mediaId,
          replyText,
          token,
          commentId,
        );

        if (result.success) {
          await trackResponses(automationId, "MENTION");
          await trackAnalytics(userId, "comment").catch(console.error);
          return {
            success: true,
            message: usedAiResponse
              ? "Mention reply sent with AI response"
              : "Mention reply sent",
          };
        }
        return {
          success: false,
          message: result.error || "Failed to reply to mention",
        };
      }

      case "BUTTON_TEMPLATE": {
        // Get button template config from node
        const text = node.config?.text || node.config?.message || "";
        const buttons = node.config?.buttons || [];

        if (!text)
          return {
            success: false,
            message: "No text configured for button template",
          };
        if (buttons.length === 0)
          return { success: false, message: "No buttons configured" };

        const result = await sendButtonTemplate(
          pageId,
          senderId,
          text,
          buttons,
          token,
        );

        if (result.success) {
          await trackResponses(automationId, "DM");
          await trackAnalytics(userId, "dm").catch(console.error);
          return { success: true, message: "Button template sent" };
        }
        return {
          success: false,
          message: result.error || "Failed to send button template",
        };
      }

      case "PRODUCT_TEMPLATE": {
        // Send product(s) from Facebook catalog
        const productIds = node.config?.productIds || [];

        if (productIds.length === 0) {
          return { success: false, message: "No product IDs configured" };
        }

        const result = await sendProductTemplate(
          pageId,
          senderId,
          productIds,
          token,
        );

        if (result.success) {
          await trackResponses(automationId, "DM");
          await trackAnalytics(userId, "dm").catch(console.error);
          return { success: true, message: "Product template sent" };
        }
        return {
          success: false,
          message: result.error || "Failed to send product template",
        };
      }

      case "QUICK_REPLIES": {
        // Send message with quick reply buttons
        const text = node.config?.text || "";
        const quickReplies = node.config?.quickReplies || [];

        if (!text) {
          return { success: false, message: "No message text configured" };
        }
        if (quickReplies.length === 0) {
          return { success: false, message: "No quick replies configured" };
        }

        const result = await sendQuickReplies(
          pageId,
          senderId,
          text,
          quickReplies,
          token,
        );

        if (result.success) {
          await trackResponses(automationId, "DM");
          await trackAnalytics(userId, "dm").catch(console.error);
          return { success: true, message: "Quick replies sent" };
        }
        return {
          success: false,
          message: result.error || "Failed to send quick replies",
        };
      }

      case "ICE_BREAKERS": {
        // Ice Breakers are profile-level FAQ questions
        const iceBreakers = node.config?.iceBreakers || [];

        if (iceBreakers.length === 0) {
          return { success: false, message: "No ice breakers configured" };
        }

        const result = await setIceBreakers(iceBreakers, token);

        if (result.success) {
          return { success: true, message: "Ice breakers set successfully" };
        }
        return {
          success: false,
          message: result.error || "Failed to set ice breakers",
        };
      }

      case "PERSISTENT_MENU": {
        // Persistent Menu is a profile-level always-visible menu
        const menuItems = node.config?.menuItems || [];

        if (menuItems.length === 0) {
          return { success: false, message: "No menu items configured" };
        }

        const result = await setPersistentMenu(menuItems, token);

        if (result.success) {
          return { success: true, message: "Persistent menu set successfully" };
        }
        return {
          success: false,
          message: result.error || "Failed to set persistent menu",
        };
      }

      case "TYPING_ON": {
        const result = await sendSenderAction(
          pageId,
          senderId,
          "typing_on",
          token,
        );
        if (result.success) {
          return { success: true, message: "Typing indicator shown" };
        }
        return {
          success: false,
          message: result.error || "Failed to show typing indicator",
        };
      }

      case "TYPING_OFF": {
        const result = await sendSenderAction(
          pageId,
          senderId,
          "typing_off",
          token,
        );
        if (result.success) {
          return { success: true, message: "Typing indicator hidden" };
        }
        return {
          success: false,
          message: result.error || "Failed to hide typing indicator",
        };
      }

      case "MARK_SEEN": {
        const result = await sendSenderAction(
          pageId,
          senderId,
          "mark_seen",
          token,
        );
        if (result.success) {
          return { success: true, message: "Message marked as seen" };
        }
        return {
          success: false,
          message: result.error || "Failed to mark message as seen",
        };
      }

      case "DELAY": {
        // Delay execution for specified duration
        const delaySeconds = node.config?.delay || node.config?.seconds || 0;
        const delayMs = delaySeconds * 1000;

        if (delayMs > 0) {
          console.log(`DELAY: Waiting for ${delaySeconds} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          console.log(`DELAY: Completed ${delaySeconds} second delay`);
          return { success: true, message: `Delayed ${delaySeconds} seconds` };
        }
        return { success: true, message: "No delay configured" };
      }

      case "LOG_TO_SHEETS": {
        // Log data to Google Sheets
        const sheetsConfig = node.config?.sheetsConfig;
        if (!sheetsConfig?.spreadsheetId || !sheetsConfig?.sheetName) {
          console.log("LOG_TO_SHEETS: No sheets config found");
          return { success: false, message: "No sheets configuration" };
        }

        try {
          // Import dynamically to avoid circular deps
          const { googleSheetsService } =
            await import("@/services/google-sheets.service");

          const timestamp = new Date().toISOString();
          const senderInfo = context.senderId || "Unknown";
          const messageContent =
            context.messageText || context.commentId || "N/A";
          const triggerType = context.triggerType;

          const result = await googleSheetsService.exportToSheet(
            context.userId,
            {
              spreadsheetId: sheetsConfig.spreadsheetId,
              sheetName: sheetsConfig.sheetName,
              columnHeaders: [
                "Timestamp",
                "Sender ID",
                "Message/Comment",
                "Trigger Type",
              ],
              rows: [[timestamp, senderInfo, messageContent, triggerType]],
            },
          );

          if ("exported" in result && result.exported) {
            console.log("LOG_TO_SHEETS: Data logged successfully");
            return { success: true, message: "Data logged to sheets" };
          }
          return {
            success: false,
            message: "error" in result ? result.error : "Export failed",
          };
        } catch (error) {
          console.error("LOG_TO_SHEETS error:", error);
          return { success: false, message: "Failed to log to sheets" };
        }
      }

      default:
        return {
          success: false,
          message: `Unknown action type: ${node.subType}`,
        };
    }
  } catch (error) {
    console.error(`Error executing action ${node.subType}:`, error);
    return { success: false, message: `Execution error: ${error}` };
  }
};

// Main flow execution function with proper branching
export const executeFlow = async (
  automationId: string,
  context: ExecutionContext,
): Promise<{ success: boolean; message: string }> => {
  try {
    // Load flow data
    const nodes = await client.flowNode.findMany({
      where: { automationId },
    });

    const edges = await client.flowEdge.findMany({
      where: { automationId },
    });

    if (nodes.length === 0) {
      return {
        success: false,
        message: "No flow nodes found - using legacy execution",
      };
    }

    const flowNodes: FlowNode[] = nodes.map(
      (n: {
        nodeId: string;
        type: string;
        subType: string;
        label: string;
        config: unknown;
      }) => ({
        nodeId: n.nodeId,
        type: n.type,
        subType: n.subType,
        label: n.label,
        config: (n.config as Record<string, unknown>) || {},
      }),
    );

    if (
      context.messageText &&
      !checkKeywordMatch(context.messageText, flowNodes)
    ) {
      return { success: false, message: "Message does not match keywords" };
    }

    const triggerNode = flowNodes.find(
      (n) => n.type === "trigger" && n.subType === context.triggerType,
    );

    if (!triggerNode) {
      return {
        success: false,
        message: `No ${context.triggerType} trigger found in flow`,
      };
    }

    const adjacencyList = buildAdjacencyList(edges);
    const nodeMap = new Map<string, FlowNode>();
    flowNodes.forEach((node) => nodeMap.set(node.nodeId, node));

    const results: { node: string; success: boolean; message: string }[] = [];
    const visited = new Set<string>();

    const executeNode = async (nodeId: string): Promise<void> => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (!node) return;

      // Skip trigger nodes
      if (node.type === "trigger") {
        const children = adjacencyList.get(nodeId) || [];
        for (const childId of children) {
          await executeNode(childId);
        }
        return;
      }

      // Handle condition nodes
      if (node.type === "condition") {
        const children = adjacencyList.get(nodeId) || [];

        // YES/NO nodes are pass-through
        if (node.subType === "YES" || node.subType === "NO") {
          for (const childId of children) {
            await executeNode(childId);
          }
          return;
        }

        const conditionResult = await evaluateCondition(node, context);

        let yesBranch: string | null = null;
        let noBranch: string | null = null;
        const directChildren: string[] = [];

        for (const childId of children) {
          const childNode = nodeMap.get(childId);
          if (childNode?.subType === "YES") {
            yesBranch = childId;
          } else if (childNode?.subType === "NO") {
            noBranch = childId;
          } else {
            directChildren.push(childId);
          }
        }

        if (conditionResult) {
          if (yesBranch) {
            await executeNode(yesBranch);
          } else if (directChildren.length > 0) {
            for (const childId of directChildren) {
              await executeNode(childId);
            }
          }
        } else {
          if (noBranch) {
            await executeNode(noBranch);
          }
        }

        return;
      }

      // Handle action nodes
      if (node.type === "action") {
        console.log(`[Flow] Executing action: ${node.subType} (${node.label})`);
        console.log(
          `[Flow] context.aiResponse before:`,
          context.aiResponse ? "present" : "none",
        );

        const result = await executeActionNode(node, context);
        results.push({
          node: node.label,
          success: result.success,
          message: result.message,
        });

        console.log(`[Flow] Action result:`, result.message);
        console.log(
          `[Flow] context.aiResponse after:`,
          context.aiResponse ? "present" : "none",
        );

        const children = adjacencyList.get(nodeId) || [];
        console.log(`[Flow] ${node.label} has ${children.length} child nodes`);
        for (const childId of children) {
          await executeNode(childId);
        }
        return;
      }

      // For any other node type, just continue to children
      const children = adjacencyList.get(nodeId) || [];
      for (const childId of children) {
        await executeNode(childId);
      }
    };

    // Start execution from trigger node
    await executeNode(triggerNode.nodeId);

    const successCount = results.filter((r) => r.success).length;
    return {
      success: successCount > 0 || results.length === 0,
      message:
        results.length > 0
          ? `Executed ${successCount}/${results.length} actions`
          : "Flow completed",
    };
  } catch (error) {
    console.error("Flow execution error:", error);
    return { success: false, message: `Flow execution error: ${error}` };
  }
};

// Check if automation has flow nodes (to decide between flow vs legacy execution)
export const hasFlowNodes = async (automationId: string): Promise<boolean> => {
  const count = await client.flowNode.count({
    where: { automationId },
  });
  return count > 0;
};
