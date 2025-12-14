"use server";

import { onCurrentUser } from "../user";
import { findUser } from "../user/queries";
import {
  createScheduledPostRecord,
  updateScheduledPostRecord,
  deleteScheduledPostRecord,
  findScheduledPosts,
  findScheduledPostById,
  findPostsDueForPublishing,
  findContentDrafts,
  createContentDraft as createDraftRecord,
  updateContentDraft as updateDraftRecord,
  deleteContentDraft as deleteDraftRecord,
} from "./queries";
import {
  publishSingleMedia,
  publishCarousel,
  getPublishingLimit,
} from "@/lib/instagram-publisher";
import { PostMediaType, PostType } from "@prisma/client";

/**
 * Create a new scheduled post
 */
export async function createScheduledPost(data: {
  caption?: string;
  mediaUrl?: string;
  mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL";
  postType?: "POST" | "REEL" | "STORY";
  scheduledFor: Date;
  hashtags?: string[];
  automationId?: string;
  carouselItems?: { imageUrl?: string; videoUrl?: string }[];
  altText?: string;
}) {
  const user = await onCurrentUser();
  
  try {
    const profile = await findUser(user.id);
    if (!profile) {
      return { status: 404, data: "User not found" };
    }

    const post = await createScheduledPostRecord({
      userId: profile.id,
      caption: data.caption,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType as PostMediaType,
      postType: data.postType as PostType,
      scheduledFor: new Date(data.scheduledFor),
      hashtags: data.hashtags,
      automationId: data.automationId,
      carouselItems: data.carouselItems,
      altText: data.altText,
    });

    return { status: 200, data: post };
  } catch (error) {
    console.error("Error creating scheduled post:", error);
    return { status: 500, data: "Failed to create scheduled post" };
  }
}

/**
 * Update an existing scheduled post
 */
export async function updateScheduledPost(
  id: string,
  data: {
    caption?: string;
    mediaUrl?: string;
    mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL";
    postType?: "POST" | "REEL" | "STORY";
    scheduledFor?: Date;
    hashtags?: string[];
    automationId?: string | null;
    status?: "SCHEDULED" | "POSTED" | "FAILED" | "CANCELLED";
    carouselItems?: { imageUrl?: string; videoUrl?: string }[];
    altText?: string;
  }
) {
  await onCurrentUser();

  try {
    const post = await updateScheduledPostRecord(id, {
      caption: data.caption,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType as PostMediaType,
      postType: data.postType as PostType,
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
      hashtags: data.hashtags,
      automationId: data.automationId,
      status: data.status,
      carouselItems: data.carouselItems,
      altText: data.altText,
    });

    return { status: 200, data: post };
  } catch (error) {
    console.error("Error updating scheduled post:", error);
    return { status: 500, data: "Failed to update scheduled post" };
  }
}

/**
 * Delete a scheduled post
 */
export async function deleteScheduledPost(id: string) {
  await onCurrentUser();

  try {
    await deleteScheduledPostRecord(id);
    return { status: 200, data: "Post deleted" };
  } catch (error) {
    console.error("Error deleting scheduled post:", error);
    return { status: 500, data: "Failed to delete scheduled post" };
  }
}

/**
 * Get all scheduled posts for the current user
 */
export async function getScheduledPosts(options?: {
  status?: "SCHEDULED" | "POSTED" | "FAILED" | "CANCELLED";
  fromDate?: Date;
  toDate?: Date;
}) {
  const user = await onCurrentUser();

  try {
    const profile = await findUser(user.id);
    if (!profile) {
      return { status: 404, data: [] };
    }

    const posts = await findScheduledPosts(profile.id, {
      status: options?.status,
      fromDate: options?.fromDate ? new Date(options.fromDate) : undefined,
      toDate: options?.toDate ? new Date(options.toDate) : undefined,
    });

    return { status: 200, data: posts };
  } catch (error) {
    console.error("Error getting scheduled posts:", error);
    return { status: 500, data: [] };
  }
}

/**
 * Get a single scheduled post by ID
 */
export async function getScheduledPostById(id: string) {
  await onCurrentUser();

  try {
    const post = await findScheduledPostById(id);
    if (!post) {
      return { status: 404, data: null };
    }
    return { status: 200, data: post };
  } catch (error) {
    console.error("Error getting scheduled post:", error);
    return { status: 500, data: null };
  }
}

/**
 * Publish a scheduled post to Instagram immediately
 */
