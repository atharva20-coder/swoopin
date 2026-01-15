"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
  Tag,
  Crown,
  Sparkles,
  FileSpreadsheet,
  MessageCircle,
  MousePointerClick,
  AtSign,
} from "lucide-react";

// Node definition with pro/enterprise flag
type NodeDefinition = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  type: string;
  tier?: "FREE" | "PRO" | "ENTERPRISE";
  usageKey?: "dms" | "automations" | "aiResponses"; // Which limit applies to this node
  beta?: boolean; // Mark as beta feature
  disabled?: boolean; // Disable the node from being used
};

const TRIGGERS: NodeDefinition[] = [
  {
    id: "new-comment",
    label: "New Comment",
    description: "Trigger on new comment",
    icon: <MessageSquare className="w-5 h-5" />,
    type: "COMMENT",
    tier: "FREE",
  },
  {
    id: "new-dm",
    label: "New DM",
    description: "Trigger on direct message",
    icon: <Mail className="w-5 h-5" />,
    type: "DM",
    tier: "FREE",
  },
  {
    id: "keyword-reply",
    label: "Keyword Match",
    description: "Trigger on specific keyword",
    icon: <Reply className="w-5 h-5" />,
    type: "KEYWORDS",
    tier: "FREE",
  },
  {
    id: "select-posts",
    label: "Select Posts",
    description: "Attach specific Instagram posts",
    icon: <ImagePlus className="w-5 h-5" />,
    type: "SELECT_POSTS",
    tier: "FREE",
  },
  {
    id: "story-reply",
    label: "Story Reply",
    description: "Trigger when someone replies to your story",
    icon: <MessageCircle className="w-5 h-5" />,
    type: "STORY_REPLY",
    tier: "FREE",
  },
  {
    id: "postback",
    label: "Button Click",
    description: "Trigger when user clicks a button",
    icon: <MousePointerClick className="w-5 h-5" />,
    type: "POSTBACK",
    tier: "FREE",
  },
  {
    id: "mention",
    label: "New Mention",
    description: "Trigger on @mention in caption/comment",
    icon: <AtSign className="w-5 h-5" />,
    type: "MENTION",
    tier: "PRO",
  },
];

const ACTIONS: NodeDefinition[] = [
  {
    id: "send-message",
    label: "Send DM",
    description: "Send a direct message",
    icon: <Send className="w-5 h-5" />,
    type: "MESSAGE",
    tier: "FREE",
    usageKey: "dms",
  },
  {
    id: "reply-comment",
    label: "Reply Comment",
    description: "Reply to comment",
    icon: <MessageCircleReply className="w-5 h-5" />,
    type: "REPLY_COMMENT",
    tier: "FREE",
    usageKey: "dms",
  },
  {
    id: "send-carousel",
    label: "Send Carousel",
    description: "Send carousel template",
    icon: <ImageIcon className="w-5 h-5" />,
    type: "CAROUSEL",
    tier: "PRO",
    usageKey: "dms",
  },
  {
    id: "button-template",
    label: "Button Template",
    description: "Send buttons with actions",
    icon: <MessageSquare className="w-5 h-5" />,
    type: "BUTTON_TEMPLATE",
    tier: "PRO",
    usageKey: "dms",
  },
  {
    id: "ice-breakers",
    label: "Ice Breakers",
    description: "Set FAQ quick replies",
    icon: <MessageSquare className="w-5 h-5" />,
    type: "ICE_BREAKERS",
    tier: "PRO",
  },
  {
    id: "persistent-menu",
    label: "Persistent Menu",
    description: "Set always-visible menu",
    icon: <MessageSquare className="w-5 h-5" />,
    type: "PERSISTENT_MENU",
    tier: "PRO",
  },
  {
    id: "product-template",
    label: "Product Template",
    description: "Send catalog products",
    icon: <ImageIcon className="w-5 h-5" />,
    type: "PRODUCT_TEMPLATE",
    tier: "ENTERPRISE",
    usageKey: "dms",
  },
  {
    id: "quick-replies",
    label: "Quick Replies",
    description: "Buttons for quick responses",
    icon: <MessageSquare className="w-5 h-5" />,
    type: "QUICK_REPLIES",
    tier: "FREE",
    usageKey: "dms",
  },
  {
    id: "smart-ai",
    label: "Smart AI",
    description: "AI-powered response",
    icon: <Bot className="w-5 h-5" />,
    type: "SMARTAI",
    tier: "PRO",
    usageKey: "aiResponses",
  },
  {
    id: "log-to-sheets",
    label: "Log to Sheets",
    description: "Save data to Google Sheets",
    icon: <FileSpreadsheet className="w-5 h-5" />,
    type: "LOG_TO_SHEETS",
    tier: "FREE",
  },
  {
    id: "reply-mention",
    label: "Reply to Mention",
    description: "Comment on media where mentioned",
    icon: <AtSign className="w-5 h-5" />,
    type: "REPLY_MENTION",
    tier: "PRO",
  },
];

