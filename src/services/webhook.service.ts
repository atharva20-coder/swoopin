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
    triggerType: "DM" | "COMMENT" = "DM",
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

    // No keyword match - look for CATCH-ALL automations
    const catchAllFlows = await client.flowNode.findMany({
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
            flowNodes: {
              where: { subType: "KEYWORDS" },
              select: { id: true },
              take: 1,
            },
          },
        },
      },
    });

    for (const triggerNode of catchAllFlows) {
      const hasKeywords = (triggerNode.Automation?.flowNodes?.length || 0) > 0;
      if (!hasKeywords) {
        return { automationId: triggerNode.automationId };
      }
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
}

// Export singleton instance
export const webhookService = new WebhookService();
