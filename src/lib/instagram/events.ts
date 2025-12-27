"use server";

import axios from "axios";

// Types
export interface InstagramEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  cover_image_url?: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  coverImageUrl?: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  coverImageUrl?: string;
}

interface EventsResponse {
  data: InstagramEvent[];
  paging?: {
    cursors: { before: string; after: string };
    next?: string;
  };
}

const getBaseUrl = () => {
  const baseUrl = process.env.INSTAGRAM_BASE_URL;
  if (!baseUrl) {
    throw new Error("INSTAGRAM_BASE_URL environment variable is not set");
  }
  return baseUrl;
};

/**
 * Get upcoming events for an Instagram account
 */
export async function getUpcomingEvents(
  instagramAccountId: string,
  accessToken: string
): Promise<{ success: boolean; events?: InstagramEvent[]; error?: string }> {
  try {
    const response = await axios.get<EventsResponse>(
      `${getBaseUrl()}/${instagramAccountId}/upcoming_events`,
      {
        params: {
          fields: "id,title,description,start_time,end_time,cover_image_url",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const events: InstagramEvent[] = (response.data.data || []).map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      start_time: event.start_time,
      end_time: event.end_time,
      status: "scheduled" as const,
      cover_image_url: event.cover_image_url,
    }));

    return { success: true, events };
  } catch (error) {
    console.error("Error fetching upcoming events:", error);

    let errorMessage = "Failed to fetch events";
    if (axios.isAxiosError(error)) {
      // 400/403 often means permission not granted
      if (error.response?.status === 400 || error.response?.status === 403) {
        return { success: true, events: [] }; // Return empty gracefully
      }
      errorMessage = error.response?.data?.error?.message || error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Create a new Instagram event
 */
export async function createEvent(
  instagramAccountId: string,
  accessToken: string,
  data: CreateEventInput
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const requestBody: Record<string, unknown> = {
      title: data.title,
      start_time: Math.floor(data.startTime.getTime() / 1000), // Unix timestamp
    };

    if (data.description) {
      requestBody.description = data.description;
    }

    if (data.endTime) {
      requestBody.end_time = Math.floor(data.endTime.getTime() / 1000);
    }

    if (data.coverImageUrl) {
      requestBody.cover_image_url = data.coverImageUrl;
    }

    const response = await axios.post<{ id: string }>(
      `${getBaseUrl()}/${instagramAccountId}/upcoming_events`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true, eventId: response.data.id };
  } catch (error) {
    console.error("Error creating event:", error);

    let errorMessage = "Failed to create event";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Update an existing Instagram event
 */
export async function updateEvent(
  eventId: string,
  accessToken: string,
  data: UpdateEventInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const requestBody: Record<string, unknown> = {};

    if (data.title) {
      requestBody.title = data.title;
    }

    if (data.description) {
      requestBody.description = data.description;
    }

    if (data.startTime) {
      requestBody.start_time = Math.floor(data.startTime.getTime() / 1000);
    }

    if (data.endTime) {
      requestBody.end_time = Math.floor(data.endTime.getTime() / 1000);
    }

    if (data.coverImageUrl) {
      requestBody.cover_image_url = data.coverImageUrl;
    }

    await axios.post(
      `${getBaseUrl()}/${eventId}`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating event:", error);

    let errorMessage = "Failed to update event";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Cancel/delete an Instagram event
 */
export async function cancelEvent(
  eventId: string,
  accessToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await axios.delete(
      `${getBaseUrl()}/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Error cancelling event:", error);

    let errorMessage = "Failed to cancel event";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    }

    return { success: false, error: errorMessage };
  }
}
