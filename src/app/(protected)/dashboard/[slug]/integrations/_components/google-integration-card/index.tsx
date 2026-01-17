"use client";

import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Loader2, FileSpreadsheet, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// REST API calls
async function fetchGoogleStatus() {
  const res = await fetch("/api/v1/google/status");
  return res.json();
}

async function disconnectGoogle() {
  const res = await fetch("/api/v1/google", { method: "DELETE" });
  return res.json();
}

export default function GoogleIntegrationCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["google-status"],
    queryFn: fetchGoogleStatus,
    refetchOnMount: "always",
    staleTime: 0,
  });

  // Force refetch when returning from OAuth callback
  useEffect(() => {
    const googleConnected = searchParams.get("google");
    if (googleConnected === "connected") {
      queryClient.invalidateQueries({ queryKey: ["google-status"] });
      refetch();
    }
  }, [searchParams, queryClient, refetch]);

  // Extract connection status from REST API response
  const isConnected = data?.success && data?.data?.connected;
  const email = data?.success ? data?.data?.email : null;

  const handleConnect = async () => {
    setIsConnecting(true);
    // Redirect to Google OAuth with Sheets scope
    // We use the same callback as existing Google auth but request additional scopes
    const callbackUrl = `${window.location.origin}/api/auth/callback/google-sheets`;
    const scope = encodeURIComponent(
      "openid email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file",
    );

    // Fetch client ID from server to avoid exposing in client bundle
    const res = await fetch("/api/google/client-id");
    const { clientId } = await res.json();

    if (!clientId) {
      alert("Google OAuth not configured. Please add GOOGLE_CLIENT_ID to .env");
      setIsConnecting(false);
      return;
    }

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      callbackUrl,
    )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  };

  const handleDisconnect = async () => {
    try {
      await disconnectGoogle();
      queryClient.invalidateQueries({ queryKey: ["google-status"] });
      refetch();
    } catch (error) {
      console.error("Failed to disconnect Google:", error);
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
          "ring-2 ring-green-500/20 border-green-200 dark:border-green-500/30",
        !isConnected && "cursor-pointer",
      )}
      onClick={!isConnected ? handleConnect : undefined}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 border border-green-200 dark:border-green-600/50">
        <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            Google Sheets
          </h3>
          {isConnected && <Check className="w-4 h-4 text-green-500 shrink-0" />}
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
          {isConnected && email ? email : "Export data to spreadsheets"}
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
              className="data-[state=checked]:bg-green-600"
            />
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition" />
          </>
        )}
      </div>
    </div>
  );
}
