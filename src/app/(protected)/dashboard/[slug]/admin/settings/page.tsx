"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Bell, Gift, CreditCard, Users, Send, 
  XCircle, RefreshCw, Percent, MessageSquare,
  ArrowUpRight, Check
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notifications' | 'offers' | 'plans'>('notifications');
  
  // Notification form
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationTarget, setNotificationTarget] = useState<'all' | 'free' | 'pro' | 'enterprise'>('all');
  const [isSending, setIsSending] = useState(false);

  // Offer form
  const [offerCode, setOfferCode] = useState("");
  const [offerDiscount, setOfferDiscount] = useState("");
  const [offerExpiry, setOfferExpiry] = useState("");
  
  // Quick actions
  const [upgradeEmail, setUpgradeEmail] = useState("");
  const [upgradePlan, setUpgradePlan] = useState<'PRO' | 'ENTERPRISE'>('PRO');

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch("/api/admin/check");
      const data = await response.json();
      setIsAuthorized(data.isAdmin);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendNotification = async () => {
    if (!notificationMessage.trim()) {
      toast.error("Please enter a notification message");
      return;
    }
    
    setIsSending(true);
    try {
      const response = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: notificationTitle,
          message: notificationMessage,
          target: notificationTarget,
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Notification sent to ${data.count} users!`);
        setNotificationTitle("");
        setNotificationMessage("");
      } else {
        toast.error(data.error || "Failed to send notification");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSending(false);
    }
  };

  const quickUpgrade = async () => {
    if (!upgradeEmail.trim()) {
      toast.error("Please enter an email");
      return;
    }
    
    try {
      const endpoint = upgradePlan === 'ENTERPRISE' 
        ? "/api/admin/upgrade-enterprise"
        : "/api/admin/users/upgrade";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: upgradeEmail,
          plan: upgradePlan 
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Upgraded ${upgradeEmail} to ${upgradePlan}!`);
        setUpgradeEmail("");
      } else {
        toast.error(data.error || "Failed to upgrade");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <XCircle className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Tools</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage users, send notifications, and run campaigns</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-neutral-800">
        {[
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'offers', label: 'Offers & Promos', icon: Gift },
          { id: 'plans', label: 'Plan Management', icon: CreditCard },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Broadcast Notification
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Target Audience</label>
                <select
                  value={notificationTarget}
                  onChange={(e) => setNotificationTarget(e.target.value as typeof notificationTarget)}
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                >
                  <option value="all">All Users</option>
                  <option value="free">Free Users Only</option>
                  <option value="pro">PRO Users Only</option>
                  <option value="enterprise">Enterprise Users Only</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Title (optional)</label>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="e.g., New Feature Alert!"
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Message</label>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Enter your notification message..."
                  rows={4}
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
              </div>
              
              <Button 
                onClick={sendNotification}
                disabled={isSending}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSending ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Notification
              </Button>
            </div>
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Percent className="w-5 h-5" /> Create Promotional Offer
            </h3>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                💡 Offers are managed in Stripe. Create coupon codes in your Stripe Dashboard 
                and they'll automatically work with checkout.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Promo Code</label>
                  <input
                    type="text"
                    value={offerCode}
                    onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                    placeholder="e.g., NEWYEAR25"
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Discount %</label>
                  <input
                    type="number"
                    value={offerDiscount}
                    onChange={(e) => setOfferDiscount(e.target.value)}
                    placeholder="25"
                    className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Expiry Date</label>
                <input
                  type="date"
                  value={offerExpiry}
                  onChange={(e) => setOfferExpiry(e.target.value)}
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
              </div>
              
              <a 
                href="https://dashboard.stripe.com/coupons" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Create in Stripe Dashboard
                </Button>
              </a>
            </div>
          </div>
        )}

        {/* Plan Management Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Current Pricing
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg text-center">
                  <span className="text-sm text-gray-500">FREE</span>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">₹0</p>
                  <p className="text-xs text-gray-500">50 DMs/mo</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center border-2 border-blue-500">
                  <span className="text-sm text-blue-600">PRO</span>
                  <p className="text-2xl font-bold text-blue-600">₹999</p>
                  <p className="text-xs text-gray-500">1000 DMs/mo</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                  <span className="text-sm text-purple-600">ENTERPRISE</span>
                  <p className="text-2xl font-bold text-purple-600">Custom</p>
                  <p className="text-xs text-gray-500">Unlimited</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  To update pricing, edit <code className="bg-gray-200 dark:bg-neutral-700 px-1 rounded">PLAN_LIMITS</code> in 
                  <code className="bg-gray-200 dark:bg-neutral-700 px-1 rounded ml-1">src/lib/access-control.ts</code> 
                  and Stripe product prices.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" /> Bulk Actions
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Gift className="w-5 h-5" />
                  <span>Give 1 Month Free</span>
                  <span className="text-xs text-gray-500">To all FREE users</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Bell className="w-5 h-5" />
                  <span>Upgrade Reminder</span>
                  <span className="text-xs text-gray-500">Notify FREE users</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
