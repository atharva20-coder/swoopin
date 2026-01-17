"use client";

import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Loader2, Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// REST API calls
async function fetchCanvaStatus() {
  const res = await fetch("/api/v1/canva/status");
  return res.json();
}

async function getCanvaConnectUrl() {
  const res = await fetch("/api/v1/canva/oauth");
  return res.json();
}

async function disconnectCanva() {
  const res = await fetch("/api/v1/canva", { method: "DELETE" });
  return res.json();
}

export default function CanvaIntegrationCard() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["canva-status"],
    queryFn: fetchCanvaStatus,
    refetchOnMount: "always",
    staleTime: 0,
  });

  // Force refetch when returning from OAuth callback
  useEffect(() => {
    const canvaConnected = searchParams.get("canva");
    if (canvaConnected === "connected") {
      queryClient.invalidateQueries({ queryKey: ["canva-status"] });
      refetch();
    }
  }, [searchParams, queryClient, refetch]);

  // Extract connection status from REST API response
  const isConnected = data?.success && data?.data?.connected;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await getCanvaConnectUrl();
      // REST API returns { success: boolean, data: { url: string } } or { success: false, error: { ... } }
      if (!result.success) {
        toast.error(result.error?.message || "Failed to connect to Canva");
        setIsConnecting(false);
        return;
      }
      window.location.href = result.data.url;
    } catch {
      toast.error("Failed to connect to Canva");
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const result = await disconnectCanva();
      // REST API returns { success: boolean, data: { disconnected: boolean } }
      if (!result.success) {
        toast.error(result.error?.message || "Failed to disconnect");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["canva-status"] });
      refetch();
      toast.success("Canva disconnected");
    } catch (error) {
      toast.error("Failed to disconnect Canva");
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
        "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group border h-full",
        "bg-white dark:bg-[#222222] border-gray-200 dark:border-neutral-800",
        "hover:shadow-lg hover:-translate-y-0.5 dark:hover:bg-[#262626] dark:hover:border-neutral-700",
        isConnected &&
          "bg-purple-50/30 dark:bg-purple-900/10 border-purple-200 dark:border-purple-500/20",
        !isConnected && "cursor-pointer",
      )}
      onClick={!isConnected ? handleConnect : undefined}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center shrink-0">
        <Palette className="w-6 h-6 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            Canva
          </h3>
          {isConnected && <Check className="w-4 h-4 text-green-500 shrink-0" />}
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
          {isConnected
            ? "Import designs to scheduler"
            : "Connect to import designs"}
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
              className="data-[state=checked]:bg-purple-600"
            />
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition" />
          </>
        )}
      </div>
    </div>
  );
}
