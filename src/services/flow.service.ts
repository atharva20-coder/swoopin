import { client } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  type FlowNodeInput,
  type FlowEdgeInput,
  type SaveFlowBatchRequest,
  type TriggerType,
} from "@/schemas/flow.schema";

/**
 * ============================================
 * FLOW SERVICE
 * Business logic for automation flow builder
 * IDOR protection via automationId ownership checks
 * Zero patchwork - all transformations via Zod schemas
 * ============================================
 */

class FlowService {
  /**
   * Verify automation belongs to user
   * IDOR: Critical ownership check
   */
  private async verifyAutomationOwnership(
    automationId: string,
    userId: string
  ): Promise<boolean> {
    const automation = await client.automation.findFirst({
      where: { id: automationId, userId },
    });
    return !!automation;
  }

  /**
   * Save flow nodes and edges
   * IDOR: Verifies automation belongs to user
   */
  async saveFlowData(
    userId: string,
    automationId: string,
    nodes: FlowNodeInput[],
    edges: FlowEdgeInput[]
  ): Promise<{ saved: boolean } | { error: string }> {
    // IDOR check
    const isOwner = await this.verifyAutomationOwnership(automationId, userId);
    if (!isOwner) {
      return { error: "Automation not found" };
    }

    try {
      // Delete existing flow data
      await client.flowEdge.deleteMany({ where: { automationId } });
      await client.flowNode.deleteMany({ where: { automationId } });

      // Insert new nodes (data already transformed by Zod)
      if (nodes.length > 0) {
        await client.flowNode.createMany({
          data: nodes.map((node) => ({
            automationId,
            nodeId: node.nodeId,
            type: node.type,
            subType: node.subType,
            label: node.label,
            description: node.description,
            positionX: node.positionX,
            positionY: node.positionY,
            config: node.config,
          })),
        });
      }

      // Insert new edges (data already transformed by Zod)
      if (edges.length > 0) {
        await client.flowEdge.createMany({
          data: edges.map((edge) => ({
            automationId,
            edgeId: edge.edgeId,
            sourceNodeId: edge.sourceNodeId,
            targetNodeId: edge.targetNodeId,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
          })),
        });
      }

      return { saved: true };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error saving flow data:", error.message);
      }
      return { error: "Failed to save flow data" };
    }
  }

  /**
   * Batch save all automation flow data in a single transaction
   * IDOR: Verifies automation belongs to user
   */
  async saveFlowBatch(
    userId: string,
    automationId: string,
    payload: SaveFlowBatchRequest
  ): Promise<{ saved: boolean } | { error: string }> {
    // IDOR check
    const isOwner = await this.verifyAutomationOwnership(automationId, userId);
    if (!isOwner) {
      return { error: "Automation not found" };
    }

    try {
      await client.$transaction(
        async (tx) => {
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
                description: node.description,
                positionX: node.positionX,
                positionY: node.positionY,
                config: node.config,
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
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
              })),
            });
          }

          // 2. Sync triggers
          await tx.trigger.deleteMany({ where: { automationId } });
          if (payload.triggers.length > 0) {
            await tx.trigger.createMany({
              data: payload.triggers.map((triggerType) => ({
                automationId,
                type: triggerType,
              })),
            });
          }

          // 3. Sync keywords
          await tx.keyword.deleteMany({ where: { automationId } });
          const uniqueKeywords = Array.from(
            new Set(payload.keywords.filter((k) => k && k.trim()))
          );
          if (uniqueKeywords.length > 0) {
            await tx.keyword.createMany({
              data: uniqueKeywords.map((keyword) => ({
                automationId,
                word: keyword,
              })),
            });
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
                  commentReply: payload.listener.reply,
                },
              });
            } else {
              await tx.listener.create({
                data: {
                  automationId,
                  listener: payload.listener.type,
                  prompt: payload.listener.prompt,
                  commentReply: payload.listener.reply,
                },
              });
            }
          }
        },
        {
          maxWait: 10000,
          timeout: 30000,
        }
      );

      return { saved: true };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error saving automation flow batch:", error.message);
      }
      return { error: "Failed to save flow" };
    }
  }

  /**
   * Load flow nodes and edges from database
   * IDOR: Verifies automation belongs to user
   */
  async getFlowData(
    userId: string,
    automationId: string
  ): Promise<
    | {
        nodes: Array<{
          id: string;
          type: "custom";
          position: { x: number; y: number };
          data: {
            label: string;
            type: string;
            subType: string;
            description: string | null;
            config: Record<string, unknown>;
            nodeId: string;
          };
        }>;
        edges: Array<{
          id: string;
          source: string;
          target: string;
          sourceHandle: string | null;
          targetHandle: string | null;
          animated: boolean;
          type: "smoothstep";
          style: { stroke: string; strokeWidth: number };
        }>;
      }
    | { error: string }
  > {
    // IDOR check
    const isOwner = await this.verifyAutomationOwnership(automationId, userId);
    if (!isOwner) {
      return { error: "Automation not found" };
    }

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
        nodes: nodes.map((node) => ({
          id: node.nodeId,
          type: "custom" as const,
          position: { x: node.positionX, y: node.positionY },
          data: {
            label: node.label,
            type: node.type,
            subType: node.subType,
            description: node.description,
            config: (node.config as Record<string, unknown>) || {},
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
          type: "smoothstep" as const,
          style: { stroke: "#6366f1", strokeWidth: 2 },
        })),
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error loading flow data:", error.message);
      }
      return { error: "Failed to load flow data" };
    }
  }

  /**
   * Delete a specific flow node and its connected edges
   * IDOR: Verifies automation belongs to user
   */
  async deleteFlowNode(
    userId: string,
    automationId: string,
    nodeId: string
  ): Promise<{ deleted: boolean } | { error: string }> {
    // IDOR check
    const isOwner = await this.verifyAutomationOwnership(automationId, userId);
    if (!isOwner) {
      return { error: "Automation not found" };
    }

    try {
      // Delete edges connected to this node
      await client.flowEdge.deleteMany({
        where: {
          automationId,
          OR: [{ sourceNodeId: nodeId }, { targetNodeId: nodeId }],
        },
      });

      // Delete the node
      await client.flowNode.deleteMany({
        where: {
          automationId,
          nodeId,
        },
      });

      return { deleted: true };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error deleting node:", error.message);
      }
      return { error: "Failed to delete node" };
    }
  }

  /**
   * Get flow execution path for an automation based on trigger type
   * Note: No IDOR check - used by system for execution
   */
  async getFlowExecutionPath(
    automationId: string,
    triggerType: TriggerType
  ): Promise<
    | {
        path: Array<{
          nodeId: string;
          type: string;
          subType: string;
          label: string;
          config: Record<string, unknown>;
        }>;
      }
    | { error: string }
  > {
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
        return { error: "No matching trigger found" };
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
        path: executionPath.map((node) => ({
          nodeId: node.nodeId,
          type: node.type,
          subType: node.subType,
          label: node.label,
          config: (node.config as Record<string, unknown>) || {},
        })),
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error getting execution path:", error.message);
      }
      return { error: "Failed to get execution path" };
    }
  }
}

export const flowService = new FlowService();
