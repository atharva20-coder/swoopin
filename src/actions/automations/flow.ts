"use server";

import { onCurrentUser } from "../user";
import { client } from "@/lib/prisma";

// Save flow nodes and edges to database
export const saveFlowData = async (
  automationId: string,
  nodes: {
    nodeId: string;
    type: string;
    subType: string;
    label: string;
    description?: string;
    positionX: number;
    positionY: number;
    config?: Record<string, any>;
  }[],
  edges: {
    edgeId: string;
    sourceNodeId: string;
    targetNodeId: string;
    sourceHandle?: string;
    targetHandle?: string;
  }[]
) => {
  await onCurrentUser();
  try {
    // Delete existing flow nodes and edges for this automation
    await client.flowEdge.deleteMany({
      where: { automationId },
    });
    await client.flowNode.deleteMany({
      where: { automationId },
    });

    // Insert new nodes
    if (nodes.length > 0) {
      await client.flowNode.createMany({
        data: nodes.map((node) => ({
          automationId,
          nodeId: node.nodeId,
          type: node.type,
          subType: node.subType,
          label: node.label,
          description: node.description || undefined,
          positionX: node.positionX,
          positionY: node.positionY,
          config: node.config || undefined,
        })),
      });
    }

    // Insert new edges
    if (edges.length > 0) {
      await client.flowEdge.createMany({
        data: edges.map((edge) => ({
          automationId,
          edgeId: edge.edgeId,
          sourceNodeId: edge.sourceNodeId,
          targetNodeId: edge.targetNodeId,
          sourceHandle: edge.sourceHandle || null,
          targetHandle: edge.targetHandle || null,
        })),
      });
    }

    return { status: 200, data: "Flow saved successfully" };
  } catch (error) {
    console.error("Error saving flow data:", error);
    return { status: 500, data: "Failed to save flow data" };
  }
};

/**
 * Batch save all automation flow data in a single server call
 * This replaces multiple sequential calls to reduce API usage
 */
export const saveAutomationFlowBatch = async (
  automationId: string,
  payload: {
    nodes: {
      nodeId: string;
      type: string;
      subType: string;
      label: string;
      description?: string;
      positionX: number;
      positionY: number;
      config?: Record<string, any>;
    }[];
    edges: {
      edgeId: string;
      sourceNodeId: string;
      targetNodeId: string;
      sourceHandle?: string;
      targetHandle?: string;
    }[];
    triggers: string[];
    keywords: string[];
    listener?: {
      type: "MESSAGE" | "SMARTAI" | "CAROUSEL";
      prompt: string;
      reply: string;
      carouselTemplateId?: string;
    };
  }
) => {
  await onCurrentUser();
  
  try {
    // Use a transaction to ensure atomicity
    await client.$transaction(async (tx) => {
      // 1. Save flow nodes and edges
      await tx.flowEdge.deleteMany({ where: { automationId } });
      await tx.flowNode.deleteMany({ where: { automationId } });
      
      if (payload.nodes.length > 0) {
        await tx.flowNode.createMany({
          data: payload.nodes.map((node) => ({
            automationId,
            nodeId: node.nodeId,
            type: node.type,
            subType: node.subType,
            label: node.label,
            description: node.description || undefined,
            positionX: node.positionX,
            positionY: node.positionY,
            config: node.config || undefined,
          })),
        });
      }

      if (payload.edges.length > 0) {
        await tx.flowEdge.createMany({
          data: payload.edges.map((edge) => ({
            automationId,
            edgeId: edge.edgeId,
            sourceNodeId: edge.sourceNodeId,
            targetNodeId: edge.targetNodeId,
            sourceHandle: edge.sourceHandle || null,
            targetHandle: edge.targetHandle || null,
          })),
        });
      }

      // 2. Sync triggers - remove old, add new
      await tx.trigger.deleteMany({ where: { automationId } });
      for (const triggerType of payload.triggers) {
        await tx.trigger.create({
          data: {
            automationId,
            type: triggerType as "DM" | "COMMENT",
          },
        });
      }

      // 3. Sync keywords - check for existing and add new ones
      const existingKeywords = await tx.keyword.findMany({
        where: { automationId },
        select: { word: true },
      });
      const existingWords = new Set(existingKeywords.map(k => k.word?.toLowerCase()));
      
      for (const keyword of payload.keywords) {
        if (keyword && !existingWords.has(keyword.toLowerCase())) {
          await tx.keyword.create({
            data: {
              automationId,
              word: keyword,
            },
          });
        }
      }

      // 4. Upsert listener if provided
      if (payload.listener) {
        const existingListener = await tx.listener.findFirst({
          where: { automationId },
        });

        if (existingListener) {
          await tx.listener.update({
            where: { id: existingListener.id },
            data: {
              listener: payload.listener.type,
              prompt: payload.listener.prompt,
              commentReply: payload.listener.reply || null,
            },
          });
        } else {
          await tx.listener.create({
            data: {
              automationId,
              listener: payload.listener.type,
              prompt: payload.listener.prompt,
              commentReply: payload.listener.reply || null,
            },
          });
        }
      }
    });

    return { status: 200, data: "Flow saved successfully" };
  } catch (error) {
    console.error("Error saving automation flow batch:", error);
    return { status: 500, data: "Failed to save flow" };
  }
};

