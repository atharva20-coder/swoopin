"use client";
import { usePaths } from "@/hooks/use-nav";
import React from "react";
import Items from "./items";
import { HelpDuoToneWhite } from "@/icons";
import ClerkAuthState from "../clerk-auth-state";
import { SubscriptionPlan } from "../subscription-plan";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "@/contexts/theme-context";
import UpgradeCard from "./upgrade";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CreditCard, Settings, HelpCircle, Moon, Sun } from "lucide-react";
import Image from "next/image";

type Props = {
  slug: string;
};

const Sidebar = ({ slug }: Props) => {
  const { page } = usePaths();
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  React.useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '80px' : '280px');
    document.documentElement.style.setProperty('--main-content-width', isCollapsed ? '95%' : '82%');
  }, [isCollapsed]);

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

        {/* User Profile */}
        <div className={`p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-700">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <div className={`flex flex-col min-w-0 ${isCollapsed ? 'hidden' : ''}`}>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
            </p>
            <p className="text-xs text-[#4B4EC6] dark:text-[#4B4EC6] truncate">
              <strong>{user?.emailAddresses[0]?.emailAddress}</strong>
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <Items page={page} slug={slug} isCollapsed={isCollapsed} />
        </nav>
      </div>

      {/* Footer Actions */}
      <div className={`mt-auto p-6 ${isCollapsed ? 'items-center px-3' : 'space-y-4'} border-t border-gray-100 dark:border-gray-800 flex flex-col`}>        
        {isCollapsed ? (
          <>
            <Button
              variant="ghost"
              className="mb-2 p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="w-12 h-12" /> : <Moon className="w-12 h-12" />}
            </Button>
            <a
              href="https://www.instagram.com/sandipjoshi990/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                className="mb-2 p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <HelpCircle className="w-12 h-12" />
              </Button>
            </a>
            <SubscriptionPlan type="FREE">
              <div className="flex-1">
                <Button 
                  variant="ghost" 
                  className="p-2 bg-gradient-to-br from-[#6d60a3] via-[#9434E6] to-[#CC3BD4] text-white rounded-md hover:opacity-90 transition-opacity"
                >
                  <CreditCard className="w-8 h-8" />
                </Button>
              </div>
            </SubscriptionPlan>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors w-full justify-start px-4 py-2 mb-4"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span> {theme === 'dark' ? 'Light' : 'Dark'} Theme</span>
            </Button>
            <a
              href="https://www.instagram.com/sandipjoshi990/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors w-full justify-start px-4 py-2 mb-4"
              >
                <HelpCircle className="w-5 h-5" />
                <span>Help & Support</span>
              </Button>
            </a>
            <SubscriptionPlan type="FREE">
              <div className="flex-1">
                <UpgradeCard />
              </div>
            </SubscriptionPlan>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
