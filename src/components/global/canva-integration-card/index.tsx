"use client";

import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Loader2, Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { isCanvaConnected, disconnectCanva, getCanvaConnectUrl } from "@/actions/canva";
import { toast } from "sonner";

export default function CanvaIntegrationCard() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const result = await isCanvaConnected();
      setIsConnected(result.connected);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await getCanvaConnectUrl();
      if ("error" in result) {
        toast.error(result.error);
        setIsConnecting(false);
        return;
      }
      window.location.href = result.url;
    } catch {
      toast.error("Failed to connect to Canva");
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const result = await disconnectCanva();
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setIsConnected(false);
      toast.success("Canva disconnected");
    } finally {
      setIsLoading(false);
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
        isConnected && "ring-2 ring-purple-500/20 border-purple-200 dark:border-purple-500/30",
        !isConnected && "cursor-pointer"
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
          {isConnected && (
            <Check className="w-4 h-4 text-green-500 shrink-0" />
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
          {isConnected ? "Import designs to scheduler" : "Connect to import designs"}
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