export async function publishScheduledPost(id: string) {
  await onCurrentUser();

  try {
    const post = await findScheduledPostById(id);
    if (!post) {
      return { status: 404, data: "Post not found" };
    }

    if (!post.User?.integrations?.[0]?.token) {
      return { status: 400, data: "Instagram not connected" };
    }

    if (!post.User?.integrations?.[0]?.instagramId) {
      return { status: 400, data: "Instagram account ID not found" };
    }

    const token = post.User.integrations[0].token;
    const instagramAccountId = post.User.integrations[0].instagramId;

    // Check rate limit first
    const limitCheck = await getPublishingLimit({
      instagramAccountId,
      accessToken: token,
    });

    if (limitCheck.success && limitCheck.quotaUsage && limitCheck.quotaTotal) {
      if (limitCheck.quotaUsage >= limitCheck.quotaTotal) {
        await updateScheduledPostRecord(id, {
          status: "FAILED",
          errorMessage: "Daily publishing limit reached (100 posts per 24 hours)",
        });
        return { status: 429, data: "Daily publishing limit reached" };
      }
    }

    // Determine media type and publish
    let result;

    if (post.mediaType === "CAROUSEL") {
      // Parse carousel items from post data
      const carouselItems = (post as any).carouselItems || [];
      
      if (carouselItems.length < 2) {
        return { status: 400, data: "Carousels require at least 2 items" };
      }

      result = await publishCarousel({
        instagramAccountId,
        accessToken: token,
        items: carouselItems,
        caption: post.caption || undefined,
      });
    } else {
      // Single media post
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
        imageUrl: post.mediaType === "IMAGE" ? post.mediaUrl || undefined : undefined,
        videoUrl: post.mediaType === "VIDEO" || mediaType === "REELS" || mediaType === "STORIES" 
          ? post.mediaUrl || undefined 
          : undefined,
        mediaType,
        caption: post.caption || undefined,
        altText: (post as any).altText,
        trialParams: (post as any).trialParams,
      });
    }

    if (result.success && result.mediaId) {
      await updateScheduledPostRecord(id, {
        status: "POSTED",
        igMediaId: result.mediaId,
      });
      return { status: 200, data: "Post published successfully" };
    } else {
      await updateScheduledPostRecord(id, {
        status: "FAILED",
        errorMessage: result.error || "Unknown error",
      });
      return { status: 500, data: result.error || "Failed to publish" };
    }
  } catch (error) {
    console.error("Error publishing scheduled post:", error);
    
    // Update post status to failed
    try {
      await updateScheduledPostRecord(id, {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    } catch {}

    return { status: 500, data: "Failed to publish post" };
  }
}

/**
 * Get current publishing rate limit
 */
export async function checkPublishingLimit() {
  const user = await onCurrentUser();

  try {
    const profile = await findUser(user.id);
    if (!profile?.integrations?.[0]?.token || !profile.integrations[0].instagramId) {
      return { status: 400, data: { quotaUsage: 0, quotaTotal: 100 } };
    }

    const result = await getPublishingLimit({
      instagramAccountId: profile.integrations[0].instagramId,
      accessToken: profile.integrations[0].token,
    });

    if (result.success) {
      return { 
        status: 200, 
        data: { 
          quotaUsage: result.quotaUsage || 0, 
          quotaTotal: result.quotaTotal || 100 
        } 
      };
    }

    return { status: 500, data: { quotaUsage: 0, quotaTotal: 100 } };
  } catch (error) {
    console.error("Error checking publishing limit:", error);
    return { status: 500, data: { quotaUsage: 0, quotaTotal: 100 } };
  }
}

/**
 * Process all due scheduled posts
 * Called by background job
 */
export async function processDueScheduledPosts() {
  try {
    const duePosts = await findPostsDueForPublishing();
    
    const results = [];
    for (const post of duePosts) {
      const result = await publishScheduledPost(post.id);
      results.push({ id: post.id, ...result });
    }

    return { status: 200, data: results };
  } catch (error) {
    console.error("Error processing due posts:", error);
    return { status: 500, data: [] };
  }
}

// ============= Content Drafts =============

/**
 * Get all drafts for current user
 */
export async function getContentDrafts() {
  const user = await onCurrentUser();

  try {
    const profile = await findUser(user.id);
    if (!profile) {
      return { status: 404, data: [] };
    }

    const drafts = await findContentDrafts(profile.id);
    return { status: 200, data: drafts };
  } catch (error) {
    console.error("Error getting drafts:", error);
    return { status: 500, data: [] };
  }
}

/**
 * Create a new draft
 */
export async function createDraft(data: {
  title?: string;
  caption?: string;
  mediaUrl?: string;
  mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL";
}) {
  const user = await onCurrentUser();

  try {
    const profile = await findUser(user.id);
    if (!profile) {
      return { status: 404, data: "User not found" };
    }

    const draft = await createDraftRecord({
      userId: profile.id,
      title: data.title,
      caption: data.caption,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType as PostMediaType,
    });

    return { status: 200, data: draft };
  } catch (error) {
    console.error("Error creating draft:", error);
    return { status: 500, data: "Failed to create draft" };
  }
}

/**
 * Update a draft
 */
export async function updateDraft(
  id: string,
  data: {
    title?: string;
    caption?: string;
    mediaUrl?: string;
    mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL";
  }
) {
  await onCurrentUser();

  try {
    const draft = await updateDraftRecord(id, {
      title: data.title,
      caption: data.caption,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType as PostMediaType,
    });

    return { status: 200, data: draft };
  } catch (error) {
    console.error("Error updating draft:", error);
    return { status: 500, data: "Failed to update draft" };
  }
}

/**
 * Delete a draft
 */
export async function deleteDraft(id: string) {
  await onCurrentUser();

  try {
    await deleteDraftRecord(id);
    return { status: 200, data: "Draft deleted" };
  } catch (error) {
    console.error("Error deleting draft:", error);
    return { status: 500, data: "Failed to delete draft" };
  }
}
