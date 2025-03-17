"use client";
import { onOAuthInstagram } from "@/actions/integrations";
import { onUserInfo } from "@/actions/user";
import { Button } from "@/components/ui/button";
import useConfirm from "@/hooks/use-confirm";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import dynamic from "next/dynamic";

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

  // Show confetti only on first successful integration
  React.useEffect(() => {
    const integrated = userData?.data?.integrations.find(
      (integration) => integration.name === strategy
    );
    const storageKey = `integration_${strategy}_connected`;
    const hasShownConfetti = localStorage.getItem(storageKey);
    
    if (integrated?.name === strategy && !hasShownConfetti) {
      localStorage.setItem(storageKey, 'true');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
    }
  }, [userData?.data?.integrations, strategy]);

  if (isLoading) {
    return (
      <div className="rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm flex items-center gap-6 relative overflow-hidden border-2 border-black dark:border-gray-700 animate-pulse">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="flex flex-col flex-1 space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
        <div className="w-[160px] h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  const integrated = userData?.data?.integrations.find(
    (integration) => integration.name === strategy
  );

  const getBackgroundColor = (strategy: string) => {
    switch (strategy) {
      case 'INSTAGRAM':
        return 'bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20';
      case 'MESSENGER':
        return 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/20';
      case 'WHATSAPP':
        return 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/20';
      case 'THREADS':
        return 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700';
      case 'NEWSLETTER':
        return 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/20';
    }
  };

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
      <div className="rounded-lg p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 relative overflow-hidden border-2 border-black dark:border-gray-700">
        {comingSoon && (
          <div className={`absolute top-2 right-2 ${getBackgroundColor(strategy)} dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded shine-effect`}>
            Coming Soon
          </div>
        )}        
        <div className="w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
          {icon}
        </div>
        <div className="flex flex-col flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-1 sm:mt-2">{description}</p>
        </div>
        <Button
          onClick={onInstaOAuth}
          disabled={integrated?.name === strategy || isConnecting || comingSoon}
          className="w-full sm:w-auto bg-black dark:bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 dark:hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] mt-4 sm:mt-0"
        >
          {isConnecting ? "Connecting..." : integrated ? "Connected" : buttonText}
        </Button>
      </div>
      <style jsx>{`
        @keyframes shine {
          0% {
            background-position: -100% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
        .shine-effect {
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%);
          background-size: 200% 100%;
          animation: shine 3s infinite;
        }
      `}</style>
    </>
  );
};

export default IntegrationCard;