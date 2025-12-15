import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUserUsage, getUserPlanLimits } from "@/lib/access-control";
import { applyRateLimit } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(req, "API");
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ status: 401, error: "Unauthorized" });
  }

  try {
    const [usage, planInfo] = await Promise.all([
      getUserUsage(user.id),
      getUserPlanLimits(user.id),
    ]);

    return NextResponse.json({
      status: 200,
      data: {
        plan: planInfo.plan,
        planName: planInfo.limits.name,
        usage,
      },
    });
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json({ 
      status: 500, 
      error: "Failed to fetch usage" 
    });
  }
}
