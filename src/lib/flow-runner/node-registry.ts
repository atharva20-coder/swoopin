/**
 * ============================================
 * NODE REGISTRY
 * Central registry for all node executors.
 * Enables plugin-style architecture where each node type
 * is registered separately and loaded dynamically.
 * ============================================
 */

import type { INodeExecutor, FlowNodeRuntime } from "./types";

// =============================================================================
// REGISTRY
// =============================================================================

/**
 * Map of registered node executors.
 * Key format: "type:subType" (e.g., "action:MESSAGE")
 */
const nodeRegistry = new Map<string, INodeExecutor>();

/**
 * Generate registry key from type and subType.
 */
function getRegistryKey(type: string, subType: string): string {
  return `${type}:${subType}`;
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Register a node executor.
 * Call this at module initialization for each node type.
 */
export function registerNode(executor: INodeExecutor): void {
  const key = getRegistryKey(executor.type, executor.subType);

  if (nodeRegistry.has(key)) {
    console.warn(`[NodeRegistry] Overwriting existing executor for: ${key}`);
  }

  nodeRegistry.set(key, executor);
  console.log(`[NodeRegistry] Registered: ${key}`);
}

/**
 * Get a node executor by type and subType.
 * Returns undefined if no executor is registered.
 */
export function getExecutor(
  type: string,
  subType: string,
): INodeExecutor | undefined {
  const key = getRegistryKey(type, subType);
  return nodeRegistry.get(key);
}

/**
 * Get a node executor for a FlowNodeRuntime.
 */
export function getExecutorForNode(
  node: FlowNodeRuntime,
): INodeExecutor | undefined {
  // Special handling for KEYWORDS: it's registered as "filter" but might be stored
  // as "trigger" or "condition" in the DB depending on where it was dragged from.
  if (node.subType === "KEYWORDS") {
    return getExecutor("filter", "KEYWORDS");
  }

  return getExecutor(node.type, node.subType);
}

/**
 * Check if a node type is registered.
 */
export function hasExecutor(type: string, subType: string): boolean {
  const key = getRegistryKey(type, subType);
  return nodeRegistry.has(key);
}

/**
 * Get all registered node types.
 * Useful for debugging and admin UI.
 */
export function getAllRegisteredNodes(): Array<{
  type: string;
  subType: string;
  description?: string;
}> {
  const nodes: Array<{ type: string; subType: string; description?: string }> =
    [];

  nodeRegistry.forEach((executor) => {
    nodes.push({
      type: executor.type,
      subType: executor.subType,
      description: executor.description,
    });
  });

  return nodes;
}

/**
 * Clear all registered nodes.
 * Primarily for testing purposes.
 */
export function clearRegistry(): void {
  nodeRegistry.clear();
}

/**
 * Get the count of registered nodes.
 */
export function getRegistrySize(): number {
  return nodeRegistry.size;
}
