"use server";


import { client } from "@/lib/prisma";

export const createAutomation = async (userId: string, id?: string) => {
  return await client.user.update({
    where: {
      id: userId,
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

export const getAutomations = async (userId: string) => {
  return await client.user.findUnique({
    where: {
      id: userId,
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
      flowNodes: true,
      flowEdges: true,
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

// Sync triggers - only creates new ones and deletes removed ones
export const syncTriggers = async (automationId: string, newTriggerTypes: string[]) => {
  // Get existing triggers
  const automation = await client.automation.findUnique({
    where: { id: automationId },
    include: { trigger: true },
  });
  
  if (!automation) return null;
  
  const existingTypes = automation.trigger.map(t => t.type);
  
  // Find triggers to add (in new but not in existing)
  const toAdd = newTriggerTypes.filter(t => !existingTypes.includes(t));
  
  // Find triggers to delete (in existing but not in new)
  const toDelete = automation.trigger.filter(t => !newTriggerTypes.includes(t.type));
  
  // Delete removed triggers
  if (toDelete.length > 0) {
    await client.trigger.deleteMany({
      where: {
        id: { in: toDelete.map(t => t.id) },
      },
    });
  }
  
  // Create new triggers
  if (toAdd.length > 0) {
    await client.trigger.createMany({
      data: toAdd.map(type => ({
        automationId,
        type,
      })),
    });
  }
  
  return { added: toAdd, deleted: toDelete.map(t => t.type) };
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
