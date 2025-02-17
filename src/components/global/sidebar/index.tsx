"use client";
import { usePaths } from "@/hooks/use-nav";
import { LogoSmall } from "../../../app/svgs/logo-small";
import React from "react";
import Items from "./items";
import { HelpDuoToneWhite } from "@/icons";
import ClerkAuthState from "../clerk-auth-state";
import { SubscriptionPlan } from "../subscription-plan";
import { useUser } from "@clerk/nextjs";
import UpgradeCard from "./upgrade";

type Props = {
  slug: string;
};

const Sidebar = ({ slug }: Props) => {
  const { page } = usePaths();
  const { user } = useUser();
  
  return (
    <div className="fixed left-0 top-0 bottom-0 w-[250px] bg-[#F6F7F9] dark:bg-[#1C1C1C] border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col">
      <div className="flex items-center justify-center py-8">
        <div className="w-32 h-auto flex items-center justify-center">
          <LogoSmall />
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-2 mb-6">
        <ClerkAuthState />
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <Items page={page} slug={slug} />
      </nav>

      <div className="mt-auto space-y-4">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">FREE</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">0/1000 contacts</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
          <HelpDuoToneWhite />
          <span>Help</span>
        </div>

        <SubscriptionPlan type="FREE">
        <div className="flex-1 flex flex-col justify-end">
            <UpgradeCard />
          </div>
        </SubscriptionPlan>
      </div>
    </div>
  );
};

export default Sidebar;
