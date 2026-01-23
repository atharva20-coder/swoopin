/**
 * ============================================
 * CONDITION: IS FOLLOWER
 * Checks if the sender is following the page.
 * If not following, sends a button template with Follow button.
 * ============================================
 */

import type {
  INodeExecutor,
  ItemData,
  ExecutionContext,
  NodeExecutionResult,
  ExecutionLogEntry,
} from "../types";
import {
  checkIfFollower,
  getUserProfile,
  sendButtonTemplate,
} from "@/lib/fetch";
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
    config: Record<string, unknown>,
    items: ItemData[],
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    const logs: ExecutionLogEntry[] = [];
    const startTime = Date.now();

    const { token, pageId, senderId } = context;

    // Configurable settings with defaults
    const sendFollowPrompt = config.sendFollowPrompt !== false; // Default: true
    const promptMessage =
      (config.promptMessage as string) ||
      "Hey! Follow us to stay updated with our latest content!";
    const buttonText = (config.buttonText as string) || "Follow Us";

    logs.push({
      timestamp: startTime,
      level: "info",
      message: "Checking if user is follower",
      data: { senderId, sendFollowPrompt },
    });

    try {
      let isFollower = false;
      let username: string | undefined;

      const apiResult = await checkIfFollower(pageId, senderId, token);

      if (apiResult !== null) {
        // API Check Successful (True or False)
        isFollower = apiResult;

        // Sync state to DB
        try {
          await updateFollowerStatus(senderId, pageId, isFollower).catch(
            async () => {
              // If update fails (does not exist), we need to create it.
              const profile = await getUserProfile(senderId, token);
              username = profile?.username;
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

      // If NOT a follower and sendFollowPrompt is enabled, send button template
      if (!isFollower && sendFollowPrompt) {
        logs.push({
          timestamp: Date.now(),
          level: "info",
          message: "User is not a follower - sending follow prompt",
        });

        try {
          // Fetch page's Instagram username to build profile URL
          const pageProfile = await getUserProfile(pageId, token);
          const pageUsername = pageProfile?.username;

          if (pageUsername) {
            const followUrl = `https://www.instagram.com/${pageUsername}`;

            const result = await sendButtonTemplate(
              pageId,
              senderId,
              promptMessage,
              [
                {
                  type: "web_url",
                  title: buttonText.substring(0, 20), // Max 20 chars
                  url: followUrl,
                },
              ],
              token,
            );

            if (result.success) {
              logs.push({
                timestamp: Date.now(),
                level: "info",
                message: "Follow prompt sent successfully",
                data: { messageId: result.messageId, followUrl },
              });
            } else {
              logs.push({
                timestamp: Date.now(),
                level: "warn",
                message: "Failed to send follow prompt",
                data: { error: result.error },
              });
            }
          } else {
            logs.push({
              timestamp: Date.now(),
              level: "warn",
              message: "Could not determine page username for follow URL",
            });
          }
        } catch (followError) {
          logs.push({
            timestamp: Date.now(),
            level: "error",
            message: "Exception sending follow prompt",
            data: {
              error:
                followError instanceof Error
                  ? followError.message
                  : String(followError),
            },
          });
        }
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
