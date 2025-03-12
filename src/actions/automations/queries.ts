"use server";


import { client } from "@/lib/prisma";

export const createAutomation = async (clerkId: string, id?: string) => {
  return await client.user.update({
    where: {
      clerkId,
    },
    data: {
      automations: {
        create: {
          ...(id && { id }),
        },
      },
    },
  });
};
export const deleteAutomation = async (id: string) => {
  return await client.automation.delete({
    where: {
      id,
    },
  });
};

export const getAutomations = async (clerkId: string) => {
  return await client.user.findUnique({
    where: {
      clerkId,
    },
    select: {
      automations: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          keywords: true,
          listener: true,
        },
      },
    },
  });
};

export const findAutomation = async (id: string) => {
  return await client.automation.findUnique({
    where: {
      id,
    },
    include: {
      keywords: true,
      trigger: true,
      posts: true,
      listener: true,
      carouselTemplates: {  // Changed from carouselTemplate to carouselTemplates
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
          subscription: true,
          integrations: true,
          openAiKey: true,
        },
      },
    },
  });
};

export const updateAutomation = async (
  id: string,
  update: {
    name?: string;
    active?: boolean;
  }
) => {
  return await client.automation.update({
    where: { id },
    data: {
      name: update.name,
      active: update.active,
    },
  });
};

export const addListener = async (
  automationId: string,
  listener: "SMARTAI" | "MESSAGE" | "CAROUSEL",
  prompt: string,
  reply?: string,
  carouselTemplateId?: string
) => {
  if (listener === "CAROUSEL" && !carouselTemplateId) {
    throw new Error("carouselTemplateId is required for CAROUSEL listener");
  }

  return await client.automation.update({
    where: {
      id: automationId,
    },
    data: {
      listener: {
        create: {
          listener,
          prompt,
          commentReply: reply,
          ...(listener === "CAROUSEL" && { carouselTemplateId })
        },
      },
    },
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
      }
    }
  });
};

export const addTrigger = async (automationId: string, trigger: string[]) => {
  if (trigger.length === 2) {
    return await client.automation.update({
      where: { id: automationId },
      data: {
        trigger: {
          createMany: {
            data: [{ type: trigger[0] }, { type: trigger[1] }],
          },
        },
      },
    });
  }
  return await client.automation.update({
    where: {
      id: automationId,
    },
    data: {
      trigger: {
        create: {
          type: trigger[0],
        },
      },
    },
  });
};

export const addKeyWord = async (automationId: string, keyword: string) => {
  return client.automation.update({
    where: {
      id: automationId,
    },
    data: {
      keywords: {
        create: {
          word: keyword,
        },
      },
    },
  });
};
export const editKeyWord = async (
  automationId: string,
  keyword: string,
  keywordId: string
) => {
  return client.automation.update({
    where: {
      id: automationId,
    },
    data: {
      keywords: {
        update: {
          where: { id: keywordId },
          data: {
            word: keyword,
          },
        },
      },
    },
  });
};

export const deleteKeywordQuery = async (id: string) => {
  return client.keyword.delete({
    where: { id },
  });
};

export const addPost = async (
  autmationId: string,
  posts: {
    postid: string;
    caption?: string;
    media: string;
    mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  }[]
) => {
  return await client.automation.update({
    where: {
      id: autmationId,
    },
    data: {
      posts: {
        createMany: {
          data: posts,
        },
      },
    },
  });
};

export const addCarouselTemplate = async (automationId: string, userId: string, elements: Array<{
  title: string;
  subtitle?: string;
  imageUrl?: string;
  defaultAction?: string;
  buttons: Array<{
    type: "WEB_URL" | "POSTBACK";
    title: string;
    url?: string;
    payload?: string;
  }>;
}>) => {
  return await client.automation.update({
    where: {
      id: automationId,
    },
    data: {
      carouselTemplates: {
        create: {
          userId,
          elements: {
            create: elements.map((element, index) => ({
              title: element.title,
              subtitle: element.subtitle || "",
              imageUrl: element.imageUrl || "",
              defaultAction: element.defaultAction || "",
              order: index,
              buttons: {
                create: element.buttons.map(button => ({
                  type: button.type,
                  title: button.title,
                  url: button.type === "WEB_URL" ? button.url : "",
                  payload: button.type === "POSTBACK" ? button.payload : ""
                }))
              }
            }))
          }
        }
      }
    },
    include: {
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
      }
    }
  });
};
