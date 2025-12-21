"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import ProfileHeader from "./_components/profile-header";
import ProfileTab from "./_components/profile-tab";
import SecurityTab from "./_components/security-tab";
import BillingTab from "./_components/billing-tab";
import NotificationsTab from "./_components/notifications-tab";

export default function SettingsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header with Navigation */}
      <ProfileHeader activeTab={activeTab} setActiveTab={setActiveTab} />

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