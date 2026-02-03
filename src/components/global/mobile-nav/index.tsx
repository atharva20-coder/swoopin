"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { useState } from "react";
import { usePaths } from "@/hooks/use-nav";
import { useTheme } from "@/contexts/theme-context";
import {
  Home,
  MessageCircle,
  Zap,
  Calendar,
  MoreHorizontal,
  CalendarCheck,
  Users,
  ShoppingBag,
  Megaphone,
  Database,
  Rocket,
  Settings,
  X,
  Sun,
  Moon,
} from "lucide-react";

type Props = {
  slug: string;
};

// Primary nav items (always visible in bottom bar)
const PRIMARY_NAV = [
  { id: "home", label: "home", icon: Home, name: "Home" },
  { id: "inbox", label: "inbox", icon: MessageCircle, name: "Inbox" },
  { id: "automations", label: "automations", icon: Zap, name: "Automations" },
  { id: "scheduler", label: "scheduler", icon: Calendar, name: "Scheduler" },
];

// Secondary nav items (shown in "More" menu)
const SECONDARY_NAV = [
  {
    id: "collabs",
    label: "collabs",
    icon: Users,
    name: "Collabs",
    isBeta: true,
  },
  {
    id: "commerce",
    label: "commerce",
    icon: ShoppingBag,
    name: "Commerce",
    isBeta: true,
  },
  { id: "ads", label: "ads", icon: Megaphone, name: "Ads", isBeta: true },
  {
    id: "data-hub",
    label: "data-hub",
    icon: Database,
    name: "Data Hub",
    isBeta: true,
  },
  {
    id: "integrations",
    label: "integrations",
    icon: Rocket,
    name: "Integrations",
  },
  { id: "settings", label: "settings", icon: Settings, name: "Settings" },
];

const MobileNav = ({ slug }: Props) => {
  const { page } = usePaths();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isSecondaryActive = SECONDARY_NAV.some(
    (item) => page === item.label || page.startsWith(item.label),
  );

  return (
    <>
      {/* More Menu Overlay */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* More Menu Sheet */}
      <div
        className={cn(
          "lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out",
          isMenuOpen ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 dark:bg-neutral-700 rounded-full" />
        </div>

        {/* Header with theme toggle */}
        <div className="flex items-center justify-between px-5 pb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            More
          </h3>
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-500" />
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-4 gap-2 px-4 pb-24">
          {SECONDARY_NAV.map((item) => {
            const isActive = page === item.label || page.startsWith(item.label);
            const path = `/dashboard/${slug}/${item.label}`;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200 relative",
                  "hover:scale-105 active:scale-95",
                  isActive
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 active:bg-gray-200 dark:active:bg-neutral-700",
                )}
              >
                {"isBeta" in item && item.isBeta && (
                  <span className="absolute -top-1 -right-1 px-1 py-0.5 text-[8px] font-bold rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    Beta
                  </span>
                )}
                <Icon
                  className={cn(
                    "w-6 h-6 transition-transform",
                    isActive && "animate-bounce-once",
                  )}
                />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-neutral-800">
        <div className="flex items-center justify-around h-14 px-2">
          {PRIMARY_NAV.map((item) => {
            const isHome = item.label === "home";
            const isActive = isHome
              ? page === slug
              : page === item.label || page.startsWith(item.label);
            const path = `/dashboard/${slug}${isHome ? "" : `/${item.label}`}`;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={path}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 h-12 transition-all duration-200",
                  "hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl active:scale-90",
                  isActive
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-500 dark:text-gray-400",
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6 transition-all duration-200",
                    isActive
                      ? "stroke-[2.5px] scale-110"
                      : "stroke-[1.5px] hover:scale-110",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium transition-all",
                    isActive && "font-semibold",
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 h-12 transition-all duration-200",
              "hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl active:scale-90",
              isSecondaryActive || isMenuOpen
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-500 dark:text-gray-400",
            )}
          >
            <MoreHorizontal
              className={cn(
                "w-6 h-6 transition-all duration-200",
                isSecondaryActive || isMenuOpen
                  ? "stroke-[2.5px] scale-110"
                  : "stroke-[1.5px] hover:scale-110",
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium transition-all",
                (isSecondaryActive || isMenuOpen) && "font-semibold",
              )}
            >
              More
            </span>
          </button>
        </div>

        {/* Home indicator bar (iOS style) */}
        <div className="flex justify-center pb-1">
          <div className="w-32 h-1 bg-gray-300 dark:bg-neutral-700 rounded-full" />
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
