"use client";
import { usePaths } from "@/hooks/use-nav";
import React from "react";
import Items from "./items";
import UpgradeCard from "./upgrade";
import { SubscriptionPlan } from "../subscription-plan";
import { useSession, signOut } from "@/lib/auth-client";
import { useTheme } from "@/contexts/theme-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, HelpCircle, Moon, Sun, LogOut, User, ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import NinthNodeLogo from "../ninth-node-logo";

type Props = {
  slug: string;
  isAdmin?: boolean;
};

const Sidebar = ({ slug, isAdmin = false }: Props) => {
  const { page } = usePaths();
  const { data: session } = useSession();
  const user = session?.user;
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const router = useRouter();
  
  React.useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '72px' : '260px');
    document.documentElement.style.setProperty('--main-content-width', isCollapsed ? '95%' : '82%');
  }, [isCollapsed]);

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
    <div className={`lg:flex fixed left-0 top-0 bottom-0 ${isCollapsed ? 'w-[72px]' : 'w-[260px]'} bg-[#FAFAFA] dark:bg-neutral-900 flex-col hidden transition-all duration-300 border-r border-gray-200 dark:border-neutral-800`}>
      {/* Header */}
      <div className={`p-4 ${isCollapsed ? 'px-3' : 'px-5'}`}>
        {/* Logo Row */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-4`}>
          <div className="flex items-center gap-2.5">
            <NinthNodeLogo 
              showText={!isCollapsed} 
              iconClassName={isCollapsed ? "w-10 h-10" : "w-14 h-14"}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`w-7 h-7 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ${isCollapsed ? 'hidden' : ''}`}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Collapse Button (when collapsed) */}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="w-full h-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-2"
            onClick={() => setIsCollapsed(false)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
        <Items page={page} slug={slug} isCollapsed={isCollapsed} isAdmin={isAdmin} />
      </nav>

      {/* Footer */}
      <div className={`p-3 border-t border-gray-200 dark:border-neutral-800 ${isCollapsed ? 'px-2' : ''}`}>
        {/* Quick Actions */}
        <div className={`flex ${isCollapsed ? 'flex-col gap-1' : 'items-center gap-1'} mb-2`}>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <a href="https://www.instagram.com/sandipjoshi990/" target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Help"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </a>
        </div>

        {/* Upgrade Card */}
        <SubscriptionPlan type="FREE">
          <div className={`mb-3 ${isCollapsed ? 'flex justify-center' : ''}`}>
            <UpgradeCard isCollapsed={isCollapsed} />
          </div>
        </SubscriptionPlan>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white dark:hover:bg-neutral-800 transition-colors focus:outline-none ${isCollapsed ? 'justify-center' : ''}`}>
              <Avatar className="w-8 h-8 ring-2 ring-gray-200 dark:ring-neutral-700">
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-medium">
                  {user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.name || 'Guest'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side={isCollapsed ? "right" : "top"} className="w-56">
            <div className="flex items-center gap-3 p-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/dashboard/${slug}/${isAdmin ? 'admin/settings' : 'settings'}`)}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/${slug}/settings`)}>
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
  );
};

export default Sidebar;
