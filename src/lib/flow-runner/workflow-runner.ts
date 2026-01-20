/**
 * ============================================
 * WORKFLOW RUNNER
 * Decoupled graph traversal engine.
 * Executes flow nodes in order using the node registry.
 * ============================================
 */

import type {
  FlowNodeRuntime,
  FlowEdgeRuntime,
  ExecutionContext,
  FlowExecutionResult,
  ItemData,
  ExecutionLogEntry,
} from "./types";
import { getExecutorForNode } from "./node-registry";

// =============================================================================
// WORKFLOW RUNNER CLASS
// =============================================================================

export class WorkflowRunner {
  private nodes: Map<string, FlowNodeRuntime>;
  private adjacencyList: Map<string, string[]>;
  private context: ExecutionContext;
  private nodeLogs: Record<string, ExecutionLogEntry[]> = {};
  private visited: Set<string> = new Set();

  constructor(
    nodes: FlowNodeRuntime[],
    edges: FlowEdgeRuntime[],
    context: ExecutionContext,
  ) {
    this.context = context;

    // Build node map for O(1) lookup
    this.nodes = new Map();
    nodes.forEach((node) => this.nodes.set(node.nodeId, node));

    // Build adjacency list for graph traversal
    this.adjacencyList = new Map();
    edges.forEach((edge) => {
      const current = this.adjacencyList.get(edge.sourceNodeId) || [];
      current.push(edge.targetNodeId);
      this.adjacencyList.set(edge.sourceNodeId, current);
    });
  }

  /**
   * Execute the entire flow starting from the trigger node.
   */
  async run(): Promise<FlowExecutionResult> {
    const startTime = Date.now();

    // Find trigger node matching the context's trigger type
    const triggerNode = this.findTriggerNode();

    if (!triggerNode) {
      return {
        success: false,
        message: `No ${this.context.triggerType} trigger found in flow`,
        executionTimeMs: Date.now() - startTime,
      };
    }

    console.log(
      `[WorkflowRunner] Starting flow from trigger: ${triggerNode.nodeId}`,
    );

    // Initial items (empty, will be populated by trigger)
    let currentItems: ItemData[] = [
      {
        json: {
          messageText: this.context.messageText,
          senderId: this.context.senderId,
          commentId: this.context.commentId,
          mediaId: this.context.mediaId,
          triggerType: this.context.triggerType,
        },
      },
    ];

    try {
      const result = await this.executeFromNode(
        triggerNode.nodeId,
        currentItems,
      );

      return {
        ...result,
        nodeLogs: this.nodeLogs,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error("[WorkflowRunner] Execution error:", error);

      return {
        success: false,
        message: `Flow execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        nodeLogs: this.nodeLogs,
        executionTimeMs: Date.now() - startTime,
        error: {
          code: "EXECUTION_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Execute flow starting from a specific node (recursive BFS).
   */
  private async executeFromNode(
    nodeId: string,
    inputItems: ItemData[],
  ): Promise<FlowExecutionResult> {
    // Prevent cycles
    if (this.visited.has(nodeId)) {
      return { success: true, message: "Already visited node" };
    }
    this.visited.add(nodeId);

    const node = this.nodes.get(nodeId);
    if (!node) {
      return { success: false, message: `Node not found: ${nodeId}` };
    }

    console.log(`[WorkflowRunner] Executing node: ${node.subType} (${nodeId})`);

    // Skip trigger nodes (they don't execute, just start the flow)
    if (node.type === "trigger") {
      const children = this.adjacencyList.get(nodeId) || [];
      for (const childId of children) {
        const result = await this.executeFromNode(childId, inputItems);
        if (!result.success) return result;
      }
      return { success: true, message: "Trigger processed" };
    }

    // Get the executor for this node type
    const executor = getExecutorForNode(node);

    let outputItems: ItemData[] = inputItems;

    if (executor) {
      // New architecture: use the registered executor
      const result = await executor.execute(
        node.config,
        inputItems,
        this.context,
      );

      // Store logs for UI
      if (result.logs) {
        this.nodeLogs[nodeId] = result.logs;
      }

      if (!result.success) {
        return {
          success: false,
          message: result.message || `Node ${node.subType} failed`,
          error: {
            nodeId,
            code: "NODE_EXECUTION_FAILED",
            message: result.message || "Unknown error",
          },
        };
      }

      outputItems = result.items;
    } else {
      // Fallback: Node not yet migrated, use legacy executor
      console.log(
        `[WorkflowRunner] Falling back to legacy executor for: ${node.subType}`,
      );
      const legacyResult = await this.executeLegacyNode(node, inputItems);

      if (!legacyResult.success) {
        return {
          success: false,
          message: legacyResult.message,
          error: {
            nodeId,
            code: "LEGACY_NODE_FAILED",
            message: legacyResult.message,
          },
        };
      }

      outputItems = legacyResult.items;
    }

    // Handle condition nodes (YES/NO branching)
    if (node.type === "condition") {
      const conditionResult = outputItems[0]?.json?.conditionResult as boolean;
      const children = this.adjacencyList.get(nodeId) || [];

      for (const childId of children) {
        const childNode = this.nodes.get(childId);

        // Route based on condition result
        if (childNode?.subType === "YES" && conditionResult) {
          const result = await this.executeFromNode(childId, outputItems);
          if (!result.success) return result;
        } else if (childNode?.subType === "NO" && !conditionResult) {
          const result = await this.executeFromNode(childId, outputItems);
          if (!result.success) return result;
        } else if (
          childNode?.subType !== "YES" &&
          childNode?.subType !== "NO"
        ) {
          // Non-branching child, always execute if condition passed
          if (conditionResult) {
            const result = await this.executeFromNode(childId, outputItems);
            if (!result.success) return result;
          }
        }
      }

      return { success: true, message: "Condition evaluated" };
    }

    // Execute all children (sequential execution)
    const children = this.adjacencyList.get(nodeId) || [];
    for (const childId of children) {
      const result = await this.executeFromNode(childId, outputItems);
      if (!result.success) return result;
    }

    return { success: true, message: `Node ${node.subType} completed` };
  }

  /**
   * Find the trigger node that matches the current context.
   */
  private findTriggerNode(): FlowNodeRuntime | undefined {
    const nodeArray = Array.from(this.nodes.values());
    for (const node of nodeArray) {
      if (
        node.type === "trigger" &&
        node.subType === this.context.triggerType
      ) {
        return node;
      }
    }
    return undefined;
  }

  /**
   * Fallback executor for nodes not yet migrated to new architecture.
   * This will be removed once all nodes are migrated.
   */
  private async executeLegacyNode(
    node: FlowNodeRuntime,
    items: ItemData[],
  ): Promise<{ success: boolean; message: string; items: ItemData[] }> {
    // Import legacy executor dynamically
    const { executeActionNode } = await import("./legacy-executor");

    const result = await executeActionNode(
      {
        nodeId: node.nodeId,
        type: node.type,
        subType: node.subType,
        label: node.label,
        config: node.config,
      },
      this.context,
    );

    return {
      success: result.success,
      message: result.message,
      items: result.success ? items : [],
    };
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create and run a workflow from flow data.
 */
export async function runWorkflow(
  nodes: FlowNodeRuntime[],
  edges: FlowEdgeRuntime[],
  context: ExecutionContext,
): Promise<FlowExecutionResult> {
  const runner = new WorkflowRunner(nodes, edges, context);
  return runner.run();
}
