"use client";

import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import {
  ChevronRight,
  Loader2,
  Check,
  Instagram,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useQueryInstagramProfile } from "@/hooks/user-queries";
import Image from "next/image";
import EarlyAccessFormDialog from "./early-access-form-dialog";

// ============================================
// EARLY ACCESS TOGGLE
// Set NEXT_PUBLIC_INSTAGRAM_EARLY_ACCESS="true" in .env
// to intercept the connect flow with the early-access form.
// Set to "false" or remove to restore normal OAuth.
// ============================================
const IS_EARLY_ACCESS_MODE =
  process.env.NEXT_PUBLIC_INSTAGRAM_EARLY_ACCESS === "true";

// REST API calls
async function fetchInstagramStatus() {
  const res = await fetch("/api/v1/integrations/instagram/status");
  return res.json();
}

async function getInstagramOAuthUrl() {
  const res = await fetch("/api/v1/integrations/instagram/oauth");
  return res.json();
}

async function disconnectInstagram(integrationId: string) {
  const res = await fetch(
    `/api/v1/integrations/instagram?id=${integrationId}`,
    {
      method: "DELETE",
    },
  );
  return res.json();
}

async function fetchEarlyAccessStatus() {
  const res = await fetch("/api/v1/early-access/request");
  return res.json();
}

export default function InstagramIntegrationCard() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showEarlyAccessDialog, setShowEarlyAccessDialog] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["instagram-status"],
    queryFn: fetchInstagramStatus,
    refetchOnMount: "always",
    staleTime: 0,
  });

  // Also fetch Instagram profile for display
  const { data: profileData } = useQueryInstagramProfile();

  // Fetch early access request status (only when toggle is on)
  const { data: earlyAccessData, refetch: refetchEarlyAccess } = useQuery({
    queryKey: ["early-access-status"],
    queryFn: fetchEarlyAccessStatus,
    enabled: IS_EARLY_ACCESS_MODE,
    staleTime: 30_000,
  });

  // Force refetch when returning from OAuth callback
  useEffect(() => {
    const connected = searchParams.get("instagram");
    if (connected === "connected") {
      queryClient.invalidateQueries({ queryKey: ["instagram-status"] });
      refetch();
      toast.success("Instagram connected successfully!");
    }
  }, [searchParams, queryClient, refetch]);

  // Extract connection status from REST API response
  const isConnected = data?.success && data?.data?.connected;
  const integrationId = data?.data?.integrationId;
  const profile = profileData?.status === 200 ? profileData.data : null;

  // Early access state
  const hasEarlyAccessRequest =
    IS_EARLY_ACCESS_MODE &&
    earlyAccessData?.success &&
    earlyAccessData?.data?.hasRequest;
  const earlyAccessStatus = earlyAccessData?.data?.request?.status;

  const handleConnect = async () => {
    // When early access is active and user is not connected, show the form dialog
    if (IS_EARLY_ACCESS_MODE && !isConnected) {
      setShowEarlyAccessDialog(true);
      return;
    }

    setIsConnecting(true);
    try {
      const result = await getInstagramOAuthUrl();
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        toast.error(result.error?.message || "Failed to get OAuth URL");
        setIsConnecting(false);
      }
    } catch {
      toast.error("Failed to connect to Instagram");
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!integrationId) return;

    try {
      const result = await disconnectInstagram(integrationId);
      if (!result.success) {
        toast.error(result.error?.message || "Failed to disconnect");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["instagram-status"] });
      refetch();
      toast.success("Instagram disconnected");
    } catch {
      toast.error("Failed to disconnect Instagram");
    }
  };

  const handleEarlyAccessSuccess = () => {
    refetchEarlyAccess();
  };

  // Format follower count
  const formatFollowers = (count?: number) => {
    if (!count) return null;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Subtitle logic
  const getSubtitle = () => {
    if (isConnected && profile?.follower_count) {
      return `${formatFollowers(profile.follower_count)} followers`;
    }
    if (isConnected) {
      return "Connected";
    }
    if (IS_EARLY_ACCESS_MODE && hasEarlyAccessRequest) {
      if (earlyAccessStatus === "ENROLLED") return "Ready to connect!";
      if (earlyAccessStatus === "CONTACTED") return "We've reached out to you";
      return "Request submitted — we'll be in touch!";
    }
    if (IS_EARLY_ACCESS_MODE) {
      return "Get early access to Instagram integration";
    }
    return "Connect your Instagram account";
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
    <>
      <div
        className={cn(
          "flex items-center gap-4 p-4 rounded-2xl transition-all group border",
          "bg-white dark:bg-[#252525] border-gray-200 dark:border-neutral-700/50",
          "hover:bg-gray-50 dark:hover:bg-[#2d2d2d] hover:border-gray-300 dark:hover:border-gray-600",
          isConnected &&
            "ring-2 ring-pink-500/20 border-pink-200 dark:border-pink-500/30",
          !isConnected && "cursor-pointer",
        )}
        onClick={!isConnected ? handleConnect : undefined}
      >
        {/* Icon / Profile Picture */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center shrink-0 overflow-hidden">
          {isConnected && profile?.profile_pic ? (
            <Image
              src={profile.profile_pic}
              alt={profile.name || "Profile"}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <Instagram className="w-6 h-6 text-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {isConnected && profile?.username
                ? `@${profile.username}`
                : "Instagram"}
            </h3>
            {isConnected && (
              <Check className="w-4 h-4 text-pink-500 shrink-0" />
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
            {getSubtitle()}
          </p>
        </div>

        {/* Toggle/Action */}
        <div className="flex items-center gap-2 shrink-0">
          {isConnecting ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : IS_EARLY_ACCESS_MODE && !isConnected && hasEarlyAccessRequest ? (
            /* Show "Request Sent" badge when early access is active and already submitted */
            <div className="flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
              <Check className="w-3 h-3" />
              <span>Request Sent</span>
            </div>
          ) : IS_EARLY_ACCESS_MODE && !isConnected ? (
            /* Show "Early Access" badge when toggle is on and no request yet */
            <div className="flex items-center gap-1 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              <span>Early Access</span>
            </div>
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
                className="data-[state=checked]:bg-pink-600"
              />
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition" />
            </>
          )}
        </div>
      </div>

      {/* Early Access Dialog — rendered outside the card to avoid click propagation */}
      {IS_EARLY_ACCESS_MODE && (
        <EarlyAccessFormDialog
          open={showEarlyAccessDialog}
          onOpenChange={setShowEarlyAccessDialog}
          onSuccess={handleEarlyAccessSuccess}
        />
      )}
    </>
  );
}
