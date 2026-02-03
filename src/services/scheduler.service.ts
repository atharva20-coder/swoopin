import { client } from "@/lib/prisma";
import { deleteCache, getOrSetCache } from "@/lib/cache";
import {
  ScheduledPostSchema,
  ScheduledPostListSchema,
  ContentDraftListSchema,
  ScheduledPostCreatedSchema,
  ContentDraftSchema,
  PaginatedScheduledPostsSchema,
  type ScheduledPost,
  type CreateScheduledPostRequest,
  type UpdateScheduledPostRequest,
  type ScheduledPostsQuery,
  type ContentDraft,
  type CreateDraftRequest,
  type UpdateDraftRequest,
  type ScheduledPostCreated,
  type PublishingLimit,
  type PaginatedScheduledPosts,
} from "@/schemas/scheduler.schema";
import {
  publishSingleMedia,
  publishCarousel,
  getPublishingLimit,
} from "@/lib/instagram-publisher";

/**
 * ============================================
 * SCHEDULER SERVICE
 * Business logic for scheduled posts and drafts
 * IDOR protection via userId ownership checks
 * ============================================
 */

class SchedulerService {
  /**
   * Get paginated scheduled posts for a user
   */
  async listPosts(
    userId: string,
    query: ScheduledPostsQuery,
  ): Promise<PaginatedScheduledPosts> {
    const { cursor, limit, status, fromDate, toDate } = query;

    const posts = await client.scheduledPost.findMany({
      where: {
        userId,
        ...(status && { status }),
        ...(fromDate && { scheduledFor: { gte: fromDate } }),
        ...(toDate && { scheduledFor: { lte: toDate } }),
      },
      orderBy: { scheduledFor: "asc" },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? (data[data.length - 1]?.id ?? null) : null;

    const total = await client.scheduledPost.count({
      where: {
        userId,
        ...(status && { status }),
      },
    });

    const validated = ScheduledPostListSchema.safeParse(data);
    if (!validated.success) {
      console.error(
        "Scheduled posts validation failed:",
        validated.error.format(),
      );
      return { data: [], meta: { nextCursor: null, hasMore: false, total: 0 } };
    }

    return {
      data: validated.data,
      meta: { nextCursor, hasMore, total },
    };
  }

  /**
   * Get scheduled post by ID with ownership check
   */
  async getPostById(
    postId: string,
    userId: string,
  ): Promise<ScheduledPost | null> {
    const post = await client.scheduledPost.findUnique({
      where: { id: postId },
    });

    // IDOR check
    if (!post || post.userId !== userId) {
      return null;
    }

    const validated = ScheduledPostSchema.safeParse(post);
    return validated.success ? validated.data : null;
  }

  /**
   * Create scheduled post
   */
  async createPost(
    userId: string,
    input: CreateScheduledPostRequest,
  ): Promise<ScheduledPostCreated | null> {
    const post = await client.scheduledPost.create({
      data: {
        userId,
        caption: input.caption,
        mediaUrl: input.mediaUrl,
        mediaType: input.mediaType,
        postType: input.postType,
        scheduledFor: input.scheduledFor,
        hashtags: input.hashtags,
        automationId: input.automationId,
        altText: input.altText,
        location: input.location,
        locationId: input.locationId,
        music: input.music,
        taggedUsers: input.taggedUsers,
        collaborators: input.collaborators,
        carouselItems: input.carouselItems,
        status: "SCHEDULED",
      },
      select: {
        id: true,
        scheduledFor: true,
        status: true,
        createdAt: true,
      },
    });

    const validated = ScheduledPostCreatedSchema.safeParse(post);
    return validated.success ? validated.data : null;
  }

  /**
   * Update scheduled post with ownership check
   */
  async updatePost(
    postId: string,
    userId: string,
    input: UpdateScheduledPostRequest,
  ): Promise<ScheduledPost | null> {
    // IDOR check
    const existing = await client.scheduledPost.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return null;
    }

    // Build update data - only include defined fields
    const updateData: Record<string, unknown> = {};
    if (input.caption !== undefined) updateData.caption = input.caption;
    if (input.mediaUrl !== undefined) updateData.mediaUrl = input.mediaUrl;
    if (input.mediaType !== undefined) updateData.mediaType = input.mediaType;
    if (input.postType !== undefined) updateData.postType = input.postType;
    if (input.scheduledFor !== undefined)
      updateData.scheduledFor = input.scheduledFor;
    if (input.hashtags !== undefined) updateData.hashtags = input.hashtags;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.automationId !== undefined)
      updateData.automationId = input.automationId;
    if (input.carouselItems !== undefined)
      updateData.carouselItems = input.carouselItems;
    if (input.altText !== undefined) updateData.altText = input.altText;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.locationId !== undefined)
      updateData.locationId = input.locationId;
    if (input.music !== undefined) updateData.music = input.music;
    if (input.taggedUsers !== undefined)
      updateData.taggedUsers = input.taggedUsers;
    if (input.collaborators !== undefined)
      updateData.collaborators = input.collaborators;

