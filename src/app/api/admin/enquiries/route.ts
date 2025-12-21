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
 * GET /api/admin/enquiries
 * List all enterprise enquiries
 */
export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enquiries = await client.enterpriseEnquiry.findMany({
      orderBy: [
        { status: "asc" }, // PENDING first
        { createdAt: "desc" },
      ],
      include: {
        User: {
          select: {
            subscription: {
              select: {
                plan: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: enquiries.length,
      enquiries,
    });
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
  }
}

/**
 * POST /api/admin/enquiries
 * Create a new enterprise enquiry (called from billing page form)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { company, teamSize, useCase, expectedVolume } = body;

    // Find user
    const user = await client.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for existing pending enquiry
    const existingEnquiry = await client.enterpriseEnquiry.findFirst({
      where: {
        userId: user.id,
        status: { in: ["PENDING", "CONTACTED", "NEGOTIATING"] },
      },
    });

    if (existingEnquiry) {
      return NextResponse.json({
        error: "You already have a pending enterprise enquiry",
        existing: true,
      }, { status: 400 });
    }

    // Create new enquiry
    const enquiry = await client.enterpriseEnquiry.create({
      data: {
        userId: user.id,
        email: session.user.email,
        name: session.user.name,
        company,
        teamSize,
        useCase,
        expectedVolume,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Enterprise enquiry submitted successfully",
      enquiry,
    });
  } catch (error) {
    console.error("Error creating enquiry:", error);
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
  }
}
