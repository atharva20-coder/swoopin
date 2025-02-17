import { SIDEBAR_MENU } from "@/constants/menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

type Props = {
  page: string;
  slug: string;
};

const Items = ({ page, slug }: Props) => {
  return (
    <div className="space-y-2">
      {SIDEBAR_MENU.map((item) => {
        const isHome = item.label === "home";
        const isActive = isHome ? page === slug : page === item.label;

        return (
          <Link
            key={item.id}
            href={`/dashboard/${slug}${isHome ? "" : `/${item.label}`}`}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors",
              isActive
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <span className="w-5 h-5">{item.icon}</span>
            <span className="capitalize">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default Items;
