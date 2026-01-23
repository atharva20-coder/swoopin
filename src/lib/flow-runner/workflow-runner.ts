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
import {
  validateFlowForExecution,
  PLAN_LIMITS,
  type PlanType,
} from "./flow-validator";

// =============================================================================
// WORKFLOW RUNNER CLASS
// =============================================================================

export class WorkflowRunner {
  private nodes: Map<string, FlowNodeRuntime>;
  private adjacencyList: Map<string, string[]>;
  private context: ExecutionContext;
  private nodeLogs: Record<string, ExecutionLogEntry[]> = {};
  private visited: Set<string> = new Set();
  private currentDepth: number = 0;
  private maxDepthLimit: number;
  private nodesArray: FlowNodeRuntime[];
  private edgesArray: FlowEdgeRuntime[];

  constructor(
    nodes: FlowNodeRuntime[],
    edges: FlowEdgeRuntime[],
    context: ExecutionContext,
  ) {
    this.context = context;
    this.nodesArray = nodes;
    this.edgesArray = edges;

    // Determine plan-based depth limit
    const plan = (context.userSubscription as PlanType) || "FREE";
    this.maxDepthLimit =
      PLAN_LIMITS[plan]?.maxDepth || PLAN_LIMITS.FREE.maxDepth;

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

    // Runtime validation (Zero-Patchwork: validate at gateway)
    const plan = (this.context.userSubscription as PlanType) || "FREE";
    const validation = validateFlowForExecution(
      this.nodesArray,
      this.edgesArray,
      plan,
    );

    if (!validation.canExecute) {
      console.error(
        "[WorkflowRunner] Flow validation failed:",
        validation.error,
      );
      return {
        success: false,
        message: validation.error || "Flow validation failed",
        executionTimeMs: Date.now() - startTime,
        error: {
          code: "VALIDATION_ERROR",
          message: validation.error || "Flow validation failed",
        },
      };
    }

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
    depth: number = 0,
  ): Promise<FlowExecutionResult> {
    // Depth limit check (runtime safety)
    if (depth > this.maxDepthLimit) {
      console.error(
        `[WorkflowRunner] Max depth exceeded: ${depth} > ${this.maxDepthLimit}`,
      );
      return {
        success: false,
        message: `Execution depth limit exceeded (max: ${this.maxDepthLimit} nodes). Upgrade your plan for deeper flows.`,
        error: {
          code: "DEPTH_LIMIT_EXCEEDED",
          message: `Max depth of ${this.maxDepthLimit} nodes exceeded`,
        },
      };
    }

    // Prevent cycles
    if (this.visited.has(nodeId)) {
      return { success: true, message: "Already visited node" };
    }
    this.visited.add(nodeId);

    const node = this.nodes.get(nodeId);
    if (!node) {
      return { success: false, message: `Node not found: ${nodeId}` };
    }

    console.log(
      `[WorkflowRunner] Executing node: ${node.subType} (${nodeId}) [depth: ${depth}]`,
    );

    // Skip trigger nodes (they don't execute, just start the flow)
    // For triggers, we execute ALL children (branches) even if some fail
    // This enables branching like: Keyword Match → Send DM vs SmartAI → Send DM
    if (node.type === "trigger") {
      const children = this.adjacencyList.get(nodeId) || [];
      let anySucceeded = false;
      let lastError: FlowExecutionResult | null = null;

      for (const childId of children) {
        const result = await this.executeFromNode(
          childId,
          inputItems,
          depth + 1,
        );
        if (result.success) {
          anySucceeded = true;
        } else {
          // Log but continue - other branches may succeed
          console.log(
            `[WorkflowRunner] Branch ${childId} stopped:`,
            result.message,
          );
          lastError = result;
        }
      }

      // Consider trigger successful if any branch succeeded
      if (anySucceeded) {
        return { success: true, message: "Trigger processed" };
      }

      // If no branches succeeded, return the last error
      return lastError || { success: false, message: "No branches executed" };
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
          const result = await this.executeFromNode(
            childId,
            outputItems,
            depth + 1,
          );
          if (!result.success) return result;
        } else if (childNode?.subType === "NO" && !conditionResult) {
          const result = await this.executeFromNode(
            childId,
            outputItems,
            depth + 1,
          );
          if (!result.success) return result;
        } else if (
          childNode?.subType !== "YES" &&
          childNode?.subType !== "NO"
        ) {
          // Non-branching child, always execute if condition passed
          if (conditionResult) {
            const result = await this.executeFromNode(
              childId,
              outputItems,
              depth + 1,
            );
            if (!result.success) return result;
          }
        }
      }

      return { success: true, message: "Condition evaluated" };
    }

    // n8n-style: If node outputs empty items, skip children (branch ends gracefully)
    if (outputItems.length === 0) {
      console.log(
        `[WorkflowRunner] Node ${node.subType} output empty - branch ends`,
      );
      return {
        success: true,
        message: `Node ${node.subType} completed (branch ended)`,
      };
    }

    // Execute all children (parallel branching - all branches run)
    // This enables nodes with multiple children to all execute
    const children = this.adjacencyList.get(nodeId) || [];

    // If no children, node is a terminal/leaf node - success
    if (children.length === 0) {
      return {
        success: true,
        message: `Node ${node.subType} completed (terminal)`,
      };
    }

    let anyChildSucceeded = false;

    for (const childId of children) {
      const result = await this.executeFromNode(
        childId,
        outputItems,
        depth + 1,
      );
      if (result.success) {
        anyChildSucceeded = true;
      } else {
        console.log(
          `[WorkflowRunner] Child branch ${childId} stopped:`,
          result.message,
        );
      }
    }

    // Node succeeds if it executed (we already checked for empty items above)
    return { success: true, message: `Node ${node.subType} completed` };
  }

  /**
   * Find the trigger node that matches the current context.
   */
  private findTriggerNode(): FlowNodeRuntime | undefined {
    const nodeArray = Array.from(this.nodes.values());
    for (const node of nodeArray) {
      // Logic update: Allow "filter" nodes like KEYWORDS to be triggers
      // if they match the context trigger type.
      // This respects the "Valve as Source" metaphor when the valve IS the event.
      const isMatchingTrigger =
        node.type === "trigger" && node.subType === this.context.triggerType;

      const isMatchingFilter =
        (node.type === "filter" || node.subType === "KEYWORDS") &&
        node.subType === this.context.triggerType;

      if (isMatchingTrigger || isMatchingFilter) {
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
