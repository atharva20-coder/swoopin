/**
 * ============================================
 * NODE EXECUTORS INDEX
 * Exports and registers all node executors.
 * Importing this file triggers registration.
 * ============================================
 */

import { registerNode } from "../node-registry";

// YouTube Nodes
import { youtubeCommentNodeExecutor } from "./youtube-comment.node";
import { youtubeSelectVideosNodeExecutor } from "./youtube-select-videos.node";
import { youtubeKeywordsNodeExecutor } from "./youtube-keywords.node";
import { youtubeReplyCommentNodeExecutor } from "./youtube-reply-comment.node";

// Register YouTube Nodes
registerNode(youtubeCommentNodeExecutor);
registerNode(youtubeSelectVideosNodeExecutor);
registerNode(youtubeKeywordsNodeExecutor);
registerNode(youtubeReplyCommentNodeExecutor);

// TODO: Import and register other platform nodes (Instagram, etc.)
// Currently, legacy nodes are handled via fallback in workflow-runner.ts
// but we should migrate them here eventually.

export const registeredNodes = [
  youtubeCommentNodeExecutor,
  youtubeSelectVideosNodeExecutor,
  youtubeKeywordsNodeExecutor,
  youtubeReplyCommentNodeExecutor,
];
