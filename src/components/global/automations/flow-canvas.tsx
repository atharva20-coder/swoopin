"use client";

import React, { useCallback, useRef, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  ReactFlowInstance,
  ConnectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import { cn } from "@/lib/utils";
import FlowNode, { FlowNodeData } from "./flow-node";

type Props = {
  className?: string;
  initialNodes?: Node<FlowNodeData>[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node<FlowNodeData>[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onNodeClick?: (node: Node<FlowNodeData>) => void;
  onSelectionChange?: (nodeId: string | null) => void;
  readOnly?: boolean;
};

const nodeTypes = {
  custom: FlowNode,
};

// Validation: check if connection is valid
const isValidConnection = (
  connection: Connection,
  nodes: Node<FlowNodeData>[],
) => {
  const sourceNode = nodes.find((n) => n.id === connection.source);
  const targetNode = nodes.find((n) => n.id === connection.target);

  if (!sourceNode || !targetNode) return false;

  // No self-connections
  if (connection.source === connection.target) {
    return false;
  }

  // All other connections are allowed:
  // - Trigger → Trigger (e.g., DM AND Comment)
  // - Trigger → Action
  // - Trigger → Condition
  // - Action → Action (chaining)
  // - Action → Condition
  // - Condition → Action

  return true;
};

const FlowCanvasInner = ({
  className,
  initialNodes = [],
  initialEdges = [],
  onNodesChange: onNodesChangeProp,
  onEdgesChange: onEdgesChangeProp,
  onNodeClick,
  onSelectionChange,
  readOnly = false,
}: Props) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const idCounter = useRef(initialNodes.length);

  const onConnect = useCallback(
    (params: Connection) => {
      // Validate connection before adding
      if (!isValidConnection(params, nodes)) {
        console.warn("Invalid connection attempted:", params);
        return;
      }

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "#6366f1", strokeWidth: 2 },
            type: "smoothstep",
          },
          eds,
        ),
      );
    },
    [setEdges, nodes],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const data = event.dataTransfer.getData("application/reactflow");

      if (!data || !reactFlowBounds || !reactFlowInstance) return;

      const nodeData = JSON.parse(data);
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node<FlowNodeData> = {
        id: `node-${Date.now()}-${idCounter.current++}`,
        type: "custom",
        position,
        data: {
          label: nodeData.label,
          type: nodeData.type,
          subType: nodeData.subType,
          description: nodeData.description,
          config: {},
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  // Track last synced data to detect when parent updates
  const lastSyncedNodeIds = useRef<string>("");
  const lastSyncedNodeData = useRef<string>("");
  const lastSyncedEdgeIds = useRef<string>("");
  const isSyncingFromParent = useRef(false);

  // Sync nodes from parent when they change (DB load or config update)
  React.useEffect(() => {
    if (initialNodes.length === 0) return;

    // Create signatures to detect changes
    const nodeIdsSignature = initialNodes
      .map((n) => n.id)
      .sort()
      .join(",");
    const nodeDataSignature = JSON.stringify(
      initialNodes.map((n) => ({ id: n.id, data: n.data })),
    );

    // Sync if node IDs change (new nodes from DB)
    if (nodeIdsSignature !== lastSyncedNodeIds.current) {
      console.log(
        "[FlowCanvas] Syncing nodes from parent (new nodes):",
        initialNodes.length,
      );
      isSyncingFromParent.current = true;
      setNodes(initialNodes);
      lastSyncedNodeIds.current = nodeIdsSignature;
      lastSyncedNodeData.current = nodeDataSignature;
      setTimeout(() => {
        isSyncingFromParent.current = false;
      }, 0);
    }
    // Sync if node data/config changes (config update from parent)
    else if (nodeDataSignature !== lastSyncedNodeData.current) {
      console.log("[FlowCanvas] Syncing node data from parent (config update)");
      isSyncingFromParent.current = true;
      // Update data only, preserve canvas positions
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          const updatedNode = initialNodes.find((n) => n.id === node.id);
          if (updatedNode) {
            return { ...node, data: updatedNode.data };
          }
          return node;
        }),
      );
      lastSyncedNodeData.current = nodeDataSignature;
      setTimeout(() => {
        isSyncingFromParent.current = false;
      }, 0);
    }
  }, [initialNodes, setNodes]);

  // Sync edges from parent when they change
  React.useEffect(() => {
    if (initialEdges.length === 0) return;

    const edgeIdsSignature = initialEdges
      .map((e) => e.id)
      .sort()
      .join(",");

    if (edgeIdsSignature !== lastSyncedEdgeIds.current) {
      console.log(
        "[FlowCanvas] Syncing edges from parent:",
        initialEdges.length,
      );
      isSyncingFromParent.current = true;
      setEdges(initialEdges);
      lastSyncedEdgeIds.current = edgeIdsSignature;
      setTimeout(() => {
        isSyncingFromParent.current = false;
      }, 0);
    }
  }, [initialEdges, setEdges]);

  // Notify parent of changes - skip if we're syncing from parent
  React.useEffect(() => {
    if (onNodesChangeProp && !isSyncingFromParent.current) {
      onNodesChangeProp(nodes);
    }
  }, [nodes, onNodesChangeProp]);

  React.useEffect(() => {
    if (onEdgesChangeProp && !isSyncingFromParent.current) {
      onEdgesChangeProp(edges);
    }
  }, [edges, onEdgesChangeProp]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<FlowNodeData>) => {
      if (onNodeClick) {
        onNodeClick(node);
      }
      if (onSelectionChange) {
        onSelectionChange(node.id);
      }
    },
    [onNodeClick, onSelectionChange],
  );

  const handlePaneClick = useCallback(() => {
    if (onSelectionChange) {
      onSelectionChange(null);
    }
  }, [onSelectionChange]);

  return (
    <div
      ref={reactFlowWrapper}
      className={cn("relative w-full h-full", className)}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onDrop={readOnly ? undefined : onDrop}
        onDragOver={readOnly ? undefined : onDragOver}
        onInit={setReactFlowInstance}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-white dark:bg-neutral-950"
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
          style: { stroke: "#6366f1", strokeWidth: 2 },
        }}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        // Keep pan/zoom enabled for "preview"
        // Also disable attribution for cleaner preview if desired
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={2}
          color="#d1d5db"
          className="dark:[&>svg>pattern>circle]:fill-neutral-500"
        />
        <Controls
          showInteractive={!readOnly}
          className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg"
        />
      </ReactFlow>
    </div>
  );
};

const FlowCanvas = (props: Props) => {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default FlowCanvas;
