"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Camera, Save, Loader2, User, Globe, Building, Users, Target, Sparkles, UserCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Profile type labels
const PROFILE_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  CREATOR: { label: "Creator", icon: "🎨" },
  INFLUENCER: { label: "Influencer", icon: "⭐" },
  AGENCY: { label: "Agency", icon: "🏢" },
  BRAND: { label: "Brand / Business", icon: "💼" },
  COACH: { label: "Coach / Consultant", icon: "🎯" },
  EDUCATOR: { label: "Educator", icon: "📚" },
  ECOMMERCE: { label: "E-commerce Seller", icon: "🛒" },
  EXPLORING: { label: "Just exploring", icon: "👀" },
};

// Follower range labels
const FOLLOWER_RANGE_LABELS: Record<string, string> = {
  UNDER_1K: "< 1K",
  FROM_1K_TO_10K: "1K - 10K",
  FROM_10K_TO_50K: "10K - 50K",
  FROM_50K_TO_100K: "50K - 100K",
  OVER_100K: "100K+",
};

// Pronouns options
const PRONOUNS_OPTIONS = [
  { value: "", label: "Select..." },
  { value: "he/him", label: "He/Him" },
  { value: "she/her", label: "She/Her" },
  { value: "they/them", label: "They/Them" },
  { value: "other", label: "Other" },
  { value: "prefer_not", label: "Prefer not to say" },
];

// Automation goal labels
const AUTOMATION_GOAL_LABELS: Record<string, string> = {
  auto_dm: "Auto-reply to DMs",
  comment_replies: "Comment keyword replies",
  lead_capture: "Lead capture",
  booking: "Appointment booking",
  support: "Customer support",
  sales: "Sales automation",
  giveaways: "Giveaways",
  broadcasts: "Broadcast messages",
};

type ProfileData = {
  displayName: string;
  phoneNumber: string;
  bio: string;
  pronouns: string;
  age: number | null;
  profileType: string;
  contentCategories: string[];
  platforms: string[];
  primaryPlatform: string;
  followerRange: string;
  automationGoals: string[];
  sellsCoaching: boolean;
  sellsCourses: boolean;
  sellsWorkshops: boolean;
  sellsMemberships: boolean;
  bookingLink: string;
};

