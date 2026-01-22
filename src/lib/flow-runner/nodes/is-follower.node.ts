/**
 * ============================================
 * CONDITION: IS FOLLOWER
 * Checks if the sender is following the page.
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";
import { checkIfFollower, getUserProfile } from "@/lib/fetch";
import {
  getContact,
  updateFollowerStatus,
  upsertContact,
} from "@/services/contact.service";

export class IsFollowerNodeExecutor implements INodeExecutor {
  readonly type = "condition";
  readonly subType = "IS_FOLLOWER";
  readonly description = "Check if user is following the page";

  async execute(
    _config: Record<string, unknown>,
    items: ItemData[],
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    const logs: ExecutionLogEntry[] = [];
    const startTime = Date.now();

    const { token, pageId, senderId } = context;

    logs.push({
      timestamp: startTime,
      level: "info",
      message: "Checking if user is follower",
      data: { senderId },
    });

    try {
      let isFollower = false;
      const apiResult = await checkIfFollower(pageId, senderId, token);

      if (apiResult !== null) {
        // API Check Successful (True or False)
        isFollower = apiResult;

        // Sync state to DB
        // We might need to fetch profile if we don't have basic details, but for now just update status
        try {
          // We upsert to ensure record exists. We try to get profile for name/username if possible
          // But to keep it fast, we might just update status if contact exists, or create minimal contact.
          // Let's attempt to get profile only if we are creating.
          // Ideally, webhook created it.

          await updateFollowerStatus(senderId, pageId, isFollower).catch(
            async () => {
              // If update fails (does not exist), we need to create it.
              // Fetch profile first
              const profile = await getUserProfile(senderId, token);
              await upsertContact(senderId, pageId, {
                name: profile?.name,
                username: profile?.username,
                isFollower,
              });
            },
          );
        } catch (dbError) {
          console.error("Failed to sync follower status to DB:", dbError);
        }

        logs.push({
          timestamp: Date.now(),
          level: "info",
          message: `API Verification: ${isFollower}`,
          data: { source: "API", isFollower },
        });
      } else {
        // API Check Failed (Error or Permission) -> Fallback to DB
        const contact = await getContact(senderId, pageId);
        isFollower = contact?.isFollower ?? false;

        logs.push({
          timestamp: Date.now(),
          level: "warn",
          message: `API Failed. DB Fallback: ${isFollower}`,
          data: { source: "DB", isFollower, dbRecordFound: !!contact },
        });
      }

      logs.push({
        timestamp: Date.now(),
        level: "info",
        message: `Follower check complete: ${isFollower}`,
        data: { isFollower, executionTimeMs: Date.now() - startTime },
      });

      // Add condition result to output items
      const outputItems: ItemData[] = items.map((item) => ({
        ...item,
        json: {
          ...item.json,
          conditionResult: isFollower,
          conditionType: "IS_FOLLOWER",
        },
      }));

      return {
        success: true,
        items:
          outputItems.length > 0
            ? outputItems
            : [{ json: { conditionResult: isFollower } }],
        message: isFollower ? "User is a follower" : "User is not a follower",
        logs,
      };
    } catch (error) {
      logs.push({
        timestamp: Date.now(),
        level: "error",
        message: "Follower check failed",
        data: { error: error instanceof Error ? error.message : String(error) },
      });

      // Default to false on error
      return {
        success: true, // Condition itself executed, just returned false
        items: [{ json: { conditionResult: false } }],
        message: "Follower check failed - defaulting to false",
        logs,
      };
    }
  }
}

export const isFollowerNodeExecutor = new IsFollowerNodeExecutor();
