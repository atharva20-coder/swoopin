"use client";

import React from "react";
import { ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor?: string;
};

export default function ComingSoonCard({
  title,
  description,
  icon,
  iconBgColor = "bg-gray-100 dark:bg-neutral-800",
}: Props) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl transition-all group border opacity-60",
        "bg-white dark:bg-[#252525] border-gray-200 dark:border-neutral-700/50",
        "cursor-not-allowed",
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          iconBgColor,
        )}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {title}
          </h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
          {description}
        </p>
      </div>

      {/* Coming Soon Badge */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
          <Clock className="w-3 h-3" />
          <span>Coming Soon</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
      </div>
    </div>
  );
}
