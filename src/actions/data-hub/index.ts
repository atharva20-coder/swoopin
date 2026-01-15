"use server";

import { client } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { googleSheetsService } from "@/services/google-sheets.service";

type CollectionSource =
  | "STORY_POLL"
  | "STORY_QUESTION"
  | "DM_KEYWORD"
  | "COMMENT_KEYWORD"
  | "BROADCAST_CHANNEL";

interface SheetsConfig {
  spreadsheetId: string;
  spreadsheetName: string;
  sheetName: string;
}

interface CreateCollectionInput {
  name: string;
  source: CollectionSource;
  sheetsConfig?: SheetsConfig | null;
  triggerConfig?: Record<string, unknown>;
}

/**
 * Get all collections for user
 */
export async function getUserCollections() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { status: 401, data: "Unauthorized" };
    }

    const collections = await client.dataCollection.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { status: 200, data: collections };
  } catch (error) {
    console.error("Error getting collections:", error);
    return { status: 500, data: "Failed to get collections" };
  }
}

/**
 * Create a new collection
 */
export async function createCollection(input: CreateCollectionInput) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { status: 401, data: "Unauthorized" };
    }

    const collection = await client.dataCollection.create({
      data: {
        userId: session.user.id,
        name: input.name,
        source: input.source,
        sheetsConfig: input.sheetsConfig
          ? JSON.parse(JSON.stringify(input.sheetsConfig))
          : null,
        triggerConfig: input.triggerConfig
          ? JSON.parse(JSON.stringify(input.triggerConfig))
          : null,
      },
    });

    revalidatePath("/dashboard");
    return { status: 200, data: collection };
  } catch (error) {
    console.error("Error creating collection:", error);
    return { status: 500, data: "Failed to create collection" };
  }
}

/**
 * Update collection status
 */
export async function updateCollectionStatus(
  collectionId: string,
  status: "ACTIVE" | "PAUSED" | "COMPLETED"
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { status: 401, data: "Unauthorized" };
    }

    await client.dataCollection.update({
      where: { id: collectionId },
      data: { status },
    });

    revalidatePath("/dashboard");
    return { status: 200, data: "Status updated" };
  } catch (error) {
    console.error("Error updating status:", error);
    return { status: 500, data: "Failed to update status" };
  }
}

/**
 * Delete a collection
 */
export async function deleteCollection(collectionId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { status: 401, data: "Unauthorized" };
    }

    await client.dataCollection.delete({
      where: { id: collectionId },
    });

    revalidatePath("/dashboard");
    return { status: 200, data: "Collection deleted" };
  } catch (error) {
    console.error("Error deleting collection:", error);
    return { status: 500, data: "Failed to delete collection" };
  }
}

/**
 * Get responses for a collection
 */
export async function getCollectionResponses(collectionId: string, limit = 50) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { status: 401, data: "Unauthorized" };
    }

    const responses = await client.collectionResponse.findMany({
      where: { collectionId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return { status: 200, data: responses };
  } catch (error) {
    console.error("Error getting responses:", error);
    return { status: 500, data: "Failed to get responses" };
  }
}

/**
 * Add a response to a collection (called from webhooks/automations)
 */
export async function addCollectionResponse(
  collectionId: string,
  data: {
    senderName?: string;
    senderId?: string;
    content: string;
    metadata?: Record<string, unknown>;
  }
) {
  try {
    const response = await client.collectionResponse.create({
      data: {
        collectionId,
        senderName: data.senderName,
        senderId: data.senderId,
        content: data.content,
        metadata: data.metadata as any,
      },
    });

    // Check if collection has sheets config and export
    const collection = await client.dataCollection.findUnique({
      where: { id: collectionId },
    });

    if (collection?.sheetsConfig && collection.userId) {
      const config = collection.sheetsConfig as unknown as SheetsConfig;
      await googleSheetsService.exportToSheet(collection.userId, {
        spreadsheetId: config.spreadsheetId,
        sheetName: config.sheetName,
        columnHeaders: ["Timestamp", "Sender", "Content"],
        rows: [
          [
            new Date().toISOString(),
            data.senderName || "Unknown",
            data.content,
          ],
        ],
      });

      // Mark as exported
      await client.collectionResponse.update({
        where: { id: response.id },
        data: { exportedAt: new Date() },
      });
    }

    return { status: 200, data: response };
  } catch (error) {
    console.error("Error adding response:", error);
    return { status: 500, data: "Failed to add response" };
  }
}

/**
 * Export all responses to sheets
 */
export async function exportResponsesToSheet(collectionId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { status: 401, data: "Unauthorized" };
    }

    const collection = await client.dataCollection.findUnique({
      where: { id: collectionId },
      include: { responses: { where: { exportedAt: null } } },
    });

    if (!collection) {
      return { status: 404, data: "Collection not found" };
    }

    if (!collection.sheetsConfig) {
      return { status: 400, data: "No sheets configured" };
    }

    const config = collection.sheetsConfig as unknown as SheetsConfig;
    const rows = collection.responses.map((r) => [
      r.createdAt.toISOString(),
      r.senderName || "Unknown",
      r.content,
    ]);

    if (rows.length === 0) {
      return { status: 200, data: "No new responses to export" };
    }

    const result = await googleSheetsService.exportToSheet(session.user.id, {
      spreadsheetId: config.spreadsheetId,
      sheetName: config.sheetName,
      columnHeaders: ["Timestamp", "Sender", "Content"],
      rows,
    });

    if ("error" in result) {
      return { status: 500, data: result.error };
    }

    // Mark all as exported
    await client.collectionResponse.updateMany({
      where: { collectionId, exportedAt: null },
      data: { exportedAt: new Date() },
    });

    return { status: 200, data: `Exported ${rows.length} responses` };
  } catch (error) {
    console.error("Error exporting responses:", error);
    return { status: 500, data: "Failed to export" };
  }
}

/**
 * Demo: Create sample data and export to sheet
 */
export async function demoExportToSheet(sheetConfig: SheetsConfig) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { status: 401, data: "Unauthorized" };
    }

    const result = await googleSheetsService.exportToSheet(session.user.id, {
      spreadsheetId: sheetConfig.spreadsheetId,
      sheetName: sheetConfig.sheetName,
      columnHeaders: ["Timestamp", "Name", "Email", "Response", "Source"],
      rows: [
        [
          new Date().toISOString(),
          "John Doe",
          "john@example.com",
          "Yes, I'm interested!",
          "Story Poll",
        ],
        [
          new Date().toISOString(),
          "Jane Smith",
          "jane@example.com",
          "Great content!",
          "DM",
        ],
        [
          new Date().toISOString(),
          "Bob Wilson",
          "bob@example.com",
          "Count me in",
          "Comment",
        ],
      ],
    });

    if ("error" in result) {
      return { status: 500, data: result.error };
    }

    return { status: 200, data: "Demo exported successfully" };
  } catch (error) {
    console.error("Error in demo export:", error);
    return { status: 500, data: "Demo export failed" };
  }
}
