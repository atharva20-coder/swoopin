/**
 * ============================================
 * FLOW VALIDATOR
 * Validates flow structure and configuration
 * following the Zero-Patchwork Protocol.
 *
 * All validation happens HERE at the gateway,
 * keeping the execution core pure.
 * ============================================
 */

import { z } from "zod";
import type { FlowNodeRuntime, FlowEdgeRuntime } from "./types";

// =============================================================================
// VALIDATION RESULT TYPES
// =============================================================================

export interface FlowValidationError {
  code: string;
  message: string;
  nodeId?: string;
  severity: "error" | "warning";
}

export interface FlowValidationResult {
  valid: boolean;
  errors: FlowValidationError[];
  warnings: FlowValidationError[];
}

// =============================================================================
// TIER-BASED LIMITS
// =============================================================================

export const PLAN_LIMITS = {
  FREE: {
    maxNodes: 7,
    maxDepth: 7,
  },
  PRO: {
    maxNodes: 17,
    maxDepth: 17,
  },
  ENTERPRISE: {
    maxNodes: 30,
    maxDepth: 30,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

// =============================================================================
// CYCLE DETECTION (DAG ENFORCEMENT)
// =============================================================================

/**
 * Detect cycles in the flow graph using DFS with coloring.
 * WHITE (0) = unvisited
 * GRAY (1) = in current path (visiting)
 * BLACK (2) = fully processed
 */
export function detectCycles(
  nodes: FlowNodeRuntime[],
  edges: FlowEdgeRuntime[],
): { hasCycle: boolean; cycleNodes: string[] } {
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;

  const color = new Map<string, number>();
  const parent = new Map<string, string | null>();
  const cycleNodes: string[] = [];

  // Build adjacency list
  const adjacency = new Map<string, string[]>();
  nodes.forEach((n) => {
    color.set(n.nodeId, WHITE);
    adjacency.set(n.nodeId, []);
  });

  edges.forEach((e) => {
    const current = adjacency.get(e.sourceNodeId) || [];
    current.push(e.targetNodeId);
    adjacency.set(e.sourceNodeId, current);
  });

  let hasCycle = false;

  function dfs(nodeId: string): boolean {
    color.set(nodeId, GRAY);

    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (color.get(neighbor) === GRAY) {
        // Back edge found - cycle detected
        hasCycle = true;
        cycleNodes.push(neighbor);
        cycleNodes.push(nodeId);
        return true;
      }
      if (color.get(neighbor) === WHITE) {
        parent.set(neighbor, nodeId);
        if (dfs(neighbor)) {
          return true;
        }
      }
    }

    color.set(nodeId, BLACK);
    return false;
  }

  // Run DFS from each unvisited node
  for (const nodeId of color.keys()) {
    if (color.get(nodeId) === WHITE) {
      if (dfs(nodeId)) {
        break;
      }
    }
  }

  return { hasCycle, cycleNodes: [...new Set(cycleNodes)] };
}

// =============================================================================
// ORPHAN DETECTION
// =============================================================================

/**
 * Find nodes that are not reachable from any trigger node.
 */
export function findOrphanedNodes(
  nodes: FlowNodeRuntime[],
  edges: FlowEdgeRuntime[],
): string[] {
  // Find all trigger nodes
  const triggerNodes = nodes.filter((n) => n.type === "trigger");

  if (triggerNodes.length === 0) {
    // If no triggers, all nodes are effectively orphaned
    return nodes.map((n) => n.nodeId);
  }

  // Build adjacency list
  const adjacency = new Map<string, string[]>();
  nodes.forEach((n) => adjacency.set(n.nodeId, []));
  edges.forEach((e) => {
    const current = adjacency.get(e.sourceNodeId) || [];
    current.push(e.targetNodeId);
    adjacency.set(e.sourceNodeId, current);
  });

  // BFS from all trigger nodes
  const reachable = new Set<string>();
  const queue: string[] = triggerNodes.map((t) => t.nodeId);

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (reachable.has(nodeId)) continue;
    reachable.add(nodeId);

    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!reachable.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }

  // Find orphaned nodes (not reachable from any trigger)
  const orphaned = nodes
    .filter((n) => !reachable.has(n.nodeId))
    .map((n) => n.nodeId);

  return orphaned;
}

// =============================================================================
// DEAD END DETECTION
// =============================================================================

