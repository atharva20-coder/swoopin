"use client";
import { onOAuthInstagram } from "@/actions/integrations";
import { onUserInfo } from "@/actions/user";
import { Switch } from "@/components/ui/switch";
import useConfirm from "@/hooks/use-confirm";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { ChevronRight, Loader2, Users, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryInstagramProfile } from "@/hooks/user-queries";
import Image from "next/image";

const ReactConfetti = dynamic(() => import("react-confetti"), {
  ssr: false,
  loading: () => null
});

type Props = {
  title: string;
  description: string;
  icon: React.ReactNode;
  strategy: "INSTAGRAM" | "CRM";
  comingSoon?: boolean;
  buttonText?: string;
};

const IntegrationCard = ({ description, icon, strategy, title, comingSoon, buttonText = "Connect" }: Props) => {
  const { data: userData, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: onUserInfo,
  });
  const { data: instagramProfile, isLoading: isLoadingProfile } = useQueryInstagramProfile();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const [ConfirmDialog, confirm] = useConfirm(
    "Terms of Service & Privacy",
    `We comply with ${capitalize(strategy)}'s terms of service and protect your privacy. We do not store sensitive information and ensure secure data handling. By proceeding, you agree to our Terms and Conditions. Learn more at /terms`
  );

  const onInstaOAuth = async () => {
    const ok = await confirm();
    if (!ok) return;
    try {
      setIsConnecting(true);
      if (strategy === 'INSTAGRAM') {
        await onOAuthInstagram('INSTAGRAM');
      } else {
        console.error('Strategy not implemented:', strategy);
      }
    } catch (error) {
      console.error('OAuth Error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  React.useEffect(() => {
    const integrated = userData?.data?.integrations.find(
      (integration: { name: string }) => integration.name === strategy
    );
    const storageKey = `integration_${strategy}_connected`;
    const hasShownConfetti = localStorage.getItem(storageKey);
    
    if (integrated?.name === strategy && !hasShownConfetti) {
      localStorage.setItem(storageKey, 'true');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [userData?.data?.integrations, strategy]);

  const integrated = userData?.data?.integrations.find(
    (integration: { name: string }) => integration.name === strategy
  );

  const isConnected = integrated?.name === strategy;
  const profile = instagramProfile?.status === 200 ? instagramProfile.data : null;

  // Format follower count
  const formatFollowers = (count?: number) => {
    if (!count) return null;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
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
      <ConfirmDialog />
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      <div 
        className={cn(
          "flex items-center gap-4 p-4 rounded-2xl transition-all group border",
          "bg-white dark:bg-[#252525] border-gray-200 dark:border-neutral-700/50",
          "hover:bg-gray-50 dark:hover:bg-[#2d2d2d] hover:border-gray-300 dark:hover:border-gray-600",
          isConnected && "ring-2 ring-blue-500/20 border-blue-200 dark:border-blue-500/30",
          !isConnected && !comingSoon ? "cursor-pointer" : ""
        )}
        onClick={!isConnected && !comingSoon ? onInstaOAuth : undefined}
      >
        {/* Icon / Profile Picture */}
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 dark:border-gray-600/50">
          {isConnected && profile?.profile_pic ? (
            <Image 
              src={profile.profile_pic} 
              alt={profile.name || "Profile"} 
              width={48} 
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            icon
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {isConnected && profile?.username ? `@${profile.username}` : title.replace('Connect ', '')}
            </h3>
            {isConnected && profile?.is_verified_user && (
              <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
            )}
            {comingSoon && (
              <span className="text-[10px] font-bold text-orange-500 uppercase">NEW</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {isConnected && profile?.follower_count ? (
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Users className="w-3 h-3" />
                {formatFollowers(profile.follower_count)} followers
              </span>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Toggle/Action */}
        <div className="flex items-center gap-2 shrink-0">
          {isConnecting ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <>
              <Switch 
                checked={isConnected}
                disabled={comingSoon}
                onCheckedChange={() => {
                  if (!isConnected && !comingSoon) {
                    onInstaOAuth();
                  }
                }}
                className="data-[state=checked]:bg-blue-600"
              />
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition" />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default IntegrationCard;