import { client } from "@/lib/prisma";
import { sendDM, sendPrivateMessage, replyToComment, sendCarouselMessage, checkIfFollower, getMediaHashtags, sendButtonTemplate, setIceBreakers, setPersistentMenu, sendSenderAction, sendProductTemplate, sendQuickReplies } from "@/lib/fetch";
import { openai } from "@/lib/openai";
import { OpenAI } from "openai";
import { trackResponses } from "@/actions/webhook/queries";
import { trackAnalytics } from "@/actions/analytics";

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
  triggerType: "DM" | "COMMENT";
  userSubscription?: string;
  userOpenAiKey?: string;
};

// Build adjacency list from edges
const buildAdjacencyList = (edges: { sourceNodeId: string; targetNodeId: string }[]) => {
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
  adjacencyList: Map<string, string[]>
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
const checkKeywordMatch = (
  messageText: string,
  nodes: FlowNode[]
): boolean => {
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
  context: ExecutionContext
): Promise<boolean> => {
  const { token, pageId, senderId, mediaId, messageText } = context;

  try {
    switch (node.subType) {
      case "IS_FOLLOWER": {
        // Check if the sender follows the page
        const isFollower = await checkIfFollower(pageId, senderId, token);

        return isFollower;
      }

      case "HAS_TAG": {
        // Check if the media or message contains specified hashtags
        const requiredTags = node.config?.hashtags || node.config?.keywords || [];
        if (requiredTags.length === 0) return true;

        let foundTags: string[] = [];
        
        // If we have a media ID, get hashtags from the post
        if (mediaId) {
          foundTags = await getMediaHashtags(mediaId, token);
        }
        
        // Also check message text for hashtags
        if (messageText) {
          const messageHashtags = messageText.match(/#(\w+)/g) || [];
          foundTags = [...foundTags, ...messageHashtags.map(t => t.toLowerCase())];
        }

        // Check if any required tag is found
        const hasMatch = requiredTags.some((tag: string) => 
          foundTags.includes(tag.toLowerCase().replace('#', ''))
        );

        return hasMatch;
      }

      case "YES":
        // YES node always returns true (path selection)
        return true;

      case "NO":
        // NO node always returns false (path selection)
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
  context: ExecutionContext
): Promise<{ success: boolean; message: string }> => {
  const { token, pageId, senderId, automationId, userId, commentId } = context;

  try {
    switch (node.subType) {
      case "MESSAGE": {
        const messageText = node.config?.message || "";
        if (!messageText) return { success: false, message: "No message configured" };
        
        const result = await sendDM(pageId, senderId, messageText, token);
        if (result.status === 200) {
          await trackResponses(automationId, "DM");
          await trackAnalytics(userId, "dm").catch(console.error);
          return { success: true, message: "DM sent" };
        }
        return { success: false, message: "Failed to send DM" };
      }

      case "REPLY_COMMENT": {
        if (!commentId) return { success: false, message: "No comment to reply to" };
        const replyText = node.config?.commentReply || "";
        if (!replyText) return { success: false, message: "No reply text configured" };
        
        const result = await replyToComment(commentId, replyText, token);
        if (result.status === 200) {
          await trackResponses(automationId, "COMMENT");
          return { success: true, message: "Comment reply sent" };
        }
        return { success: false, message: "Failed to reply to comment" };
      }

      case "SMARTAI": {
        if (context.userSubscription !== "PRO") {
          return { success: false, message: "Smart AI requires PRO subscription" };
        }

        // Import rate limiter and Gemini dynamically to avoid circular deps
        const { checkRateLimit } = await import("@/lib/rate-limiter");
        const { generatePersonifiedResponse } = await import("@/lib/gemini");
        const { getChatHistory, createChatHistory } = await import("@/actions/webhook/queries");

        // Check AI rate limit (5 requests per minute per user)
        const rateLimitResult = await checkRateLimit(`ai:${senderId}`, "AI");
        if (!rateLimitResult.success) {
          console.log(`Rate limited AI request for sender: ${senderId}`);
          // Send a friendly rate limit message
          const rateLimitMsg = "I'm receiving a lot of messages right now! Please wait a moment and try again. 😊";
          await sendDM(pageId, senderId, rateLimitMsg, token);
          return { success: false, message: "AI rate limited" };
        }

        const prompt = node.config?.message || node.config?.prompt || "";
        if (!prompt) return { success: false, message: "No prompt configured" };

        // === SENDER ACTIONS: Improve conversational UX ===
        // 1. Mark message as seen immediately
        try {
          await sendSenderAction(pageId, senderId, "mark_seen", token);
        } catch (e) { console.log("Failed to mark_seen:", e); }
        
        // 2. Show typing indicator while generating AI response
        try {
          await sendSenderAction(pageId, senderId, "typing_on", token);
        } catch (e) { console.log("Failed to typing_on:", e); }

        // Fetch chat history for context
        let chatHistory: { role: "user" | "model"; text: string }[] = [];
        try {
          const historyResult = await getChatHistory(senderId, pageId);
          if (historyResult.history && historyResult.history.length > 0) {
            // Convert to Gemini format and limit to last 10 messages
            chatHistory = historyResult.history.slice(-10).map((msg) => ({
              role: msg.role === "user" ? "user" as const : "model" as const,
              text: msg.content,
            }));
          }
        } catch (error) {
          console.log("Could not fetch chat history, proceeding without it:", error);
        }

        // Generate response using Gemini with personified prompt
        const aiResponse = await generatePersonifiedResponse(
          prompt,
          context.messageText || "",
          chatHistory
        );

        if (!aiResponse) {
          // Fallback to OpenAI if Gemini fails
          console.log("Gemini failed, falling back to OpenAI");
          const openaiClient = context.userOpenAiKey
            ? new OpenAI({ apiKey: context.userOpenAiKey })
            : openai;

          const completion = await openaiClient.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `${prompt}: Keep responses under 2 sentences`,
              },
              {
                role: "user",
                content: context.messageText || "",
              },
            ],
          });

          const fallbackResponse = completion.choices[0]?.message?.content;
          if (!fallbackResponse) {
            // Turn off typing if we have no response
            try { await sendSenderAction(pageId, senderId, "typing_off", token); } catch (e) {}
            return { success: false, message: "No AI response from fallback" };
          }

          // Send the message (automatically stops typing indicator)
          const result = await sendDM(pageId, senderId, fallbackResponse, token);
          if (result.status === 200) {
            // Store in chat history
            try {
              await createChatHistory(automationId, senderId, pageId, context.messageText || "");
              await createChatHistory(automationId, pageId, senderId, fallbackResponse);
            } catch (e) { console.log("Failed to store chat history:", e); }
            
            await trackResponses(automationId, "DM");
            await trackAnalytics(userId, "dm").catch(console.error);
            return { success: true, message: "Smart AI response sent (OpenAI fallback)" };
          }
          return { success: false, message: "Failed to send AI response" };
        }

        // Send the Gemini response as a message (automatically stops typing indicator)
        const result = await sendDM(pageId, senderId, aiResponse, token);
        if (result.status === 200) {
          // Store messages in chat history for future context
          try {
            await createChatHistory(automationId, senderId, pageId, context.messageText || "");
            await createChatHistory(automationId, pageId, senderId, aiResponse);
          } catch (e) { console.log("Failed to store chat history:", e); }
          
          await trackResponses(automationId, "DM");
          await trackAnalytics(userId, "dm").catch(console.error);
          return { success: true, message: "Smart AI response sent (Gemini)" };
        }
        return { success: false, message: "Failed to send AI response" };
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

        const carouselElements = template.elements.map((element: { title: string; subtitle?: string | null; imageUrl?: string | null; defaultAction?: string | null; buttons: { type: string; title: string; url?: string | null; payload?: string | null }[] }) => ({
          title: element.title,
          subtitle: element.subtitle || undefined,
          imageUrl: element.imageUrl || undefined,
          defaultAction: element.defaultAction || undefined,
          buttons: element.buttons.map((button: { type: string; title: string; url?: string | null; payload?: string | null }) => ({
            type: button.type.toLowerCase() as "web_url" | "postback",
            title: button.title,
            url: button.url || undefined,
            payload: button.payload || undefined,
          })),
        }));

        const result = await sendCarouselMessage(pageId, senderId, carouselElements, token);
        if (result) {
          await trackResponses(automationId, "CAROUSEL");
          await trackAnalytics(userId, "dm").catch(console.error);
          return { success: true, message: "Carousel sent" };
        }
        return { success: false, message: "Failed to send carousel" };
      }

      case "BUTTON_TEMPLATE": {
        // Get button template config from node
        const text = node.config?.text || node.config?.message || "";
        const buttons = node.config?.buttons || [];
        
        if (!text) return { success: false, message: "No text configured for button template" };
        if (buttons.length === 0) return { success: false, message: "No buttons configured" };

        const result = await sendButtonTemplate(
          pageId,
          senderId,
          text,
          buttons,
          token
        );

        if (result.success) {
          await trackResponses(automationId, "DM");
          await trackAnalytics(userId, "dm").catch(console.error);
          return { success: true, message: "Button template sent" };
        }
        return { success: false, message: result.error || "Failed to send button template" };
      }

      case "PRODUCT_TEMPLATE": {
        // Send product(s) from Facebook catalog
        const productIds = node.config?.productIds || [];
        
        if (productIds.length === 0) {
          return { success: false, message: "No product IDs configured" };
        }

        const result = await sendProductTemplate(pageId, senderId, productIds, token);

        if (result.success) {
          await trackResponses(automationId, "DM");
          await trackAnalytics(userId, "dm").catch(console.error);
          return { success: true, message: "Product template sent" };
        }
        return { success: false, message: result.error || "Failed to send product template" };
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

        const result = await sendQuickReplies(pageId, senderId, text, quickReplies, token);

        if (result.success) {
          await trackResponses(automationId, "DM");
          await trackAnalytics(userId, "dm").catch(console.error);
          return { success: true, message: "Quick replies sent" };
        }
        return { success: false, message: result.error || "Failed to send quick replies" };
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
        return { success: false, message: result.error || "Failed to set ice breakers" };
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
        return { success: false, message: result.error || "Failed to set persistent menu" };
      }

      case "TYPING_ON": {
        const result = await sendSenderAction(pageId, senderId, "typing_on", token);
        if (result.success) {
          return { success: true, message: "Typing indicator shown" };
        }
        return { success: false, message: result.error || "Failed to show typing indicator" };
      }

      case "TYPING_OFF": {
        const result = await sendSenderAction(pageId, senderId, "typing_off", token);
        if (result.success) {
          return { success: true, message: "Typing indicator hidden" };
        }
        return { success: false, message: result.error || "Failed to hide typing indicator" };
      }

      case "MARK_SEEN": {
        const result = await sendSenderAction(pageId, senderId, "mark_seen", token);
        if (result.success) {
          return { success: true, message: "Message marked as seen" };
        }
        return { success: false, message: result.error || "Failed to mark message as seen" };
      }

      default:
        return { success: false, message: `Unknown action type: ${node.subType}` };
    }
  } catch (error) {
    console.error(`Error executing action ${node.subType}:`, error);
    return { success: false, message: `Execution error: ${error}` };
  }
};

