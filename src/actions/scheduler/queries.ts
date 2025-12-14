"use server";

import { client } from "@/lib/prisma";
import { PostMediaType, PostType, ScheduleStatus } from "@prisma/client";

/**
 * Find all scheduled posts for a user
 */
export async function findScheduledPosts(userId: string, options?: {
  status?: ScheduleStatus;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
}) {
  const { status, fromDate, toDate, limit } = options || {};

  return client.scheduledPost.findMany({
    where: {
      userId,
      ...(status && { status }),
      ...(fromDate && { scheduledFor: { gte: fromDate } }),
      ...(toDate && { scheduledFor: { lte: toDate } }),
    },
    orderBy: { scheduledFor: "asc" },
    ...(limit && { take: limit }),
  });
}

/**
 * Find a single scheduled post by ID
 */
export async function findScheduledPostById(id: string) {
  return client.scheduledPost.findUnique({
    where: { id },
    include: {
      User: {
        include: {
          integrations: true,
        },
      },
      Automation: true,
    },
  });
}

/**
 * Create a new scheduled post record
 */
export async function createScheduledPostRecord(data: {
  userId: string;
  caption?: string;
  mediaUrl?: string;
  mediaType?: PostMediaType;
  postType?: PostType;
  scheduledFor: Date;
  hashtags?: string[];
  automationId?: string;
  carouselItems?: any;
  trialParams?: any;
  altText?: string;
  location?: string;
  locationId?: string;
  music?: string;
  taggedUsers?: string[];
  collaborators?: string[];
}) {
  return client.scheduledPost.create({
    data: {
      userId: data.userId,
      caption: data.caption,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType || "IMAGE",
      postType: data.postType || "POST",
      scheduledFor: data.scheduledFor,
      hashtags: data.hashtags || [],
      automationId: data.automationId,
      status: "SCHEDULED",
      carouselItems: data.carouselItems,
      trialParams: data.trialParams,
      altText: data.altText,
      location: data.location,
      locationId: data.locationId,
      music: data.music,
      taggedUsers: data.taggedUsers || [],
      collaborators: data.collaborators || [],
    },
  });
}

/**
 * Update an existing scheduled post record
 */
export async function updateScheduledPostRecord(
  id: string,
  data: {
    caption?: string;
    mediaUrl?: string;
    mediaType?: PostMediaType;
    postType?: PostType;
    scheduledFor?: Date;
    hashtags?: string[];
    status?: ScheduleStatus;
    automationId?: string | null;
    containerId?: string;
    igMediaId?: string;
    errorMessage?: string;
    carouselItems?: any;
    trialParams?: any;
    altText?: string;
    location?: string;
    locationId?: string;
    music?: string;
    taggedUsers?: string[];
    collaborators?: string[];
  }
) {
  // Only include defined fields
  const updateData: Record<string, any> = {};
  
  if (data.caption !== undefined) updateData.caption = data.caption;
  if (data.mediaUrl !== undefined) updateData.mediaUrl = data.mediaUrl;
  if (data.mediaType !== undefined) updateData.mediaType = data.mediaType;
  if (data.postType !== undefined) updateData.postType = data.postType;
  if (data.scheduledFor !== undefined) updateData.scheduledFor = data.scheduledFor;
  if (data.hashtags !== undefined) updateData.hashtags = data.hashtags;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.automationId !== undefined) updateData.automationId = data.automationId;
  if (data.containerId !== undefined) updateData.containerId = data.containerId;
  if (data.igMediaId !== undefined) updateData.igMediaId = data.igMediaId;
  if (data.errorMessage !== undefined) updateData.errorMessage = data.errorMessage;
  if (data.carouselItems !== undefined) updateData.carouselItems = data.carouselItems;
  if (data.trialParams !== undefined) updateData.trialParams = data.trialParams;
  if (data.altText !== undefined) updateData.altText = data.altText;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.locationId !== undefined) updateData.locationId = data.locationId;
  if (data.music !== undefined) updateData.music = data.music;
  if (data.taggedUsers !== undefined) updateData.taggedUsers = data.taggedUsers;
  if (data.collaborators !== undefined) updateData.collaborators = data.collaborators;

  return client.scheduledPost.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Delete a scheduled post record
 */
export async function deleteScheduledPostRecord(id: string) {
  return client.scheduledPost.delete({
    where: { id },
  });
}

/**
 * Find posts that are due for publishing
 * Returns posts with status SCHEDULED and scheduledFor <= now
 */
export async function findPostsDueForPublishing() {
  const now = new Date();
  
  return client.scheduledPost.findMany({
    where: {
      status: "SCHEDULED",
      scheduledFor: {
        lte: now,
      },
    },
    include: {
      User: {
        include: {
          integrations: true,
        },
      },
    },
    orderBy: { scheduledFor: "asc" },
  });
}

/**
 * Get drafts for a user
 */
export async function findContentDrafts(userId: string, limit?: number) {
  return client.contentDraft.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    ...(limit && { take: limit }),
  });
}

/**
 * Create a content draft
 */
export async function createContentDraft(data: {
  userId: string;
  title?: string;
  caption?: string;
  mediaUrl?: string;
  mediaType?: PostMediaType;
}) {
  return client.contentDraft.create({
    data: {
      userId: data.userId,
      title: data.title,
      caption: data.caption,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType || "IMAGE",
    },
  });
}

/**
 * Update a content draft
 */
export async function updateContentDraft(
  id: string,
  data: {
    title?: string;
    caption?: string;
    mediaUrl?: string;
    mediaType?: PostMediaType;
  }
) {
  return client.contentDraft.update({
    where: { id },
    data,
  });
}

/**
 * Delete a content draft
 */
export async function deleteContentDraft(id: string) {
  return client.contentDraft.delete({
    where: { id },
  });
}
