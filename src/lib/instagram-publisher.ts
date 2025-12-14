"use server";

import axios from "axios";

// Types for Instagram Graph API responses
export type MediaType = "IMAGE" | "VIDEO" | "REELS" | "STORIES";

export type ContainerStatus = 
  | "EXPIRED"
  | "ERROR" 
  | "FINISHED"
  | "IN_PROGRESS"
  | "PUBLISHED";

export type GraduationStrategy = "MANUAL" | "SS_PERFORMANCE";

export interface MediaContainerParams {
  instagramAccountId: string;
  accessToken: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: "VIDEO" | "REELS" | "STORIES";
  caption?: string;
  altText?: string;
  isCarouselItem?: boolean;
  locationId?: string;
  userTags?: { username: string; x?: number; y?: number }[];
  coverUrl?: string;
  thumbOffset?: number;
  shareToFeed?: boolean;
  collaborators?: string[];
  audioName?: string;
  trialParams?: {
    graduationStrategy: GraduationStrategy;
  };
}

export interface CarouselContainerParams {
  instagramAccountId: string;
  accessToken: string;
  caption?: string;
  children: string[]; // Container IDs of child media items (max 10)
  locationId?: string;
  collaborators?: string[];
}

export interface PublishParams {
  instagramAccountId: string;
  accessToken: string;
  containerId: string;
}

export interface ContainerStatusResponse {
  status_code: ContainerStatus;
  id: string;
}

export interface PublishingLimitResponse {
  quota_usage: number;
  config: {
    quota_total: number;
    quota_duration: number;
  };
}

// API Response types
interface CreateContainerResponse {
  id: string;
}

interface PublishResponse {
  id: string;
}

interface ResumableUploadResponse {
  success: boolean;
  message?: string;
  debug_info?: {
    retriable: boolean;
    type: string;
    message: string;
  };
}

// Get the base URL for Instagram Graph API
const getBaseUrl = () => {
  const baseUrl = process.env.INSTAGRAM_BASE_URL;
  if (!baseUrl) {
    throw new Error("INSTAGRAM_BASE_URL environment variable is not set");
  }
  return baseUrl;
};

/**
 * Create a media container for a single image or video
 * This is Step 1 in the publishing process
 */
