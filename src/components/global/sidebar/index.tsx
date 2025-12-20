"use client";
import { usePaths } from "@/hooks/use-nav";
import React from "react";
import Items from "./items";
import { SubscriptionPlan } from "../subscription-plan";
import { useSession, signOut } from "@/lib/auth-client";
import { useTheme } from "@/contexts/theme-context";
import UpgradeCard from "./upgrade";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreditCard, Settings, HelpCircle, Moon, Sun, LogOut, User, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  slug: string;
};

const Sidebar = ({ slug }: Props) => {
  const { page } = usePaths();
  const { data: session } = useSession();
  const user = session?.user;
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const router = useRouter();
  
  React.useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '80px' : '280px');
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
    <div className={`lg:flex fixed left-0 top-0 bottom-0 ${isCollapsed ? 'w-[80px]' : 'w-[280px]'} bg-[#F6F5F8] dark:bg-[#1C1C1C] flex-col hidden transition-all duration-300 border-r border-gray-200 dark:border-gray-800`}>
      <div className={`p-6 space-y-6 ${isCollapsed ? 'items-center px-3' : ''}`}>
        {/* Logo */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} w-full relative`}>
          <div className="flex items-center gap-3">
            <Image
              src="/landingpage-images/Autcorn-logo.svg"
              alt="Autcorn Logo"
              width={isCollapsed ? 32 : 40}
              height={isCollapsed ? 32 : 40}
              className="transition-all duration-300"
            />
            <span className={`font-['Brice'] font-bold text-2xl text-gray-900 dark:text-gray-100 ${isCollapsed ? 'hidden' : ''}`}>Auctorn</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-8 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:scale-105 transition-transform z-50"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <Image
              src={isCollapsed ? '/icons/expand-right-stop-svgrepo-com.svg' : '/icons/expand-left-stop-svgrepo-com.svg'}
              alt="toggle sidebar"
              width={16}
              height={16}
              className="transition-transform duration-300"
            />
          </Button>
        </div>
        <div className="border-b border-gray-200 dark:border-gray-700 w-full"></div>

        {/* Navigation */}
        <nav className="space-y-1">
          <Items page={page} slug={slug} isCollapsed={isCollapsed} />
        </nav>
      </div>

      {/* Footer Actions */}
      <div className={`mt-auto p-4 ${isCollapsed ? 'items-center px-3' : 'space-y-3'} border-t border-gray-100 dark:border-gray-800 flex flex-col`}>        
        {isCollapsed ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => router.push(`/dashboard/${slug}/settings`)}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none mt-2">
                  <Avatar className="w-10 h-10 ring-2 ring-gray-200 dark:ring-gray-700 cursor-pointer hover:ring-purple-500 transition-all">
                    <AvatarImage src={user?.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-medium">
                      {user?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="right" className="w-56">
                <div className="flex items-center gap-3 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">{user?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-semibold truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
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
          </>
        ) : (
          <>
            {/* Quick Actions Row */}
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start gap-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span className="text-sm">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </Button>
              <a href="https://www.instagram.com/sandipjoshi990/" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </a>
            </div>

            {/* Upgrade Card */}
            <SubscriptionPlan type="FREE">
              <UpgradeCard />
            </SubscriptionPlan>

            {/* User Profile Card */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full mt-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all group focus:outline-none">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-purple-500/20 group-hover:ring-purple-500/50 transition-all">
                      <AvatarImage src={user?.image || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-medium">
                        {user?.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1 text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user?.name || 'Guest User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-56">
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
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