type OrgData = {
  name: string;
  orgType: string;
  teamSize: string;
  website: string;
  clientHandles: string[];
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function ProfilePage({ params }: PageProps) {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const { slug } = React.use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [organization, setOrganization] = useState<OrgData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    displayName: "",
    phoneNumber: "",
    bio: "",
    pronouns: "",
    age: "",
  });

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/onboarding");
        const data = await res.json();
        
        if (data.status === 200 && data.data) {
          if (data.data.profile) {
            setProfile(data.data.profile);
            setFormData(prev => ({
              ...prev,
              displayName: data.data.profile.displayName || "",
              phoneNumber: data.data.profile.phoneNumber || "",
              bio: data.data.profile.bio || "",
              pronouns: data.data.profile.pronouns || "",
              age: data.data.profile.age?.toString() || "",
            }));
          }
          if (data.data.organization) {
            setOrganization(data.data.organization);
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
      loadProfile();
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStep: 999,
          isCompleted: true,
          profile: {
            ...profile,
            displayName: formData.displayName,
            phoneNumber: formData.phoneNumber,
            bio: formData.bio,
            pronouns: formData.pronouns,
            age: formData.age ? parseInt(formData.age, 10) : null,
          },
        }),
      });
      
      if (res.ok) {
        // Invalidate caches to refresh data on settings page
        await queryClient.invalidateQueries({ queryKey: ["onboarding-profile"] });
        await queryClient.invalidateQueries({ queryKey: ["instagram-profile"] });
        
        toast.success("Profile updated successfully!");
        
        // Navigate back to settings page
        router.push(`/dashboard/${slug}/settings`);
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to save");
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const profileType = profile?.profileType ? PROFILE_TYPE_LABELS[profile.profileType] : null;
  const isAgencyOrBrand = profile?.profileType === "AGENCY" || profile?.profileType === "BRAND";
  const isCreatorOrInfluencer = profile?.profileType === "CREATOR" || profile?.profileType === "INFLUENCER";
  const isCoachOrEducator = profile?.profileType === "COACH" || profile?.profileType === "EDUCATOR";

  return (
    <div className="w-full py-8 px-6 lg:px-12">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href={`/dashboard/${slug}/settings`}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account information and preferences
        </p>
      </div>

      {/* Profile Photo & Basic Info */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {user?.image ? (
                <Image src={user.image} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                formData.displayName?.[0] || user?.name?.[0] || "U"
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-700">
              <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {formData.displayName || formData.name || "User"}
              </h2>
              {profileType && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-neutral-800 rounded-full text-sm flex items-center gap-1.5">
                  <span>{profileType.icon}</span>
                  <span className="text-gray-700 dark:text-gray-300">{profileType.label}</span>
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">{formData.email}</p>
            {formData.pronouns && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                {PRONOUNS_OPTIONS.find(p => p.value === formData.pronouns)?.label || formData.pronouns}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information - Editable */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Your display name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="pronouns">Pronouns</Label>
            <select
              id="pronouns"
              value={formData.pronouns}
              onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
              className="mt-1 w-full h-10 px-3 rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {PRONOUNS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="13"
              max="120"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="Your age"
              className="mt-1"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              className="mt-1 min-h-[80px] resize-none"
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{formData.bio.length}/200</p>
          </div>
          <div className="col-span-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-gray-50 dark:bg-neutral-800 mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
        </div>
      </div>

      {/* Profile Type */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <UserCircle className="w-5 h-5" />
          Profile Type
        </h3>
        {profileType ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl">{profileType.icon}</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{profileType.label}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your account type determines available features</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Not specified - <Link href="/onboarding" className="text-purple-500 hover:underline">Complete onboarding</Link></p>
        )}
      </div>

      {/* Organization Info (for Agency/Brand) */}
      {isAgencyOrBrand && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building className="w-5 h-5" />
            {profile?.profileType === "AGENCY" ? "Agency Information" : "Brand Information"}
          </h3>
          {organization ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500 dark:text-gray-400 text-sm">Name</Label>
                <p className="text-gray-900 dark:text-white font-medium">{organization.name || "-"}</p>
              </div>
              <div>
                <Label className="text-gray-500 dark:text-gray-400 text-sm">Website</Label>
                <p className="text-blue-600 dark:text-blue-400">{organization.website || "-"}</p>
              </div>
              <div>
                <Label className="text-gray-500 dark:text-gray-400 text-sm">Team Size</Label>
                <p className="text-gray-900 dark:text-white">{organization.teamSize?.replace("SIZE_", "").replace("_", "-") || "-"}</p>
              </div>
              {organization.clientHandles && organization.clientHandles.length > 0 && (
                <div className="col-span-2">
                  <Label className="text-gray-500 dark:text-gray-400 text-sm">Major Clients</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {organization.clientHandles.map((handle, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded text-sm text-gray-700 dark:text-gray-300">
                        {handle}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No organization details provided</p>
          )}
        </div>
      )}

      {/* Audience Info (for Creators/Influencers) */}
      {isCreatorOrInfluencer && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Audience
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-500 dark:text-gray-400 text-sm">Primary Platform</Label>
              <p className="text-gray-900 dark:text-white font-medium capitalize">{profile?.primaryPlatform || "-"}</p>
            </div>
            <div>
              <Label className="text-gray-500 dark:text-gray-400 text-sm">Followers</Label>
              <p className="text-gray-900 dark:text-white font-medium">
                {profile?.followerRange ? (FOLLOWER_RANGE_LABELS[profile.followerRange] || profile.followerRange) : "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Monetization (for Coaches/Educators) */}
      {isCoachOrEducator && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Monetization
          </h3>
          <div className="space-y-2">
            {profile?.sellsCoaching && <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm mr-2">1-on-1 Coaching</span>}
            {profile?.sellsCourses && <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm mr-2">Online Courses</span>}
            {profile?.sellsWorkshops && <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm mr-2">Workshops</span>}
            {profile?.sellsMemberships && <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm mr-2">Memberships</span>}
            {!profile?.sellsCoaching && !profile?.sellsCourses && !profile?.sellsWorkshops && !profile?.sellsMemberships && (
              <p className="text-gray-500 dark:text-gray-400">No monetization methods specified</p>
            )}
            {profile?.bookingLink && (
              <div className="mt-3">
                <Label className="text-gray-500 dark:text-gray-400 text-sm">Booking Link</Label>
                <p className="text-blue-600 dark:text-blue-400">{profile.bookingLink}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Categories */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Content Focus
        </h3>
        {profile?.contentCategories && profile.contentCategories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.contentCategories.map((cat, i) => (
              <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-full text-sm text-blue-700 dark:text-blue-300">
                {cat}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No content categories specified</p>
        )}
      </div>

      {/* Platforms */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Platforms
        </h3>
        {profile?.platforms && profile.platforms.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.platforms.map((platform, i) => (
              <span key={i} className="px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full text-sm text-gray-700 dark:text-gray-300 capitalize">
                {platform}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No platforms specified</p>
        )}
      </div>

      {/* Automation Goals */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Automation Goals
        </h3>
        {profile?.automationGoals && profile.automationGoals.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.automationGoals.map((goal, i) => (
              <span key={i} className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-sm text-green-700 dark:text-green-300">
                {AUTOMATION_GOAL_LABELS[goal] || goal.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No automation goals specified</p>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-between items-center">
        <Link 
          href="/onboarding" 
          className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          ← Re-take Onboarding
        </Link>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
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
