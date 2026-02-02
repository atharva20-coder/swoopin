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
   */
  async matchKeyword(
    messageText: string,
    triggerType: "DM" | "COMMENT" | "MENTION" = "DM",
  ) {
    // Guard against undefined/null messageText
    if (!messageText || typeof messageText !== "string") {
      return null;
    }

    // First, try legacy keyword table
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

    // Search FlowNode KEYWORDS nodes
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

    // No keyword match - find ANY automation with this trigger type
    // Flow execution will handle all branching logic
    // This supports:
    // - Simple: DM → SendDM
    // - With SmartAI: DM → SmartAI → SendDM
    // - Mixed: DM → [Keywords + SmartAI branches]
    // - ANY other combination
    const triggerFlows = await client.flowNode.findMany({
      where: {
        type: "trigger",
        subType: triggerType,
        Automation: {
          active: true,
        },
      },
      select: {
        automationId: true,
      },
    });

    // Return first matching automation
    if (triggerFlows.length > 0) {
      return { automationId: triggerFlows[0].automationId, isCatchAll: true };
    }

    return null;
  }

  /**
   * Get automation with all flow data for execution
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
            integrations: { select: { token: true } },
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
