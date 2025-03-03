"use client";

import { SIDEBAR_MENU } from "@/constants/menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePaths } from "@/hooks/use-nav";
import { useRouter } from "next/navigation";

type Props = {
  slug: string;
};

const MobileNav = ({ slug }: Props) => {
  const { page } = usePaths();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleNavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(true);
  };

  const handleOverlayClick = () => {
    setIsExpanded(false);
  };

  const handleLinkClick = (path: string) => {
    setIsExpanded(false);
    router.push(path);
  };

  return (
    <>
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-[999] backdrop-blur-sm transition-all duration-300 ease-in-out opacity-0 animate-in fade-in-0"
          onClick={handleOverlayClick}
        />
      )}
      <div 
        onClick={handleNavClick}
        className={cn(
          "lg:hidden fixed left-1/2 -translate-x-1/2 bg-[#E1E5E9] dark:bg-gray-800 rounded-full shadow-lg z-[1000] transition-all duration-500 ease-in-out",
          isExpanded ? "top-6" : "bottom-6",
          isVisible && !isExpanded ? "translate-y-0" : !isExpanded ? "translate-y-full opacity-0" : "opacity-100"
        )}
      >
        <div className="flex items-center justify-center gap-1 px-2 py-2">
          {SIDEBAR_MENU.map((item) => {
            const isHome = item.label === "home";
            const isActive = isHome ? page === slug : page === item.label;
            const path = `/dashboard/${slug}${isHome ? "" : `/${item.label}`}`;

            return (
              <button
                key={item.id}
                onClick={() => handleLinkClick(path)}
                className={cn(
                  "p-2 rounded-full transition-all duration-300 relative",
                  isActive
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-gray-700/50"
                )}
              >
                <span className="w-5 h-5">{item.icon}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileNav;