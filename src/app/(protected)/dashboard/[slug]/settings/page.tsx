"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  User, CreditCard, Key, Bell, Shield, Trash2, 
  ChevronRight, Instagram, Zap, Crown, Check, 
  AlertCircle, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { OpenAISettings } from "./_components/openai-settings";
import DeleteAccount from "./_components/delete-account";

type PlanType = "FREE" | "PRO" | "ENTERPRISE";

const PLAN_NAMES: Record<PlanType, string> = {
  FREE: "Starter",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

export default function SettingsPage() {
  const { user } = useUser();
  const params = useParams();
  const slug = params.slug as string;

  const [currentPlan, setCurrentPlan] = useState<PlanType>("FREE");
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    dmAlerts: true,
    weeklyReport: false,
  });

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch("/api/user/usage");
        const data = await response.json();
        if (data.status === 200) {
          setCurrentPlan(data.data.plan);
        }
      } catch (error) {
        console.error("Failed to fetch plan:", error);
      } finally {
        setIsLoadingPlan(false);
      }
    };
    fetchPlan();
  }, []);

  const SettingsCard = ({ 
    icon: Icon, 
    title, 
    description, 
    children,
    variant = "default"
  }: { 
    icon: React.ElementType;
    title: string;
    description?: string;
    children: React.ReactNode;
    variant?: "default" | "danger";
  }) => (
    <div className={cn(
      "rounded-2xl border overflow-hidden",
      variant === "danger" 
        ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50" 
        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
    )}>
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            variant === "danger" 
              ? "bg-red-100 dark:bg-red-900/30" 
              : "bg-gray-100 dark:bg-gray-800"
          )}>
            <Icon className={cn(
              "w-5 h-5",
              variant === "danger" 
                ? "text-red-600 dark:text-red-400" 
                : "text-gray-600 dark:text-gray-400"
            )} />
          </div>
          <div>
            <h3 className={cn(
              "text-lg font-semibold",
              variant === "danger" 
                ? "text-red-700 dark:text-red-400" 
                : "text-gray-900 dark:text-white"
            )}>{title}</h3>
            {description && (
              <p className={cn(
                "text-sm mt-0.5",
                variant === "danger" 
                  ? "text-red-600/80 dark:text-red-400/80" 
                  : "text-gray-500 dark:text-gray-400"
              )}>{description}</p>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <SettingsCard icon={User} title="Profile" description="Your personal information">
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shrink-0">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.firstName?.[0] || "U"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                {user?.fullName || "User"}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
            <Link href={`/dashboard/${slug}/settings/profile`}>
              <Button variant="outline" size="sm" className="gap-2 shrink-0">
                Edit
              </Button>
            </Link>
          </div>
        </SettingsCard>

        {/* Subscription */}
        <SettingsCard icon={CreditCard} title="Subscription" description="Manage your plan and billing">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                currentPlan === "FREE" ? "bg-gray-200 dark:bg-gray-700" :
                currentPlan === "PRO" ? "bg-blue-100 dark:bg-blue-900/30" :
                "bg-purple-100 dark:bg-purple-900/30"
              )}>
                {currentPlan === "FREE" ? <Zap className="w-5 h-5 text-gray-600 dark:text-gray-400" /> :
                 <Crown className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {isLoadingPlan ? "Loading..." : `${PLAN_NAMES[currentPlan]} Plan`}
                </p>
                {currentPlan !== "FREE" && (
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Active
                  </p>
                )}
              </div>
            </div>
            <Link href={`/dashboard/${slug}/billing`}>
              <Button className="gap-2">
                {currentPlan === "FREE" ? "Upgrade" : "Manage"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </SettingsCard>

        {/* Instagram */}
        <SettingsCard icon={Instagram} title="Instagram" description="Connected Instagram account">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                <Instagram className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">@{slug}</p>
                <p className="text-sm text-green-600 dark:text-green-400">Connected</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Reconnect</Button>
          </div>
        </SettingsCard>

        {/* OpenAI */}
        <SettingsCard icon={Key} title="OpenAI API" description="Configure AI-powered responses">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <OpenAISettings />
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            Your API key is stored securely. Required for Smart AI responses.
          </p>
        </SettingsCard>

        {/* Notifications */}
        <SettingsCard icon={Bell} title="Notifications" description="Control how we contact you">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive important updates</p>
              </div>
              <Switch 
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
              />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">DM Alerts</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when automations send DMs</p>
              </div>
              <Switch 
                checked={notifications.dmAlerts}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, dmAlerts: checked }))}
              />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Weekly Reports</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive weekly performance summaries</p>
              </div>
              <Switch 
                checked={notifications.weeklyReport}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReport: checked }))}
              />
            </div>
          </div>
        </SettingsCard>

        {/* Security */}
        <SettingsCard icon={Shield} title="Security" description="Manage your account security">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Password</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Change your account password</p>
              </div>
              <Link href={`/dashboard/${slug}/settings/security`}>
                <Button variant="outline" size="sm">Change</Button>
              </Link>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add extra security</p>
              </div>
              <Link href={`/dashboard/${slug}/settings/security`}>
                <Button variant="outline" size="sm">Manage</Button>
              </Link>
            </div>
          </div>
        </SettingsCard>

        {/* Danger Zone */}
        <SettingsCard icon={Trash2} title="Danger Zone" description="Irreversible actions" variant="danger">
          <DeleteAccount />
        </SettingsCard>
      </div>
    </div>
  );
}