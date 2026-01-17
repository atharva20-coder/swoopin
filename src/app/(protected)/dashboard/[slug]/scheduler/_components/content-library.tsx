"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  GripVertical,
  FileText,
  Zap,
  ExternalLink,
  Image,
  Film,
  Clock,
  MoreHorizontal,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// REST API helpers
async function isCanvaConnected() {
  const res = await fetch("/api/v1/canva/status");
  return res.json();
}

async function getCanvaConnectUrl() {
  const res = await fetch("/api/v1/canva/oauth");
  return res.json();
}

type Automation = {
  id: string;
  name: string;
  active: boolean;
};

type Draft = {
  id: string;
  title: string;
  type: "POST" | "REEL" | "STORY";
  status: "draft" | "processing";
  thumbnail?: string;
  updatedAt: Date;
};

type ContentLibraryProps = {
  automations?: Automation[];
  drafts?: Draft[];
  onCreatePost?: () => void;
  onConnectCanva?: () => void;
  onDragAutomation?: (automation: Automation) => void;
  onDraftClick?: (draft: Draft) => void;
  onCanvaDesignSelect?: (imageUrl: string) => void;
};

// Canva logo component
const CanvaLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <circle cx="12" cy="12" r="10" fill="url(#canva-gradient)" />
    <path
      d="M12 6C8.7 6 6 8.7 6 12s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z"
      fill="white"
    />
    <defs>
      <linearGradient id="canva-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00C4CC" />
        <stop offset="50%" stopColor="#7D2AE8" />
        <stop offset="100%" stopColor="#FF6F61" />
      </linearGradient>
    </defs>
  </svg>
);

export default function ContentLibrary({
  automations = [],
  drafts = [],
  onCreatePost,
  onConnectCanva,
  onDragAutomation,
  onDraftClick,
  onCanvaDesignSelect,
}: ContentLibraryProps) {
  const [canvaConnected, setCanvaConnected] = useState(false);
  const [canvaLoading, setCanvaLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    checkCanvaConnection();
  }, []);

  const checkCanvaConnection = async () => {
    setCanvaLoading(true);
    try {
      const result = await isCanvaConnected();
      // REST API returns { success: boolean, data: { connected: boolean } }
      if (result.success && result.data) {
        setCanvaConnected(result.data.connected);
      } else {
        setCanvaConnected(false);
      }
    } catch (error) {
      console.error("Error checking Canva connection:", error);
    } finally {
      setCanvaLoading(false);
    }
  };

  const handleConnectCanva = async () => {
    if (canvaConnected) {
      toast.info("Opening Canva picker...");
      onConnectCanva?.();
      return;
    }

    setConnecting(true);
    try {
      const result = await getCanvaConnectUrl();
      // REST API returns { success: boolean, data: { url: string } }
      if (!result.success) {
        toast.error(result.error?.message || "Failed to connect to Canva");
        return;
      }
      window.location.href = result.data.url;
    } catch (error) {
      toast.error("Failed to connect to Canva");
    } finally {
      setConnecting(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, automation: Automation) => {
    e.dataTransfer.setData("automation", JSON.stringify(automation));
    e.dataTransfer.effectAllowed = "copy";
    onDragAutomation?.(automation);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "REEL":
        return Film;
      case "STORY":
        return Clock;
      default:
        return Image;
    }
  };

  return (
    <div className="w-72 shrink-0 flex flex-col h-full bg-white dark:bg-neutral-950 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-neutral-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Content Library
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Canva Integration */}
        <div className="p-4 border-b border-gray-100 dark:border-neutral-800">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Design Tools
          </h3>
          <button
            onClick={handleConnectCanva}
            disabled={connecting || canvaLoading}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
              canvaConnected
                ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 hover:bg-green-100/50"
                : "border-dashed border-gray-200 dark:border-neutral-700 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20",
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
              {connecting || canvaLoading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <CanvaLogo />
              )}
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {canvaConnected ? "Import from Canva" : "Connect Canva"}
              </p>
              <p className="text-xs text-gray-500">
                {canvaConnected ? "Browse your designs" : "Import your designs"}
              </p>
            </div>
            {canvaConnected ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <ExternalLink className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>

        {/* Automations */}
        <div className="p-4 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Automations
              </h3>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
              {automations.length}
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-3">
            Drag to calendar to schedule
          </p>

          <div className="space-y-2">
            {automations.length > 0 ? (
              automations.map((automation) => (
                <div
                  key={automation.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, automation)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all",
                    "hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700",
                    automation.active
                      ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20"
                      : "border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900",
                  )}
                >
                  <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm truncate flex-1 text-gray-900 dark:text-white">
                    {automation.name}
                  </span>
                  {automation.active && (
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                No automations yet
              </p>
            )}
          </div>
        </div>

        {/* Drafts */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drafts
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {drafts.length > 0 ? (
              drafts.map((draft) => {
                const TypeIcon = getTypeIcon(draft.type);
                return (
                  <button
                    key={draft.id}
                    onClick={() => onDraftClick?.(draft)}
                    className="aspect-square rounded-xl border border-gray-200 dark:border-neutral-700 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all flex flex-col items-center justify-center gap-1 bg-gray-50 dark:bg-neutral-800/50 group"
                    title={draft.title}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <TypeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-full px-1">
                      {draft.type}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-gray-400 text-center py-4 col-span-3">
                No drafts yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Button */}
      <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={onCreatePost}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </div>
    </div>
  );
}
