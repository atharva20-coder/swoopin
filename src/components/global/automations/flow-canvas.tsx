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
};

const nodeTypes = {
  custom: FlowNode,
};

// Validation: check if connection is valid
const isValidConnection = (connection: Connection, nodes: Node<FlowNodeData>[]) => {
  const sourceNode = nodes.find(n => n.id === connection.source);
  const targetNode = nodes.find(n => n.id === connection.target);
  
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
}: Props) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const idCounter = useRef(initialNodes.length);

  const onConnect = useCallback(
    (params: Connection) => {
      // Validate connection before adding
      if (!isValidConnection(params, nodes)) {
        console.warn("Invalid connection attempted:", params);
        return;
      }
      
      setEdges((eds) => addEdge({ 
        ...params, 
        animated: true, 
        style: { stroke: '#6366f1', strokeWidth: 2 },
        type: 'smoothstep',
      }, eds));
    },
    [setEdges, nodes]
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
    [reactFlowInstance, setNodes]
  );

  // Track if we've initialized from props
  const hasInitializedNodes = useRef(false);
  const hasInitializedEdges = useRef(false);
  const lastNodeDataRef = useRef<string>("");

  // Update nodes on initial load
  React.useEffect(() => {
    if (!hasInitializedNodes.current && initialNodes.length > 0) {
      setNodes(initialNodes);
      hasInitializedNodes.current = true;
      lastNodeDataRef.current = JSON.stringify(initialNodes.map(n => n.data));
    }
  }, [initialNodes, setNodes]);

  // Sync node config updates from parent (only when data changes, not position)
  React.useEffect(() => {
    if (!hasInitializedNodes.current || initialNodes.length === 0) return;
    
    const newDataJson = JSON.stringify(initialNodes.map(n => n.data));
    if (newDataJson !== lastNodeDataRef.current) {
      lastNodeDataRef.current = newDataJson;
      setNodes(prevNodes => 
        prevNodes.map(node => {
          const updatedNode = initialNodes.find(n => n.id === node.id);
          if (updatedNode) {
            return { ...node, data: updatedNode.data };
          }
          return node;
        })
      );
    }
  }, [initialNodes, setNodes]);

  // Update edges only on initial load
  React.useEffect(() => {
    if (!hasInitializedEdges.current && initialEdges.length > 0) {
      setEdges(initialEdges);
      hasInitializedEdges.current = true;
    }
  }, [initialEdges, setEdges]);

  // Notify parent of changes
  React.useEffect(() => {
    if (onNodesChangeProp) {
      onNodesChangeProp(nodes);
    }
  }, [nodes, onNodesChangeProp]);

  React.useEffect(() => {
    if (onEdgesChangeProp) {
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
    [onNodeClick, onSelectionChange]
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
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-white dark:bg-gray-950"
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={2}
          color="#d1d5db"
          className="dark:[&>svg>pattern>circle]:fill-gray-600"
        />
        <Controls className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" />
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
