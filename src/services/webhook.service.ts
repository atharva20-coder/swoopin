import { client } from "@/lib/prisma";

/**
 * ============================================
 * WEBHOOK SERVICE
 * Business logic for webhook processing & automation execution
 * Used by REST API routes AND flow-executor
 * ============================================
 */

class WebhookService {
  /**
   * Match incoming message to an automation keyword
   * @param messageText - The message/comment text
   * @param triggerType - Type of trigger (DM, COMMENT, MENTION)
   * @param pageId - Instagram page ID (required for MENTION to validate ownership)
   */
  async matchKeyword(
    messageText: string,
    triggerType: "DM" | "COMMENT" | "MENTION" | "STORY_REPLY" = "DM",
    pageId?: string,
  ) {
    console.log("[matchKeyword] Called with:", {
      messageText: messageText?.substring(0, 50),
      triggerType,
      pageId,
    });

    // Guard against undefined/null messageText
    if (!messageText || typeof messageText !== "string") {
      console.log("[matchKeyword] Skipping: invalid messageText");
      return null;
    }

    // ==========================================
    // STEP 1: Try legacy keyword table
    // ==========================================
    const legacyKeywords = await client.keyword.findMany({
      where: {
        Automation: {
          active: true,
        },
      },
      select: {
        id: true,
        word: true,
        automationId: true,
      },
    });

    console.log(
      `[matchKeyword] Step 1: Found ${legacyKeywords.length} legacy keywords`,
    );
    for (const kw of legacyKeywords) {
      if (messageText.toLowerCase().includes(kw.word.toLowerCase())) {
        console.log(
          `[matchKeyword] Step 1 MATCHED legacy keyword: "${kw.word}" -> automationId: ${kw.automationId}`,
        );
        return kw;
      }
    }

    // ==========================================
    // STEP 2: Search FlowNode KEYWORDS nodes
    // ==========================================
    const keywordNodes = await client.flowNode.findMany({
      where: {
        subType: "KEYWORDS",
        Automation: {
          active: true,
        },
      },
      select: {
        automationId: true,
        config: true,
      },
    });

    console.log(
      `[matchKeyword] Step 2: Found ${keywordNodes.length} FlowNode KEYWORDS nodes`,
    );
    for (const node of keywordNodes) {
      const config = (node.config as Record<string, unknown>) || {};
      const keywords = (config.keywords as string[]) || [];

      for (const kw of keywords) {
        if (
          typeof kw === "string" &&
          messageText.toLowerCase().includes(kw.toLowerCase())
        ) {
          console.log(
            `[matchKeyword] Step 2 MATCHED FlowNode keyword: "${kw}" -> automationId: ${node.automationId}`,
          );
          return { automationId: node.automationId };
        }
      }
    }
    console.log(
      "[matchKeyword] No keyword match in Steps 1-2, proceeding to trigger-type matching",
    );

    // ==========================================
    // STEP 3: No keyword match - find automation with trigger type
    // This logic now runs for ALL trigger types
    // ==========================================

    // For MENTION type, try to validate ownership via pageId
    if (triggerType === "MENTION") {
      // Find all active MENTION triggers first
      const allMentionAutomations = await client.flowNode.findMany({
        where: {
          type: "trigger",
          subType: "MENTION",
          Automation: {
            active: true,
          },
        },
        select: {
          automationId: true,
          Automation: {
            select: {
              User: {
                select: {
                  integrations: {
                    where: { name: "INSTAGRAM" },
                    select: { instagramId: true },
                  },
                },
              },
            },
          },
        },
      });

      console.log(
        `[matchKeyword] Step 3: Found ${allMentionAutomations.length} MENTION triggers (unfiltered), pageId: ${pageId}`,
      );

      let matched = allMentionAutomations;

      // Apply pageId filter if provided
      if (pageId && allMentionAutomations.length > 0) {
        const filtered = allMentionAutomations.filter((t) =>
          t.Automation?.User?.integrations?.some(
            (i) => i.instagramId === pageId,
          ),
        );

        if (filtered.length > 0) {
          matched = filtered;
        } else {
          // SAFETY FALLBACK: pageId didn't match any automation's instagramId
          console.warn(
            `[matchKeyword] Step 3 FALLBACK: MENTION pageId filter found no match. ` +
              `Matching first available MENTION trigger anyway. ` +
              `webhook pageId=${pageId}`,
          );
        }
      }

      if (matched.length > 0) {
        console.log(
          `[matchKeyword] Found MENTION automation: ${matched[0].automationId}`,
        );
        return {
          automationId: matched[0].automationId,
          isCatchAll: true,
        };
      }

      console.log(`[matchKeyword] No MENTION automation found`);
      return null;
    }

    // For STORY_REPLY type
    if (triggerType === "STORY_REPLY") {
      // Find all active STORY_REPLY triggers first
      const allStoryReplyAutomations = await client.flowNode.findMany({
        where: {
          type: "trigger",
          subType: "STORY_REPLY",
          Automation: {
            active: true,
          },
        },
        select: {
          automationId: true,
          Automation: {
            select: {
              User: {
                select: {
                  integrations: {
                    where: { name: "INSTAGRAM" },
                    select: { instagramId: true },
                  },
                },
              },
            },
          },
        },
      });

      console.log(
        `[matchKeyword] Step 3: Found ${allStoryReplyAutomations.length} STORY_REPLY triggers, pageId: ${pageId}`,
      );

      let matched = allStoryReplyAutomations;

      // Apply pageId filter if provided
      if (pageId && allStoryReplyAutomations.length > 0) {
        const filtered = allStoryReplyAutomations.filter((t) =>
          t.Automation?.User?.integrations?.some(
            (i) => i.instagramId === pageId,
          ),
        );

        if (filtered.length > 0) {
          matched = filtered;
        } else {
          console.warn(
            `[matchKeyword] Step 3 FALLBACK: STORY_REPLY pageId filter found no match. ` +
              `Matching first available STORY_REPLY trigger anyway. ` +
              `webhook pageId=${pageId}`,
          );
        }
      }

      if (matched.length > 0) {
        console.log(
          `[matchKeyword] Found STORY_REPLY automation: ${matched[0].automationId}`,
        );
        return {
          automationId: matched[0].automationId,
          isCatchAll: true,
        };
      }

      console.log(`[matchKeyword] No STORY_REPLY automation found`);
      return null;
    }

    // ==========================================
    // STEP 4: Handle DM and COMMENT catch-all triggers
    // ==========================================

    if (triggerType === "DM" || triggerType === "COMMENT") {
      console.log(
        `[matchKeyword] Step 4: Looking for ${triggerType} catch-all trigger, pageId: ${pageId}`,
      );

      // First, check WITHOUT pageId filter to see if any triggers exist at all
      const allTriggers = await client.flowNode.findMany({
        where: {
          type: "trigger",
          subType: triggerType,
          Automation: {
            active: true,
          },
        },
        select: {
          automationId: true,
          Automation: {
            select: {
              userId: true,
              User: {
                select: {
                  integrations: {
                    where: { name: "INSTAGRAM" },
                    select: { instagramId: true },
                  },
                },
              },
            },
          },
        },
      });

      console.log(
        `[matchKeyword] Step 4: Found ${allTriggers.length} ${triggerType} triggers (unfiltered)`,
      );
      if (allTriggers.length > 0) {
        for (const t of allTriggers) {
          const userInstagramIds = t.Automation?.User?.integrations?.map(
            (i) => i.instagramId,
          );
          console.log(
            `[matchKeyword] Step 4: Trigger automationId=${t.automationId}, userId=${t.Automation?.userId}, instagramIds=${JSON.stringify(userInstagramIds)}, webhook pageId=${pageId}`,
          );
        }
      }

      // Now apply pageId filter if provided
      let matchedTriggers = allTriggers;
      if (pageId) {
        const filtered = allTriggers.filter((t) =>
          t.Automation?.User?.integrations?.some(
            (i) => i.instagramId === pageId,
          ),
        );
        console.log(
          `[matchKeyword] Step 4: After pageId filter: ${filtered.length} of ${allTriggers.length} triggers`,
        );

        if (filtered.length > 0) {
          matchedTriggers = filtered;
        } else if (allTriggers.length > 0) {
          // SAFETY FALLBACK: pageId filter removed all triggers.
          // This can happen if the stored instagramId doesn't match the webhook's entry[0].id.
          // Rather than silently failing (breaking all automations), match anyway and log a warning.
          console.warn(
            `[matchKeyword] Step 4 FALLBACK: pageId filter removed all triggers. ` +
              `Matching first available trigger anyway. ` +
              `webhook pageId=${pageId}, stored IDs=${JSON.stringify(
                allTriggers.flatMap(
                  (t) =>
                    t.Automation?.User?.integrations?.map(
                      (i) => i.instagramId,
                    ) || [],
                ),
              )}`,
          );
          matchedTriggers = allTriggers;
        }
      }

      if (matchedTriggers.length > 0) {
        console.log(
          `[matchKeyword] Step 4 MATCHED ${triggerType} catch-all automation: ${matchedTriggers[0].automationId}` +
            (pageId ? ` for pageId: ${pageId}` : ""),
        );
        return {
          automationId: matchedTriggers[0].automationId,
          isCatchAll: true,
        };
      }

      console.log(
        `[matchKeyword] Step 4: No ${triggerType} automation found` +
          (pageId ? ` for pageId: ${pageId}` : ""),
      );
      return null;
    }

    // Unknown trigger type
    console.warn(`[matchKeyword] Unknown trigger type: ${triggerType}`);
    return null;
  }