/**
 * Find condition nodes that don't have all required outgoing branches.
 */
export function findDeadEnds(
  nodes: FlowNodeRuntime[],
  edges: FlowEdgeRuntime[],
): FlowValidationError[] {
  const errors: FlowValidationError[] = [];

  // Build outgoing edge map
  const outgoingEdges = new Map<string, FlowEdgeRuntime[]>();
  edges.forEach((e) => {
    const current = outgoingEdges.get(e.sourceNodeId) || [];
    current.push(e);
    outgoingEdges.set(e.sourceNodeId, current);
  });

  for (const node of nodes) {
    const outgoing = outgoingEdges.get(node.nodeId) || [];

    // Condition nodes should have children connected
    if (
      node.type === "condition" &&
      node.subType !== "YES" &&
      node.subType !== "NO"
    ) {
      // Check if this is a branching condition that needs downstream nodes
      if (outgoing.length === 0) {
        errors.push({
          code: "DEAD_END",
          message: `Condition node "${node.label}" has no outgoing connections`,
          nodeId: node.nodeId,
          severity: "warning",
        });
      }
    }

    // Action nodes at the end of a branch are ok (terminal nodes)
    // But check if they have required config
    if (node.type === "action") {
      const config = node.config || {};

      // Check specific action types for required config
      if (node.subType === "MESSAGE" && !config.message) {
        errors.push({
          code: "MISSING_CONFIG",
          message: `Send DM node "${node.label}" has no message configured`,
          nodeId: node.nodeId,
          severity: "warning",
        });
      }

      if (node.subType === "SMARTAI" && !config.message && !config.prompt) {
        errors.push({
          code: "MISSING_CONFIG",
          message: `Smart AI node "${node.label}" has no prompt configured`,
          nodeId: node.nodeId,
          severity: "warning",
        });
      }

      if (node.subType === "REPLY_COMMENT" && !config.commentReply) {
        errors.push({
          code: "MISSING_CONFIG",
          message: `Reply Comment node "${node.label}" has no reply text configured`,
          nodeId: node.nodeId,
          severity: "warning",
        });
      }
    }

    // KEYWORDS node should have at least one keyword
    if (node.subType === "KEYWORDS") {
      const keywords = (node.config?.keywords as string[]) || [];
      if (keywords.length === 0) {
        errors.push({
          code: "MISSING_CONFIG",
          message: `Keyword Match node "${node.label}" has no keywords configured`,
          nodeId: node.nodeId,
          severity: "warning",
        });
      }
    }
  }

  return errors;
}

// =============================================================================
// NODE COUNT VALIDATION
// =============================================================================

/**
 * Check if node count exceeds plan limits.
 */
export function validateNodeCount(
  nodes: FlowNodeRuntime[],
  plan: PlanType = "FREE",
): FlowValidationError | null {
  const limits = PLAN_LIMITS[plan];

  if (nodes.length > limits.maxNodes) {
    return {
      code: "NODE_LIMIT_EXCEEDED",
      message: `Flow has ${nodes.length} nodes, but your ${plan} plan allows maximum ${limits.maxNodes} nodes`,
      severity: "error",
    };
  }

  return null;
}

// =============================================================================
// MAX DEPTH CALCULATION
// =============================================================================

/**
 * Calculate the maximum depth (longest path) in the flow.
 */
export function calculateMaxDepth(
  nodes: FlowNodeRuntime[],
  edges: FlowEdgeRuntime[],
): number {
  // Build adjacency list
  const adjacency = new Map<string, string[]>();
  nodes.forEach((n) => adjacency.set(n.nodeId, []));
  edges.forEach((e) => {
    const current = adjacency.get(e.sourceNodeId) || [];
    current.push(e.targetNodeId);
    adjacency.set(e.sourceNodeId, current);
  });

  // Find root nodes (nodes with no incoming edges)
  const hasIncoming = new Set<string>();
  edges.forEach((e) => hasIncoming.add(e.targetNodeId));
  const roots = nodes.filter((n) => !hasIncoming.has(n.nodeId));

  // DFS to find max depth
  const memo = new Map<string, number>();

  function getDepth(nodeId: string, visited: Set<string>): number {
    if (visited.has(nodeId)) return 0; // Cycle protection
    if (memo.has(nodeId)) return memo.get(nodeId)!;

    visited.add(nodeId);
    const neighbors = adjacency.get(nodeId) || [];

    let maxChildDepth = 0;
    for (const neighbor of neighbors) {
      maxChildDepth = Math.max(
        maxChildDepth,
        getDepth(neighbor, new Set(visited)),
      );
    }

    const depth = 1 + maxChildDepth;
    memo.set(nodeId, depth);
    return depth;
  }

  let maxDepth = 0;
  for (const root of roots) {
    maxDepth = Math.max(maxDepth, getDepth(root.nodeId, new Set()));
  }

  return maxDepth;
}

