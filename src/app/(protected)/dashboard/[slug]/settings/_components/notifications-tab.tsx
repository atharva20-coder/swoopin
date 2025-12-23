"use client";
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquare, BarChart, Megaphone } from "lucide-react";

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState({
    email: true,
    dmAlerts: true,
    weeklyReport: false,
    marketing: false,
  });

  const notificationOptions = [
    {
      id: "email",
      title: "Email Notifications",
      description: "Receive important updates about your account",
      icon: Mail,
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      id: "dmAlerts",
      title: "DM Alerts",
      description: "Get notified when automations send DMs",
      icon: MessageSquare,
      color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
    },
    {
      id: "weeklyReport",
      title: "Weekly Reports",
      description: "Receive weekly performance summaries",
      icon: BarChart,
      color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "marketing",
      title: "Product Updates",
      description: "Get notified about new features and updates",
      icon: Megaphone,
      color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-4 h-4 text-indigo-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Notification Preferences</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Choose how you want to be notified about important updates.
        </p>
      </div>

      {/* Notification Options */}
      {notificationOptions.map((option) => {
        const Icon = option.icon;
        return (
          <div key={option.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-5">
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${option.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{option.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                </div>
              </div>
              <Switch 
                checked={notifications[option.id as keyof typeof notifications]}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [option.id]: checked }))}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
