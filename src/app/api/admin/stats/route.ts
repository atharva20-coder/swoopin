import { client } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// List of admin email addresses
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter((email) => email.length > 0);

async function isAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session?.user) return false;
  return ADMIN_EMAILS.includes(session.user.email.toLowerCase());
}

/**
 * GET /api/admin/stats
 * Get admin dashboard stats with monthly analytics
 */
export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user counts
    const [totalUsers, subscriptions, pendingEnquiries, recentUsersData] = await Promise.all([
      client.user.count(),
      client.subscription.groupBy({
        by: ['plan'],
        _count: { plan: true },
      }),
      client.enterpriseEnquiry.count({
        where: { status: { in: ["PENDING", "CONTACTED", "NEGOTIATING"] } },
      }),
      client.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          subscription: {
            select: { plan: true },
          },
        },
      }),
    ]);

    // Parse subscription counts
    const planCounts = subscriptions.reduce((acc, item) => {
      acc[item.plan] = item._count.plan;
      return acc;
    }, {} as Record<string, number>);

    // Format recent users
    const recentUsers = recentUsersData.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      plan: user.subscription?.plan || "FREE",
    }));

    // Get monthly user growth for the last 12 months
    const now = new Date();
    const monthlyData: { month: string; users: number; proUsers: number }[] = [];
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      
      const [usersCount, proCount] = await Promise.all([
        client.user.count({
          where: {
            createdAt: { lte: monthEnd }
          }
        }),
        client.subscription.count({
          where: {
            plan: "PRO",
            createdAt: { lte: monthEnd }
          }
        })
      ]);
      
      const monthName = monthStart.toLocaleString('default', { month: 'short' });
      monthlyData.push({
        month: monthName,
        users: usersCount,
        proUsers: proCount
      });
    }

    // Calculate growth percentages
    const lastMonthUsers = monthlyData[monthlyData.length - 2]?.users || 1;
    const currentUsers = monthlyData[monthlyData.length - 1]?.users || 0;
    const userGrowthPercent = lastMonthUsers > 0 
      ? (((currentUsers - lastMonthUsers) / lastMonthUsers) * 100).toFixed(1)
      : "0";

    const lastMonthPro = monthlyData[monthlyData.length - 2]?.proUsers || 1;
    const currentPro = planCounts["PRO"] || 0;
    const proGrowthPercent = lastMonthPro > 0 
      ? (((currentPro - lastMonthPro) / lastMonthPro) * 100).toFixed(1)
      : "0";

    const proPrice = 999;
    const monthlyRevenue = monthlyData.map(m => m.proUsers * proPrice);

    const stats = {
      totalUsers,
      freeUsers: planCounts["FREE"] || 0,
      proUsers: planCounts["PRO"] || 0,
      enterpriseUsers: planCounts["ENTERPRISE"] || 0,
      pendingEnquiries,
      recentUsers,
      // Monthly analytics
      monthlyData,
      monthlyRevenue,
      userGrowthPercent: parseFloat(userGrowthPercent),
      proGrowthPercent: parseFloat(proGrowthPercent),
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

