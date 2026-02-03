"use client";

import {
  SIDEBAR_MENU_GROUPED,
  SIDEBAR_BOTTOM_ITEMS,
  ADMIN_SIDEBAR_MENU,
  MenuCategory,
} from "@/constants/menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  page: string;
  slug: string;
  isCollapsed: boolean;
  isAdmin?: boolean;
};

const Items = ({ page, slug, isCollapsed, isAdmin = false }: Props) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(SIDEBAR_MENU_GROUPED.map((c) => c.id)),
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  if (isAdmin) {
    return (
      <div className="space-y-1">
        {ADMIN_SIDEBAR_MENU.map((item) => {
          const isHome = item.label === "admin";
          const isActive = isHome
            ? page === "admin"
            : page === item.label || page.startsWith(item.label);
          const path = `/dashboard/${slug}/${item.label}`;

          return (
            <Link
              key={item.id}
              href={path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 transition-all duration-200 rounded-lg",
                isActive
                  ? "bg-white dark:bg-neutral-800 text-purple-600 dark:text-purple-400 font-semibold shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-neutral-800/50",
                isCollapsed && "justify-center px-2",
              )}
            >
              <span className="w-5 h-5 flex items-center justify-center shrink-0">
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="text-sm">{item.name || item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Grouped Categories */}
      <div className="space-y-4 flex-1">
        {SIDEBAR_MENU_GROUPED.map((category) => {
          const isExpanded = expandedCategories.has(category.id);

          return (
            <div key={category.id}>
              {/* Category Header */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {category.title}
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 transition-transform duration-200",
                      !isExpanded && "-rotate-90",
                    )}
                  />
                </button>
              )}

              {/* Category Items */}
              {(isCollapsed || isExpanded) && (
                <div className={cn("space-y-0.5", !isCollapsed && "mt-1")}>
                  {category.items.map((item) => {
                    const isHome = item.label === "home";
                    const isActive = isHome
                      ? page === slug
                      : page === item.label || page.startsWith(item.label);
                    const path = `/dashboard/${slug}${isHome ? "" : `/${item.label}`}`;

                    return (
                      <Link
                        key={item.id}
                        href={path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 transition-all duration-200 rounded-lg group",
                          isActive
                            ? "bg-white dark:bg-neutral-800 text-purple-600 dark:text-purple-400 font-semibold shadow-sm border border-purple-100 dark:border-purple-900/30"
                            : "text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-neutral-800/60",
                          isCollapsed && "justify-center px-2",
                        )}
                        title={
                          isCollapsed ? item.name || item.label : undefined
                        }
                      >
                        <span
                          className={cn(
                            "w-5 h-5 flex items-center justify-center shrink-0 transition-colors",
                            isActive
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300",
                          )}
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <span className="flex items-center gap-2">
                            <span className="text-sm capitalize">
                              {item.name || item.label}
                            </span>
                            {item.isBeta && (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                Beta
                              </span>
                            )}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      {!isCollapsed && (
        <div className="my-3 border-t border-gray-200 dark:border-neutral-700/50" />
      )}

      {/* Bottom Items */}
      <div className="space-y-0.5">
        {SIDEBAR_BOTTOM_ITEMS.map((item) => {
          const isActive = page === item.label || page.startsWith(item.label);
          const path = `/dashboard/${slug}/${item.label}`;

          return (
            <Link
              key={item.id}
              href={path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 transition-all duration-200 rounded-lg group",
                isActive
                  ? "bg-white dark:bg-neutral-800 text-purple-600 dark:text-purple-400 font-semibold shadow-sm border border-purple-100 dark:border-purple-900/30"
                  : "text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-neutral-800/60",
                isCollapsed && "justify-center px-2",
              )}
              title={isCollapsed ? item.name || item.label : undefined}
            >
              <span
                className={cn(
                  "w-5 h-5 flex items-center justify-center shrink-0 transition-colors",
                  isActive
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300",
                )}
              >
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="text-sm capitalize">
                  {item.name || item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Items;
