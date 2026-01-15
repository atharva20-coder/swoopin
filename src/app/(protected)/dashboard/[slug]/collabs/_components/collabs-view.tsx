"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Check,
  X,
  Clock,
  Trash2,
  RefreshCw,
  Building2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// REST API calls
async function syncPartnerships() {
  const res = await fetch("/api/v1/collabs/sync", { method: "POST" });
  return res.json();
}

async function approvePartnership(id: string) {
  const res = await fetch(`/api/v1/collabs/${id}/approve`, { method: "POST" });
  return res.json();
}

async function rejectPartnership(id: string) {
  const res = await fetch(`/api/v1/collabs/${id}/reject`, { method: "POST" });
  return res.json();
}

async function removePartnership(id: string) {
  const res = await fetch(`/api/v1/collabs/${id}`, { method: "DELETE" });
  return res.json();
}

type PartnershipStatus = "PENDING" | "APPROVED" | "REJECTED";
type PartnershipType = "BRAND_TO_CREATOR" | "CREATOR_TO_BRAND";

interface BrandPartnership {
  id: string;
  userId: string;
  partnerId: string;
  partnerName: string;
  partnerUsername: string | null;
  status: PartnershipStatus;
  type: PartnershipType;
  createdAt: Date;
  updatedAt: Date;
}

interface CollabsViewProps {
  slug: string;
  initialPartnerships: BrandPartnership[];
}

const STATUS_COLORS: Record<PartnershipStatus, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  APPROVED:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_ICONS: Record<PartnershipStatus, React.ReactNode> = {
  PENDING: <Clock className="w-4 h-4" />,
  APPROVED: <Check className="w-4 h-4" />,
  REJECTED: <X className="w-4 h-4" />,
};

export default function CollabsView({
  slug,
  initialPartnerships,
}: CollabsViewProps) {
  const [partnerships, setPartnerships] =
    useState<BrandPartnership[]>(initialPartnerships);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | PartnershipStatus>("all");

  const filteredPartnerships = partnerships.filter(
    (p) => filter === "all" || p.status === filter
  );

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncPartnerships();
      if (result.status === 200) {
        toast.success("Partnerships synced with Instagram");
        // Refresh page to get updated data
        window.location.reload();
      } else {
        toast.error(
          typeof result.data === "string" ? result.data : "Sync failed"
        );
      }
    } catch {
      toast.error("Failed to sync");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await approvePartnership(id);
      if (result.status === 200) {
        setPartnerships(
          partnerships.map((p) =>
            p.id === id ? { ...p, status: "APPROVED" as PartnershipStatus } : p
          )
        );
        toast.success("Partnership approved");
      }
    } catch {
      toast.error("Failed to approve");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await rejectPartnership(id);
      if (result.status === 200) {
        setPartnerships(
          partnerships.map((p) =>
            p.id === id ? { ...p, status: "REJECTED" as PartnershipStatus } : p
          )
        );
        toast.success("Partnership rejected");
      }
    } catch {
      toast.error("Failed to reject");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await removePartnership(id);
      if (result.status === 200) {
        setPartnerships(partnerships.filter((p) => p.id !== id));
        toast.success("Partnership removed");
      }
    } catch {
      toast.error("Failed to remove");
    } finally {
      setIsLoading(false);
    }
  };

  const pendingCount = partnerships.filter(
    (p) => p.status === "PENDING"
  ).length;

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
          <span className="text-gray-900 dark:text-white font-medium">
            Collabs
          </span>
        </div>
        <Button
          variant="outline"
          onClick={handleSync}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          Sync
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {partnerships.length}
              </p>
              <p className="text-sm text-gray-500">Total Partners</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pendingCount}
              </p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {partnerships.filter((p) => p.status === "APPROVED").length}
              </p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
            )}
          >
            {status === "all"
              ? "All"
              : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Partnerships List */}
      <div className="flex-1 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
        {filteredPartnerships.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Users className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-lg font-medium">No partnerships found</p>
            <p className="text-sm">
              Sync with Instagram to load your brand partners
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-neutral-800">
            {filteredPartnerships.map((partnership) => (
              <div
                key={partnership.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center">
                      {partnership.type === "BRAND_TO_CREATOR" ? (
                        <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      ) : (
                        <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {partnership.partnerName}
                    </p>
                    {partnership.partnerUsername && (
                      <p className="text-sm text-gray-500">
                        @{partnership.partnerUsername}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {partnership.type === "BRAND_TO_CREATOR"
                        ? "Brand Partner"
                        : "Creator Partner"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                      STATUS_COLORS[partnership.status]
                    )}
                  >
                    {STATUS_ICONS[partnership.status]}
                    {partnership.status.charAt(0) +
                      partnership.status.slice(1).toLowerCase()}
                  </span>

                  {partnership.status === "PENDING" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600"
                        onClick={() => handleApprove(partnership.id)}
                        disabled={isLoading}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => handleReject(partnership.id)}
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-red-600"
                    onClick={() => handleRemove(partnership.id)}
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
    </div>
  );
}