export async function createMediaContainer(
  params: MediaContainerParams
): Promise<{ success: boolean; containerId?: string; error?: string }> {
  const { 
    instagramAccountId, 
    accessToken, 
    imageUrl, 
    videoUrl, 
    mediaType,
    caption,
    altText,
    isCarouselItem,
    locationId,
    userTags,
    coverUrl,
    thumbOffset,
    shareToFeed,
    collaborators,
    audioName,
    trialParams,
  } = params;

  if (!imageUrl && !videoUrl) {
    return { success: false, error: "Either image_url or video_url is required" };
  }

  try {
    const requestBody: Record<string, any> = {};

    // Add image or video URL
    if (imageUrl) {
      requestBody.image_url = imageUrl;
    }
    if (videoUrl) {
      requestBody.video_url = videoUrl;
    }

    // Add media type for videos
    if (mediaType) {
      requestBody.media_type = mediaType;
    }

    // Add caption
    if (caption) {
      requestBody.caption = caption;
    }

    // Add alt text (only for images, not for reels or stories)
    if (altText && !mediaType) {
      requestBody.alt_text = altText;
    }

    // For carousel items
    if (isCarouselItem) {
      requestBody.is_carousel_item = true;
    }

    // Optional location
    if (locationId) {
      requestBody.location_id = locationId;
    }

    // User tags (URL encoded)
    if (userTags && userTags.length > 0) {
      requestBody.user_tags = userTags;
    }

    // Cover URL for videos
    if (coverUrl) {
      requestBody.cover_url = coverUrl;
    }

    // Thumb offset for video thumbnails
    if (thumbOffset !== undefined) {
      requestBody.thumb_offset = thumbOffset;
    }

    // Share to feed (for reels/stories)
    if (shareToFeed !== undefined) {
      requestBody.share_to_feed = shareToFeed;
    }

    // Collaborators
    if (collaborators && collaborators.length > 0) {
      requestBody.collaborators = collaborators;
    }

    // Audio name for reels
    if (audioName) {
      requestBody.audio_name = audioName;
    }

    // Trial reel parameters
    if (trialParams) {
      requestBody.trial_params = trialParams;
    }

    const response = await axios.post<CreateContainerResponse>(
      `${getBaseUrl()}/${instagramAccountId}/media`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true, containerId: response.data.id };
  } catch (error) {
    console.error("Error creating media container:", error);
    
    let errorMessage = "Failed to create media container";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Create a carousel container with multiple media items
 * Carousels can contain up to 10 images/videos
 */
export async function createCarouselContainer(
  params: CarouselContainerParams
): Promise<{ success: boolean; containerId?: string; error?: string }> {
  const { 
    instagramAccountId, 
    accessToken, 
    caption, 
    children,
    locationId,
    collaborators,
  } = params;

  if (!children || children.length === 0) {
    return { success: false, error: "At least one child container is required" };
  }

  if (children.length > 10) {
    return { success: false, error: "Carousels are limited to 10 items" };
  }

  try {
    const requestBody: Record<string, any> = {
      media_type: "CAROUSEL",
      children: children.join(","),
    };

    if (caption) {
      requestBody.caption = caption;
    }

    if (locationId) {
      requestBody.location_id = locationId;
    }

    if (collaborators && collaborators.length > 0) {
      requestBody.collaborators = collaborators;
    }

    const response = await axios.post<CreateContainerResponse>(
      `${getBaseUrl()}/${instagramAccountId}/media`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true, containerId: response.data.id };
  } catch (error) {
    console.error("Error creating carousel container:", error);
    
    let errorMessage = "Failed to create carousel container";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Upload a video file through resumable upload
 * Use this for large video files or unreliable network conditions
 */
export async function uploadResumableVideo(params: {
  containerId: string;
  accessToken: string;
  videoUrl?: string;
  fileSize?: number;
}): Promise<{ success: boolean; error?: string }> {
  const { containerId, accessToken, videoUrl, fileSize } = params;

  if (!videoUrl) {
    return { success: false, error: "Video URL is required" };
  }

  try {
    const headers: Record<string, string> = {
      Authorization: `OAuth ${accessToken}`,
    };

    // For hosted video, use file_url header
    if (videoUrl.startsWith("http")) {
      headers.file_url = videoUrl;
    } else {
      // For local files, set offset and file_size
      headers.offset = "0";
      if (fileSize) {
        headers.file_size = fileSize.toString();
      }
    }

    const response = await axios.post<ResumableUploadResponse>(
      `https://rupload.facebook.com/ig-api-upload/v21.0/${containerId}`,
      videoUrl.startsWith("http") ? undefined : videoUrl,
      { headers }
    );

    if (response.data.success) {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: response.data.debug_info?.message || "Upload failed" 
      };
    }
  } catch (error) {
    console.error("Error uploading video:", error);
    
    let errorMessage = "Failed to upload video";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Get the status of a media container
 * Use this to check if a container is ready to be published
 */
export async function getContainerStatus(params: {
  containerId: string;
  accessToken: string;
}): Promise<{ success: boolean; status?: ContainerStatus; error?: string }> {
  const { containerId, accessToken } = params;

  try {
    const response = await axios.get<ContainerStatusResponse>(
      `${getBaseUrl()}/${containerId}`,
      {
        params: { fields: "status_code" },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return { success: true, status: response.data.status_code };
  } catch (error) {
    console.error("Error getting container status:", error);
    
    let errorMessage = "Failed to get container status";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Publish a container to Instagram
 * This is the final step in the publishing process
 */
export async function publishContainer(
  params: PublishParams
): Promise<{ success: boolean; mediaId?: string; error?: string }> {
  const { instagramAccountId, accessToken, containerId } = params;

  try {
    const response = await axios.post<PublishResponse>(
      `${getBaseUrl()}/${instagramAccountId}/media_publish`,
      { creation_id: containerId },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true, mediaId: response.data.id };
  } catch (error) {
    console.error("Error publishing container:", error);
    
    let errorMessage = "Failed to publish content";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Get the current publishing rate limit usage
 * Instagram accounts are limited to 100 API-published posts per 24 hours
 */
export async function getPublishingLimit(params: {
  instagramAccountId: string;
  accessToken: string;
}): Promise<{ 
  success: boolean; 
  quotaUsage?: number; 
  quotaTotal?: number;
  error?: string 
}> {
  const { instagramAccountId, accessToken } = params;

  try {
    const response = await axios.get<PublishingLimitResponse>(
      `${getBaseUrl()}/${instagramAccountId}/content_publishing_limit`,
      {
        params: { fields: "quota_usage,config" },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return { 
      success: true, 
      quotaUsage: response.data.quota_usage,
      quotaTotal: response.data.config?.quota_total || 100,
    };
  } catch (error) {
    console.error("Error getting publishing limit:", error);
    
    let errorMessage = "Failed to get publishing limit";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Wait for a container to be ready for publishing
 * Polls the status every 5 seconds for up to 5 minutes
 */
export async function waitForContainerReady(params: {
  containerId: string;
  accessToken: string;
  maxWaitMs?: number;
  pollIntervalMs?: number;
}): Promise<{ success: boolean; status?: ContainerStatus; error?: string }> {
  const { 
    containerId, 
    accessToken, 
    maxWaitMs = 300000, // 5 minutes default
    pollIntervalMs = 5000 // 5 seconds default
  } = params;

  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const result = await getContainerStatus({ containerId, accessToken });
    
    if (!result.success) {
      return result;
    }

    switch (result.status) {
      case "FINISHED":
        return { success: true, status: "FINISHED" };
      case "ERROR":
        return { success: false, error: "Container processing failed", status: "ERROR" };
      case "EXPIRED":
        return { success: false, error: "Container has expired", status: "EXPIRED" };
      case "PUBLISHED":
        return { success: true, status: "PUBLISHED" };
      case "IN_PROGRESS":
        // Wait and poll again
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
        break;
      default:
        return { success: false, error: `Unknown status: ${result.status}` };
    }
  }

  return { success: false, error: "Timeout waiting for container to be ready" };
}

/**
 * Complete publishing flow: create container -> wait for ready -> publish
 * Use this for simple single-media posts
 */
export async function publishSingleMedia(params: {
  instagramAccountId: string;
  accessToken: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: "VIDEO" | "REELS" | "STORIES";
  caption?: string;
  altText?: string;
  trialParams?: { graduationStrategy: GraduationStrategy };
}): Promise<{ success: boolean; mediaId?: string; error?: string }> {
  const { 
    instagramAccountId, 
    accessToken, 
    imageUrl, 
    videoUrl, 
    mediaType, 
    caption,
    altText,
    trialParams,
  } = params;

  // Step 1: Create container
  const containerResult = await createMediaContainer({
    instagramAccountId,
    accessToken,
    imageUrl,
    videoUrl,
    mediaType,
    caption,
    altText,
    trialParams,
  });

  if (!containerResult.success || !containerResult.containerId) {
    return { success: false, error: containerResult.error || "Failed to create container" };
  }

  // Step 2: For videos/reels, wait for processing
  if (videoUrl || mediaType === "VIDEO" || mediaType === "REELS") {
    const waitResult = await waitForContainerReady({
      containerId: containerResult.containerId,
      accessToken,
    });

    if (!waitResult.success) {
      return { success: false, error: waitResult.error };
    }
  }

  // Step 3: Publish
  const publishResult = await publishContainer({
    instagramAccountId,
    accessToken,
    containerId: containerResult.containerId,
  });

  return publishResult;
}

/**
 * Complete publishing flow for carousels
 */
export async function publishCarousel(params: {
  instagramAccountId: string;
  accessToken: string;
  items: Array<{
    imageUrl?: string;
    videoUrl?: string;
    mediaType?: "VIDEO";
  }>;
  caption?: string;
}): Promise<{ success: boolean; mediaId?: string; error?: string }> {
  const { instagramAccountId, accessToken, items, caption } = params;

  if (items.length < 2) {
    return { success: false, error: "Carousels require at least 2 items" };
  }

  if (items.length > 10) {
    return { success: false, error: "Carousels are limited to 10 items" };
  }

  // Step 1: Create containers for each item
  const childContainerIds: string[] = [];
  
  for (const item of items) {
    const containerResult = await createMediaContainer({
      instagramAccountId,
      accessToken,
      imageUrl: item.imageUrl,
      videoUrl: item.videoUrl,
      mediaType: item.videoUrl ? "VIDEO" : undefined,
      isCarouselItem: true,
    });

    if (!containerResult.success || !containerResult.containerId) {
      return { success: false, error: `Failed to create carousel item: ${containerResult.error}` };
    }

    // Wait for video items to process
    if (item.videoUrl) {
      const waitResult = await waitForContainerReady({
        containerId: containerResult.containerId,
        accessToken,
      });

      if (!waitResult.success) {
        return { success: false, error: `Failed processing carousel video: ${waitResult.error}` };
      }
    }

    childContainerIds.push(containerResult.containerId);
  }

  // Step 2: Create carousel container
  const carouselResult = await createCarouselContainer({
    instagramAccountId,
    accessToken,
    caption,
    children: childContainerIds,
  });

  if (!carouselResult.success || !carouselResult.containerId) {
    return { success: false, error: carouselResult.error || "Failed to create carousel" };
  }

  // Step 3: Publish carousel
  const publishResult = await publishContainer({
    instagramAccountId,
    accessToken,
    containerId: carouselResult.containerId,
  });

  return publishResult;
}
