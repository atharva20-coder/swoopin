'use client';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import React from "react";
import { useQueryAutomations } from "@/hooks/user-queries";
import { useParams } from "next/navigation";
import Image from "next/image";

interface AutomationMetrics {
  accountsEngaged: number;
  totalLikes: number;
  followersRange: string;
}

interface AutomationData {
  platform: string;
  title: string;
  description: string;
  status: string;
  accountCount: number;
  createdAt: string;
  metrics: AutomationMetrics;
}

const AutomationSummaryCard = () => {
  const params = useParams();
  const { data, isLoading } = useQueryAutomations({
    refetchInterval: 60000, // Refresh data every 60 seconds
  });

  if (isLoading) {
    return (
      <Card className="transition-all duration-200 hover:shadow-md p-6 border-gray-100 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent dark:border-blue-400 rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  const transformedData = data?.data?.[0] ? {
    platform: "Instagram",
    title: data.data[0].name || "Instagram Automation",
    description: data.data[0].listener?.prompt || "Automated responses for Instagram comments and DMs",
    status: data.data[0].active ? "completed" : "pending",
    accountCount: data.data[0].keywords?.length || 0,
    createdAt: data.data[0].createdAt.toISOString(),
    metrics: {
      accountsEngaged: data.data[0].listener?.dmCount || 0,
      totalLikes: data.data[0].listener?.commentCount || 0,
      followersRange: "0-1K"
    }
  } : null;

  const automationData: AutomationData = transformedData || {
    platform: "Instagram",
    title: "Instagram Automation",
    description: "Automated responses for Instagram comments and DMs",
    status: "pending",
    accountCount: 1,
    createdAt: new Date().toISOString(),
    metrics: {
      accountsEngaged: 0,
      totalLikes: 0,
      followersRange: "0-1K"
    }
  };

  const {
    platform,
    title,
    description,
    status,
    accountCount,
    createdAt,
    metrics
  } = automationData;

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "scheduled":
        return "outline";
      case "pending":
        return "warning";
      default:
        return "outline";
    }
  };

  const formattedDate = new Date(createdAt).toLocaleDateString();

  return (
    <Card className="transition-all duration-200 hover:shadow-md p-6 border-gray-100 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Automation & Posts</h2>
        <div className="flex items-center justify-between">
          <Tabs defaultValue="automation" className="w-[300px]">
            <TabsList className="dark:bg-neutral-800">
              <TabsTrigger value="automation" className="dark:text-gray-300 dark:data-[state=active]:text-white">Automation</TabsTrigger>
              <TabsTrigger value="posts" className="dark:text-gray-300 dark:data-[state=active]:text-white">Posts</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" className="gap-2 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Image
            src={`/icons/${platform.toLowerCase()}.svg`}
            alt={platform}
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <div>
            <h3 className="text-lg font-semibold dark:text-gray-100">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
          <Badge variant={getBadgeVariant(status)} className="ml-auto dark:border-neutral-700">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
          </svg>
          <span className="text-sm text-gray-600 dark:text-gray-400">{accountCount} Accounts</span>
          <span className="text-gray-400 dark:text-gray-500 mx-1">•</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">{formattedDate}</span>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
          <div>
            <p className="text-2xl font-bold dark:text-gray-100">{metrics.accountsEngaged}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Account Engaged</p>
          </div>
          <div>
            <p className="text-2xl font-bold dark:text-gray-100">{metrics.totalLikes}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Likes Given</p>
          </div>
          <div>
            <p className="text-2xl font-bold dark:text-gray-100">{metrics.followersRange}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Followers Range</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AutomationSummaryCard;