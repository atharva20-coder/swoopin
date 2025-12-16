"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Mail, 
  Reply, 
  Send, 
  Image as ImageIcon, 
  Bot,
  MessageCircleReply,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  ImagePlus,
  UserCheck,
  Clock,
  Tag
} from "lucide-react";

const TRIGGERS = [
  {
    id: "new-comment",
    label: "New Comment",
    description: "Trigger on new comment",
    icon: <MessageSquare className="w-5 h-5" />,
    type: "COMMENT",
  },
  {
    id: "new-dm",
    label: "New DM",
    description: "Trigger on direct message",
    icon: <Mail className="w-5 h-5" />,
    type: "DM",
  },
  {
    id: "keyword-reply",
    label: "Keyword Match",
    description: "Trigger on specific keyword",
    icon: <Reply className="w-5 h-5" />,
    type: "KEYWORDS",
  },
  {
    id: "select-posts",
    label: "Select Posts",
    description: "Attach specific Instagram posts",
    icon: <ImagePlus className="w-5 h-5" />,
    type: "SELECT_POSTS",
  },
];

const ACTIONS = [
  {
    id: "send-message",
    label: "Send DM",
    description: "Send a direct message",
    icon: <Send className="w-5 h-5" />,
    type: "MESSAGE",
  },
  {
    id: "reply-comment",
    label: "Reply Comment",
    description: "Reply to comment",
    icon: <MessageCircleReply className="w-5 h-5" />,
    type: "REPLY_COMMENT",
  },
  {
    id: "send-carousel",
    label: "Send Carousel",
    description: "Send carousel template",
    icon: <ImageIcon className="w-5 h-5" />,
    type: "CAROUSEL",
  },
  {
    id: "button-template",
    label: "Button Template",
    description: "Send buttons with actions",
    icon: <MessageSquare className="w-5 h-5" />,
    type: "BUTTON_TEMPLATE",
  },
  {
    id: "ice-breakers",
    label: "Ice Breakers",
    description: "Set FAQ quick replies",
    icon: <MessageSquare className="w-5 h-5" />,
    type: "ICE_BREAKERS",
  },
  {
    id: "persistent-menu",
    label: "Persistent Menu",
    description: "Set always-visible menu",
    icon: <MessageSquare className="w-5 h-5" />,
    type: "PERSISTENT_MENU",
  },
  {
    id: "product-template",
    label: "Product Template",
    description: "Send catalog products",
    icon: <ImageIcon className="w-5 h-5" />,
    type: "PRODUCT_TEMPLATE",
  },
  {
    id: "quick-replies",
    label: "Quick Replies",
    description: "Buttons for quick responses",
    icon: <MessageSquare className="w-5 h-5" />,
    type: "QUICK_REPLIES",
  },
  {
    id: "smart-ai",
    label: "Smart AI",
    description: "AI-powered response",
    icon: <Bot className="w-5 h-5" />,
    type: "SMARTAI",
  },
];

const CONDITIONS = [
  {
    id: "yes-condition",
    label: "Yes (Continue)",
    description: "If condition is true",
    icon: <CheckCircle className="w-5 h-5" />,
    type: "YES",
  },
  {
    id: "no-condition",
    label: "No (Stop)",
    description: "If condition is false",
    icon: <XCircle className="w-5 h-5" />,
    type: "NO",
  },
  {
    id: "is-follower",
    label: "Is Follower",
    description: "Check if user follows",
    icon: <UserCheck className="w-5 h-5" />,
    type: "IS_FOLLOWER",
  },
  {
    id: "delay",
    label: "Delay",
    description: "Wait before next action",
    icon: <Clock className="w-5 h-5" />,
    type: "DELAY",
  },
  {
    id: "has-tag",
    label: "Has Tag",
    description: "Check user has tag",
    icon: <Tag className="w-5 h-5" />,
    type: "HAS_TAG",
  },
];

type ComponentsPanelProps = {
  className?: string;
};

const ComponentsPanel = ({ className }: ComponentsPanelProps) => {
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    triggers: true,
    actions: true,
    conditions: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const onDragStart = (
    event: React.DragEvent, 
    nodeType: "trigger" | "action" | "condition", 
    nodeSubType: string, 
    label: string, 
    description: string
  ) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify({
      type: nodeType,
      subType: nodeSubType,
      label,
      description,
    }));
    event.dataTransfer.effectAllowed = "move";
  };

  const renderDraggableItem = (
    item: { id: string; label: string; description: string; icon: React.ReactNode; type: string },
    nodeType: "trigger" | "action" | "condition",
    colorClass: string
  ) => (
    <div
      key={item.id}
      draggable
      onDragStart={(e) => onDragStart(e, nodeType, item.type, item.label, item.description)}
      className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-grab hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all active:cursor-grabbing"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={colorClass}>{item.icon}</div>
        <p className="font-medium text-sm text-gray-900 dark:text-white">
          {item.label}
        </p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">
        {item.description}
      </p>
    </div>
  );

  return (
    <div
      className={cn(
        "w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto flex flex-col",
        className
      )}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Components
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Drag to canvas to add
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Triggers Section */}
        <div>
          <button
            onClick={() => toggleSection("triggers")}
            className="w-full flex items-center justify-between text-left font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm hover:text-gray-900 dark:hover:text-white"
          >
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              Triggers
            </span>
            {expandedSections.triggers ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {expandedSections.triggers && (
            <div className="space-y-2">
              {TRIGGERS.map((trigger) => renderDraggableItem(trigger, "trigger", "text-blue-500"))}
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div>
          <button
            onClick={() => toggleSection("actions")}
            className="w-full flex items-center justify-between text-left font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm hover:text-gray-900 dark:hover:text-white"
          >
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              Actions
            </span>
            {expandedSections.actions ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {expandedSections.actions && (
            <div className="space-y-2">
              {ACTIONS.map((action) => renderDraggableItem(action, "action", "text-green-500"))}
            </div>
          )}
        </div>

        {/* Conditions Section */}
        <div>
          <button
            onClick={() => toggleSection("conditions")}
            className="w-full flex items-center justify-between text-left font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm hover:text-gray-900 dark:hover:text-white"
          >
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              Conditions
            </span>
            {expandedSections.conditions ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {expandedSections.conditions && (
            <div className="space-y-2">
              {CONDITIONS.map((condition) => renderDraggableItem(condition, "condition", "text-yellow-500"))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComponentsPanel;
