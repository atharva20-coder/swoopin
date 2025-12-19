"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { client } from "@/lib/prisma";

export const getUserAnalytics = async (slug: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session?.user) redirect("/sign-in");

  try {
    const dbUser = await client.user.findUnique({
      where: { email: session.user.email },
      include: {
        analytics: {
          orderBy: { date: "asc" },
          take: 6,
        },
        automations: {
          include: {
            listener: true,
          },
        },
      },
    });
    
    const formattedSlug = decodeURIComponent(slug).replace(/\s+/g, " ").trim();
    const fullName = dbUser?.name?.replace(/\s+/g, "").trim() || "";

    // Security check - verify user owns this dashboard
    if (!dbUser || formattedSlug !== fullName.replace(/\s+/g, "")) {
      return { status: 404 };
    }

    const totalDms = dbUser.automations.reduce(
      (sum, auto) => sum + (auto.listener?.dmCount || 0),
      0
    );

    const totalComments = dbUser.automations.reduce(
      (sum, auto) => sum + (auto.listener?.commentCount || 0),
      0
    );

    const analyticsData = dbUser.analytics.map((item) => ({
      date: item.date,
      month: item.date.toLocaleDateString("en-US", { month: "long" }),
      activity: item.dmCount + item.commentCount,
      dmCount: item.dmCount,
      commentCount: item.commentCount
    }));

    return {
      status: 200,
      data: {
        totalDms,
        totalComments,
        chartData: analyticsData,
      },
    };
  } catch (error) {
    console.error("Analytics error:", error);
    return { status: 500, data: null };
  }
};

export const trackAnalytics = async (
  userId: string,
  type: "dm" | "comment"
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // First try to find existing analytics for today
    const existingAnalytics = await client.analytics.findFirst({
      where: {
        userId,
        date: today,
      },
    });

    if (existingAnalytics) {
      // Update existing record
      const analytics = await client.analytics.update({
        where: {
          id: existingAnalytics.id,
        },
        data: {
          [type === "dm" ? "dmCount" : "commentCount"]: {
            increment: 1,
          },
        },
      });
      return { status: 200, data: analytics };
    } else {
      // Create new record
      const analytics = await client.analytics.create({
        data: {
          userId,
          date: today,
          dmCount: type === "dm" ? 1 : 0,
          commentCount: type === "comment" ? 1 : 0,
        },
      });
      return { status: 200, data: analytics };
    }
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return { status: 500, data: null };
  }
};