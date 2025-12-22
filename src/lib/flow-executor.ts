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
  aiResponse?: string; // AI-generated response to pass to downstream nodes
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
        // Check if the sender follows the page using Instagram User Profile API
        console.log(`IS_FOLLOWER: Checking if ${senderId} follows ${pageId}`);
        const isFollower = await checkIfFollower(pageId, senderId, token);
        console.log(`IS_FOLLOWER: Result = ${isFollower}`);
        return isFollower;
      }

      case "HAS_TAG": {
        // Check if the media or message contains specified hashtags
        const requiredTags = node.config?.hashtags || node.config?.keywords || [];
        console.log(`HAS_TAG: Looking for tags:`, requiredTags);
        
        if (requiredTags.length === 0) {
          console.log(`HAS_TAG: No tags configured, returning true`);
          return true;
        }

        let foundTags: string[] = [];
        
        // If we have a media ID, get hashtags from the post
        if (mediaId) {
          const mediaTags = await getMediaHashtags(mediaId, token);
          foundTags = [...foundTags, ...mediaTags.map(t => t.toLowerCase())];
          console.log(`HAS_TAG: Found media tags:`, mediaTags);
        }
        
        // Also check message text for hashtags
        if (messageText) {
          const messageHashtags = messageText.match(/#(\w+)/g) || [];
          foundTags = [...foundTags, ...messageHashtags.map(t => t.toLowerCase().replace('#', ''))];
          console.log(`HAS_TAG: Found message tags:`, messageHashtags);
        }

        console.log(`HAS_TAG: All found tags:`, foundTags);

        // Check if any required tag is found
        const hasMatch = requiredTags.some((tag: string) => 
          foundTags.includes(tag.toLowerCase().replace('#', ''))
        );

        console.log(`HAS_TAG: Match found = ${hasMatch}`);
        return hasMatch;
      }

      case "DELAY": {
        // Delay is handled as an action, not a condition
        // Return true to continue execution
        return true;
      }

      case "YES":
        // YES node always returns true (path selection)
        return true;

      case "NO":
        // NO node always returns false (path selection)
        return false;

      default:
        console.log(`Unknown condition type: ${node.subType}, defaulting to true`);
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
        // Use AI response if available, fallback to configured message
        console.log(`[MESSAGE] Context aiResponse: ${context.aiResponse ? 'present' : 'not present'}`);
        console.log(`[MESSAGE] Node config:`, node.config);
        
        const messageText = context.aiResponse || node.config?.message || "";
        console.log(`[MESSAGE] Final message text: "${messageText?.substring(0, 50)}..."`);
        
        if (!messageText) return { success: false, message: "No message configured" };
        
        // Clear AI response after use (one-time use)
        const usedAiResponse = !!context.aiResponse;
        if (context.aiResponse) delete context.aiResponse;
        
        console.log(`[MESSAGE] Sending DM to ${senderId}...`);
        const result = await sendDM(pageId, senderId, messageText, token);
        console.log(`[MESSAGE] DM result:`, result);
        
        if (result.status === 200) {
          await trackResponses(automationId, "DM");
          await trackAnalytics(userId, "dm").catch(console.error);
          return { success: true, message: usedAiResponse ? "DM sent with AI response" : "DM sent" };
        }
        return { success: false, message: "Failed to send DM" };
      }

      case "REPLY_COMMENT": {
        if (!commentId) return { success: false, message: "No comment to reply to" };
        
        // Use AI response if available, fallback to configured reply
        const replyText = context.aiResponse || node.config?.commentReply || "";
        if (!replyText) return { success: false, message: "No reply text configured" };
        
        // Clear AI response after use (one-time use)
        const usedAiResponse = !!context.aiResponse;
        if (context.aiResponse) delete context.aiResponse;
        
        const result = await replyToComment(commentId, replyText, token);
        if (result.status === 200) {
          await trackResponses(automationId, "COMMENT");
          return { success: true, message: usedAiResponse ? "Comment reply sent with AI response" : "Comment reply sent" };
        }
        return { success: false, message: "Failed to reply to comment" };
      }

      case "SMARTAI": {
        if (context.userSubscription !== "PRO" && context.userSubscription !== "ENTERPRISE") {
          console.log("Smart AI requires PRO/ENTERPRISE subscription, user has:", context.userSubscription);
          return { success: false, message: "Smart AI requires PRO or ENTERPRISE subscription" };
        }

        // Import rate limiter and Gemini dynamically to avoid circular deps
        const { checkRateLimit } = await import("@/lib/rate-limiter");
        const { generatePersonifiedResponse } = await import("@/lib/gemini");
        const { getChatHistory, createChatHistory } = await import("@/actions/webhook/queries");

        // Check AI rate limit (5 requests per minute per user)
        const rateLimitResult = await checkRateLimit(`ai:${senderId}`, "AI");
        if (!rateLimitResult.success) {
          console.log(`Rate limited AI request for sender: ${senderId}`);
          return { success: false, message: "AI rate limited" };
        }

        const prompt = node.config?.message || node.config?.prompt || "";
        if (!prompt) {
          console.log("SmartAI: No prompt configured");
          return { success: false, message: "No prompt configured" };
        }

        console.log("SmartAI: Generating response with prompt:", prompt.substring(0, 50) + "...");
        console.log("SmartAI: User message:", context.messageText);

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
        console.log("SmartAI: Calling Gemini API...");
        let generatedResponse = await generatePersonifiedResponse(
          prompt,
          context.messageText || "",
          chatHistory
        );

        console.log("SmartAI: Gemini response:", generatedResponse ? generatedResponse.substring(0, 100) + "..." : "NULL");

        if (!generatedResponse) {
          // Fallback to OpenAI if Gemini fails
          console.log("SmartAI: Gemini failed, falling back to OpenAI");
          const openaiClient = context.userOpenAiKey
            ? new OpenAI({ apiKey: context.userOpenAiKey })
            : openai;

          try {
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

            generatedResponse = completion.choices[0]?.message?.content || null;
            console.log("SmartAI: OpenAI fallback response:", generatedResponse ? generatedResponse.substring(0, 100) + "..." : "NULL");
          } catch (openaiError) {
            console.error("SmartAI: OpenAI fallback failed:", openaiError);
          }
        }

        // Turn off typing
        try { await sendSenderAction(pageId, senderId, "typing_off", token); } catch (e) {}

        if (!generatedResponse) {
          console.log("SmartAI: No response generated from any AI provider");
          return { success: false, message: "No AI response generated" };
        }

        // Store response in context for downstream nodes (MESSAGE, REPLY_COMMENT)
        // The downstream node (Send DM or Reply Comment) will use this to send
        context.aiResponse = generatedResponse;
        console.log("SmartAI: Stored AI response in context for downstream nodes (Send DM / Reply Comment)");

        // Store messages in chat history for future context
        try {
          await createChatHistory(automationId, senderId, pageId, context.messageText || "");
          await createChatHistory(automationId, pageId, senderId, generatedResponse);
        } catch (e) { console.log("Failed to store chat history:", e); }

        return { success: true, message: "AI response generated - ready for Send DM or Reply Comment" };
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

      case "DELAY": {
        // Delay execution for specified duration
        const delaySeconds = node.config?.delay || node.config?.seconds || 0;
        const delayMs = delaySeconds * 1000;
        
        if (delayMs > 0) {
          console.log(`DELAY: Waiting for ${delaySeconds} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          console.log(`DELAY: Completed ${delaySeconds} second delay`);
          return { success: true, message: `Delayed ${delaySeconds} seconds` };
        }
        return { success: true, message: "No delay configured" };
      }

      default:
        return { success: false, message: `Unknown action type: ${node.subType}` };
    }
  } catch (error) {
    console.error(`Error executing action ${node.subType}:`, error);
    return { success: false, message: `Execution error: ${error}` };
  }
};

// Main flow execution function with proper branching
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

    console.log("=== FLOW EXECUTION DEBUG ===");
    console.log(`Loaded ${nodes.length} nodes, ${edges.length} edges`);

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

    console.log("Flow nodes:");
    flowNodes.forEach(n => console.log(`  - ${n.nodeId}: ${n.type}:${n.subType} (${n.label})`));
    
    console.log("Flow edges:");
    edges.forEach(e => console.log(`  - ${e.sourceNodeId} -> ${e.targetNodeId}`));

    // Check if message matches keywords
    if (context.messageText && !checkKeywordMatch(context.messageText, flowNodes)) {
      return { success: false, message: "Message does not match keywords" };
    }

    // Find trigger node matching the trigger type
    const triggerNode = flowNodes.find(
      (n) => n.type === "trigger" && n.subType === context.triggerType
    );

    if (!triggerNode) {
      console.log(`Available triggers:`, flowNodes.filter(n => n.type === "trigger").map(n => n.subType));
      return { success: false, message: `No ${context.triggerType} trigger found in flow` };
    }

    console.log(`Starting from trigger: ${triggerNode.label} (${triggerNode.nodeId})`);

    // Build adjacency list
    const adjacencyList = buildAdjacencyList(edges);
    
    // Create node lookup map
    const nodeMap = new Map<string, FlowNode>();
    flowNodes.forEach(node => nodeMap.set(node.nodeId, node));

    // Results tracking
    const results: { node: string; success: boolean; message: string }[] = [];
    const visited = new Set<string>();

    // DFS execution with branching support
    const executeNode = async (nodeId: string): Promise<void> => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (!node) return;

      console.log(`Processing: ${node.type}:${node.subType} (${node.label})`);

      // Skip trigger nodes (they're just entry points)
      if (node.type === "trigger") {
        // Continue to children
        const children = adjacencyList.get(nodeId) || [];
        for (const childId of children) {
          await executeNode(childId);
        }
        return;
      }

      // Handle condition nodes with branching
      if (node.type === "condition") {
        // Get children of this condition
        const children = adjacencyList.get(nodeId) || [];
        console.log(`[CONDITION] ${node.label} (${node.subType}) has ${children.length} children`);
        
        // Special handling for YES/NO nodes - they're pass-through to their children
        if (node.subType === "YES" || node.subType === "NO") {
          console.log(`[CONDITION] ${node.subType} branch - executing ${children.length} children`);
          for (const childId of children) {
            await executeNode(childId);
          }
          return;
        }

        // For actual conditions (IS_FOLLOWER, HAS_TAG, etc.)
        console.log(`[CONDITION] Evaluating: ${node.subType}`);
        const conditionResult = await evaluateCondition(node, context);
        console.log(`[CONDITION] ${node.label} result: ${conditionResult ? 'TRUE' : 'FALSE'}`);

        // Categorize children
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

        console.log(`[CONDITION] Branches: YES=${yesBranch ? 'found' : 'none'}, NO=${noBranch ? 'found' : 'none'}, direct=${directChildren.length}`);

        // Execute based on condition result
        if (conditionResult) {
          // TRUE: Execute YES branch if exists, otherwise execute direct children
          if (yesBranch) {
            console.log(`[CONDITION] TRUE -> Taking YES branch`);
            await executeNode(yesBranch);
          } else if (directChildren.length > 0) {
            console.log(`[CONDITION] TRUE -> Executing ${directChildren.length} direct children`);
            for (const childId of directChildren) {
              await executeNode(childId);
            }
          } else {
            console.log(`[CONDITION] TRUE -> No YES branch or direct children to execute`);
          }
        } else {
          // FALSE: Execute NO branch if exists, otherwise skip
          if (noBranch) {
            console.log(`[CONDITION] FALSE -> Taking NO branch`);
            await executeNode(noBranch);
          } else {
            console.log(`[CONDITION] FALSE -> No NO branch, skipping flow`);
          }
        }

        return;
      }

      // Handle action nodes
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

        // Continue to children
        const children = adjacencyList.get(nodeId) || [];
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
