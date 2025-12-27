"use server";

import { client } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventStatus } from "@prisma/client";
import {
  getUpcomingEvents,
  createEvent as createMetaEvent,
  updateEvent as updateMetaEvent,
  cancelEvent as cancelMetaEvent,
  CreateEventInput,
  UpdateEventInput,
} from "@/lib/instagram/events";

// Helper to get current user's integration
async function getUserIntegration() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return null;
  }

  const integration = await client.integrations.findFirst({
    where: { userId: session.user.id },
    select: { token: true, instagramId: true, userId: true },
  });

  return integration;
}

/**
 * Get all events for the current user
 */
export async function getUserEvents() {
  try {
    const integration = await getUserIntegration();
    if (!integration) {
      return { status: 401, data: "Unauthorized" };
    }

    // Get events from database
    const events = await client.instagramEvent.findMany({
      where: { userId: integration.userId! },
      orderBy: { startTime: "asc" },
    });

    return { status: 200, data: events };
  } catch (error) {
    console.error("Error getting user events:", error);
    return { status: 500, data: "Failed to get events" };
  }
}

/**
 * Sync events with Instagram
 */
export async function syncEvents() {
  try {
    const integration = await getUserIntegration();
    if (!integration?.token || !integration?.instagramId) {
      return { status: 400, data: "Instagram not connected" };
    }

    const result = await getUpcomingEvents(integration.instagramId, integration.token);
    if (!result.success) {
      return { status: 500, data: result.error };
    }

    // Update/create events in database
    for (const event of result.events || []) {
      await client.instagramEvent.upsert({
        where: { id: event.id },
        create: {
          userId: integration.userId!,
          eventId: event.id,
          title: event.title,
          description: event.description ?? null,
          startTime: new Date(event.start_time),
          endTime: event.end_time ? new Date(event.end_time) : null,
          status: "SCHEDULED",
          coverImage: event.cover_image_url ?? null,
        },
        update: {
          title: event.title,
          description: event.description,
          startTime: new Date(event.start_time),
          endTime: event.end_time ? new Date(event.end_time) : null,
          coverImage: event.cover_image_url,
        },
      });
    }

    return { status: 200, data: "Events synced" };
  } catch (error) {
    console.error("Error syncing events:", error);
    return { status: 500, data: "Failed to sync events" };
  }
}

/**
 * Create a new event
 */
export async function createUserEvent(data: {
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  coverImage?: string;
  syncToInstagram?: boolean;
}) {
  try {
    const integration = await getUserIntegration();
    if (!integration) {
      return { status: 401, data: "Unauthorized" };
    }

    let metaEventId: string | undefined;

    // Optionally create on Instagram
    if (data.syncToInstagram && integration.token && integration.instagramId) {
      const metaResult = await createMetaEvent(
        integration.instagramId,
        integration.token,
        {
          title: data.title,
          description: data.description,
          startTime: data.startTime,
          endTime: data.endTime,
          coverImageUrl: data.coverImage,
        }
      );

      if (metaResult.success) {
        metaEventId = metaResult.eventId;
      }
    }

    // Create in database
    const event = await client.instagramEvent.create({
      data: {
        userId: integration.userId!,
        eventId: metaEventId ?? null,
        title: data.title,
        description: data.description ?? null,
        startTime: data.startTime,
        endTime: data.endTime ?? null,
        coverImage: data.coverImage ?? null,
        status: "SCHEDULED",
      },
    });

    return { status: 200, data: event };
  } catch (error) {
    console.error("Error creating event:", error);
    return { status: 500, data: "Failed to create event" };
  }
}

/**
 * Update an event
 */
export async function updateUserEvent(
  eventId: string,
  data: {
    title?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    coverImage?: string;
    status?: EventStatus;
  }
) {
  try {
    const integration = await getUserIntegration();
    if (!integration) {
      return { status: 401, data: "Unauthorized" };
    }

    // Get existing event
    const existingEvent = await client.instagramEvent.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent || existingEvent.userId !== integration.userId) {
      return { status: 404, data: "Event not found" };
    }

    // Update on Instagram if synced
    if (existingEvent.eventId && integration.token) {
      await updateMetaEvent(existingEvent.eventId, integration.token, {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        coverImageUrl: data.coverImage,
      });
    }

    // Update in database
    const event = await client.instagramEvent.update({
      where: { id: eventId },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        coverImage: data.coverImage,
        status: data.status,
      },
    });

    return { status: 200, data: event };
  } catch (error) {
    console.error("Error updating event:", error);
    return { status: 500, data: "Failed to update event" };
  }
}

/**
 * Cancel an event
 */
export async function cancelUserEvent(eventId: string) {
  try {
    const integration = await getUserIntegration();
    if (!integration) {
      return { status: 401, data: "Unauthorized" };
    }

    // Get existing event
    const existingEvent = await client.instagramEvent.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent || existingEvent.userId !== integration.userId) {
      return { status: 404, data: "Event not found" };
    }

    // Cancel on Instagram if synced
    if (existingEvent.eventId && integration.token) {
      await cancelMetaEvent(existingEvent.eventId, integration.token);
    }

    // Update status in database
    const event = await client.instagramEvent.update({
      where: { id: eventId },
      data: { status: "CANCELLED" },
    });

    return { status: 200, data: event };
  } catch (error) {
    console.error("Error cancelling event:", error);
    return { status: 500, data: "Failed to cancel event" };
  }
}

/**
 * Delete an event permanently
 */
export async function deleteUserEvent(eventId: string) {
  try {
    const integration = await getUserIntegration();
    if (!integration) {
      return { status: 401, data: "Unauthorized" };
    }

    // Get existing event
    const existingEvent = await client.instagramEvent.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent || existingEvent.userId !== integration.userId) {
      return { status: 404, data: "Event not found" };
    }

    // Cancel on Instagram if synced
    if (existingEvent.eventId && integration.token) {
      await cancelMetaEvent(existingEvent.eventId, integration.token);
    }

    // Delete from database
    await client.instagramEvent.delete({
      where: { id: eventId },
    });

    return { status: 200, data: "Event deleted" };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { status: 500, data: "Failed to delete event" };
  }
}
