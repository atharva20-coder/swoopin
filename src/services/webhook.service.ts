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
    // Guard against undefined/null messageText
    if (!messageText || typeof messageText !== "string") {
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

    for (const kw of legacyKeywords) {
      if (messageText.toLowerCase().includes(kw.word.toLowerCase())) {
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

    for (const node of keywordNodes) {
      const config = (node.config as Record<string, unknown>) || {};
      const keywords = (config.keywords as string[]) || [];

      for (const kw of keywords) {
        if (
          typeof kw === "string" &&
          messageText.toLowerCase().includes(kw.toLowerCase())
        ) {
          return { automationId: node.automationId };
        }
      }
    }

    // ==========================================
    // STEP 3: No keyword match - find automation with trigger type
    // This logic now runs for ALL trigger types
    // ==========================================

    // For MENTION type, we MUST validate ownership via pageId
    if (triggerType === "MENTION") {
      if (!pageId) {
        console.warn(
          "[matchKeyword] MENTION trigger requires pageId for ownership validation",
        );
        return null;
      }

      // Find MENTION triggers that belong to accounts matching this pageId
      const mentionAutomations = await client.flowNode.findMany({
        where: {
          type: "trigger",
          subType: "MENTION",
          Automation: {
            active: true,
            User: {
              integrations: {
                some: {
                  instagramId: pageId,
                },
              },
            },
          },
        },
        select: {
          automationId: true,
        },
      });

      if (mentionAutomations.length > 0) {
        console.log(
          `[matchKeyword] Found MENTION automation for pageId: ${pageId}`,
        );
        return {
          automationId: mentionAutomations[0].automationId,
          isCatchAll: true,
        };
      }

      console.log(
        `[matchKeyword] No MENTION automation found for pageId: ${pageId}`,
      );
      return null;
    }

    // For STORY_REPLY type
    if (triggerType === "STORY_REPLY") {
      const whereClause: any = {
        type: "trigger",
        subType: "STORY_REPLY",
        Automation: {
          active: true,
        },
      };

      // If pageId is provided, filter by ownership
      if (pageId) {
        whereClause.Automation.User = {
          integrations: {
            some: {
              instagramId: pageId,
            },
          },
        };
      }

      const storyReplyAutomations = await client.flowNode.findMany({
        where: whereClause,
        select: {
          automationId: true,
        },
      });

      if (storyReplyAutomations.length > 0) {
        console.log(`[matchKeyword] Found STORY_REPLY automation`);
        return {
          automationId: storyReplyAutomations[0].automationId,
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
      // For catch-all triggers, we should also validate pageId if provided
      // to ensure we're automating for the correct account
      const whereClause: any = {
        type: "trigger",
        subType: triggerType,
        Automation: {
          active: true,
        },
      };

      // If pageId is provided, filter by ownership (prevents cross-account automation)
      if (pageId) {
        whereClause.Automation.User = {
          integrations: {
            some: {
              instagramId: pageId,
            },
          },
        };
      }

      const triggerFlows = await client.flowNode.findMany({
        where: whereClause,
        select: {
          automationId: true,
        },
      });

      if (triggerFlows.length > 0) {
        console.log(
          `[matchKeyword] Found ${triggerType} catch-all automation` +
            (pageId ? ` for pageId: ${pageId}` : ""),
        );
        return {
          automationId: triggerFlows[0].automationId,
          isCatchAll: true,
        };
      }

      console.log(
        `[matchKeyword] No ${triggerType} automation found` +
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
