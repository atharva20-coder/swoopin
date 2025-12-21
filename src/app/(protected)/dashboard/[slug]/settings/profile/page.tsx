"use client";
import React, { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Camera, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Update form when user loads
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Note: Better-Auth user profile updates need to be implemented
      // via your own API endpoint that updates the database
      toast.info("Profile updates will be implemented via API");
      // TODO: Implement profile update API
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href={`/dashboard/${slug}/settings`}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Update your personal information
        </p>
      </div>

      {/* Profile Photo */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Profile Photo</h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {user?.image ? (
                <Image src={user.image} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0] || "U"
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-neutral-800 rounded-full border border-gray-200 dark:border-neutral-700 flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-700">
              <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              JPG, GIF or PNG. Max size 2MB.
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              Upload Photo
            </Button>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-gray-50 dark:bg-neutral-800"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
