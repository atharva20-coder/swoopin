/**
 * ============================================
 * FLOW RUNNER - NODE INDEX
 * Registers all node executors with the registry.
 * Import this file to initialize the node system.
 * ============================================
 */

import { registerNode } from "./node-registry";

// Action Nodes
import { messageNodeExecutor } from "./nodes/message.node";
import { smartAINodeExecutor } from "./nodes/smartai.node";
import { replyCommentNodeExecutor } from "./nodes/reply-comment.node";
import { delayNodeExecutor } from "./nodes/delay.node";
import { carouselNodeExecutor } from "./nodes/carousel.node";
import { buttonTemplateNodeExecutor } from "./nodes/button-template.node";
import { productTemplateNodeExecutor } from "./nodes/product-template.node";
import { quickRepliesNodeExecutor } from "./nodes/quick-replies.node";
import { iceBreakersNodeExecutor } from "./nodes/ice-breakers.node";
import { persistentMenuNodeExecutor } from "./nodes/persistent-menu.node";
import { replyMentionNodeExecutor } from "./nodes/reply-mention.node";
import { logToSheetsNodeExecutor } from "./nodes/log-to-sheets.node";
import {
  typingOnNodeExecutor,
  typingOffNodeExecutor,
  markSeenNodeExecutor,
} from "./nodes/sender-actions.node";

// Condition Nodes
import { isFollowerNodeExecutor } from "./nodes/is-follower.node";
import { hasTagNodeExecutor } from "./nodes/has-tag.node";
import { keywordsNodeExecutor } from "./nodes/keywords.node";
import { yesNodeExecutor, noNodeExecutor } from "./nodes/branch.node";

// =============================================================================
// REGISTER ALL NODES
// =============================================================================

/**
 * Initialize the node registry with all available executors.
 * Call this once at application startup.
 */
export function initializeNodeRegistry(): void {
  // Action Nodes - Messaging
  registerNode(messageNodeExecutor);
  registerNode(smartAINodeExecutor);
  registerNode(replyCommentNodeExecutor);
  registerNode(replyMentionNodeExecutor);

  // Action Nodes - Templates
  registerNode(carouselNodeExecutor);
  registerNode(buttonTemplateNodeExecutor);
  registerNode(productTemplateNodeExecutor);
  registerNode(quickRepliesNodeExecutor);

  // Action Nodes - Page Settings
  registerNode(iceBreakersNodeExecutor);
  registerNode(persistentMenuNodeExecutor);

  // Action Nodes - Sender Actions
  registerNode(typingOnNodeExecutor);
  registerNode(typingOffNodeExecutor);
  registerNode(markSeenNodeExecutor);

  // Action Nodes - Utility
  registerNode(delayNodeExecutor);
  registerNode(logToSheetsNodeExecutor);

  // Condition/Filter Nodes
  registerNode(isFollowerNodeExecutor);
  registerNode(hasTagNodeExecutor);
  registerNode(keywordsNodeExecutor);

  // Branch Nodes (YES/NO pass-through)
  registerNode(yesNodeExecutor);
  registerNode(noNodeExecutor);

  console.log("[FlowRunner] Node registry initialized with all 18 node types");
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

export * from "./types";
export * from "./node-registry";
export { WorkflowRunner, runWorkflow } from "./workflow-runner";
export {
  validateFlow,
  validateFlowForExecution,
  detectCycles,
  findOrphanedNodes,
  findDeadEnds,
  calculateMaxDepth,
  extractExternalReferences,
  checkSubscriptionRequirements,
  PLAN_LIMITS,
  type PlanType,
  type FlowValidationResult,
  type FlowValidationError,
  type ReferenceValidationResult,
} from "./flow-validator";
