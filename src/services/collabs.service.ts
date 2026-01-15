import { client } from "@/lib/prisma";
import {
  getBrandedContentPartners,
  approveBrandedContent as approveMetaPartner,
  removeBrandedContentPartner as removeMetaPartner,
} from "@/lib/instagram/collabs";
import {
  PartnershipListSchema,
  PartnershipSchema,
  type Partnership,
  type CreatePartnershipRequest,
  type PartnershipType,
} from "@/schemas/collabs.schema";

/**
 * ============================================
 * COLLABS SERVICE
 * Business logic for brand partnerships
 * IDOR protection via userId ownership checks
 * Zero patchwork - all types from Zod schemas
 * ============================================
 */

class CollabsService {
  /**
   * Get all partnerships for a user
   * IDOR: Only returns partnerships owned by userId
   */
  async getPartnerships(userId: string): Promise<Partnership[]> {
    const partnerships = await client.brandPartnership.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const validated = PartnershipListSchema.safeParse(partnerships);
    return validated.success ? validated.data : [];
  }

  /**
   * Sync partnerships with Instagram
   */
  async syncPartnerships(
    userId: string
  ): Promise<{ synced: boolean; count: number } | { error: string }> {
    const integration = await client.integrations.findFirst({
      where: { userId, name: "INSTAGRAM" },
    });

    if (!integration?.token || !integration?.instagramId) {
      return { error: "Instagram not connected" };
    }

    const result = await getBrandedContentPartners(
      integration.instagramId,
      integration.token
    );

    if (!result.success) {
      return { error: result.error || "Failed to fetch partners" };
    }

    let count = 0;
    for (const partner of result.partners || []) {
      await client.brandPartnership.upsert({
        where: { id: partner.id },
        create: {
          userId,
          partnerId: partner.id,
          partnerName: partner.name || partner.username,
          partnerUsername: partner.username ?? null,
          status: "APPROVED",
          type: "BRAND_TO_CREATOR",
        },
        update: {
          partnerName: partner.name || partner.username,
          partnerUsername: partner.username ?? null,
          status: "APPROVED",
        },
      });
      count++;
    }

    return { synced: true, count };
  }

  /**
   * Create a new partnership request
   * Type from Zod schema already matches Prisma (no MUTUAL)
   */
  async createPartnership(
    userId: string,
    input: CreatePartnershipRequest
  ): Promise<Partnership | { error: string }> {
    const partnership = await client.brandPartnership.create({
      data: {
        userId,
        partnerId: input.partnerId,
        partnerName: input.partnerName,
        partnerUsername: input.partnerUsername,
        status: "PENDING",
        type: input.type,
      },
    });

    const validated = PartnershipSchema.safeParse(partnership);
    return validated.success ? validated.data : { error: "Validation failed" };
  }

  /**
   * Approve a partnership
   * IDOR: Verifies partnership belongs to user
   */
  async approvePartnership(
    userId: string,
    partnershipId: string
  ): Promise<Partnership | { error: string }> {
    const existing = await client.brandPartnership.findUnique({
      where: { id: partnershipId },
    });

    if (!existing || existing.userId !== userId) {
      return { error: "Partnership not found" };
    }

    const integration = await client.integrations.findFirst({
      where: { userId, name: "INSTAGRAM" },
    });

    if (integration?.token && integration?.instagramId) {
      try {
        await approveMetaPartner(
          integration.instagramId,
          integration.token,
          existing.partnerId
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Meta partner approval failed:", error.message);
        }
      }
    }

    const updated = await client.brandPartnership.update({
      where: { id: partnershipId },
      data: { status: "APPROVED" },
    });

    const validated = PartnershipSchema.safeParse(updated);
    return validated.success ? validated.data : { error: "Validation failed" };
  }

  /**
   * Reject a partnership
   * IDOR: Verifies partnership belongs to user
   */
  async rejectPartnership(
    userId: string,
    partnershipId: string
  ): Promise<Partnership | { error: string }> {
    const existing = await client.brandPartnership.findUnique({
      where: { id: partnershipId },
    });

    if (!existing || existing.userId !== userId) {
      return { error: "Partnership not found" };
    }

    const updated = await client.brandPartnership.update({
      where: { id: partnershipId },
      data: { status: "REJECTED" },
    });

    const validated = PartnershipSchema.safeParse(updated);
    return validated.success ? validated.data : { error: "Validation failed" };
  }

  /**
   * Remove a partnership
   * IDOR: Verifies partnership belongs to user
   */
  async removePartnership(
    userId: string,
    partnershipId: string
  ): Promise<boolean> {
    const existing = await client.brandPartnership.findUnique({
      where: { id: partnershipId },
    });

    if (!existing || existing.userId !== userId) {
      return false;
    }

    const integration = await client.integrations.findFirst({
      where: { userId, name: "INSTAGRAM" },
    });

    if (
      existing.status === "APPROVED" &&
      integration?.token &&
      integration?.instagramId
    ) {
      try {
        await removeMetaPartner(
          integration.instagramId,
          integration.token,
          existing.partnerId
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Meta partner removal failed:", error.message);
        }
      }
    }

    await client.brandPartnership.delete({ where: { id: partnershipId } });
    return true;
  }
}

export const collabsService = new CollabsService();
