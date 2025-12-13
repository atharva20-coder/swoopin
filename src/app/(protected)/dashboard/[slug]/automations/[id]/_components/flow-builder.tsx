"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Node, Edge } from "reactflow";
import FlowCanvas from "@/components/global/automations/flow-canvas";
import ComponentsPanel from "@/components/global/automations/components-panel";
import ConfigPanel from "@/components/global/automations/config-panel";
import { useQueryAutomation } from "@/hooks/user-queries";
import { FlowNodeData } from "@/components/global/automations/flow-node";
import { Button } from "@/components/ui/button";
import { Save, AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";

type Props = {
  automationId: string;
  slug: string;
};

// Validate the flow before saving
const validateFlow = (nodes: Node<FlowNodeData>[], edges: Edge[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check for at least one trigger
  const triggers = nodes.filter(n => n.data.type === "trigger");
  if (triggers.length === 0) {
    errors.push("Flow must have at least one trigger");
  }
  
  // Check for at least one action
  const actions = nodes.filter(n => n.data.type === "action");
  if (actions.length === 0) {
    errors.push("Flow must have at least one action");
  }
  
  // Check for orphan nodes (nodes with no connections)
  const connectedNodeIds = new Set<string>();
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });
  
  const orphanNodes = nodes.filter(n => !connectedNodeIds.has(n.id));
  if (orphanNodes.length > 0 && nodes.length > 1) {
    errors.push(`${orphanNodes.length} node(s) are not connected`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

const FlowManager = ({ automationId, slug }: Props) => {
  const { data, refetch } = useQueryAutomation(automationId);
  const [selectedNode, setSelectedNode] = useState<Node<FlowNodeData> | null>(null);
  const [nodes, setNodes] = useState<Node<FlowNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });

  // Convert existing automation data to initial nodes and edges
  useEffect(() => {
    if (data?.data) {
      const initialNodes: Node<FlowNodeData>[] = [];
      const initialEdges: Edge[] = [];
      const xCenter = 400;
      let currentY = 100;
      const ySpacing = 180;
      const xSpacing = 280;
      
      const triggerNodeIds: string[] = [];
      const actionNodeIds: string[] = [];

      // === TRIGGERS ===
      // Add DM trigger if exists
      const dmTrigger = data.data.trigger?.find(t => t.type === "DM");
      if (dmTrigger) {
        const nodeId = `trigger-dm-${dmTrigger.id}`;
        triggerNodeIds.push(nodeId);
        initialNodes.push({
          id: nodeId,
          type: "custom",
          position: { x: xCenter - xSpacing, y: currentY },
          data: {
            label: "New DM",
            type: "trigger",
            subType: "DM",
            description: "Triggers on direct message",
            nodeId: dmTrigger.id,
          },
        });
      }

      // Add Comment trigger if exists
      const commentTrigger = data.data.trigger?.find(t => t.type === "COMMENT");
      if (commentTrigger) {
        const nodeId = `trigger-comment-${commentTrigger.id}`;
        triggerNodeIds.push(nodeId);
        initialNodes.push({
          id: nodeId,
          type: "custom",
          position: { x: xCenter + xSpacing, y: currentY },
          data: {
            label: "New Comment",
            type: "trigger",
            subType: "COMMENT",
            description: "Triggers on comment",
            nodeId: commentTrigger.id,
          },
        });
      }

      currentY += ySpacing;

      // === KEYWORDS ===
      if (data.data.keywords && data.data.keywords.length > 0) {
        const keywordNodeId = "keywords-node";
        initialNodes.push({
          id: keywordNodeId,
          type: "custom",
          position: { x: xCenter, y: currentY },
          data: {
            label: "Keywords",
            type: "trigger",
            subType: "KEYWORDS",
            description: data.data.keywords.map(k => k.word).join(", "),
            config: { keywords: data.data.keywords.map(k => k.word) },
          },
        });

        // Connect all triggers to keywords
        triggerNodeIds.forEach(triggerId => {
          initialEdges.push({
            id: `edge-${triggerId}-keywords`,
            source: triggerId,
            target: keywordNodeId,
            animated: true,
            type: 'smoothstep',
            style: { stroke: '#6366f1', strokeWidth: 2 },
          });
        });

        triggerNodeIds.push(keywordNodeId);
        currentY += ySpacing;
      }

      // === ACTIONS ===
      if (data.data.listener) {
        const listener = data.data.listener;

        // Reply Comment action (if commentReply exists)
        if (listener.commentReply) {
          const replyNodeId = "action-reply-comment";
          actionNodeIds.push(replyNodeId);
          initialNodes.push({
            id: replyNodeId,
            type: "custom",
            position: { x: xCenter + xSpacing, y: currentY },
            data: {
              label: "Reply Comment",
              type: "action",
              subType: "REPLY_COMMENT",
              description: listener.commentReply.substring(0, 40) + "...",
              config: { commentReply: listener.commentReply },
              nodeId: listener.id,
            },
          });
        }

        // Send DM action (if prompt exists - MESSAGE or SMARTAI)
        if (listener.prompt) {
          const dmActionNodeId = "action-send-dm";
          actionNodeIds.push(dmActionNodeId);
          const isSmartAI = listener.listener === "SMARTAI";
          
          initialNodes.push({
            id: dmActionNodeId,
            type: "custom",
            position: { x: xCenter - xSpacing, y: currentY },
            data: {
              label: isSmartAI ? "Smart AI" : "Send DM",
              type: "action",
              subType: isSmartAI ? "SMARTAI" : "MESSAGE",
              description: listener.prompt.substring(0, 40) + "...",
              config: { message: listener.prompt },
              nodeId: listener.id,
            },
          });
        }

        // Carousel action
        if (listener.listener === "CAROUSEL") {
          const carouselNodeId = "action-carousel";
          actionNodeIds.push(carouselNodeId);
          initialNodes.push({
            id: carouselNodeId,
            type: "custom",
            position: { x: xCenter, y: currentY },
            data: {
              label: "Send Carousel",
              type: "action",
              subType: "CAROUSEL",
              description: "Carousel template configured",
              nodeId: listener.id,
            },
          });
        }

        // Connect keywords/triggers to actions
        const lastTriggerNodeId = triggerNodeIds[triggerNodeIds.length - 1] || triggerNodeIds[0];
        if (lastTriggerNodeId) {
          actionNodeIds.forEach(actionId => {
            initialEdges.push({
              id: `edge-trigger-${actionId}`,
              source: lastTriggerNodeId,
              target: actionId,
              animated: true,
              type: 'smoothstep',
              style: { stroke: '#10b981', strokeWidth: 2 },
            });
          });
        }

        currentY += ySpacing;
      }

      // === POSTS (as a trigger/condition) ===
      if (data.data.posts && data.data.posts.length > 0) {
        const postsNodeId = "posts-attached";
        initialNodes.push({
          id: postsNodeId,
          type: "custom",
          position: { x: xCenter + xSpacing * 2, y: 100 },
          data: {
            label: "Selected Posts",
            type: "trigger",
            subType: "SELECT_POSTS",
            description: `${data.data.posts.length} post(s) attached`,
            config: { 
              posts: data.data.posts.map(p => ({ id: p.postid, media: p.media })),
              postCount: data.data.posts.length 
            },
          },
        });

        // Connect posts to keywords (posts are linked to triggers)
        if (data.data.keywords && data.data.keywords.length > 0) {
          initialEdges.push({
            id: `edge-posts-keywords`,
            source: postsNodeId,
            target: "keywords-node",
            animated: true,
            type: 'smoothstep',
            style: { stroke: '#8b5cf6', strokeWidth: 2 },
          });
        } else if (triggerNodeIds.length > 0) {
          // If no keywords, connect directly to actions
          actionNodeIds.forEach(actionId => {
            initialEdges.push({
              id: `edge-posts-${actionId}`,
              source: postsNodeId,
              target: actionId,
              animated: true,
              type: 'smoothstep',
              style: { stroke: '#8b5cf6', strokeWidth: 2 },
            });
          });
        }
      }

      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [data]);

  // Validate flow when nodes/edges change
  useEffect(() => {
    const result = validateFlow(nodes, edges);
    setValidationResult(result);
  }, [nodes, edges]);

  const handleNodeClick = useCallback((node: Node<FlowNodeData>) => {
    setSelectedNode(node);
  }, []);

  const handleSelectionChange = useCallback((nodeId: string | null) => {
    if (nodeId === null) {
      setSelectedNode(null);
    } else {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        setSelectedNode(node);
      }
    }
  }, [nodes]);

  const handleNodesChange = useCallback((updatedNodes: Node<FlowNodeData>[]) => {
    setNodes(updatedNodes);
  }, []);

  const handleEdgesChange = useCallback((updatedEdges: Edge[]) => {
    setEdges(updatedEdges);
  }, []);

  const handleUpdateNode = useCallback((nodeId: string, config: Record<string, any>) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, config } }
          : node
      )
    );
  }, []);

  const handleSaveFlow = async () => {
    if (!validationResult.valid) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    setIsSaving(true);
    try {
      // Flow is saved through individual node configurations
      // The config panel handles saving each node's data
      toast.success("Flow configuration saved");
      refetch();
    } catch (error) {
      toast.error("Failed to save flow");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden flex-col">
      {/* Validation Bar */}
      {!validationResult.valid && nodes.length > 0 && (
        <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-950 border-b border-yellow-200 dark:border-yellow-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm text-yellow-700 dark:text-yellow-300">
            {validationResult.errors[0]}
          </span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Components */}
        <ComponentsPanel />

        {/* Center panel - Canvas */}
        <div className="flex-1 relative">
          <FlowCanvas
            className="absolute inset-0"
            initialNodes={nodes}
            initialEdges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onNodeClick={handleNodeClick}
            onSelectionChange={handleSelectionChange}
          />

          {/* Save Button */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <Button
              onClick={handleSaveFlow}
              disabled={isSaving || !validationResult.valid}
              className="shadow-lg"
            >
              {isSaving ? (
                "Saving..."
              ) : validationResult.valid ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Flow Valid
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Flow
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right panel - Configuration */}
        <ConfigPanel 
          id={automationId} 
          selectedNode={selectedNode}
          onUpdateNode={handleUpdateNode}
        />
      </div>
    </div>
  );
};

export default FlowManager;