  /**
   * Get automation with all flow data for execution.
   * Ensures Instagram integration token is selected (filter by name INSTAGRAM).
   */
  async getKeywordAutomation(automationId: string, dm: boolean) {
    return await client.automation.findUnique({
      where: { id: automationId },
      include: {
        dms: dm,
        trigger: {
          where: { type: dm ? "DM" : "COMMENT" },
        },
        flowNodes: true,
        flowEdges: true,
        posts: { select: { postid: true } }, // used to know if comment must be on attached post
        listener: {
          include: {
            carouselTemplate: {
              include: {
                elements: {
                  include: { buttons: true },
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        },
        User: {
          select: {
            subscription: { select: { plan: true } },
            integrations: {
              where: { name: "INSTAGRAM" },
              take: 1,
              select: { token: true },
            },
            openAiKey: true,
          },
        },
      },
    });
  }

  /**
   * Track automation responses (DM or comment count)
   */
  async trackResponses(
    automationId: string,
    type: "COMMENT" | "DM" | "CAROUSEL" | "MENTION",
  ) {
    if (type === "COMMENT" || type === "MENTION") {
      return await client.listener.update({
        where: { automationId },
        data: {
          commentCount: { increment: 1 },
        },
      });
    }

    if (type === "DM" || type === "CAROUSEL") {
      return await client.listener.update({
        where: { automationId },
        data: {
          dmCount: { increment: 1 },
        },
      });
    }
  }

  /**
   * Create chat history entry
   */
  async createChatHistory(
    automationId: string,
    sender: string,
    receiver: string,
    message: string,
  ) {
    return client.automation.update({
      where: { id: automationId },
      data: {
        dms: {
          create: {
            reciever: receiver,
            senderId: sender,
            message,
          },
        },
      },
    });
  }

  /**
   * Get chat history for AI context
   */
  async getChatHistory(sender: string, receiver: string) {
    const history = await client.dms.findMany({
      where: {
        AND: [{ senderId: sender }, { reciever: receiver }],
      },
      orderBy: { createdAt: "asc" },
    });

    const chatSession: { role: "assistant" | "user"; content: string }[] =
      history.map((chat) => ({
        role: chat.reciever ? "assistant" : "user",
        content: chat.message!,
      }));

    return {
      history: chatSession,
      automationId: history[history.length - 1]?.automationId,
    };
  }

  /**
   * Get post by ID for automation matching
   */
  async getKeywordPost(postId: string, automationId: string) {
    return await client.post.findFirst({
      where: {
        AND: [{ postid: postId }, { automationId }],
      },
      select: { automationId: true },
    });
  }

  /**
   * Get carousel automation data
   */
  async getCarouselAutomation(automationId: string) {
    return await client.automation.findUnique({
      where: { id: automationId },
      include: {
        listener: true,
        carouselTemplates: {
          include: {
            elements: {
              include: { buttons: true },
              orderBy: { order: "asc" },
            },
          },
        },
        User: {
          select: {
            subscription: { select: { plan: true } },
            integrations: { select: { token: true } },
          },
        },
      },
    });
  }

  /**
   * Get integration token by Page ID (Instagram ID)
   */
  async getIntegrationToken(pageId: string) {
    const integration = await client.integrations.findUnique({
      where: { instagramId: pageId },
      select: { token: true },
    });
    return integration?.token;
  }

  /**
   * Get automation for follower recheck with IDOR protection
   * Returns null if automation doesn't exist, is inactive, or user doesn't own the page
   * Zero-Patchwork: All validation happens here, caller receives clean data or null
   */
  async getAutomationForFollowerRecheck(
    automationId: string,
    pageId: string,
  ): Promise<{
    id: string;
    userId: string;
    flowNodes: unknown;
    flowEdges: unknown;
    token: string;
  } | null> {
    // Fetch automation with ownership data
    const automation = await client.automation.findUnique({
      where: { id: automationId },
      select: {
        id: true,
        userId: true,
        active: true,
        flowNodes: true,
        flowEdges: true,
        User: {
          select: {
            integrations: {
              where: { name: "INSTAGRAM" },
              select: { instagramId: true, token: true },
            },
          },
        },
      },
    });

    // Guard: Automation must exist and be active
    if (!automation || !automation.userId || !automation.active) {
      console.warn("[IDOR] Automation not found or inactive", { automationId });
      return null;
    }

    // Guard: User must own this Instagram page
    const matchingIntegration = automation.User?.integrations.find(
      (i) => i.instagramId === pageId,
    );
    if (!matchingIntegration) {
      console.warn("[IDOR] Page mismatch - blocked", {
        automationId,
        pageId,
        userPages: automation.User?.integrations.map((i) => i.instagramId),
      });
      return null;
    }

    // Guard: Must have valid flow data
    if (!automation.flowNodes || !automation.flowEdges) {
      console.warn("[IDOR] Missing flow data", { automationId });
      return null;
    }

    // Return clean, validated data
    return {
      id: automation.id,
      userId: automation.userId,
      flowNodes: automation.flowNodes,
      flowEdges: automation.flowEdges,
      token: matchingIntegration.token,
    };
  }
}

// Export singleton instance
export const webhookService = new WebhookService();
