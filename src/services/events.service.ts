import { client } from "@/lib/prisma";
import {
  getUpcomingEvents,
  createEvent as createMetaEvent,
  updateEvent as updateMetaEvent,
  cancelEvent as cancelMetaEvent,
} from "@/lib/instagram/events";
import {
  EventListSchema,
  EventSchema,
  type Event,
  type CreateEventRequest,
  type UpdateEventRequest,
} from "@/schemas/events.schema";

/**
 * ============================================
 * EVENTS SERVICE
 * Business logic for Instagram events management
 * IDOR protection via userId ownership checks
 * ============================================
 */

class EventsService {
  /**
   * Get all events for a user
   * IDOR: Only returns events owned by userId
   */
  async getEvents(userId: string): Promise<Event[]> {
    const events = await client.instagramEvent.findMany({
      where: { userId },
      orderBy: { startTime: "asc" },
    });

    const validated = EventListSchema.safeParse(events);
    return validated.success ? validated.data : [];
  }

  /**
   * Sync events with Instagram
   */
  async syncEvents(
    userId: string
  ): Promise<{ synced: boolean; count: number } | { error: string }> {
    // Get user's integration
    const integration = await client.integrations.findFirst({
      where: {
        userId,
        name: "INSTAGRAM",
      },
    });

    if (!integration?.token || !integration?.instagramId) {
      return { error: "Instagram not connected" };
    }

    const result = await getUpcomingEvents(
      integration.instagramId,
      integration.token
    );
    if (!result.success) {
      return { error: result.error || "Failed to fetch events from Instagram" };
    }

    let count = 0;

    // Sync events to database
    for (const event of result.events || []) {
      await client.instagramEvent.upsert({
        where: { id: event.id },
        create: {
          userId,
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
          description: event.description ?? null,
          startTime: new Date(event.start_time),
          endTime: event.end_time ? new Date(event.end_time) : null,
          coverImage: event.cover_image_url ?? null,
        },
      });
      count++;
    }

    return { synced: true, count };
  }

  /**
   * Create a new event
   */
  async createEvent(
    userId: string,
    input: CreateEventRequest
  ): Promise<Event | { error: string }> {
    // Get integration for optional Meta sync
    const integration = await client.integrations.findFirst({
      where: {
        userId,
        name: "INSTAGRAM",
      },
    });

    let metaEventId: string | null = null;

    // Optionally sync to Instagram
    if (
      input.syncToInstagram &&
      integration?.token &&
      integration?.instagramId
    ) {
      try {
        const metaResult = await createMetaEvent(
          integration.instagramId,
          integration.token,
          {
            title: input.title,
            description: input.description ?? undefined,
            startTime: input.startTime,
            endTime: input.endTime ?? undefined,
            coverImageUrl: input.coverImage ?? undefined,
          }
        );

        if (metaResult.success && metaResult.eventId) {
          metaEventId = metaResult.eventId;
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Failed to create event on Instagram:", error.message);
        }
        // Continue with local creation even if Meta fails
      }
    }

    // Create in database
    const event = await client.instagramEvent.create({
      data: {
        userId,
        eventId: metaEventId,
        title: input.title,
        description: input.description,
        startTime: input.startTime,
        endTime: input.endTime,
        coverImage: input.coverImage,
        status: "SCHEDULED",
      },
    });

    const validated = EventSchema.safeParse(event);
    return validated.success ? validated.data : { error: "Validation failed" };
  }

  /**
   * Update an event
   * IDOR: Verifies event belongs to user
   */
  async updateEvent(
    userId: string,
    eventId: string,
    input: UpdateEventRequest
  ): Promise<Event | { error: string }> {
    // Get existing event for IDOR check
    const existing = await client.instagramEvent.findUnique({
      where: { id: eventId },
    });

    if (!existing || existing.userId !== userId) {
      return { error: "Event not found" };
    }

    // Update on Instagram if synced
    if (existing.eventId) {
      const integration = await client.integrations.findFirst({
        where: {
          userId,
          name: "INSTAGRAM",
        },
      });

      if (integration?.token) {
        try {
          await updateMetaEvent(existing.eventId, integration.token, {
            title: input.title,
            description: input.description ?? undefined,
            startTime: input.startTime,
            endTime: input.endTime ?? undefined,
            coverImageUrl: input.coverImage ?? undefined,
          });
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(
              "Failed to update event on Instagram:",
              error.message
            );
          }
        }
      }
    }

    // Build update data - only include defined fields
    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.startTime !== undefined) updateData.startTime = input.startTime;
    if (input.endTime !== undefined) updateData.endTime = input.endTime;
    if (input.coverImage !== undefined)
      updateData.coverImage = input.coverImage;
    if (input.status !== undefined) updateData.status = input.status;

    // Update in database
    const event = await client.instagramEvent.update({
      where: { id: eventId },
      data: updateData,
    });

    const validated = EventSchema.safeParse(event);
    return validated.success ? validated.data : { error: "Validation failed" };
  }

  /**
   * Cancel an event
   * IDOR: Verifies event belongs to user
   */
  async cancelEvent(
    userId: string,
    eventId: string
  ): Promise<Event | { error: string }> {
    return this.updateEvent(userId, eventId, { status: "CANCELLED" });
  }

  /**
   * Delete an event
   * IDOR: Verifies event belongs to user
   */
  async deleteEvent(userId: string, eventId: string): Promise<boolean> {
    // Get existing event for IDOR check
    const existing = await client.instagramEvent.findUnique({
      where: { id: eventId },
    });

    if (!existing || existing.userId !== userId) {
      return false;
    }

    // Cancel on Instagram if synced
    if (existing.eventId) {
      const integration = await client.integrations.findFirst({
        where: {
          userId,
          name: "INSTAGRAM",
        },
      });

      if (integration?.token) {
        try {
          await cancelMetaEvent(existing.eventId, integration.token);
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(
              "Failed to cancel event on Instagram:",
              error.message
            );
          }
        }
      }
    }

    // Delete from database
    await client.instagramEvent.delete({
      where: { id: eventId },
    });

    return true;
  }
}

// Export singleton instance
export const eventsService = new EventsService();
