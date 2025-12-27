"use server";

import { client } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PartnershipStatus, PartnershipType } from "@prisma/client";
import {
  getBrandedContentPartners,
  approveBrandedContent as approveMetaPartner,
  removeBrandedContentPartner as removeMetaPartner,
} from "@/lib/instagram/collabs";

// Helper to get current user's integration
async function getUserIntegration() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return null;
  }

  const integration = await client.integrations.findFirst({
    where: { userId: session.user.id },
    select: { token: true, instagramId: true, userId: true },
  });

  return integration;
}

/**
 * Get all partnerships for the current user
 */
export async function getUserPartnerships() {
  try {
    const integration = await getUserIntegration();
    if (!integration) {
      return { status: 401, data: "Unauthorized" };
    }

    const partnerships = await client.brandPartnership.findMany({
      where: { userId: integration.userId! },
      orderBy: { createdAt: "desc" },
    });

    return { status: 200, data: partnerships };
  } catch (error) {
    console.error("Error getting partnerships:", error);
    return { status: 500, data: "Failed to get partnerships" };
  }
}

/**
 * Sync partnerships with Instagram
 */
export async function syncPartnerships() {
  try {
    const integration = await getUserIntegration();
    if (!integration?.token || !integration?.instagramId) {
      return { status: 400, data: "Instagram not connected" };
    }

    const result = await getBrandedContentPartners(integration.instagramId, integration.token);
    if (!result.success) {
      return { status: 500, data: result.error };
    }

    // Update/create partnerships in database
    for (const partner of result.partners || []) {
      await client.brandPartnership.upsert({
        where: { id: partner.id },
        create: {
          userId: integration.userId!,
          partnerId: partner.id,
          partnerName: partner.name || partner.username,
          partnerUsername: partner.username,
          status: "APPROVED",
          type: "BRAND_TO_CREATOR",
        },
        update: {
          partnerName: partner.name || partner.username,
          partnerUsername: partner.username,
          status: "APPROVED",
        },
      });
    }

    return { status: 200, data: "Partnerships synced" };
  } catch (error) {
    console.error("Error syncing partnerships:", error);
    return { status: 500, data: "Failed to sync partnerships" };
  }
}

/**
 * Create a new partnership request
 */
export async function createPartnership(data: {
  partnerId: string;
  partnerName: string;
  partnerUsername?: string;
  type: PartnershipType;
}) {
  try {
    const integration = await getUserIntegration();
    if (!integration) {
      return { status: 401, data: "Unauthorized" };
    }

    const partnership = await client.brandPartnership.create({
      data: {
        userId: integration.userId!,
        partnerId: data.partnerId,
        partnerName: data.partnerName,
        partnerUsername: data.partnerUsername ?? null,
        status: "PENDING",
        type: data.type,
      },
    });

    return { status: 200, data: partnership };
  } catch (error) {
    console.error("Error creating partnership:", error);
    return { status: 500, data: "Failed to create partnership" };
  }
}

/**
 * Approve a partnership
 */
export async function approvePartnership(partnershipId: string) {
  try {
    const integration = await getUserIntegration();
    if (!integration) {
      return { status: 401, data: "Unauthorized" };
    }

    const existing = await client.brandPartnership.findUnique({
      where: { id: partnershipId },
    });

    if (!existing || existing.userId !== integration.userId) {
      return { status: 404, data: "Partnership not found" };
    }

    // Approve on Instagram if possible
    if (integration.token && integration.instagramId) {
      await approveMetaPartner(integration.instagramId, integration.token, existing.partnerId);
    }

    const partnership = await client.brandPartnership.update({
      where: { id: partnershipId },
      data: { status: "APPROVED" },
    });

    return { status: 200, data: partnership };
  } catch (error) {
    console.error("Error approving partnership:", error);
    return { status: 500, data: "Failed to approve partnership" };
  }
}

/**
 * Reject a partnership
 */
export async function rejectPartnership(partnershipId: string) {
  try {
    const integration = await getUserIntegration();
    if (!integration) {
      return { status: 401, data: "Unauthorized" };
    }

    const existing = await client.brandPartnership.findUnique({
      where: { id: partnershipId },
    });

    if (!existing || existing.userId !== integration.userId) {
      return { status: 404, data: "Partnership not found" };
    }

    const partnership = await client.brandPartnership.update({
      where: { id: partnershipId },
      data: { status: "REJECTED" },
    });

    return { status: 200, data: partnership };
  } catch (error) {
    console.error("Error rejecting partnership:", error);
    return { status: 500, data: "Failed to reject partnership" };
  }
}

/**
 * Remove a partnership
 */
export async function removePartnership(partnershipId: string) {
  try {
    const integration = await getUserIntegration();
    if (!integration) {
      return { status: 401, data: "Unauthorized" };
    }

    const existing = await client.brandPartnership.findUnique({
      where: { id: partnershipId },
    });

    if (!existing || existing.userId !== integration.userId) {
      return { status: 404, data: "Partnership not found" };
    }

    // Remove on Instagram if approved
    if (existing.status === "APPROVED" && integration.token && integration.instagramId) {
      await removeMetaPartner(integration.instagramId, integration.token, existing.partnerId);
    }

    await client.brandPartnership.delete({
      where: { id: partnershipId },
    });

    return { status: 200, data: "Partnership removed" };
  } catch (error) {
    console.error("Error removing partnership:", error);
    return { status: 500, data: "Failed to remove partnership" };
  }
}
