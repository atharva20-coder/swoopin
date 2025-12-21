"use client";
import React, { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Instagram, Plus, Smartphone, Mail, Save, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useQueryInstagramProfile } from "@/hooks/user-queries";

interface ProfileTabProps {
  slug: string;
}

export default function ProfileTab({ slug }: ProfileTabProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const { data: instagramProfile } = useQueryInstagramProfile();
  const profile = instagramProfile?.status === 200 ? instagramProfile.data : null;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Placeholder for API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.info("Profile update not implemented yet");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-950 rounded-3xl border border-gray-200 dark:border-neutral-800 p-8 space-y-8">
      {/* Profile Photo */}
      <div className="flex items-start justify-between pb-8 border-b border-gray-200 dark:border-neutral-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile photo</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            This will be displayed on your profile.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center">
            {user?.image ? (
              <Image src={user.image} alt="Profile" width={64} height={64} className="object-cover w-full h-full" />
            ) : profile?.profile_pic ? (
              <Image src={profile.profile_pic} alt="Profile" width={64} height={64} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-neutral-800 text-gray-500 font-bold text-xl">
                {user?.name?.[0] || "U"}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="dark:text-white dark:border-neutral-700">Update</Button>
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">Remove</Button>
          </div>
        </div>
      </div>

      {/* Email Address */}
      <div className="flex items-start justify-between pb-8 border-b border-gray-200 dark:border-neutral-800">
        <div className="max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email address</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
            The email address associated with your account.
          </p>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">{user?.email}</span>
            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 text-xs font-medium">Primary</span>
          </div>
          <Button variant="ghost" size="sm" className="mt-3 p-0 h-auto text-indigo-600 hover:text-indigo-700 hover:bg-transparent">
            <Plus className="w-4 h-4 mr-1.5" />
            Add email address
          </Button>
        </div>
      </div>

      {/* Phone Number */}
      <div className="flex items-start justify-between pb-8 border-b border-gray-200 dark:border-neutral-800">
        <div className="max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Phone number</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
            For notifications and security.
          </p>
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 italic text-sm">
            <Smartphone className="w-4 h-4" />
            <span>No phone number added</span>
          </div>
          <Button variant="ghost" size="sm" className="mt-3 p-0 h-auto text-indigo-600 hover:text-indigo-700 hover:bg-transparent">
            <Plus className="w-4 h-4 mr-1.5" />
            Add phone number
          </Button>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="pb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Connected accounts</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Connect your social media accounts to enable automations.
        </p>

        <div className="space-y-4">
          {/* Instagram */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Instagram</p>
                {profile?.username ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Connected as @{profile.username}</p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Not connected</p>
                )}
              </div>
            </div>
            <Link href={`/dashboard/${slug}/integrations`}>
              {profile?.username ? (
                <Button variant="outline" size="sm" className="dark:text-white dark:border-neutral-700">Manage</Button>
              ) : (
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 border-0">Connect</Button>
              )}
            </Link>
          </div>
          
          <Button variant="ghost" size="sm" className="p-0 h-auto text-indigo-600 hover:text-indigo-700 hover:bg-transparent">
            <Plus className="w-4 h-4 mr-1.5" />
            Connect another account
          </Button>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-neutral-800 flex justify-end gap-3">
        <Button variant="outline" className="dark:text-white dark:border-neutral-700">Cancel</Button>
        <Button onClick={handleSave} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}
