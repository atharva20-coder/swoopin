"use client";
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquare, BarChart } from "lucide-react";

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState({
    email: true,
    dmAlerts: true,
    weeklyReport: false,
    marketing: false,
  });

  return (
    <div className="bg-white dark:bg-neutral-950 rounded-3xl border border-gray-200 dark:border-neutral-800 p-8 space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-500" />
          Notification Preferences
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
          Choose how you want to be notified.
        </p>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-900/50 rounded-2xl border border-gray-100 dark:border-neutral-800">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive important updates about your account</p>
              </div>
            </div>
            <Switch 
              checked={notifications.email}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-900/50 rounded-2xl border border-gray-100 dark:border-neutral-800">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-purple-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">DM Alerts</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when automations send DMs</p>
              </div>
            </div>
            <Switch 
              checked={notifications.dmAlerts}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, dmAlerts: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-900/50 rounded-2xl border border-gray-100 dark:border-neutral-800">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                <BarChart className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Weekly Reports</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive weekly performance summaries</p>
              </div>
            </div>
            <Switch 
              checked={notifications.weeklyReport}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReport: checked }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
