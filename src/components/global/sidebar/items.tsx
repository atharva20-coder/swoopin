import { SIDEBAR_MENU } from "@/constants/menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

type Props = {
  page: string;
  slug: string;
  isCollapsed: boolean;
};

const Items = ({ page, slug, isCollapsed }: Props) => {
  const menuItems = [...SIDEBAR_MENU];

  return (
    <div className="space-y-4">
      <h2 className="px-3 text-sm font-bold text-gray-700 dark:text-gray-300">Menu</h2>
      <div className="space-y-1">
        {menuItems.map((item) => {
          const isHome = item.label === "home";
          const isActive = isHome ? page === slug : page === item.label;
          const path = `/dashboard/${slug}${isHome ? "" : `/${item.label}`}`;

          return (
            <Link
              key={item.id}
              href={path}
              className={cn(
                "flex items-center gap-x-6 p-2 transition-all duration-300 rounded-lg",
                isActive
                  ? "bg-white dark:bg-gray-800 text-[#4B4EC6] font-bold border border-black/10 dark:border-white/10"
                  : "text-gray-800 font-medium hover:bg-white dark:text-gray-200 dark:hover:bg-gray-800",
                isCollapsed && "justify-center"
              )}
            >
              <div className={`${isCollapsed ? 'w-8 h-8' : ''} flex items-center justify-center`}>
                {item.icon}
              </div>
              <span className={cn("text-sm font-medium capitalize", isCollapsed && "hidden")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Items;
