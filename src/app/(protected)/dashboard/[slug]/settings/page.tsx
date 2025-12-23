"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import ProfileHeader from "./_components/profile-header";
import ProfileTab from "./_components/profile-tab";
import SecurityTab from "./_components/security-tab";
import BillingTab from "./_components/billing-tab";
import NotificationsTab from "./_components/notifications-tab";

export default function SettingsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
    { id: "billing", label: "Billing" },
    { id: "notifications", label: "Notifications" },
  ];

  return (
    <div className="w-full py-8 px-6 lg:px-12 space-y-6">
      {/* Profile Header - Constrained Width & Centered */}
      <div className="max-w-2xl mx-auto">
        <ProfileHeader />
      </div>

      {/* Navigation Tabs - Centered */}
      <div className="flex justify-center">
        <div className="flex gap-1 bg-gray-100 dark:bg-neutral-800 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all rounded-lg",
                activeTab === tab.id
                  ? "bg-white dark:bg-neutral-900 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === "profile" && <ProfileTab slug={slug} />}
        {activeTab === "security" && <SecurityTab />}
        {activeTab === "billing" && <BillingTab slug={slug} />}
        {activeTab === "notifications" && <NotificationsTab />}
      </div>
    </div>
  );
}