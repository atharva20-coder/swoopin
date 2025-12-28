"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

type Props = {
  isCollapsed?: boolean;
};

export default function UpgradeCard({ isCollapsed = false }: Props) {
  if (isCollapsed) {
    return (
      <Link 
        href="./billing"
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center hover:scale-105 transition-transform"
        title="Upgrade to PRO"
      >
        <Sparkles className="w-5 h-5 text-white" />
      </Link>
    );
  }

  return (
    <Link 
      href="./billing"
      className="block p-3 rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-orange-500/20 border border-purple-200 dark:border-purple-800/50 hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
            Upgrade to PRO
            <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Unlock AI & more features
          </p>
        </div>
      </div>
    </Link>
  );
}