    const updated = await client.scheduledPost.update({
      where: { id: postId },
      data: updateData,
    });

    const validated = ScheduledPostSchema.safeParse(updated);
    return validated.success ? validated.data : null;
  }

  /**
   * Delete scheduled post with ownership check
   */
  async deletePost(postId: string, userId: string): Promise<boolean> {
    // IDOR check
    const existing = await client.scheduledPost.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return false;
    }

    await client.scheduledPost.delete({ where: { id: postId } });
    return true;
  }

  /**
   * Publish a scheduled post to Instagram
   */
  async publishPost(
    postId: string,
    userId: string,
  ): Promise<{ success: boolean; error?: string }> {
    // Get post with user integration
    const post = await client.scheduledPost.findUnique({
      where: { id: postId },
      include: {
        User: {
          include: {
            integrations: true,
          },
        },
      },
    });

    // IDOR check
    if (!post || post.userId !== userId) {
      return { success: false, error: "Post not found" };
    }

    const token = post.User?.integrations?.[0]?.token;
    const instagramAccountId = post.User?.integrations?.[0]?.instagramId;

    if (!token || !instagramAccountId) {
      return { success: false, error: "Instagram not connected" };
    }

    // Check rate limit
    const limitCheck = await getPublishingLimit({
      instagramAccountId,
      accessToken: token,
    });

    if (
      limitCheck.success &&
      limitCheck.quotaUsage !== undefined &&
      limitCheck.quotaTotal !== undefined
    ) {
      if (limitCheck.quotaUsage >= limitCheck.quotaTotal) {
        await this.updatePostStatus(
          postId,
          "FAILED",
          "Daily publishing limit reached",
        );
        return {
          success: false,
          error: "Daily publishing limit reached (100 posts per 24 hours)",
        };
      }
    }

    try {
      let result: { success: boolean; mediaId?: string; error?: string };

      if (post.mediaType === "CAROUSEL") {
        const carouselItems =
          (post.carouselItems as Array<{
            imageUrl?: string;
            videoUrl?: string;
          }>) || [];

        if (carouselItems.length < 2) {
          return {
            success: false,
            error: "Carousels require at least 2 items",
          };
        }

        result = await publishCarousel({
          instagramAccountId,
          accessToken: token,
          items: carouselItems,
          caption: post.caption || undefined,
          collaborators: post.collaborators || undefined,
        });
      } else {
        let mediaType: "VIDEO" | "REELS" | "STORIES" | undefined;

        if (post.postType === "REEL") {
          mediaType = "REELS";
        } else if (post.postType === "STORY") {
          mediaType = "STORIES";
        } else if (post.mediaType === "VIDEO") {
          mediaType = "VIDEO";
        }

        result = await publishSingleMedia({
          instagramAccountId,
          accessToken: token,
          imageUrl:
            post.mediaType === "IMAGE" ? post.mediaUrl || undefined : undefined,
          videoUrl:
            post.mediaType === "VIDEO" ||
            mediaType === "REELS" ||
            mediaType === "STORIES"
              ? post.mediaUrl || undefined
              : undefined,
          mediaType,
          caption: post.caption || undefined,
          altText: post.altText || undefined,
          collaborators: post.collaborators || undefined,
        });
      }

      if (result.success && result.mediaId) {
        await client.scheduledPost.update({
          where: { id: postId },
          data: {
            status: "POSTED",
            igMediaId: result.mediaId,
          },
        });
        return { success: true };
      } else {
        await this.updatePostStatus(
          postId,
          "FAILED",
          result.error || "Unknown error",
        );
        return { success: false, error: result.error || "Failed to publish" };
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      await this.updatePostStatus(postId, "FAILED", errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get publishing rate limit
   */
  async getPublishingLimit(userId: string): Promise<PublishingLimit> {
    const user = await client.user.findUnique({
      where: { id: userId },
      include: { integrations: true },
    });

    if (!user?.integrations?.[0]?.token || !user.integrations[0].instagramId) {
      return { quotaUsage: 0, quotaTotal: 100 };
    }

    const result = await getPublishingLimit({
      instagramAccountId: user.integrations[0].instagramId,
      accessToken: user.integrations[0].token,
    });

    if (result.success) {
      return {
        quotaUsage: result.quotaUsage || 0,
        quotaTotal: result.quotaTotal || 100,
      };
    }

    return { quotaUsage: 0, quotaTotal: 100 };
  }

  /**
   * Helper to update post status
   */
  private async updatePostStatus(
    postId: string,
    status: "SCHEDULED" | "POSTED" | "FAILED" | "CANCELLED",
    errorMessage?: string,
  ): Promise<void> {
    await client.scheduledPost.update({
      where: { id: postId },
      data: {
        status,
        ...(errorMessage && { errorMessage }),
      },
    });
  }

  // ============================================
  // CONTENT DRAFTS
  // ============================================

  /**
   * Get all drafts for user (cached)
   */
  async getDrafts(userId: string): Promise<ContentDraft[]> {
    const drafts = await getOrSetCache(
      `user:${userId}:catalog`, // Reusing catalog cache key pattern
      async () => {
        return client.contentDraft.findMany({
          where: { userId },
          orderBy: { updatedAt: "desc" },
        });
      },
      300,
    );

    const validated = ContentDraftListSchema.safeParse(drafts);
    return validated.success ? validated.data : [];
  }

  /**
   * Create draft
   */
  async createDraft(
    userId: string,
    input: CreateDraftRequest,
  ): Promise<ContentDraft | null> {
    const draft = await client.contentDraft.create({
      data: {
        userId,
        title: input.title,
        caption: input.caption,
        mediaUrl: input.mediaUrl,
        mediaType: input.mediaType,
      },
    });

    await deleteCache(`user:${userId}:catalog`);

    const validated = ContentDraftSchema.safeParse(draft);
    return validated.success ? validated.data : null;
  }

  /**
   * Update draft with ownership check
   */
  async updateDraft(
    draftId: string,
    userId: string,
    input: UpdateDraftRequest,
  ): Promise<ContentDraft | null> {
    // IDOR check
    const existing = await client.contentDraft.findUnique({
      where: { id: draftId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return null;
    }

    const updated = await client.contentDraft.update({
      where: { id: draftId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.caption !== undefined && { caption: input.caption }),
        ...(input.mediaUrl !== undefined && { mediaUrl: input.mediaUrl }),
        ...(input.mediaType !== undefined && { mediaType: input.mediaType }),
      },
    });

    await deleteCache(`user:${userId}:catalog`);

    const validated = ContentDraftSchema.safeParse(updated);
    return validated.success ? validated.data : null;
  }

  /**
   * Delete draft with ownership check
   */
  async deleteDraft(draftId: string, userId: string): Promise<boolean> {
    // IDOR check
    const existing = await client.contentDraft.findUnique({
      where: { id: draftId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return false;
    }

    await client.contentDraft.delete({ where: { id: draftId } });
    await deleteCache(`user:${userId}:catalog`);
    return true;
  }
}

// Export singleton instance
export const schedulerService = new SchedulerService();
