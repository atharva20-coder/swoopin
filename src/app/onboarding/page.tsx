"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ArrowRight, Check, Sparkles, Sun, Moon, Instagram, Youtube, MessageCircle, Globe, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/theme-context";

// Circular Progress Component
const CircularProgress = ({ progress, size = 60 }: { progress: number; size?: number }) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-gray-200 dark:text-neutral-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-purple-500"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transition: "stroke-dashoffset 0.3s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

// Country codes for phone input
const COUNTRY_CODES = [
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
];

// Profile types
const PROFILE_TYPES = [
  { id: "CREATOR", label: "Creator", description: "Content creator on social media", icon: "🎨" },
  { id: "INFLUENCER", label: "Influencer", description: "Brand partnerships & promotions", icon: "⭐" },
  { id: "AGENCY", label: "Agency", description: "Managing multiple clients", icon: "🏢" },
  { id: "BRAND", label: "Brand / Business", description: "Selling products or services", icon: "💼" },
  { id: "COACH", label: "Coach / Consultant", description: "1-on-1 services & mentoring", icon: "🎯" },
  { id: "EDUCATOR", label: "Educator", description: "Courses & educational content", icon: "📚" },
  { id: "ECOMMERCE", label: "E-commerce Seller", description: "Online store owner", icon: "🛒" },
  { id: "EXPLORING", label: "Just exploring", description: "Checking out the platform", icon: "👀" },
];

// Content categories
const CONTENT_CATEGORIES = [
  "Fashion / Lifestyle", "Education / Tutorials", "Tech / Programming",
  "Fitness / Health", "Finance / Investing", "Travel",
  "Beauty / Skincare", "Food / Cooking", "Comedy / Entertainment",
  "Motivation / Self-growth", "Business / Marketing", "E-commerce Products",
  "SaaS / Digital Tools", "Local Services",
];

// Platform icons as React components with brand colors
const PlatformIcons: Record<string, React.ReactNode> = {
  instagram: (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
      <Instagram className="w-6 h-6 text-white" />
    </div>
  ),
  facebook: (
    <div className="w-10 h-10 rounded-xl bg-[#1877F2] flex items-center justify-center">
      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/>
      </svg>
    </div>
  ),
  whatsapp: (
    <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center">
      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
      </svg>
    </div>
  ),
  telegram: (
    <div className="w-10 h-10 rounded-xl bg-[#0088cc] flex items-center justify-center">
      <Send className="w-6 h-6 text-white" />
    </div>
  ),
  youtube: (
    <div className="w-10 h-10 rounded-xl bg-[#FF0000] flex items-center justify-center">
      <Youtube className="w-6 h-6 text-white" />
    </div>
  ),
  twitter: (
    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    </div>
  ),
  linkedin: (
    <div className="w-10 h-10 rounded-xl bg-[#0A66C2] flex items-center justify-center">
      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    </div>
  ),
  threads: (
    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.022.858-.712 2.04-1.134 3.412-1.22 1.107-.07 2.126.033 3.094.272-.034-.752-.173-1.322-.411-1.723-.324-.548-.903-.847-1.678-.869h-.06c-.61 0-1.397.167-1.94.643l-1.375-1.473c.906-.846 2.1-1.291 3.455-1.291h.087c2.345.068 3.938 1.476 4.243 3.756.073.541.096 1.159.066 1.881.76.452 1.381 1.007 1.875 1.674.873 1.18 1.263 2.618 1.095 4.039-.219 1.862-1.058 3.396-2.42 4.435C17.848 23.353 15.39 24 12.186 24zm-1.638-8.422c-.901.054-1.6.304-2.023.689-.332.302-.486.656-.46 1.054.04.643.485 1.108 1.106 1.511.564.365 1.277.552 2.007.513.983-.052 1.76-.394 2.31-1.017.437-.492.722-1.138.868-1.942-.893-.241-1.882-.36-2.943-.3l-.865-.508z"/>
      </svg>
    </div>
  ),
};

const PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook Messenger" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "telegram", label: "Telegram" },
  { id: "youtube", label: "YouTube" },
  { id: "twitter", label: "Twitter / X" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "threads", label: "Threads" },
];

// Follower ranges
const FOLLOWER_RANGES = [
  { id: "UNDER_1K", label: "< 1K" },
  { id: "FROM_1K_TO_10K", label: "1K - 10K" },
  { id: "FROM_10K_TO_50K", label: "10K - 50K" },
  { id: "FROM_50K_TO_100K", label: "50K - 100K" },
  { id: "OVER_100K", label: "100K+" },
];

// Team sizes
const TEAM_SIZES = [
  { id: "SIZE_1_5", label: "1-5" },
  { id: "SIZE_6_10", label: "6-10" },
  { id: "SIZE_11_25", label: "11-25" },
  { id: "SIZE_25_PLUS", label: "25+" },
];