const CONDITIONS: NodeDefinition[] = [
  {
    id: "yes-condition",
    label: "Yes (Continue)",
    description: "If condition is true",
    icon: <CheckCircle className="w-5 h-5" />,
    type: "YES",
    tier: "FREE",
  },
  {
    id: "no-condition",
    label: "No (Continue)",
    description: "If condition is false",
    icon: <XCircle className="w-5 h-5" />,
    type: "NO",
    tier: "FREE",
  },
  {
    id: "is-follower",
    label: "Is Follower",
    description: "Coming soon - Beta",
    icon: <UserCheck className="w-5 h-5" />,
    type: "IS_FOLLOWER",
    tier: "PRO",
    beta: true,
    disabled: true,
  },
  {
    id: "delay",
    label: "Delay",
    description: "Wait before next action",
    icon: <Clock className="w-5 h-5" />,
    type: "DELAY",
    tier: "FREE",
  },
  {
    id: "has-tag",
    label: "Has Tag",
    description: "Check hashtag in post",
    icon: <Tag className="w-5 h-5" />,
    type: "HAS_TAG",
    tier: "PRO",
  },
];

// Small circular progress component for nodes
const NodeProgress = ({
  value,
  max,
  size = 16,
}: {
  value: number;
  max: number;
  size?: number;
}) => {
  if (max === -1) return null; // Unlimited - don't show

  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 100) return "#ef4444";
    if (percentage >= 80) return "#f59e0b";
    return "#22c55e";
  };

  return (
    <div className="flex items-center gap-1" title={`${value}/${max} used`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="1.5"
          fill="none"
          className="dark:stroke-neutral-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth="1.5"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

// Plan badge component
const PlanBadge = ({ tier }: { tier: "PRO" | "ENTERPRISE" }) => {
  if (tier === "ENTERPRISE") {
    return (
      <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <Crown size={10} />
        ENT
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-gradient-to-r from-amber-500 to-orange-500 text-white">
      <Sparkles size={10} />
      PRO
    </span>
  );
};

type ComponentsPanelProps = {
  className?: string;
};

type UsageData = {
  plan: string;
  usage: {
    dmsUsed: number;
    dmsLimit: number;
    automationsUsed: number;
    automationsLimit: number;
  };
};

const ComponentsPanel = ({ className }: ComponentsPanelProps) => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    triggers: true,
    actions: true,
    conditions: true,
  });
  const [usageData, setUsageData] = useState<UsageData | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch("/api/user/usage");
        const data = await res.json();
        if (data.status === 200) {
          setUsageData({ plan: data.data.plan, usage: data.data.usage });
        }
      } catch (error) {
        console.error("Failed to fetch usage:", error);
      }
    };
    fetchUsage();
  }, []);

  const currentPlan = usageData?.plan || "FREE";
  const dmsUsed = usageData?.usage?.dmsUsed || 0;
  const dmsLimit = usageData?.usage?.dmsLimit || 50;

  const isNodeAvailable = (tier?: "FREE" | "PRO" | "ENTERPRISE") => {
    if (!tier || tier === "FREE") return true;
    if (tier === "PRO")
      return currentPlan === "PRO" || currentPlan === "ENTERPRISE";
    if (tier === "ENTERPRISE") return currentPlan === "ENTERPRISE";
    return false;
  };

  const getUsageForNode = (usageKey?: string) => {
    if (!usageKey || !usageData) return { used: 0, limit: -1 };
    if (usageKey === "dms") return { used: dmsUsed, limit: dmsLimit };
    if (usageKey === "automations")
      return {
        used: usageData.usage.automationsUsed,
        limit: usageData.usage.automationsLimit,
      };
    return { used: 0, limit: -1 };
  };

  const toggleSection = (s: string) =>
    setExpandedSections((p) => ({ ...p, [s]: !p[s] }));

  const onDragStart = (
    e: React.DragEvent,
    nodeType: "trigger" | "action" | "condition",
    item: NodeDefinition
  ) => {
    // Check if node is disabled (beta/coming soon)
    if (item.disabled) {
      e.preventDefault();
      toast.info(`${item.label} is coming soon`, {
        description: "This feature is currently in beta and not available yet.",
      });
      return;
    }

    // Check if node is available for this plan
    if (!isNodeAvailable(item.tier)) {
      e.preventDefault();
      toast.error(`${item.label} requires ${item.tier} plan`, {
        description: "Upgrade your plan to use this feature",
      });
      return;
    }

    // Check quota
    const usage = getUsageForNode(item.usageKey);
    if (usage.limit !== -1 && usage.used >= usage.limit) {
      toast.warning(`${item.label} quota exceeded`, {
        description: `You've used ${usage.used}/${usage.limit}. Upgrade for more.`,
      });
      // Still allow drag but warn
    }

    e.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({
        type: nodeType,
        subType: item.type,
        label: item.label,
        description: item.description,
      })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const renderItem = (
    item: NodeDefinition,
    nodeType: "trigger" | "action" | "condition",
    colorClass: string
  ) => {
    const usage = getUsageForNode(item.usageKey);
    const isDisabled = item.disabled;

    return (
      <div
        key={item.id}
        draggable={!isDisabled}
        onDragStart={(e) => onDragStart(e, nodeType, item)}
        className={cn(
          "p-3 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 transition-all",
          isDisabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-grab hover:shadow-md hover:border-gray-300 dark:hover:border-neutral-600 active:cursor-grabbing"
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className={cn(colorClass, isDisabled && "opacity-50")}>
            {item.icon}
          </div>
          <p className="font-medium text-sm text-gray-900 dark:text-white flex-1">
            {item.label}
          </p>
          {item.beta && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
              BETA
            </span>
          )}
          {item.usageKey && usage.limit !== -1 && (
            <NodeProgress value={usage.used} max={usage.limit} />
          )}
          {item.tier && item.tier !== "FREE" && !item.beta && (
            <PlanBadge tier={item.tier} />
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">
          {item.description}
        </p>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "w-64 bg-gray-50 dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 overflow-y-auto flex flex-col",
        className
      )}
    >
      <div className="p-4 border-b border-gray-200 dark:border-neutral-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Components
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Drag to canvas to add
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <button
            onClick={() => toggleSection("triggers")}
            className="w-full flex items-center justify-between text-left font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm hover:text-gray-900 dark:hover:text-white"
          >
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>Triggers
            </span>
            {expandedSections.triggers ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          {expandedSections.triggers && (
            <div className="space-y-2">
              {TRIGGERS.map((t) => renderItem(t, "trigger", "text-blue-500"))}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => toggleSection("actions")}
            className="w-full flex items-center justify-between text-left font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm hover:text-gray-900 dark:hover:text-white"
          >
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>Actions
            </span>
            {expandedSections.actions ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          {expandedSections.actions && (
            <div className="space-y-2">
              {ACTIONS.map((a) => renderItem(a, "action", "text-green-500"))}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => toggleSection("conditions")}
            className="w-full flex items-center justify-between text-left font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm hover:text-gray-900 dark:hover:text-white"
          >
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              Conditions
            </span>
            {expandedSections.conditions ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          {expandedSections.conditions && (
            <div className="space-y-2">
              {CONDITIONS.map((c) =>
                renderItem(c, "condition", "text-yellow-500")
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComponentsPanel;
