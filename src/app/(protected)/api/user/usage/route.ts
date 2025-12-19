import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserUsageByEmail, getUserPlanLimitsByEmail } from "@/lib/access-control";
import { applyRateLimit } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(req, "API");
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session?.user) {
    return NextResponse.json({ status: 401, error: "Unauthorized" });
  }

  try {
    const [usage, planInfo] = await Promise.all([
      getUserUsageByEmail(session.user.email),
      getUserPlanLimitsByEmail(session.user.email),
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
