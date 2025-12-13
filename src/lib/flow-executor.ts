import { client } from "@/lib/prisma";
import { sendDM, sendPrivateMessage, replyToComment, sendCarouselMessage } from "@/lib/fetch";
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

        const prompt = node.config?.message || node.config?.prompt || "";
        if (!prompt) return { success: false, message: "No prompt configured" };

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

        const aiResponse = completion.choices[0]?.message?.content;
        if (!aiResponse) return { success: false, message: "No AI response" };

        const result = await sendDM(pageId, senderId, aiResponse, token);
        if (result.status === 200) {
          await trackResponses(automationId, "DM");
          await trackAnalytics(userId, "dm").catch(console.error);
          return { success: true, message: "Smart AI response sent" };
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

        const carouselElements = template.elements.map((element) => ({
          title: element.title,
          subtitle: element.subtitle || undefined,
          imageUrl: element.imageUrl || undefined,
          defaultAction: element.defaultAction || undefined,
          buttons: element.buttons.map((button) => ({
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
  console.log("=== FLOW EXECUTOR START ===");
  console.log("Automation ID:", automationId);
  console.log("Trigger type:", context.triggerType);
  console.log("Message:", context.messageText);
  
  try {
    // Load flow data
    const nodes = await client.flowNode.findMany({
      where: { automationId },
    });

    const edges = await client.flowEdge.findMany({
      where: { automationId },
    });

    console.log("Found", nodes.length, "nodes and", edges.length, "edges");

    // If no flow nodes, fall back to legacy execution
    if (nodes.length === 0) {
      console.log("No flow nodes found - falling back to legacy");
      return { success: false, message: "No flow nodes found - using legacy execution" };
    }

    // Convert to execution format
    const flowNodes: FlowNode[] = nodes.map((n) => ({
      nodeId: n.nodeId,
      type: n.type,
      subType: n.subType,
      label: n.label,
      config: (n.config as Record<string, any>) || {},
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

    // Execute action nodes in order
    const actionNodes = executionPath.filter((n) => n.type === "action");
    const results: { node: string; success: boolean; message: string }[] = [];

    for (const actionNode of actionNodes) {
      const result = await executeActionNode(actionNode, context);
      results.push({
        node: actionNode.label,
        success: result.success,
        message: result.message,
      });

      if (result.success) {
        console.log(`✓ Executed: ${actionNode.label}`);
      } else {
        console.log(`✗ Failed: ${actionNode.label} - ${result.message}`);
      }
    }

    const successCount = results.filter((r) => r.success).length;
    return {
      success: successCount > 0,
      message: `Executed ${successCount}/${actionNodes.length} actions`,
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
