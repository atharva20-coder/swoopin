"use client";

import React, { useState } from "react";
import {
  Megaphone,
  RefreshCw,
  Plus,
  Play,
  Pause,
  Trash2,
  BarChart3,
  DollarSign,
  Eye,
  MousePointerClick,
  X,
  ChevronRight,
  Target,
  Users,
  Globe,
  TrendingUp,
  Zap,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  AdCampaign,
  CampaignStatus,
  CampaignObjective,
} from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";

// REST API calls
async function updateCampaignStatus(
  campaignId: string,
  status: CampaignStatus,
) {
  const res = await fetch(`/api/v1/ads/campaigns/${campaignId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

async function deleteCampaign(campaignId: string) {
  const res = await fetch(`/api/v1/ads/campaigns/${campaignId}`, {
    method: "DELETE",
  });
  return res.json();
}

async function getCampaignInsights(campaignId: string) {
  const res = await fetch(`/api/v1/ads/campaigns/${campaignId}/insights`);
  return res.json();
}

interface AdInsights {
  impressions: number;
  reach: number;
  clicks: number;
  spend: string;
  cpc: string;
  cpm: string;
  ctr: string;
}

interface AdsViewProps {
  slug: string;
  initialCampaigns: AdCampaign[];
}

const STATUS_COLORS: Record<CampaignStatus, string> = {
  ACTIVE:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  PAUSED:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  DELETED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  ARCHIVED: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

const OBJECTIVE_ICONS: Record<CampaignObjective, React.ReactNode> = {
  BRAND_AWARENESS: <Eye className="w-4 h-4" />,
  REACH: <Users className="w-4 h-4" />,
  TRAFFIC: <Globe className="w-4 h-4" />,
  ENGAGEMENT: <MessageCircle className="w-4 h-4" />,
  CONVERSIONS: <TrendingUp className="w-4 h-4" />,
  POST_ENGAGEMENT: <Zap className="w-4 h-4" />,
};

const OBJECTIVE_LABELS: Record<CampaignObjective, string> = {
  BRAND_AWARENESS: "Brand Awareness",
  REACH: "Reach",
  TRAFFIC: "Traffic",
  ENGAGEMENT: "Engagement",
  CONVERSIONS: "Conversions",
  POST_ENGAGEMENT: "Post Engagement",
};

export default function AdsView({ slug, initialCampaigns }: AdsViewProps) {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(initialCampaigns);
  const [isLoading, setIsLoading] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(
    null,
  );
  const [insights, setInsights] = useState<AdInsights | null>(null);

  // Wizard form state
  const [formData, setFormData] = useState({
    name: "",
    objective: "ENGAGEMENT" as CampaignObjective,
    budget: 10,
    currency: "USD",
  });

  const getBudget = (campaign: AdCampaign): string => {
    // Prisma Decimal types can be converted to number using Number()
    const budget = Number(campaign.budget);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: campaign.currency || "USD",
    }).format(budget);
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      // We need an ad account ID - for now just reload
      toast.info("Please connect an ad account first");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async (campaign: AdCampaign) => {
    const newStatus: CampaignStatus =
      campaign.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    setIsLoading(true);
    try {
      const result = await updateCampaignStatus(campaign.id, newStatus);
      if (result.status === 200) {
        setCampaigns(
          campaigns.map((c) =>
            c.id === campaign.id ? { ...c, status: newStatus } : c,
          ),
        );
        toast.success(`Campaign ${newStatus.toLowerCase()}`);
      }
    } catch {
      toast.error("Failed to update campaign");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    setIsLoading(true);
    try {
      const result = await deleteCampaign(campaignId);
      if (result.status === 200) {
        setCampaigns(campaigns.filter((c) => c.id !== campaignId));
        toast.success("Campaign deleted");
      }
    } catch {
      toast.error("Failed to delete campaign");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewInsights = async (campaign: AdCampaign) => {
    setSelectedCampaign(campaign);
    setIsLoading(true);
    try {
      const result = await getCampaignInsights(campaign.id);
      if (result.status === 200 && result.data) {
        setInsights(result.data as AdInsights);
      }
    } catch {
      toast.error("Failed to load insights");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }

    setIsLoading(true);
    try {
      // Note: Would need adAccountId - placeholder for now
      toast.info("Ad account connection required");
      setShowWizard(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === "ACTIVE").length,
    paused: campaigns.filter((c) => c.status === "PAUSED").length,
    totalSpend: campaigns.reduce((sum, c) => sum + Number(c.budget), 0),
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-1 py-3">
        <div className="flex items-center gap-2 text-sm">
          <a
            href={`/dashboard/${slug}`}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Dashboard
          </a>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
            Ads
            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Beta
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Sync
          </Button>
          <Button onClick={() => setShowWizard(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
              <p className="text-sm text-gray-500">Total Campaigns</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Play className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.active}
              </p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Pause className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.paused}
              </p>
              <p className="text-sm text-gray-500">Paused</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.totalSpend.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Total Budget</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="flex-1 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Megaphone className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-lg font-medium">No campaigns yet</p>
            <p className="text-sm mb-4">
              Create your first ad campaign to get started
            </p>
            <Button onClick={() => setShowWizard(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Campaign
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-neutral-800">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    {OBJECTIVE_ICONS[campaign.objective]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {campaign.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Target className="w-3 h-3" />
                      {OBJECTIVE_LABELS[campaign.objective]}
                      <span className="text-gray-300">•</span>
                      {getBudget(campaign)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      STATUS_COLORS[campaign.status],
                    )}
                  >
                    {campaign.status}
                  </span>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleViewInsights(campaign)}
                    disabled={isLoading}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className={
                      campaign.status === "ACTIVE"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }
                    onClick={() => handleStatusToggle(campaign)}
                    disabled={isLoading}
                  >
                    {campaign.status === "ACTIVE" ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => handleDelete(campaign.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Campaign Wizard */}
      {showWizard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowWizard(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Wizard Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-neutral-800">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Create Campaign
                </h2>
                <p className="text-sm text-gray-500">Step {wizardStep} of 3</p>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wizard Content */}
            <div className="p-6">
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Campaign Objective
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(OBJECTIVE_LABELS) as CampaignObjective[]).map(
                      (obj) => (
                        <button
                          key={obj}
                          onClick={() =>
                            setFormData({ ...formData, objective: obj })
                          }
                          className={cn(
                            "p-4 rounded-xl border text-left transition-all",
                            formData.objective === obj
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-neutral-700 hover:border-gray-300",
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {OBJECTIVE_ICONS[obj]}
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              {OBJECTIVE_LABELS[obj]}
                            </span>
                          </div>
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Campaign Details
                  </h3>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">
                      Campaign Name
                    </label>
                    <Input
                      placeholder="e.g. Summer Sale 2024"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Budget
                  </h3>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">
                      Daily Budget (USD)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budget: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-neutral-800">
              <Button
                variant="ghost"
                onClick={() => wizardStep > 1 && setWizardStep(wizardStep - 1)}
                disabled={wizardStep === 1}
              >
                Back
              </Button>
              {wizardStep < 3 ? (
                <Button
                  onClick={() => setWizardStep(wizardStep + 1)}
                  className="gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleCreateCampaign} disabled={isLoading}>
                  Create Campaign
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Insights Modal */}
      {selectedCampaign && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => {
            setSelectedCampaign(null);
            setInsights(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedCampaign.name} Insights
              </h2>
              <button
                onClick={() => {
                  setSelectedCampaign(null);
                  setInsights(null);
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : insights ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Impressions</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {insights.impressions.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Reach</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {insights.reach.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <MousePointerClick className="w-4 h-4" />
                      <span className="text-sm">Clicks</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {insights.clicks.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Spend</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${insights.spend}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  No insights available yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
