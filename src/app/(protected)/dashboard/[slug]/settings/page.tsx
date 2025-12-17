"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  User, CreditCard, Bell, Shield, Trash2, 
  ChevronRight, Instagram, Zap, Crown, Check, 
  ExternalLink, BadgeCheck, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import DeleteAccount from "./_components/delete-account";
import { useQueryInstagramProfile } from "@/hooks/user-queries";
import Image from "next/image";

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

  const { data: instagramProfile, isLoading: isLoadingProfile } = useQueryInstagramProfile();
  const profile = instagramProfile?.status === 200 ? instagramProfile.data : null;

  // Prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const formatFollowers = (count?: number) => {
    if (!count) return null;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

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
        {/* Profile - Merged with Instagram */}
        <div className="rounded-2xl border overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          {/* Cover/Banner */}
          <div 
            className="h-32 relative bg-cover bg-center"
            style={{ backgroundImage: "url('https://transitivebullsh.it/_next/image?url=https%3A%2F%2Fwww.notion.so%2Fimage%2Fhttps%253A%252F%252Fs3-us-west-2.amazonaws.com%252Fsecure.notion-static.com%252F0cb69622-caba-4237-9639-98cdbd6e58af%252Fbg-gradient-opt.jpg%3Ftable%3Dblock%26id%3Dd1b5dcf8-b9ff-425b-8aef-5ce6f0730202%26cache%3Dv2&w=3840&q=75')" }}
          >
            <div className="absolute inset-0 bg-black/20" />
          </div>
          
          {/* Profile Content */}
          <div className="px-6 pb-6">
            {/* Profile Picture - Overlapping banner */}
            <div className="relative -mt-12 mb-4 flex items-end justify-between">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                {mounted ? (
                  profile?.profile_pic ? (
                    <Image 
                      src={profile.profile_pic} 
                      alt={profile.name || "Profile"} 
                      width={96} 
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {user?.firstName?.[0] || "U"}
                    </span>
                  )
                ) : (
                  <span className="text-3xl font-bold text-white">U</span>
                )}
              </div>
              <div className="flex gap-2 mb-2">
                <Link href={`/dashboard/${slug}/integrations`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Instagram className="w-4 h-4" />
                    Manage
                  </Button>
                </Link>
              </div>
            </div>

            {/* Name and Username */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {profile?.name || user?.fullName || "User"}
                </h2>
                {profile?.is_verified_user && (
                  <BadgeCheck className="w-5 h-5 text-blue-500" />
                )}
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {isLoadingProfile ? "Loading..." : profile?.username ? `@${profile.username}` : user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              {profile?.follower_count ? (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">{formatFollowers(profile.follower_count)}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Followers</span>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-gray-400" />
                <span className="text-green-600 dark:text-green-400 text-sm font-medium">Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400 text-sm">{PLAN_NAMES[currentPlan]}</span>
              </div>
            </div>
          </div>
        </div>

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