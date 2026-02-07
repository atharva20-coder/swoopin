"use client";

import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Loader2, Check, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// REST API calls
async function fetchYouTubeStatus() {
  const res = await fetch("/api/v1/integrations/youtube/status");
  return res.json();
}

async function getYouTubeOAuthUrl() {
  const res = await fetch("/api/v1/integrations/youtube");
  return res.json();
}

async function disconnectYouTube(integrationId: string) {
  const res = await fetch(`/api/v1/integrations/youtube?id=${integrationId}`, {
    method: "DELETE",
  });
  return res.json();
}

export default function YouTubeIntegrationCard() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["youtube-status"],
    queryFn: fetchYouTubeStatus,
    refetchOnMount: "always",
    staleTime: 0,
  });

  // Force refetch when returning from OAuth callback
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "youtube_connected") {
      queryClient.invalidateQueries({ queryKey: ["youtube-status"] });
      refetch();
      toast.success("YouTube connected successfully!");
    }

    const error = searchParams.get("error");
    if (error) {
      toast.error(`YouTube connection failed: ${error}`);
    }
  }, [searchParams, queryClient, refetch]);

  // Extract connection status from REST API response
  const isConnected = data?.success && data?.data?.connected;
  const integrationId = data?.data?.integrationId;
  const channelTitle = data?.data?.channelTitle;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await getYouTubeOAuthUrl();
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        toast.error(result.error?.message || "Failed to get OAuth URL");
        setIsConnecting(false);
      }
    } catch {
      toast.error("Failed to connect to YouTube");
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!integrationId) return;

    try {
      const result = await disconnectYouTube(integrationId);
      if (!result.success) {
        toast.error(result.error?.message || "Failed to disconnect");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["youtube-status"] });
      refetch();
      toast.success("YouTube disconnected");
    } catch {
      toast.error("Failed to disconnect YouTube");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl animate-pulse">
        <div className="w-12 h-12 bg-gray-200 dark:bg-neutral-800 rounded-xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-neutral-800 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-2/3"></div>
        </div>
        <div className="w-12 h-6 bg-gray-200 dark:bg-neutral-800 rounded-full"></div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl transition-all group border",
        "bg-white dark:bg-[#252525] border-gray-200 dark:border-neutral-700/50",
        "hover:bg-gray-50 dark:hover:bg-[#2d2d2d] hover:border-gray-300 dark:hover:border-gray-600",
        isConnected &&
          "ring-2 ring-red-500/20 border-red-200 dark:border-red-500/30",
        !isConnected && "cursor-pointer",
      )}
      onClick={!isConnected ? handleConnect : undefined}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
        <Youtube className="w-6 h-6 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {isConnected && channelTitle ? channelTitle : "YouTube"}
          </h3>
          {isConnected && <Check className="w-4 h-4 text-red-500 shrink-0" />}
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
          {isConnected
            ? "Connected"
            : "Manage comments and engage with your audience"}
        </p>
      </div>

      {/* Toggle/Action */}
      <div className="flex items-center gap-2 shrink-0">
        {isConnecting ? (
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        ) : (
          <>
            <Switch
              checked={isConnected}
              onCheckedChange={() => {
                if (isConnected) {
                  handleDisconnect();
                } else {
                  handleConnect();
                }
              }}
              className="data-[state=checked]:bg-red-600"
            />
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition" />
          </>
        )}
      </div>
    </div>
  );
}