// Main flow execution function
export const executeFlow = async (
  automationId: string,
  context: ExecutionContext
): Promise<{ success: boolean; message: string }> => {




  
  try {
    // Load flow data
    const nodes = await client.flowNode.findMany({
      where: { automationId },
    });

    const edges = await client.flowEdge.findMany({
      where: { automationId },
    });



    // If no flow nodes, fall back to legacy execution
    if (nodes.length === 0) {

      return { success: false, message: "No flow nodes found - using legacy execution" };
    }

    // Convert to execution format
    const flowNodes: FlowNode[] = nodes.map((n: { nodeId: string; type: string; subType: string; label: string; config: unknown }) => ({
      nodeId: n.nodeId,
      type: n.type,
      subType: n.subType,
      label: n.label,
      config: (n.config as Record<string, unknown>) || {},
    }));

    console.log("Flow nodes:", flowNodes.map(n => `${n.type}:${n.subType} (${n.label})`));

    // Check if message matches keywords
    if (context.messageText && !checkKeywordMatch(context.messageText, flowNodes)) {
      return { success: false, message: "Message does not match keywords" };
    }

    // Find trigger node matching the trigger type
    const triggerNode = flowNodes.find(
      (n) => n.type === "trigger" && n.subType === context.triggerType
    );

    if (!triggerNode) {
      return { success: false, message: `No ${context.triggerType} trigger found in flow` };
    }

    // Build adjacency list and get execution path
    const adjacencyList = buildAdjacencyList(edges);
    const executionPath = getExecutionPath(triggerNode.nodeId, flowNodes, adjacencyList);

    console.log(`Executing flow path with ${executionPath.length} nodes`);

    // Execute nodes in order (actions and conditions)
    const results: { node: string; success: boolean; message: string }[] = [];
    let skipNext = false;

    for (const node of executionPath) {
      // Skip trigger nodes
      if (node.type === "trigger") continue;

      // If we're skipping due to a failed condition
      if (skipNext && node.subType !== "NO") {
        console.log(`Skipping ${node.label} due to condition branch`);
        continue;
      }
      skipNext = false;

      if (node.type === "condition") {
        // Evaluate the condition
        const conditionResult = await evaluateCondition(node, context);
        console.log(`Condition ${node.label}: ${conditionResult}`);
        
        if (!conditionResult) {
          // Condition failed, skip to "NO" branch or next non-yes nodes
          skipNext = true;
        }
        continue;
      }

      if (node.type === "action") {
        const result = await executeActionNode(node, context);
        results.push({
          node: node.label,
          success: result.success,
          message: result.message,
        });

        if (result.success) {
          console.log(`✓ Executed: ${node.label}`);
        } else {
          console.log(`✗ Failed: ${node.label} - ${result.message}`);
        }
      }
    }

    const successCount = results.filter((r) => r.success).length;
    return {
      success: successCount > 0 || results.length === 0,
      message: results.length > 0 ? `Executed ${successCount}/${results.length} actions` : "Flow completed",
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
