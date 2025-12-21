"use client";
import React from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { BadgeCheck, LogOut, Settings, Camera } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useQueryInstagramProfile } from "@/hooks/user-queries";

interface ProfileHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function ProfileHeader({ activeTab, setActiveTab }: ProfileHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const { data: instagramProfile } = useQueryInstagramProfile();
  const profile = instagramProfile?.status === 200 ? instagramProfile.data : null;

  const handleSignOut = async () => {
    const { signOut } = await import("@/lib/auth-client");
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/sign-in");
        },
      },
    });
  };

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
    { id: "billing", label: "Billing" },
    { id: "notifications", label: "Notifications" },
  ];

  return (
    <div className="bg-white dark:bg-neutral-950 rounded-3xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-sm">
      {/* Cover Image */}
      <div className="h-48 relative w-full bg-gradient-to-r from-gray-800 to-gray-900">
        <Image
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop"
          alt="Cover"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="px-8 pb-4">
        <div className="relative flex justify-between items-end -mt-10 mb-6">
          <div className="flex items-end gap-6">
            {/* Profile Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-neutral-950 overflow-hidden bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : profile?.profile_pic ? (
                  <Image
                    src={profile.profile_pic}
                    alt={profile.name || "User"}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-gray-400">
                    {user?.name?.[0] || "U"}
                  </span>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile?.name || user?.name || "User"}
                </h1>
                {profile?.is_verified_user && (
                  <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500/10" />
                )}
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium border border-green-500/20">
                  Active
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {profile?.username ? `@${profile.username}` : user?.email}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-4">
            <Button 
              variant="outline" 
              className="bg-white/5 border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 backdrop-blur-sm text-gray-900 dark:text-white"
              onClick={() => setActiveTab("profile")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage account
            </Button>
            <Button 
              variant="destructive" 
              className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 border"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-neutral-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-3 text-sm font-medium transition-colors relative",
                activeTab === tab.id
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
