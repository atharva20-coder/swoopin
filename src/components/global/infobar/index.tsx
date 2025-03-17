"use client";

import { PAGE_BREAD_CRUMBS } from "@/constants/pages";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Notifications } from "./notifications";
import { usePaths } from "@/hooks/use-nav";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

type Props = {
  slug: string;
};

const InfoBar = ({ slug }: Props) => {
  const { page } = usePaths();
  const { user } = useUser();
  const firstName = user?.firstName || "user";
  const currentPage = PAGE_BREAD_CRUMBS.includes(page) || page == slug;

  return (
    currentPage && (
      <div className="flex flex-col w-full transition-all duration-300 pt-4 sm:pt-6">
        <div className="flex gap-x-3 lg:gap-x-5 justify-between items-center">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Hello, <span className="text-[#2E329F] dark:text-[#4B4EC6]">{firstName}!</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Notifications slug={slug} />
            <Separator orientation="vertical" className="h-6 dark:bg-gray-700" />
            <UserButton afterSignOutUrl="/" appearance={{
              elements: {
                avatarBox: "w-9 h-9 mr-2",
                userButtonAvatarBox: "w-12 h-12"
              }
            }} />
          </div>
        </div>
        <Separator className="w-full my-2 dark:bg-gray-700" />
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pb-5">
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
    )
  );
};

export default InfoBar;