"use server"

import { client } from "@/lib/prisma";

export const matchKeyword = async (keyword: string) => {
  return await client.keyword.findFirst({
    where: {
      word: {
        equals: keyword,
        mode: "insensitive",
      },
    },
  });
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
      listener: {
        include: {
          carouselTemplate: {
            include: {
              elements: {
                include: {
                  buttons: true
                },
                orderBy: {
                  order: 'asc'
                }
              }
            }
          }
        }
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
  type: "COMMENT" | "DM" | "CAROUSEL"
) => {
  if (type === "COMMENT") {
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

export const replyToComment = async (automationId: string, commentId: string) => {
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

  if (!automation?.listener?.commentReply || !automation.User?.integrations[0]?.token) {
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
              buttons: true
            },
            orderBy: {
              order: 'asc'
            }
          }
        }
      },
      User: {
        select: {
          subscription: {
            select: {
              plan: true
            }
          },
          integrations: {
            select: {
              token: true
            }
          }
        }
      }
    }
  });
};

