"use client";

import { PAGE_BREAD_CRUMBS } from "@/constants/pages";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Notifications } from "./notifications";
import { usePaths } from "@/hooks/use-nav";
import { useSession, signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  slug: string;
};

const InfoBar = ({ slug }: Props) => {
  const { page } = usePaths();
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const firstName = user?.name?.split(" ")[0] || "user";
  const currentPage = PAGE_BREAD_CRUMBS.includes(page) || page == slug;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

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
            
            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                  <Avatar className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage src={user?.image || undefined} />
                    <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image || undefined} />
                    <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/dashboard/${slug}/settings`)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/${slug}/settings/profile`)}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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