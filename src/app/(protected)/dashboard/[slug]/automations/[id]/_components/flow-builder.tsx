"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Node, Edge } from "reactflow";
import FlowCanvas from "@/components/global/automations/flow-canvas";
import ComponentsPanel from "@/components/global/automations/components-panel";
import ConfigPanel from "@/components/global/automations/config-panel";
import { useQueryAutomation } from "@/hooks/user-queries";
import { FlowNodeData } from "@/components/global/automations/flow-node";
import { Button } from "@/components/ui/button";
import { Save, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveFlowData, getFlowData, deleteFlowNode } from "@/actions/automations/flow";
import { saveTrigger, saveListener, saveKeyword } from "@/actions/automations";

type Props = {
  automationId: string;
  slug: string;
};

// Validate the flow before saving
const validateFlow = (nodes: Node<FlowNodeData>[], edges: Edge[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check for at least one trigger
  const triggers = nodes.filter(n => n.data.type === "trigger");
  if (triggers.length === 0 && nodes.length > 0) {
    errors.push("Flow must have at least one trigger");
  }
  
  // Check for at least one action
  const actions = nodes.filter(n => n.data.type === "action");
  if (actions.length === 0 && nodes.length > 0) {
    errors.push("Flow must have at least one action");
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
  const [isLoading, setIsLoading] = useState(true);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });
  const hasInitialized = React.useRef(false);

  // Load flow - try FlowNode/FlowEdge tables first, then fall back to legacy data
  useEffect(() => {
    const loadFlow = async () => {
      if (hasInitialized.current) return;
      if (!data?.data) return;
      
      hasInitialized.current = true;
      
      try {
        // Try to load from FlowNode/FlowEdge tables with timeout handling
        const result = await Promise.race([
          getFlowData(automationId),
          new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]);
        
        if (result && result.status === 200 && result.data && result.data.nodes.length > 0) {
          console.log("Loaded flow from FlowNode/FlowEdge tables:", result.data.nodes.length, "nodes");
          setNodes(result.data.nodes as Node<FlowNodeData>[]);
          setEdges(result.data.edges);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.log("FlowNode/FlowEdge loading failed, using legacy data:", error);
      }
      
      // Fall back to generating from legacy data
      generateLegacyFlow();
    };
    
    loadFlow();
  }, [data?.data, automationId]);

  // Generate flow from legacy automation data (triggers, listener, keywords)
  const generateLegacyFlow = () => {
    if (!data?.data) return;
    
    const initialNodes: Node<FlowNodeData>[] = [];
    const initialEdges: Edge[] = [];
    const xCenter = 400;
    let currentY = 100;
    const ySpacing = 180;
    const xSpacing = 280;
    
    const triggerNodeIds: string[] = [];
    let keywordNodeId: string | null = null;
    const actionNodeIds: string[] = [];

    // Add DM trigger if exists
    const dmTrigger = data.data.trigger?.find(t => t.type === "DM");
    if (dmTrigger) {
      const nodeId = `trigger-dm-${Date.now()}`;
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
          config: {},
        },
      });
    }

    // Add Comment trigger if exists
    const commentTrigger = data.data.trigger?.find(t => t.type === "COMMENT");
    if (commentTrigger) {
      const nodeId = `trigger-comment-${Date.now()}`;
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
          config: {},
        },
      });
    }

    currentY += ySpacing;

    // Add keywords if exist
    if (data.data.keywords && data.data.keywords.length > 0) {
      keywordNodeId = `keywords-${Date.now()}`;
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

      // Connect triggers to keywords
      triggerNodeIds.forEach(triggerId => {
        initialEdges.push({
          id: `edge-${triggerId}-${keywordNodeId}`,
          source: triggerId,
          target: keywordNodeId!,
          animated: true,
          type: "smoothstep",
          style: { stroke: "#6366f1", strokeWidth: 2 },
        });
      });

      currentY += ySpacing;
    }

    // Add listener/action nodes
    if (data.data.listener) {
      const listener = data.data.listener;

      // Reply Comment action
      if (listener.commentReply) {
        const nodeId = `action-reply-${Date.now()}`;
        actionNodeIds.push(nodeId);
        initialNodes.push({
          id: nodeId,
          type: "custom",
          position: { x: xCenter + xSpacing, y: currentY },
          data: {
            label: "Reply Comment",
            type: "action",
            subType: "REPLY_COMMENT",
            description: listener.commentReply.substring(0, 40) + "...",
            config: { commentReply: listener.commentReply },
          },
        });
      }

      // Send DM action
      if (listener.prompt) {
        const nodeId = `action-dm-${Date.now()}`;
        actionNodeIds.push(nodeId);
        const isSmartAI = listener.listener === "SMARTAI";
        
        initialNodes.push({
          id: nodeId,
          type: "custom",
          position: { x: xCenter - xSpacing, y: currentY },
          data: {
            label: isSmartAI ? "Smart AI" : "Send DM",
            type: "action",
            subType: isSmartAI ? "SMARTAI" : "MESSAGE",
            description: listener.prompt.substring(0, 40) + "...",
            config: { message: listener.prompt },
          },
        });
      }

      // Connect to actions
      const sourceNode = keywordNodeId || triggerNodeIds[triggerNodeIds.length - 1];
      if (sourceNode) {
        actionNodeIds.forEach(actionId => {
          initialEdges.push({
            id: `edge-${sourceNode}-${actionId}`,
            source: sourceNode,
            target: actionId,
            animated: true,
            type: "smoothstep",
            style: { stroke: "#10b981", strokeWidth: 2 },
          });
        });
      }
    }

    // Add posts if exist
    if (data.data.posts && data.data.posts.length > 0) {
      const postsNodeId = `posts-${Date.now()}`;
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

      // Connect to keywords or actions
      const target = keywordNodeId || actionNodeIds[0];
      if (target) {
        initialEdges.push({
          id: `edge-posts-${target}`,
          source: postsNodeId,
          target,
          animated: true,
          type: "smoothstep",
          style: { stroke: "#8b5cf6", strokeWidth: 2 },
        });
      }
    }

    setNodes(initialNodes);
    setEdges(initialEdges);
    setIsLoading(false);
  };

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

  // Delete node from canvas and database
  const handleDeleteNode = useCallback(async (nodeId: string) => {
    setNodes(prevNodes => prevNodes.filter(n => n.id !== nodeId));
    setEdges(prevEdges => prevEdges.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    
    // Delete from database
    await deleteFlowNode(automationId, nodeId);
    toast.success("Node deleted");
  }, [automationId]);

  // Save entire flow to database
  const handleSaveFlow = async () => {
    setIsSaving(true);
    try {
      // 1. Save flow nodes and edges
      const flowNodes = nodes.map(n => ({
        nodeId: n.id,
        type: n.data.type,
        subType: n.data.subType,
        label: n.data.label,
        description: n.data.description,
        positionX: n.position.x,
        positionY: n.position.y,
        config: n.data.config,
      }));

      const flowEdges = edges.map(e => ({
        edgeId: e.id,
        sourceNodeId: e.source,
        targetNodeId: e.target,
        sourceHandle: e.sourceHandle || undefined,
        targetHandle: e.targetHandle || undefined,
      }));

      const flowResult = await saveFlowData(automationId, flowNodes, flowEdges);
      if (flowResult.status !== 200) {
        toast.error("Failed to save flow graph");
        return;
      }

      // 2. Sync triggers to database
      const triggerNodes = nodes.filter(n => 
        n.data.type === "trigger" && 
        (n.data.subType === "DM" || n.data.subType === "COMMENT")
      );
      if (triggerNodes.length > 0) {
        const triggerTypes = triggerNodes.map(n => n.data.subType);
        await saveTrigger(automationId, triggerTypes);
      }

      // 3. Sync keywords
      const keywordNodes = nodes.filter(n => n.data.subType === "KEYWORDS");
      for (const kn of keywordNodes) {
        const keywords = kn.data.config?.keywords || [];
        for (const keyword of keywords) {
          if (keyword) {
            await saveKeyword(automationId, keyword);
          }
        }
      }

      // 4. Sync action nodes to listener
      const actionNode = nodes.find(n => n.data.type === "action");
      if (actionNode) {
        let listenerType: "MESSAGE" | "SMARTAI" | "CAROUSEL" = "MESSAGE";
        let prompt = "";
        let reply = "";

        if (actionNode.data.subType === "SMARTAI") {
          listenerType = "SMARTAI";
          prompt = actionNode.data.config?.message || actionNode.data.config?.prompt || "";
        } else if (actionNode.data.subType === "CAROUSEL") {
          listenerType = "CAROUSEL";
          prompt = "Carousel response";
        } else if (actionNode.data.subType === "REPLY_COMMENT") {
          listenerType = "MESSAGE";
          reply = actionNode.data.config?.commentReply || "";
          // Find DM action for prompt
          const dmAction = nodes.find(n => n.data.subType === "MESSAGE");
          prompt = dmAction?.data.config?.message || "";
        } else {
          prompt = actionNode.data.config?.message || "";
        }

        if (prompt || reply) {
          await saveListener(automationId, listenerType, prompt, reply);
        }
      }

      toast.success("Flow saved successfully!");
      refetch();
    } catch (error) {
      console.error("Error saving flow:", error);
      toast.error("Failed to save flow");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

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
              disabled={isSaving}
              className="shadow-lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
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
          onDeleteNode={handleDeleteNode}
        />
      </div>
    </div>
  );
};

export default FlowManager;
