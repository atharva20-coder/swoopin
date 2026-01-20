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
 * GET /api/admin/enquiries/[id]
 * Get a single enterprise enquiry by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const enquiry = await client.enterpriseEnquiry.findUnique({
      where: { id },
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

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      enquiry,
    });
  } catch (error) {
    console.error("Error fetching enquiry:", error);
    return NextResponse.json(
      { error: "Failed to fetch enquiry" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/admin/enquiries/[id]
 * Update an enterprise enquiry
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const body = await req.json();
    const {
      status,
      notes,
      customDmsLimit,
      customAutomationsLimit,
      customScheduledLimit,
      customAiLimit,
      dealAmount,
      dealClosed,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (customDmsLimit !== undefined)
      updateData.customDmsLimit = customDmsLimit;
    if (customAutomationsLimit !== undefined)
      updateData.customAutomationsLimit = customAutomationsLimit;
    if (customScheduledLimit !== undefined)
      updateData.customScheduledLimit = customScheduledLimit;
    if (customAiLimit !== undefined) updateData.customAiLimit = customAiLimit;
    if (dealAmount !== undefined) updateData.dealAmount = dealAmount;
    if (dealClosed !== undefined) updateData.dealClosed = dealClosed;

    const enquiry = await client.enterpriseEnquiry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      enquiry,
    });
  } catch (error) {
    console.error("Error updating enquiry:", error);
    return NextResponse.json(
      { error: "Failed to update enquiry" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/enquiries/[id]
 * Delete an enterprise enquiry
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await client.enterpriseEnquiry.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Enquiry deleted",
    });
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    return NextResponse.json(
      { error: "Failed to delete enquiry" },
      { status: 500 },
    );
  }
}