/**
 * Validate that flow depth doesn't exceed plan limits.
 */
export function validateDepth(
  nodes: FlowNodeRuntime[],
  edges: FlowEdgeRuntime[],
  plan: PlanType = "FREE",
): FlowValidationError | null {
  const maxDepth = calculateMaxDepth(nodes, edges);
  const limits = PLAN_LIMITS[plan];

  if (maxDepth > limits.maxDepth) {
    return {
      code: "DEPTH_LIMIT_EXCEEDED",
      message: `Flow has depth of ${maxDepth} nodes, but your ${plan} plan allows maximum depth of ${limits.maxDepth}`,
      severity: "error",
    };
  }

  return null;
}

// =============================================================================
// MAIN VALIDATION FUNCTION
// =============================================================================

/**
 * Validate a complete flow structure.
 * This is the primary gateway validator.
 */
export function validateFlow(
  nodes: FlowNodeRuntime[],
  edges: FlowEdgeRuntime[],
  plan: PlanType = "FREE",
): FlowValidationResult {
  const errors: FlowValidationError[] = [];
  const warnings: FlowValidationError[] = [];

  // 1. Cycle Detection
  const cycleResult = detectCycles(nodes, edges);
  if (cycleResult.hasCycle) {
    errors.push({
      code: "CYCLE_DETECTED",
      message: `Flow contains a cycle involving nodes: ${cycleResult.cycleNodes.join(", ")}`,
      severity: "error",
    });
  }

  // 2. Node Count Validation
  const nodeCountError = validateNodeCount(nodes, plan);
  if (nodeCountError) {
    errors.push(nodeCountError);
  }

  // 3. Depth Validation
  const depthError = validateDepth(nodes, edges, plan);
  if (depthError) {
    errors.push(depthError);
  }

  // 4. Orphan Detection
  const orphans = findOrphanedNodes(nodes, edges);
  if (orphans.length > 0) {
    for (const orphanId of orphans) {
      const node = nodes.find((n) => n.nodeId === orphanId);
      warnings.push({
        code: "ORPHANED_NODE",
        message: `Node "${node?.label || orphanId}" is not connected to any trigger`,
        nodeId: orphanId,
        severity: "warning",
      });
    }
  }

  // 5. Dead End Detection
  const deadEndWarnings = findDeadEnds(nodes, edges);
  warnings.push(...deadEndWarnings);

  // 6. No Trigger Check
  const hasTrigger = nodes.some((n) => n.type === "trigger");
  if (!hasTrigger && nodes.length > 0) {
    errors.push({
      code: "NO_TRIGGER",
      message:
        "Flow has no trigger node. Add a trigger (e.g., New DM, New Comment) to start the flow.",
      severity: "error",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// =============================================================================
// RUNTIME VALIDATION
// =============================================================================

/**
 * Quick validation for runtime execution.
 * Returns immediately if flow is invalid.
 */
export function validateFlowForExecution(
  nodes: FlowNodeRuntime[],
  edges: FlowEdgeRuntime[],
  plan: PlanType = "FREE",
): { canExecute: boolean; error?: string } {
  // Check for cycles (critical)
  const cycleResult = detectCycles(nodes, edges);
  if (cycleResult.hasCycle) {
    return {
      canExecute: false,
      error: "Flow contains a cycle and cannot be executed",
    };
  }

  // Check depth limit
  const depthError = validateDepth(nodes, edges, plan);
  if (depthError) {
    return {
      canExecute: false,
      error: depthError.message,
    };
  }

  // Check for at least one trigger
  const hasTrigger = nodes.some((n) => n.type === "trigger");
  if (!hasTrigger) {
    return {
      canExecute: false,
      error: "Flow has no trigger node",
    };
  }

  return { canExecute: true };
}