// Automation goals
const AUTOMATION_GOALS = [
  { id: "auto_dm", label: "Auto-reply to DMs", icon: "💬" },
  { id: "comment_replies", label: "Comment keyword replies", icon: "💭" },
  { id: "lead_capture", label: "Lead capture", icon: "🎯" },
  { id: "booking", label: "Appointment booking", icon: "📅" },
  { id: "support", label: "Customer support", icon: "🛟" },
  { id: "sales", label: "Sales automation", icon: "💰" },
  { id: "giveaways", label: "Giveaways", icon: "🎁" },
  { id: "broadcasts", label: "Broadcast messages", icon: "📢" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  
  // Form data
  const [formData, setFormData] = useState({
    displayName: "",
    phoneNumber: "",
    bio: "",
    pronouns: "",
    age: "",
    profileType: "",
    contentCategories: [] as string[],
    platforms: [] as string[],
    primaryPlatform: "",
    followerRange: "",
    teamSize: "",
    clientHandles: "",
    orgName: "",
    website: "",
    sellsCoaching: false,
    sellsCourses: false,
    sellsWorkshops: false,
    sellsMemberships: false,
    bookingLink: "",
    automationGoals: [] as string[],
  });

  // Detect country on mount
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const detected = COUNTRY_CODES.find(c => c.country === data.country_code);
        if (detected) setCountryCode(detected.code);
      } catch {
        // Default to India
        setCountryCode("+91");
      }
    };
    detectCountry();
  }, []);

  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const res = await fetch("/api/onboarding");
        const data = await res.json();
        if (data.status === 200 && data.data) {
          if (data.data.isCompleted) {
            router.push("/dashboard");
            return;
          }
          setCurrentStep(data.data.currentStep || 0);
          if (data.data.profile) {
            setFormData(prev => ({
              ...prev,
              displayName: data.data.profile.displayName || session?.user?.name || "",
              phoneNumber: data.data.profile.phoneNumber || "",
              bio: data.data.profile.bio || "",
              pronouns: data.data.profile.pronouns || "",
              age: data.data.profile.age?.toString() || "",
              profileType: data.data.profile.profileType || "",
              contentCategories: data.data.profile.contentCategories || [],
              platforms: data.data.profile.platforms || [],
              primaryPlatform: data.data.profile.primaryPlatform || "",
              followerRange: data.data.profile.followerRange || "",
              automationGoals: data.data.profile.automationGoals || [],
            }));
          }
          if (data.data.organization) {
            setFormData(prev => ({
              ...prev,
              orgName: data.data.organization.name || "",
              teamSize: data.data.organization.teamSize || "",
              clientHandles: data.data.organization.clientHandles?.join(", ") || "",
              website: data.data.organization.website || "",
            }));
          }
        }
      } catch (error) {
        console.error("Failed to load onboarding state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      setFormData(prev => ({ ...prev, displayName: session.user.name || "" }));
      loadOnboardingState();
    }
  }, [session, router]);

  const getSteps = () => {
    const baseSteps = ["Welcome", "Who are you?", "Content", "Platforms"];
    const profileType = formData.profileType;
    
    if (profileType === "AGENCY") return [...baseSteps.slice(0, 2), "Agency Details", "Platforms", "Goals"];
    if (profileType === "BRAND") return [...baseSteps.slice(0, 2), "Brand Details", "Platforms", "Goals"];
    if (profileType === "CREATOR" || profileType === "INFLUENCER") return [...baseSteps, "Audience", "Goals"];
    if (profileType === "COACH" || profileType === "EDUCATOR") return [...baseSteps, "Monetization", "Goals"];
    return [...baseSteps.slice(0, 2), "Platforms", "Goals"];
  };

  const steps = getSteps();
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const saveProgress = async (step: number, complete = false) => {
    setIsSaving(true);
    try {
      const fullPhone = formData.phoneNumber ? `${countryCode}${formData.phoneNumber}` : "";
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStep: step,
          isCompleted: complete,
          profile: {
            displayName: formData.displayName,
            phoneNumber: fullPhone,
            bio: formData.bio,
            pronouns: formData.pronouns,
            age: formData.age ? parseInt(formData.age, 10) : null,
            profileType: formData.profileType,
            contentCategories: formData.contentCategories,
            platforms: formData.platforms,
            primaryPlatform: formData.primaryPlatform,
            followerRange: formData.followerRange,
            sellsCoaching: formData.sellsCoaching,
            sellsCourses: formData.sellsCourses,
            sellsWorkshops: formData.sellsWorkshops,
            sellsMemberships: formData.sellsMemberships,
            bookingLink: formData.bookingLink,
            automationGoals: formData.automationGoals,
          },
          organization: (formData.profileType === "AGENCY" || formData.profileType === "BRAND") ? {
            orgType: formData.profileType === "AGENCY" ? "AGENCY" : "BRAND",
            name: formData.orgName || formData.displayName,
            teamSize: formData.teamSize,
            clientHandles: formData.clientHandles.split(",").map(s => s.trim()).filter(Boolean),
            website: formData.website,
          } : undefined,
        }),
      });
    } catch (error) {
      console.error("Failed to save progress:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 0 && !formData.displayName) {
      toast.error("Please enter your name");
      return;
    }
    if (currentStep === 1 && !formData.profileType) {
      toast.error("Please select what describes you best");
      return;
    }

    const nextStep = currentStep + 1;
    
    if (nextStep >= totalSteps) {
      // Only save when completing
      await saveProgress(nextStep, true);
      toast.success("Welcome to Auctorn! 🎉");
      router.push("/dashboard");
    } else {
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const renderStep = () => {
    // Step 0: Welcome
    if (currentStep === 0) {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              What should we call you?
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              This helps us personalize your experience
            </p>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Name *</label>
              <Input
                type="text"
                placeholder="Your name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full h-12 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 border-gray-200 dark:border-neutral-700"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Phone Number (optional)</label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="h-12 px-3 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <Input
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, "") })}
                  className="flex-1 h-12 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 border-gray-200 dark:border-neutral-700"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 1: User Type - Tiles
    if (currentStep === 1) {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Which best describes you?
            </h1>
            <p className="text-gray-500 dark:text-gray-400">We&apos;ll customize your experience</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PROFILE_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setFormData({ ...formData, profileType: type.id })}
                className={cn(
                  "group relative p-6 rounded-2xl transition-all duration-200 text-center",
                  formData.profileType === type.id
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25 scale-[1.02]"
                    : "bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700"
                )}
              >
                <span className="text-4xl mb-3 block">{type.icon}</span>
                <p className={cn("font-semibold text-sm", formData.profileType === type.id ? "text-white" : "text-gray-900 dark:text-white")}>{type.label}</p>
                <p className={cn("text-xs mt-1", formData.profileType === type.id ? "text-purple-100" : "text-gray-500 dark:text-gray-400")}>{type.description}</p>
                {formData.profileType === type.id && <div className="absolute top-3 right-3"><Check className="w-5 h-5 text-white" /></div>}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Content Categories - Tiles
    if (steps[currentStep] === "Content") {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">What do you create?</h1>
            <p className="text-gray-500 dark:text-gray-400">Select all that apply</p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {CONTENT_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setFormData({ ...formData, contentCategories: toggleArrayItem(formData.contentCategories, category) })}
                className={cn(
                  "px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  formData.contentCategories.includes(category)
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                    : "bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 hover:border-purple-300 dark:hover:border-purple-700"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Agency Details
    if (steps[currentStep] === "Agency Details") {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tell us about your agency</h1>
          </div>
          <div className="space-y-4 max-w-md mx-auto">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Agency Name</label>
              <Input type="text" placeholder="Your agency name" value={formData.orgName} onChange={(e) => setFormData({ ...formData, orgName: e.target.value })} className="w-full h-12 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border-gray-200 dark:border-neutral-700" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Team Size</label>
              <div className="grid grid-cols-4 gap-2">
                {TEAM_SIZES.map((size) => (
                  <button key={size.id} onClick={() => setFormData({ ...formData, teamSize: size.id })} className={cn("py-3 rounded-xl text-sm font-medium transition-all", formData.teamSize === size.id ? "bg-purple-500 text-white" : "bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700")}>{size.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Major Clients (optional)</label>
              <Input type="text" placeholder="@creator1, @creator2" value={formData.clientHandles} onChange={(e) => setFormData({ ...formData, clientHandles: e.target.value })} className="w-full h-12 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border-gray-200 dark:border-neutral-700" />
            </div>
          </div>
        </div>
      );
    }

    // Brand Details
    if (steps[currentStep] === "Brand Details") {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tell us about your brand</h1>
          </div>
          <div className="space-y-4 max-w-md mx-auto">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Brand Name</label>
              <Input type="text" placeholder="Your brand name" value={formData.orgName} onChange={(e) => setFormData({ ...formData, orgName: e.target.value })} className="w-full h-12 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border-gray-200 dark:border-neutral-700" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Website (optional)</label>
              <Input type="url" placeholder="https://yourbrand.com" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full h-12 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border-gray-200 dark:border-neutral-700" />
            </div>
          </div>
        </div>
      );
    }

    // Platforms - Tiles
    if (steps[currentStep] === "Platforms") {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Where do you want to automate?</h1>
            <p className="text-gray-500 dark:text-gray-400">Select your platforms</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setFormData({ ...formData, platforms: toggleArrayItem(formData.platforms, platform.id) })}
                className={cn(
                  "relative p-6 rounded-2xl transition-all duration-200 text-center",
                  formData.platforms.includes(platform.id)
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                    : "bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:border-purple-300 dark:hover:border-purple-700"
                )}
              >
                <div className="mb-2 flex justify-center">{PlatformIcons[platform.id]}</div>
                <p className={cn("text-sm font-medium", formData.platforms.includes(platform.id) ? "text-white" : "text-gray-900 dark:text-white")}>{platform.label}</p>
                {formData.platforms.includes(platform.id) && <div className="absolute top-2 right-2"><Check className="w-4 h-4 text-white" /></div>}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Audience
    if (steps[currentStep] === "Audience") {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">About your audience</h1>
          </div>
          <div className="space-y-6 max-w-lg mx-auto">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Primary Platform</label>
              <div className="flex flex-wrap gap-2">
                {["instagram", "youtube", "tiktok", "twitter"].map((p) => (
                  <button key={p} onClick={() => setFormData({ ...formData, primaryPlatform: p })} className={cn("px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all", formData.primaryPlatform === p ? "bg-purple-500 text-white" : "bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700")}>{p}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Follower Count</label>
              <div className="flex flex-wrap gap-2">
                {FOLLOWER_RANGES.map((range) => (
                  <button key={range.id} onClick={() => setFormData({ ...formData, followerRange: range.id })} className={cn("px-5 py-2.5 rounded-xl text-sm font-medium transition-all", formData.followerRange === range.id ? "bg-purple-500 text-white" : "bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700")}>{range.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Monetization
    if (steps[currentStep] === "Monetization") {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">How do you monetize?</h1>
            <p className="text-gray-500 dark:text-gray-400">Select all that apply</p>
          </div>
          <div className="space-y-3 max-w-md mx-auto">
            {[
              { key: "sellsCoaching", label: "1-on-1 Coaching/Calls" },
              { key: "sellsCourses", label: "Online Courses" },
              { key: "sellsWorkshops", label: "Workshops / Webinars" },
              { key: "sellsMemberships", label: "Memberships / Communities" },
            ].map((item) => (
              <button key={item.key} onClick={() => setFormData({ ...formData, [item.key]: !formData[item.key as keyof typeof formData] })} className={cn("w-full p-4 rounded-xl text-left transition-all flex items-center justify-between", formData[item.key as keyof typeof formData] ? "bg-purple-500 text-white" : "bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white")}>
                <span className="font-medium">{item.label}</span>
                {formData[item.key as keyof typeof formData] && <Check className="w-5 h-5" />}
              </button>
            ))}
          </div>
          <div className="max-w-md mx-auto">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Booking Link (optional)</label>
            <Input type="url" placeholder="https://calendly.com/yourname" value={formData.bookingLink} onChange={(e) => setFormData({ ...formData, bookingLink: e.target.value })} className="w-full h-12 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border-gray-200 dark:border-neutral-700" />
          </div>
        </div>
      );
    }

    // Goals - Tiles
    if (steps[currentStep] === "Goals") {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">What do you want to automate?</h1>
            <p className="text-gray-500 dark:text-gray-400">Select your priorities</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AUTOMATION_GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setFormData({ ...formData, automationGoals: toggleArrayItem(formData.automationGoals, goal.id) })}
                className={cn(
                  "relative p-6 rounded-2xl transition-all duration-200 text-center",
                  formData.automationGoals.includes(goal.id)
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                    : "bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:border-purple-300 dark:hover:border-purple-700"
                )}
              >
                <span className="text-3xl mb-2 block">{goal.icon}</span>
                <p className={cn("text-xs font-medium", formData.automationGoals.includes(goal.id) ? "text-white" : "text-gray-900 dark:text-white")}>{goal.label}</p>
                {formData.automationGoals.includes(goal.id) && <div className="absolute top-2 right-2"><Check className="w-4 h-4 text-white" /></div>}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-8 px-4">
      {/* Header with circular progress and theme toggle */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Step {currentStep + 1} of {totalSteps}</p>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{steps[currentStep]}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <CircularProgress progress={progress} size={64} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">{renderStep()}</div>

      {/* Navigation */}
      <div className="max-w-4xl mx-auto mt-12">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2 bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-4">
            {currentStep > 1 && currentStep < totalSteps - 1 && (
              <button onClick={handleNext} className="text-gray-400 text-sm hover:text-gray-600 dark:hover:text-gray-300">Skip</button>
            )}
            <Button
              onClick={handleNext}
              disabled={isSaving}
              className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {currentStep === totalSteps - 1 ? "Complete" : "Continue"}
              {currentStep < totalSteps - 1 && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