// Load flow nodes and edges from database
export const getFlowData = async (automationId: string) => {
  await onCurrentUser();
  try {
    const nodes = await client.flowNode.findMany({
      where: { automationId },
      orderBy: { createdAt: "asc" },
    });

    const edges = await client.flowEdge.findMany({
      where: { automationId },
      orderBy: { createdAt: "asc" },
    });

    return {
      status: 200,
      data: {
        nodes: nodes.map((node) => ({
          id: node.nodeId,
          type: "custom",
          position: { x: node.positionX, y: node.positionY },
          data: {
            label: node.label,
            type: node.type,
            subType: node.subType,
            description: node.description,
            config: node.config as Record<string, any> || {},
            nodeId: node.id,
          },
        })),
        edges: edges.map((edge) => ({
          id: edge.edgeId,
          source: edge.sourceNodeId,
          target: edge.targetNodeId,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          animated: true,
          type: "smoothstep",
          style: { stroke: "#6366f1", strokeWidth: 2 },
        })),
      },
    };
  } catch (error) {
    console.error("Error loading flow data:", error);
    return { status: 500, data: { nodes: [], edges: [] } };
  }
};

// Delete a specific flow node and its connected edges
export const deleteFlowNode = async (automationId: string, nodeId: string) => {
  await onCurrentUser();
  try {
    // Delete edges connected to this node
    await client.flowEdge.deleteMany({
      where: {
        automationId,
        OR: [
          { sourceNodeId: nodeId },
          { targetNodeId: nodeId },
        ],
      },
    });

    // Delete the node
    await client.flowNode.deleteMany({
      where: {
        automationId,
        nodeId,
      },
    });

    return { status: 200, data: "Node deleted successfully" };
  } catch (error) {
    console.error("Error deleting node:", error);
    return { status: 500, data: "Failed to delete node" };
  }
};

// Get flow execution path for an automation based on trigger type
export const getFlowExecutionPath = async (
  automationId: string,
  triggerType: "DM" | "COMMENT"
) => {
  try {
    const nodes = await client.flowNode.findMany({
      where: { automationId },
    });

    const edges = await client.flowEdge.findMany({
      where: { automationId },
    });

    // Find the trigger node that matches the trigger type
    const triggerNode = nodes.find(
      (n) => n.type === "trigger" && n.subType === triggerType
    );

    if (!triggerNode) {
      return { status: 404, path: [], message: "No matching trigger found" };
    }

    // Build adjacency list for graph traversal
    const adjacencyList = new Map<string, string[]>();
    edges.forEach((edge) => {
      const current = adjacencyList.get(edge.sourceNodeId) || [];
      current.push(edge.targetNodeId);
      adjacencyList.set(edge.sourceNodeId, current);
    });

    // BFS to find all reachable nodes from trigger
    const executionPath: typeof nodes = [];
    const visited = new Set<string>();
    const queue = [triggerNode.nodeId];

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      if (visited.has(currentNodeId)) continue;
      visited.add(currentNodeId);

      const node = nodes.find((n) => n.nodeId === currentNodeId);
      if (node) {
        executionPath.push(node);
        const neighbors = adjacencyList.get(currentNodeId) || [];
        queue.push(...neighbors);
      }
    }

    return {
      status: 200,
      path: executionPath.map((node) => ({
        nodeId: node.nodeId,
        type: node.type,
        subType: node.subType,
        label: node.label,
        config: node.config as Record<string, any> || {},
      })),
    };
  } catch (error) {
    console.error("Error getting execution path:", error);
    return { status: 500, path: [], message: "Failed to get execution path" };
  }
};
