import { client } from "@/lib/prisma";
import { deleteCache, getOrSetCache } from "@/lib/cache";
import {
  AutomationListResponseSchema,
  AutomationDetailResponseSchema,
  AutomationCreatedResponseSchema,
  AutomationUpdatedResponseSchema,
  type AutomationListItem,
  type AutomationDetail,
  type CreateAutomationRequest,
  type UpdateAutomationRequest,
  type SaveListenerRequest,
  type SaveTriggerRequest,
  type SaveKeywordRequest,
  type EditKeywordRequest,
  type SavePostsRequest,
  type AutomationCreatedResponse,
  type AutomationUpdatedResponse,
  type AutomationsPagination,
  type PaginatedAutomationsResponse,
} from "@/schemas/automation.schema";

/**
 * ============================================
 * AUTOMATION SERVICE
 * Business logic - accepts only validated data
 * IDOR protection via userId ownership checks
 * ============================================
 */

class AutomationService {
  /**
   * Get paginated automations for a user (IDOR: userId is from session)
   */
  async listByUser(
    userId: string,
    pagination: AutomationsPagination,
  ): Promise<PaginatedAutomationsResponse> {
    const { cursor, limit } = pagination;

    const automations = await client.automation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit + 1, // Fetch one extra to check if there's more
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // Skip the cursor itself
      }),
      include: {
        keywords: true,
        listener: true,
        // Include flowNodes for platform detection (minimal fields)
        flowNodes: {
          select: { subType: true },
        },
      },
    });

    const hasMore = automations.length > limit;
    const data = hasMore ? automations.slice(0, limit) : automations;
    const nextCursor = hasMore ? (data[data.length - 1]?.id ?? null) : null;

    // Get total count
    const total = await client.automation.count({ where: { userId } });

    // Validate response
    const validatedData = AutomationListResponseSchema.safeParse(data);
    if (!validatedData.success) {
      console.error(
        "Automation list validation failed:",
        validatedData.error.format(),
      );
      return { data: [], meta: { nextCursor: null, hasMore: false, total: 0 } };
    }

    return {
      data: validatedData.data,
      meta: { nextCursor, hasMore, total },
    };
  }

  /**
   * Get all automations for user (cached, no pagination)
   */
  async getAllByUser(userId: string): Promise<AutomationListItem[]> {
    const result = await getOrSetCache(
      `user:${userId}:automations`,
      async () => {
        const user = await client.user.findUnique({
          where: { id: userId },
          select: {
            automations: {
              orderBy: { createdAt: "asc" },
              include: {
                keywords: true,
                listener: true,
              },
            },
          },
        });
        return user?.automations ?? [];
      },
      300,
    );

    const validated = AutomationListResponseSchema.safeParse(result);
    return validated.success ? validated.data : [];
  }

  /**
   * Get automation by ID with ownership check
   */
  async getById(
    automationId: string,
    userId: string,
  ): Promise<AutomationDetail | null> {
    const automation = await client.automation.findUnique({
      where: { id: automationId },
      include: {
        keywords: true,
        trigger: true,
        posts: true,
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
            subscription: true,
            integrations: true,
          },
        },
        flowNodes: true,
        flowEdges: true,
      },
    });

    // IDOR check: verify ownership
    if (!automation || automation.userId !== userId) {
      return null;
    }

    // Build response with extra computed fields
    const rawData = {
      id: automation.id,
      name: automation.name,
      active: automation.active,
      createdAt: automation.createdAt,
      keywords: automation.keywords,
      trigger: automation.trigger,
      posts: automation.posts,
      listener: automation.listener,
      carouselTemplates: automation.carouselTemplates,
      flowNodes: automation.flowNodes,
      flowEdges: automation.flowEdges,
      hasProPlan: automation.User?.subscription?.plan === "PRO",
      hasIntegration: (automation.User?.integrations?.length ?? 0) > 0,
    };

    const validated = AutomationDetailResponseSchema.safeParse(rawData);
    if (!validated.success) {
      console.error(
        "Automation detail validation failed:",
        validated.error.format(),
      );
      return null;
    }

    return validated.data;
  }

  /**
   * Get automation by ID with full user data for internal webhook processing
   * IDOR PROTECTED: Verifies the automation's user owns the Instagram page
   * @param automationId - The automation to fetch
   * @param pageId - Instagram page ID from webhook payload (used for ownership verification)
   * @returns Automation data or null if not found/unauthorized
   */
  async getByIdForWebhook(automationId: string, pageId: string) {
    const automation = await client.automation.findUnique({
      where: { id: automationId },
      include: {
        keywords: true,
        trigger: true,
        posts: true,
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
            id: true,
            subscription: { select: { plan: true } },
            integrations: {
              where: { name: "INSTAGRAM" },
              select: { token: true, instagramId: true },
            },
            openAiKey: true,
          },
        },
      },
    });

    // Guard: Automation must exist and be active
    if (!automation || !automation.active) {
      console.warn("[IDOR] Automation not found or inactive", { automationId });
      return null;
    }

    // IDOR CHECK: Verify the automation's user owns the Instagram page
    const userOwnsPage = automation.User?.integrations.some(
      (integration: { instagramId: string | null }) =>
        integration.instagramId === pageId,
    );

    if (!userOwnsPage) {
      console.warn("[IDOR] getByIdForWebhook - Page ownership mismatch", {
        automationId,
        pageId,
        userIntegrations: automation.User?.integrations.map(
          (i: { instagramId: string | null }) => i.instagramId,
        ),
      });
      return null;
    }

    return automation;
  }

  /**
   * Create new automation
   */
  async create(
    userId: string,
    _input: CreateAutomationRequest,
  ): Promise<AutomationCreatedResponse | null> {
    // Note: We ignore input.id to prevent unique constraint violations
    // The database will generate a new UUID automatically
    const result = await client.automation.create({
      data: {
        userId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    // Invalidate cache
    await deleteCache(`user:${userId}:automations`);

    const validated = AutomationCreatedResponseSchema.safeParse(result);
    return validated.success ? validated.data : null;
  }

  /**
   * Update automation with ownership check
   */
  async update(
    automationId: string,
    userId: string,
    input: UpdateAutomationRequest,
  ): Promise<AutomationUpdatedResponse | null> {
    // IDOR check first
    const existing = await client.automation.findUnique({
      where: { id: automationId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return null;
    }

    const result = await client.automation.update({
      where: { id: automationId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.active !== undefined && { active: input.active }),
      },
      select: {
        id: true,
        name: true,
        active: true,
        createdAt: true,
      },
    });

    // Invalidate cache
    await deleteCache(`user:${userId}:automations`);

    const validated = AutomationUpdatedResponseSchema.safeParse(result);
    return validated.success ? validated.data : null;
  }

  /**
   * Delete automation with ownership check
   */
  async delete(automationId: string, userId: string): Promise<boolean> {
    // IDOR check first
    const existing = await client.automation.findUnique({
      where: { id: automationId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return false;
    }

    await client.automation.delete({ where: { id: automationId } });
    await deleteCache(`user:${userId}:automations`);

    return true;
  }

  /**
   * Add listener to automation
   */
  async saveListener(
    automationId: string,
    userId: string,
    input: SaveListenerRequest,
  ): Promise<boolean> {
    // IDOR check
    const existing = await client.automation.findUnique({
      where: { id: automationId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return false;
    }

    await client.automation.update({
      where: { id: automationId },
      data: {
        listener: {
          upsert: {
            create: {
              listener: input.listener,
              prompt: input.prompt,
              commentReply: input.reply,
              ...(input.listener === "CAROUSEL" && {
                carouselTemplateId: input.carouselTemplateId,
              }),
            },
            update: {
              listener: input.listener,
              prompt: input.prompt,
              commentReply: input.reply,
              ...(input.listener === "CAROUSEL" && {
                carouselTemplateId: input.carouselTemplateId,
              }),
            },
          },
        },
      },
    });

    await deleteCache(`user:${userId}:automations`);
    return true;
  }

  /**
   * Sync triggers for automation
   */
  async syncTriggers(
    automationId: string,
    userId: string,
    input: SaveTriggerRequest,
  ): Promise<{ added: string[]; deleted: string[] } | null> {
    // IDOR check
    const automation = await client.automation.findUnique({
      where: { id: automationId },
      include: { trigger: true },
    });

    if (!automation || automation.userId !== userId) {
      return null;
    }

    const existingTypes = automation.trigger.map(
      (t: { type: string }) => t.type,
    );
    const newTypes = input.triggers as string[];

    const toAdd = newTypes.filter((t: string) => !existingTypes.includes(t));
    const toDelete = automation.trigger.filter(
      (t: { type: string; id: string }) => !newTypes.includes(t.type),
    );

    if (toDelete.length > 0) {
      await client.trigger.deleteMany({
        where: { id: { in: toDelete.map((t: { id: string }) => t.id) } },
      });
    }

    if (toAdd.length > 0) {
      await client.trigger.createMany({
        data: toAdd.map((type) => ({ automationId, type })),
      });
    }

    await deleteCache(`user:${userId}:automations`);

    return {
      added: toAdd,
      deleted: toDelete.map((t: { type: string }) => t.type),
    };
  }

  /**
   * Add keyword to automation
   */
  async addKeyword(
    automationId: string,
    userId: string,
    input: SaveKeywordRequest,
  ): Promise<boolean> {
    // IDOR check
    const existing = await client.automation.findUnique({
      where: { id: automationId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return false;
    }

    await client.automation.update({
      where: { id: automationId },
      data: {
        keywords: {
          create: { word: input.keyword },
        },
      },
    });

    await deleteCache(`user:${userId}:automations`);
    return true;
  }

  /**
   * Edit keyword
   */
  async editKeyword(
    automationId: string,
    userId: string,
    input: EditKeywordRequest,
  ): Promise<boolean> {
    // IDOR check
    const existing = await client.automation.findUnique({
      where: { id: automationId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return false;
    }

    await client.automation.update({
      where: { id: automationId },
      data: {
        keywords: {
          update: {
            where: { id: input.keywordId },
            data: { word: input.keyword },
          },
        },
      },
    });

    await deleteCache(`user:${userId}:automations`);
    return true;
  }

  /**
   * Delete keyword
   */
  async deleteKeyword(keywordId: string, userId: string): Promise<boolean> {
    // First find the keyword and its automation to check ownership
    const keyword = await client.keyword.findUnique({
      where: { id: keywordId },
      include: { Automation: { select: { userId: true } } },
    });

    if (!keyword || keyword.Automation?.userId !== userId) {
      return false;
    }

    await client.keyword.delete({ where: { id: keywordId } });
    await deleteCache(`user:${userId}:automations`);
    return true;
  }

  /**
   * Save posts to automation
   */
  async savePosts(
    automationId: string,
    userId: string,
    input: SavePostsRequest,
  ): Promise<boolean> {
    // IDOR check
    const existing = await client.automation.findUnique({
      where: { id: automationId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return false;
    }

    await client.automation.update({
      where: { id: automationId },
      data: {
        posts: {
          createMany: {
            data: input.posts.map((post) => ({
              postid: post.postid,
              caption: post.caption,
              media: post.media,
              mediaType: post.mediaType,
            })),
          },
        },
      },
    });

    await deleteCache(`user:${userId}:automations`);
    return true;
  }

  /**
   * Toggle automation active state
   */
  async setActive(
    automationId: string,
    userId: string,
    active: boolean,
  ): Promise<AutomationUpdatedResponse | null> {
    return this.update(automationId, userId, { active });
  }

  // ============================================
  // FLOW BUILDER METHODS
  // ============================================

  /**
   * Save flow nodes and edges
   * IDOR: Validates ownership before saving
   */
  async saveFlow(
    automationId: string,
    userId: string,
    nodes: {
      nodeId: string;
      type: string;
      subType: string;
      label: string;
      description?: string | null;
      positionX: number;
      positionY: number;
      config?: Record<string, unknown> | null;
    }[],
    edges: {
      edgeId: string;
      sourceNodeId: string;
      targetNodeId: string;
      sourceHandle?: string | null;
      targetHandle?: string | null;
    }[],
  ): Promise<boolean> {
    const automation = await client.automation.findFirst({
      where: { id: automationId, userId },
    });
    if (!automation) return false;

    // Delete existing nodes and edges
    await client.flowEdge.deleteMany({ where: { automationId } });
    await client.flowNode.deleteMany({ where: { automationId } });

    // Create new nodes
    if (nodes.length > 0) {
      await client.flowNode.createMany({
        data: nodes.map((n) => ({
          nodeId: n.nodeId,
          type: n.type,
          subType: n.subType,
          label: n.label,
          description: n.description ?? null,
          positionX: n.positionX,
          positionY: n.positionY,
          config: n.config as object | undefined,
          automationId,
        })),
      });
    }

    // Create new edges
    if (edges.length > 0) {
      await client.flowEdge.createMany({
        data: edges.map((e) => ({
          edgeId: e.edgeId,
          sourceNodeId: e.sourceNodeId,
          targetNodeId: e.targetNodeId,
          sourceHandle: e.sourceHandle ?? null,
          targetHandle: e.targetHandle ?? null,
          automationId,
        })),
      });
    }

    await deleteCache(`user:${userId}:automations`);
    return true;
  }

  /**
   * Get flow nodes and edges for an automation
   */
  async getFlow(automationId: string, userId: string) {
    const automation = await client.automation.findFirst({
      where: { id: automationId, userId },
      select: {
        flowNodes: true,
        flowEdges: true,
      },
    });
    if (!automation) return null;
    return {
      nodes: automation.flowNodes,
      edges: automation.flowEdges,
    };
  }

  /**
   * Batch save all automation flow data (nodes, edges, triggers, keywords, listener)
   * Used by flow builder to save everything in one call
   */
  async saveFlowBatch(
    automationId: string,
    userId: string,
    payload: {
      nodes: {
        nodeId: string;
        type: string;
        subType: string;
        label: string;
        description?: string | null;
        positionX: number;
        positionY: number;
        config?: Record<string, unknown> | null;
      }[];
      edges: {
        edgeId: string;
        sourceNodeId: string;
        targetNodeId: string;
        sourceHandle?: string | null;
        targetHandle?: string | null;
      }[];
      triggers: string[];
      keywords: string[];
      listener?: {
        type: "MESSAGE" | "SMARTAI" | "CAROUSEL";
        prompt: string;
        reply?: string | null;
        carouselTemplateId?: string | null;
      };
    },
  ): Promise<boolean> {
    const automation = await client.automation.findFirst({
      where: { id: automationId, userId },
    });
    if (!automation) return false;

    // Save flow nodes and edges
    await this.saveFlow(automationId, userId, payload.nodes, payload.edges);

    // Sync triggers
    if (payload.triggers.length > 0) {
      await this.syncTriggers(automationId, userId, {
        triggers: payload.triggers as ("COMMENT" | "DM")[],
      });
    }

    // Sync keywords - delete and recreate
    await client.keyword.deleteMany({ where: { automationId } });
    if (payload.keywords.length > 0) {
      await client.keyword.createMany({
        data: payload.keywords.map((word) => ({ word, automationId })),
      });
    }

    // Save listener if provided
    if (payload.listener) {
      await this.saveListener(automationId, userId, {
        listener: payload.listener.type,
        prompt: payload.listener.prompt,
        reply: payload.listener.reply ?? null,
        carouselTemplateId: payload.listener.carouselTemplateId ?? null,
      });
    }

    await deleteCache(`user:${userId}:automations`);
    return true;
  }

  /**
   * Delete a specific flow node and its connected edges
   */
  async deleteFlowNode(
    automationId: string,
    userId: string,
    nodeId: string,
  ): Promise<boolean> {
    const automation = await client.automation.findFirst({
      where: { id: automationId, userId },
    });
    if (!automation) return false;

    // Delete edges connected to this node
    await client.flowEdge.deleteMany({
      where: {
        automationId,
        OR: [{ sourceNodeId: nodeId }, { targetNodeId: nodeId }],
      },
    });

    // Delete the node
    await client.flowNode.deleteMany({
      where: { automationId, nodeId },
    });

    await deleteCache(`user:${userId}:automations`);
    return true;
  }

  /**
   * Get flow execution path for a trigger type
   * IDOR PROTECTED: Verifies the automation's user owns the Instagram page
   * @param automationId - The automation to fetch
   * @param triggerType - DM or COMMENT trigger
   * @param pageId - Instagram page ID for ownership verification
   */
  async getExecutionPath(
    automationId: string,
    triggerType: "DM" | "COMMENT",
    pageId: string,
  ) {
    const automation = await client.automation.findUnique({
      where: { id: automationId },
      include: {
        flowNodes: true,
        flowEdges: true,
        trigger: true,
        listener: true,
        carouselTemplates: {
          include: { elements: { include: { buttons: true } } },
        },
        User: {
          select: {
            integrations: {
              where: { name: "INSTAGRAM" },
              select: { instagramId: true },
            },
          },
        },
      },
    });
    if (!automation || !automation.active) return null;

    // IDOR CHECK: Verify the automation's user owns the Instagram page
    const userOwnsPage = automation.User?.integrations.some(
      (i: { instagramId: string | null }) => i.instagramId === pageId,
    );
    if (!userOwnsPage) {
      console.warn("[IDOR] getExecutionPath - Page ownership mismatch", {
        automationId,
        pageId,
      });
      return null;
    }

    // Check if trigger type matches
    const hasTrigger = automation.trigger.some(
      (t: { type: string }) => t.type === triggerType,
    );
    if (!hasTrigger) return null;

    return {
      automation: {
        id: automation.id,
        name: automation.name,
        active: automation.active,
      },
      listener: automation.listener,
      carouselTemplates: automation.carouselTemplates,
      flowNodes: automation.flowNodes,
      flowEdges: automation.flowEdges,
    };
  }

  /**
   * Create carousel template for automation
   */
  async createCarouselTemplate(
    automationId: string,
    userId: string,
    elements: {
      title: string;
      subtitle?: string | null;
      imageUrl?: string | null;
      defaultAction?: string | null;
      buttons: {
        type: "WEB_URL" | "POSTBACK";
        title: string;
        url?: string | null;
        payload?: string | null;
      }[];
    }[],
  ): Promise<{ id: string } | null> {
    const automation = await client.automation.findFirst({
      where: { id: automationId, userId },
    });
    if (!automation) return null;

    const template = await client.carouselTemplate.create({
      data: {
        userId,
        automationId,
        elements: {
          create: elements.map((el, idx) => ({
            title: el.title,
            subtitle: el.subtitle ?? null,
            imageUrl: el.imageUrl ?? null,
            defaultAction: el.defaultAction ?? null,
            order: idx,
            buttons: {
              create: el.buttons.map((btn) => ({
                type: btn.type,
                title: btn.title,
                url: btn.url ?? null,
                payload: btn.payload ?? null,
              })),
            },
          })),
        },
      },
    });

    await deleteCache(`user:${userId}:automations`);
    return { id: template.id };
  }

  /**
   * Increment edit count for an automation with monthly auto-reset.
   * - If editCountResetAt is null or in the past → reset counter, set new 30-day window.
   * - Atomically increments editCount.
   * IDOR: Validates ownership via userId.
   */
  async incrementEditCount(
    automationId: string,
    userId: string,
  ): Promise<number> {
    // IDOR check
    const automation = await client.automation.findFirst({
      where: { id: automationId, userId },
      select: { editCount: true, editCountResetAt: true },
    });

    if (!automation) {
      throw new Error("Automation not found or unauthorized");
    }

    const now = new Date();
    const resetAt = automation.editCountResetAt;
    const needsReset = !resetAt || resetAt <= now;

    // Calculate new reset window: 30 days from now
    const newResetAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const updated = await client.automation.update({
      where: { id: automationId },
      data: needsReset
        ? { editCount: 1, editCountResetAt: newResetAt }
        : { editCount: { increment: 1 } },
      select: { editCount: true },
    });

    return updated.editCount;
  }
}

// Export singleton instance
export const automationService = new AutomationService();
