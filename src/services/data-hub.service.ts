import { client } from "@/lib/prisma";
import { googleSheetsService } from "@/services/google-sheets.service";
import {
  CollectionListSchema,
  CollectionSchema,
  CollectionResponseListSchema,
  CollectionResponseSchema,
  type Collection,
  type CollectionResponse,
  type CreateCollectionRequest,
  type CollectionStatus,
  type AddResponseRequest,
  type SheetsConfig,
} from "@/schemas/data-hub.schema";

/**
 * ============================================
 * DATA HUB SERVICE
 * Business logic for data collections
 * IDOR protection via userId ownership checks
 * Zero patchwork - Zod schemas handle all transformations
 * ============================================
 */

class DataHubService {
  /**
   * Get all collections for a user
   * IDOR: Only returns collections owned by userId
   */
  async getCollections(userId: string): Promise<Collection[]> {
    const collections = await client.dataCollection.findMany({
      where: { userId },
      include: {
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const validated = CollectionListSchema.safeParse(collections);
    return validated.success ? validated.data : [];
  }

  /**
   * Create a new collection
   * Input already transformed by Zod schema (sheetsConfig, triggerConfig)
   */
  async createCollection(
    userId: string,
    input: CreateCollectionRequest
  ): Promise<Collection | { error: string }> {
    const collection = await client.dataCollection.create({
      data: {
        userId,
        name: input.name,
        source: input.source,
        // sheetsConfig and triggerConfig already transformed by Zod
        sheetsConfig: input.sheetsConfig,
        triggerConfig: input.triggerConfig,
      },
      include: {
        _count: { select: { responses: true } },
      },
    });

    const validated = CollectionSchema.safeParse(collection);
    return validated.success ? validated.data : { error: "Validation failed" };
  }

  /**
   * Update collection status
   * IDOR: Verifies collection belongs to user
   */
  async updateCollectionStatus(
    userId: string,
    collectionId: string,
    status: CollectionStatus
  ): Promise<{ updated: boolean } | { error: string }> {
    const existing = await client.dataCollection.findUnique({
      where: { id: collectionId },
    });

    if (!existing || existing.userId !== userId) {
      return { error: "Collection not found" };
    }

    await client.dataCollection.update({
      where: { id: collectionId },
      data: { status },
    });

    return { updated: true };
  }

  /**
   * Delete a collection
   * IDOR: Verifies collection belongs to user
   */
  async deleteCollection(
    userId: string,
    collectionId: string
  ): Promise<boolean> {
    const existing = await client.dataCollection.findUnique({
      where: { id: collectionId },
    });

    if (!existing || existing.userId !== userId) {
      return false;
    }

    await client.dataCollection.delete({
      where: { id: collectionId },
    });

    return true;
  }

  /**
   * Get responses for a collection
   * IDOR: Verifies collection belongs to user
   */
  async getResponses(
    userId: string,
    collectionId: string,
    limit: number = 50
  ): Promise<CollectionResponse[] | { error: string }> {
    const collection = await client.dataCollection.findUnique({
      where: { id: collectionId },
    });

    if (!collection || collection.userId !== userId) {
      return { error: "Collection not found" };
    }

    const responses = await client.collectionResponse.findMany({
      where: { collectionId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const validated = CollectionResponseListSchema.safeParse(responses);
    return validated.success ? validated.data : [];
  }

  /**
   * Add a response to a collection (from webhooks/automations)
   * Note: No userId check - called from system
   * Input already transformed by Zod (metadata is Prisma.InputJsonValue)
   */
  async addResponse(
    collectionId: string,
    input: AddResponseRequest
  ): Promise<CollectionResponse | { error: string }> {
    const response = await client.collectionResponse.create({
      data: {
        collectionId,
        senderName: input.senderName,
        senderId: input.senderId,
        content: input.content,
        // metadata already transformed by Zod schema
        metadata: input.metadata,
      },
    });

    // Export to sheets if configured
    const collection = await client.dataCollection.findUnique({
      where: { id: collectionId },
    });

    if (collection?.sheetsConfig && collection.userId) {
      const config = collection.sheetsConfig as unknown as SheetsConfig;
      try {
        await googleSheetsService.exportToSheet(collection.userId, {
          spreadsheetId: config.spreadsheetId,
          sheetName: config.sheetName,
          columnHeaders: ["Timestamp", "Sender", "Content"],
          rows: [
            [
              new Date().toISOString(),
              input.senderName || "Unknown",
              input.content,
            ],
          ],
        });

        await client.collectionResponse.update({
          where: { id: response.id },
          data: { exportedAt: new Date() },
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Sheets export failed:", error.message);
        }
      }
    }

    const validated = CollectionResponseSchema.safeParse(response);
    return validated.success ? validated.data : { error: "Validation failed" };
  }

  /**
   * Export all responses to sheets
   * IDOR: Verifies collection belongs to user
   */
  async exportResponsesToSheet(
    userId: string,
    collectionId: string
  ): Promise<{ exported: number } | { error: string }> {
    const collection = await client.dataCollection.findUnique({
      where: { id: collectionId },
      include: { responses: { where: { exportedAt: null } } },
    });

    if (!collection || collection.userId !== userId) {
      return { error: "Collection not found" };
    }

    if (!collection.sheetsConfig) {
      return { error: "No sheets configured" };
    }

    const config = collection.sheetsConfig as unknown as SheetsConfig;
    const rows = collection.responses.map((r) => [
      r.createdAt.toISOString(),
      r.senderName || "Unknown",
      r.content,
    ]);

    if (rows.length === 0) {
      return { exported: 0 };
    }

    const result = await googleSheetsService.exportToSheet(userId, {
      spreadsheetId: config.spreadsheetId,
      sheetName: config.sheetName,
      columnHeaders: ["Timestamp", "Sender", "Content"],
      rows,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    await client.collectionResponse.updateMany({
      where: { collectionId, exportedAt: null },
      data: { exportedAt: new Date() },
    });

    return { exported: rows.length };
  }
}

export const dataHubService = new DataHubService();
