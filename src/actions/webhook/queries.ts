"use server";

import { client } from "@/lib/prisma";

// Find automation by keyword match or catch-all trigger
// Optimized: Only select fields needed for matching
export const matchKeyword = async (
  messageText: string,
  triggerType: "DM" | "COMMENT" = "DM"
) => {
  // First, try legacy keyword table - check if message contains any keyword
  // Only select id, word, automationId - skip other fields
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

  // Search FlowNode KEYWORDS nodes - only select needed fields
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

  // Check each KEYWORDS node's config for matching keyword
  for (const node of keywordNodes) {
    const config = (node.config as Record<string, any>) || {};
    const keywords = config.keywords || [];

    for (const kw of keywords) {
      if (
        typeof kw === "string" &&
        messageText.toLowerCase().includes(kw.toLowerCase())
      ) {
        return { automationId: node.automationId };
      }
    }
  }

  // No keyword match - look for CATCH-ALL automations (trigger without keywords)
  // Only select minimal fields needed
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
            take: 1, // Only need to know if any exist
          },
        },
      },
    },
  });

  for (const triggerNode of catchAllFlows) {
    // Check if this automation has any KEYWORDS node
    const hasKeywords = (triggerNode.Automation?.flowNodes?.length || 0) > 0;

    if (!hasKeywords) {
      return { automationId: triggerNode.automationId };
    }
  }

  return null;
};

export const getKeywordAutomation = async (
  automationId: string,
  dm: boolean
) => {
  return await client.automation.findUnique({
    where: {
      id: automationId,
    },

    include: {
      dms: dm,
      trigger: {
        where: {
          type: dm ? "DM" : "COMMENT",
        },
      },
      flowNodes: true,
      flowEdges: true,
      listener: {
        include: {
          carouselTemplate: {
            include: {
              elements: {
                include: {
                  buttons: true,
                },
                orderBy: {
                  order: "asc",
                },
              },
            },
          },
        },
      },
      User: {
        select: {
          subscription: {
            select: {
              plan: true,
            },
          },
          integrations: {
            select: {
              token: true,
            },
          },
          openAiKey: true,
        },
      },
    },
  });
};
export const trackResponses = async (
  automationId: string,
  type: "COMMENT" | "DM" | "CAROUSEL" | "MENTION"
) => {
  if (type === "COMMENT" || type === "MENTION") {
    return await client.listener.update({
      where: { automationId },
      data: {
        commentCount: {
          increment: 1,
        },
      },
    });
  }

  if (type === "DM" || type === "CAROUSEL") {
    return await client.listener.update({
      where: { automationId },
      data: {
        dmCount: {
          increment: 1,
        },
      },
    });
  }
};

export const createChatHistory = (
  automationId: string,
  sender: string,
  reciever: string,
  message: string
) => {
  return client.automation.update({
    where: {
      id: automationId,
    },
    data: {
      dms: {
        create: {
          reciever,
          senderId: sender,
          message,
        },
      },
    },
  });
};

export const getKeywordPost = async (postId: string, automationId: string) => {
  return await client.post.findFirst({
    where: {
      AND: [{ postid: postId }, { automationId }],
    },
    select: { automationId: true },
  });
};

export const getChatHistory = async (sender: string, reciever: string) => {
  const history = await client.dms.findMany({
    where: {
      AND: [{ senderId: sender }, { reciever }],
    },
    orderBy: { createdAt: "asc" },
  });
  const chatSession: {
    role: "assistant" | "user";
    content: string;
  }[] = history.map((chat) => {
    return {
      role: chat.reciever ? "assistant" : "user",
      content: chat.message!,
    };
  });

  return {
    history: chatSession,
    automationId: history[history.length - 1].automationId,
  };
};

export const replyToComment = async (
  automationId: string,
  commentId: string
) => {
  const automation = await client.automation.findUnique({
    where: { id: automationId },
    include: {
      listener: true,
      User: {
        select: {
          integrations: {
            where: { name: "INSTAGRAM" },
            select: {
              token: true,
            },
          },
        },
      },
    },
  });

  if (
    !automation?.listener?.commentReply ||
    !automation.User?.integrations[0]?.token
  ) {
    throw new Error("No comment reply template or Instagram token found");
  }

  try {
    // Make Instagram API call to reply to the comment
    const response = await fetch(
      `${process.env.INSTAGRAM_BASE_URL}/${commentId}/replies?access_token=${automation.User.integrations[0].token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: automation.listener.commentReply,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to reply to comment");
    }

    // Track the response
    await client.listener.update({
      where: { automationId },
      data: {
        commentCount: {
          increment: 1,
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error replying to comment:", error);
    throw error;
  }
};

export const getCarouselAutomation = async (automationId: string) => {
  return await client.automation.findUnique({
    where: { id: automationId },
    include: {
      listener: true,
      carouselTemplates: {
        include: {
          elements: {
            include: {
              buttons: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      },
      User: {
        select: {
          subscription: {
            select: {
              plan: true,
            },
          },
          integrations: {
            select: {
              token: true,
            },
          },
        },
      },
    },
  });
};
