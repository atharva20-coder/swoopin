"use client";

import { PAGE_BREAD_CRUMBS } from "@/constants/pages";
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Notifications } from "./notifications";
import { usePaths } from "@/hooks/use-nav";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useQueryInstagramProfile } from "@/hooks/user-queries";
import { usePlatform, Platform } from "@/context/platform-context";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
};

const PLATFORM_CONFIG: Record<Platform, { name: string; color: string; bgGradient: string }> = {
  all: { name: 'All', color: '#6366F1', bgGradient: 'from-indigo-500 to-purple-500' },
  instagram: { name: 'Instagram', color: '#E1306C', bgGradient: 'from-[#833AB4] via-[#E1306C] to-[#F77737]' },
  facebook: { name: 'Facebook', color: '#1877F2', bgGradient: 'from-[#1877F2] to-[#4A90D9]' },
  twitter: { name: 'Twitter', color: '#000000', bgGradient: 'from-gray-800 to-gray-900' },
  linkedin: { name: 'LinkedIn', color: '#0A66C2', bgGradient: 'from-[#0A66C2] to-[#0077B5]' },
  youtube: { name: 'YouTube', color: '#FF0000', bgGradient: 'from-[#FF0000] to-[#CC0000]' },
  whatsapp: { name: 'WhatsApp', color: '#25D366', bgGradient: 'from-[#25D366] to-[#128C7E]' },
  gmail: { name: 'Gmail', color: '#EA4335', bgGradient: 'from-[#EA4335] to-[#FBBC05]' },
};

const InfoBar = ({ slug }: Props) => {
  const { page } = usePaths();
  const { data: session } = useSession();
  const user = session?.user;
  const firstName = user?.name?.split(" ")[0] || "user";
  const currentPage = PAGE_BREAD_CRUMBS.includes(page) || page == slug;

  const { data: instagramProfile } = useQueryInstagramProfile();
  const { activePlatform, setActivePlatform, connectedPlatforms } = usePlatform();
  const [isHovered, setIsHovered] = useState(false);

  const isInstagramConnected = instagramProfile?.status === 200 && instagramProfile.data;
  const instaProfile = isInstagramConnected ? instagramProfile.data : null;

  const allPlatforms: Platform[] = ['all', 'instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'whatsapp', 'gmail'];
  const otherConnected = connectedPlatforms.filter(p => p !== activePlatform);

  return (
    currentPage && (
      <div className="flex flex-col w-full transition-all duration-300 pt-2">
        <div className="flex gap-x-3 lg:gap-x-5 justify-between items-center">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Hello, <span className="text-[#2E329F] dark:text-[#4B4EC6]">{firstName}!</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Platform Switcher */}
            <div 
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Collapsed - Pill showing active platform */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer transition-all duration-300",
                "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
                "hover:shadow-md",
                isHovered && "opacity-0 pointer-events-none"
              )}>
                <div 
                  className={cn("w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center", PLATFORM_CONFIG[activePlatform].bgGradient)}
                >
                  {activePlatform === 'instagram' && instaProfile?.profile_pic ? (
                    <img src={instaProfile.profile_pic} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white text-[10px] font-bold">
                      {PLATFORM_CONFIG[activePlatform].name[0]}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {PLATFORM_CONFIG[activePlatform].name}
                </span>
                <div className="flex -space-x-1 ml-1">
                  {otherConnected.slice(0, 2).map(p => (
                    <div 
                      key={p}
                      className="w-4 h-4 rounded-full border border-white dark:border-gray-800"
                      style={{ backgroundColor: PLATFORM_CONFIG[p].color }}
                    />
                  ))}
                  <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 border border-white dark:border-gray-800 flex items-center justify-center text-[8px] font-bold text-gray-600 dark:text-gray-300">
                    +{8 - connectedPlatforms.length}
                  </div>
                </div>
              </div>

              {/* Expanded - All platforms */}
              <div className={cn(
                "absolute right-0 top-0 flex items-center gap-1.5 p-1.5 rounded-full transition-all duration-300",
                "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg",
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              )}>
                {allPlatforms.map((platform) => {
                  const config = PLATFORM_CONFIG[platform];
                  const isActive = activePlatform === platform;
                  const isConnected = connectedPlatforms.includes(platform) || platform === 'all';
                  
                  return (
                    <button
                      key={platform}
                      onClick={() => setActivePlatform(platform)}
                      disabled={!isConnected}
                      className={cn(
                        "relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                        "bg-gradient-to-br",
                        config.bgGradient,
                        isActive && "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-white",
                        !isConnected && "opacity-30 cursor-not-allowed",
                        isConnected && "hover:scale-110"
                      )}
                      title={isConnected ? config.name : `${config.name} (Coming Soon)`}
                    >
                      {platform === 'instagram' && instaProfile?.profile_pic ? (
                        <img src={instaProfile.profile_pic} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white text-xs font-bold">
                          {config.name[0]}
                        </span>
                      )}
                      {isActive && (
                        <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-green-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator orientation="vertical" className="h-6 dark:bg-gray-700" />
            <Notifications slug={slug} />
          </div>
        </div>
        
        <Separator className="w-full my-3 dark:bg-gray-700" />
        
        <div className="flex items-center pb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/dashboard" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
              Auctorn
            </Link>
            <span className="dark:text-gray-500">/</span>
            <Link 
              href={`/dashboard/${page.toLowerCase()}`} 
              className="text-gray-900 dark:text-white font-medium"
            >
              {page === slug ? "Dashboard" : page.charAt(0).toUpperCase() + page.slice(1)}
            </Link>
          </div>
        </div>
      </div>
    )
  );
};

export default InfoBar;