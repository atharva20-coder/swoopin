"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Users, Crown, Zap, Rocket, TrendingUp, DollarSign,
  Building2, ArrowUpRight, RefreshCw, XCircle, ArrowUp, ArrowDown
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Stats = {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  enterpriseUsers: number;
  pendingEnquiries: number;
  recentUsers: { id: string; email: string; name: string | null; createdAt: string; plan: string }[];
  monthlyData: { month: string; users: number; proUsers: number }[];
  monthlyRevenue: number[];
  userGrowthPercent: number;
  proGrowthPercent: number;
};

// Simple line chart component
const MiniChart = ({ data, color }: { data: number[]; color: string }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1 || 1)) * 100;
    const y = 100 - (val / max) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg className="w-full h-16" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
      <polyline
        fill={`${color}20`}
        stroke="none"
        points={`0,100 ${points} 100,100`}
      />
    </svg>
  );
};

export default function AdminDashboardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    try {
      const checkRes = await fetch("/api/admin/check");
      const checkData = await checkRes.json();
      
      if (!checkData.isAdmin) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }
      
      setIsAuthorized(true);
      await fetchStats();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
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

  const proPrice = 999;
  const estimatedMRR = (stats?.proUsers || 0) * proPrice;
  const conversionRate = stats?.totalUsers ? ((((stats.proUsers || 0) + (stats.enterpriseUsers || 0)) / stats.totalUsers) * 100).toFixed(1) : 0;

  return (
    <div className="py-8 px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Business overview and analytics</p>
        </div>
        <Button onClick={fetchStats} variant="outline" className="gap-2 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-800">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-medium ${(stats?.userGrowthPercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(stats?.userGrowthPercent || 0) >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {Math.abs(stats?.userGrowthPercent || 0)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats?.totalUsers || 0}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Users</p>
          <div className="mt-4">
            <MiniChart data={stats?.monthlyData?.map(m => m.users) || []} color="#10b981" />
          </div>
        </div>

        {/* PRO Users */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-medium ${(stats?.proGrowthPercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(stats?.proGrowthPercent || 0) >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {Math.abs(stats?.proGrowthPercent || 0)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats?.proUsers || 0}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">PRO Subscribers</p>
          <div className="mt-4">
            <MiniChart data={stats?.monthlyData?.map(m => m.proUsers) || []} color="#a855f7" />
          </div>
        </div>

        {/* MRR */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="flex items-center gap-1 text-sm text-green-500 font-medium">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">₹{estimatedMRR.toLocaleString()}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Monthly Revenue</p>
          <div className="mt-4">
            <MiniChart data={stats?.monthlyRevenue || []} color="#22c55e" />
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{conversionRate}%</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Conversion Rate</p>
          <div className="mt-4">
            <MiniChart data={stats?.monthlyData?.map((m, i, arr) => ((m.proUsers / (m.users || 1)) * 100)) || []} color="#f97316" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Plan Distribution - Large Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">User Distribution by Plan</h3>
          
          <div className="flex items-center gap-8">
            {/* Pie Chart Visualization */}
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Free segment */}
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke="#6b7280"
                  strokeWidth="20"
                  strokeDasharray={`${((stats?.freeUsers || 0) / (stats?.totalUsers || 1)) * 251.2} 251.2`}
                />
                {/* Pro segment */}
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke="#a855f7"
                  strokeWidth="20"
                  strokeDasharray={`${((stats?.proUsers || 0) / (stats?.totalUsers || 1)) * 251.2} 251.2`}
                  strokeDashoffset={`-${((stats?.freeUsers || 0) / (stats?.totalUsers || 1)) * 251.2}`}
                />
                {/* Enterprise segment */}
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke="#22c55e"
                  strokeWidth="20"
                  strokeDasharray={`${((stats?.enterpriseUsers || 0) / (stats?.totalUsers || 1)) * 251.2} 251.2`}
                  strokeDashoffset={`-${(((stats?.freeUsers || 0) + (stats?.proUsers || 0)) / (stats?.totalUsers || 1)) * 251.2}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalUsers || 0}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Free Users</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Basic features</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.freeUsers || 0}</p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-purple-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">PRO Users</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">₹{proPrice}/month</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats?.proUsers || 0}</p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Enterprise</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Custom pricing</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.enterpriseUsers || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
          
          <div className="space-y-4">
            <Link href={`/dashboard/${slug}/admin/enquiries`}>
              <div className={`p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${
                (stats?.pendingEnquiries || 0) > 0 
                  ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800" 
                  : "bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className={`w-5 h-5 ${(stats?.pendingEnquiries || 0) > 0 ? "text-amber-600" : "text-gray-500"}`} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Enterprise Enquiries</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(stats?.pendingEnquiries || 0) > 0 ? `${stats?.pendingEnquiries} pending` : "No pending"}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>

            <Link href={`/dashboard/${slug}/admin/users`}>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 cursor-pointer transition-all hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Manage Users</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Upgrade & manage</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>

            <Link href={`/dashboard/${slug}/admin/settings`}>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 cursor-pointer transition-all hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Rocket className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Admin Tools</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Broadcasts & more</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Revenue Growth Chart */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Growth</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Monthly recurring revenue over time</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Revenue</span>
            </div>
          </div>
        </div>
        
        {/* Bar Chart */}
        <div className="h-64 flex items-end gap-4">
          {(stats?.monthlyData || []).map((monthData, i) => {
            const maxRevenue = Math.max(...(stats?.monthlyRevenue || [1]), 1);
            const height = ((stats?.monthlyRevenue?.[i] || 0) / maxRevenue) * 100;
            return (
              <div key={monthData.month} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-purple-500 rounded-t-lg transition-all hover:bg-purple-400" 
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">{monthData.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
