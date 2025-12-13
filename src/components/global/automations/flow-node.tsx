"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Mail, 
  Reply, 
  Send, 
  Image as ImageIcon, 
  Tag, 
  Bell, 
  UserCheck, 
  Hash,
  Bot,
  MessageCircleReply,
  CheckCircle,
  XCircle,
  Clock,
  ImagePlus
} from "lucide-react";

export type FlowNodeData = {
  label: string;
  type: "trigger" | "action" | "condition";
  subType: string;
  description?: string;
  config?: Record<string, any>;
  nodeId?: string;
};

const iconMap: Record<string, React.ReactNode> = {
  COMMENT: <MessageSquare className="w-5 h-5" />,
  DM: <Mail className="w-5 h-5" />,
  KEYWORDS: <Reply className="w-5 h-5" />,
  MESSAGE: <Send className="w-5 h-5" />,
  CAROUSEL: <ImageIcon className="w-5 h-5" />,
  TAG: <Tag className="w-5 h-5" />,
  NOTIFY: <Bell className="w-5 h-5" />,
  FOLLOWER: <UserCheck className="w-5 h-5" />,
  TAG_CHECK: <Hash className="w-5 h-5" />,
  SMARTAI: <Bot className="w-5 h-5" />,
  REPLY_COMMENT: <MessageCircleReply className="w-5 h-5" />,
  POSTS: <ImagePlus className="w-5 h-5" />,
  SELECT_POSTS: <ImagePlus className="w-5 h-5" />,
  YES: <CheckCircle className="w-5 h-5" />,
  NO: <XCircle className="w-5 h-5" />,
  IS_FOLLOWER: <UserCheck className="w-5 h-5" />,
  DELAY: <Clock className="w-5 h-5" />,
  HAS_TAG: <Tag className="w-5 h-5" />,
};

const getNodeColors = (type: string) => {
  switch (type) {
    case "trigger":
      return {
        bg: "bg-blue-50 dark:bg-blue-950",
        border: "border-blue-500",
        icon: "text-blue-500",
        header: "bg-blue-500",
      };
    case "action":
      return {
        bg: "bg-green-50 dark:bg-green-950",
        border: "border-green-500",
        icon: "text-green-500",
        header: "bg-green-500",
      };
    case "condition":
      return {
        bg: "bg-yellow-50 dark:bg-yellow-950",
        border: "border-yellow-500",
        icon: "text-yellow-500",
        header: "bg-yellow-500",
      };
    default:
      return {
        bg: "bg-gray-50 dark:bg-gray-950",
        border: "border-gray-500",
        icon: "text-gray-500",
        header: "bg-gray-500",
      };
  }
};

const handleStyle = {
  width: 12,
  height: 12,
  backgroundColor: "#6366f1",
  border: "2px solid white",
};

const FlowNode = ({ data, selected, id }: NodeProps<FlowNodeData>) => {
  const colors = getNodeColors(data.type);

  return (
    <div
      className={cn(
        "rounded-lg border-2 min-w-[220px] shadow-lg transition-all overflow-hidden",
        colors.bg,
        colors.border,
        selected && "ring-2 ring-offset-2 ring-indigo-500 dark:ring-indigo-400"
      )}
    >
      {/* Target handle at top - ALL nodes can receive connections */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          ...handleStyle,
          backgroundColor: data.type === "trigger" ? "#3b82f6" : data.type === "action" ? "#22c55e" : "#eab308",
        }}
        isConnectable={true}
      />
      
      {/* Source handle at bottom - ALL nodes can have outgoing connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          ...handleStyle,
          backgroundColor: data.type === "trigger" ? "#3b82f6" : data.type === "action" ? "#22c55e" : "#eab308",
        }}
        isConnectable={true}
      />
      
      {/* Left target handle - ALL nodes can receive connections */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ 
          ...handleStyle, 
          top: '50%',
          backgroundColor: data.type === "trigger" ? "#3b82f6" : data.type === "action" ? "#22c55e" : "#eab308",
        }}
        isConnectable={true}
      />
      
      {/* Right source handle - ALL nodes can have outgoing connections */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ 
          ...handleStyle, 
          top: '50%',
          backgroundColor: data.type === "trigger" ? "#3b82f6" : data.type === "action" ? "#22c55e" : "#eab308",
        }}
        isConnectable={true}
      />

      {/* Header */}
      <div className={cn("px-3 py-2 flex items-center gap-2", colors.header)}>
        <div className="text-white">
          {iconMap[data.subType] || <Tag className="w-4 h-4" />}
        </div>
        <span className="text-white text-sm font-semibold">{data.label}</span>
      </div>

      {/* Body */}
      <div className="px-3 py-3">
        {data.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {data.description}
          </p>
        )}
        {data.config && Object.keys(data.config).length > 0 && (
          <div className="mt-2 text-xs bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
            {data.config.message && (
              <p className="text-gray-700 dark:text-gray-300 truncate">
                {data.config.message.substring(0, 30)}...
              </p>
            )}
            {data.config.keywords && data.config.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {data.config.keywords.slice(0, 3).map((kw: string, i: number) => (
                  <span key={i} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                    {kw}
                  </span>
                ))}
                {data.config.keywords.length > 3 && (
                  <span className="text-gray-500">+{data.config.keywords.length - 3} more</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(FlowNode);
