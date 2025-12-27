"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  X,
  Edit2,
  Trash2,
  RefreshCw,
  Video,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  createUserEvent,
  updateUserEvent,
  cancelUserEvent,
  deleteUserEvent,
} from "@/actions/events";

type EventStatus = "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";

interface InstagramEvent {
  id: string;
  userId: string;
  eventId: string | null;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date | null;
  status: EventStatus;
  coverImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface EventsViewProps {
  slug: string;
  initialEvents: InstagramEvent[];
}

const STATUS_COLORS: Record<EventStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  LIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  COMPLETED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_ICONS: Record<EventStatus, React.ReactNode> = {
  SCHEDULED: <Clock className="w-3 h-3" />,
  LIVE: <Video className="w-3 h-3" />,
  COMPLETED: <Check className="w-3 h-3" />,
  CANCELLED: <AlertCircle className="w-3 h-3" />,
};

export default function EventsView({ slug, initialEvents }: EventsViewProps) {
  const [events, setEvents] = useState<InstagramEvent[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<InstagramEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("13:00");
  const [syncToInstagram, setSyncToInstagram] = useState(false);

  // Calendar helpers
  const monthStart = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return date;
  }, [currentDate]);

  const monthEnd = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  }, [currentDate]);

  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    const startDay = monthStart.getDay();

    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(monthStart);
      date.setDate(date.getDate() - i - 1);
      days.push(date);
    }

    // Current month days
    for (let i = 1; i <= monthEnd.getDate(); i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    // Next month days to fill grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(monthEnd);
      date.setDate(date.getDate() + i);
      days.push(date);
    }

    return days;
  }, [monthStart, monthEnd, currentDate]);

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setStartTime("12:00");
    setEndDate("");
    setEndTime("13:00");
    setSyncToInstagram(false);
    setEditingEvent(null);
  };

  const openCreateModal = (date?: Date) => {
    resetForm();
    if (date) {
      setStartDate(date.toISOString().slice(0, 10));
      setEndDate(date.toISOString().slice(0, 10));
    }
    setShowModal(true);
  };

  const openEditModal = (event: InstagramEvent) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description || "");
    setStartDate(new Date(event.startTime).toISOString().slice(0, 10));
    setStartTime(new Date(event.startTime).toTimeString().slice(0, 5));
    if (event.endTime) {
      setEndDate(new Date(event.endTime).toISOString().slice(0, 10));
      setEndTime(new Date(event.endTime).toTimeString().slice(0, 5));
    }
    setSyncToInstagram(!!event.eventId);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!title || !startDate) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsLoading(true);

    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = endDate ? new Date(`${endDate}T${endTime}`) : undefined;

      if (editingEvent) {
        const result = await updateUserEvent(editingEvent.id, {
          title,
          description: description || undefined,
          startTime: startDateTime,
          endTime: endDateTime,
        });

        if (result.status === 200 && typeof result.data !== "string") {
          setEvents(events.map((e) => (e.id === editingEvent.id ? result.data as InstagramEvent : e)));
          toast.success("Event updated!");
        } else {
          toast.error(typeof result.data === "string" ? result.data : "Failed to update");
        }
      } else {
        const result = await createUserEvent({
          title,
          description: description || undefined,
          startTime: startDateTime,
          endTime: endDateTime,
          syncToInstagram,
        });

        if (result.status === 200 && typeof result.data !== "string") {
          setEvents([...events, result.data as InstagramEvent]);
          toast.success("Event created!");
        } else {
          toast.error(typeof result.data === "string" ? result.data : "Failed to create");
        }
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (eventId: string) => {
    setIsLoading(true);
    try {
      const result = await cancelUserEvent(eventId);
      if (result.status === 200) {
        setEvents(events.map((e) => (e.id === eventId ? { ...e, status: "CANCELLED" as EventStatus } : e)));
        toast.success("Event cancelled");
      }
    } catch (error) {
      toast.error("Failed to cancel event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    setIsLoading(true);
    try {
      const result = await deleteUserEvent(eventId);
      if (result.status === 200) {
        setEvents(events.filter((e) => e.id !== eventId));
        toast.success("Event deleted");
      }
    } catch (error) {
      toast.error("Failed to delete event");
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date();
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-1 py-3">
        <div className="flex items-center gap-2 text-sm">
          <a
            href={`/dashboard/${slug}`}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Dashboard
          </a>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white font-medium">Events</span>
        </div>
        <Button onClick={() => openCreateModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Event
        </Button>
      </div>

      {/* Calendar */}
      <div className="flex-1 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-neutral-800">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-3">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-1">
          {calendarDays.map((date, i) => {
            const dayEvents = getEventsForDate(date);
            return (
              <div
                key={i}
                onClick={() => openCreateModal(date)}
                className={cn(
                  "min-h-[100px] p-2 border-b border-r border-gray-100 dark:border-neutral-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors",
                  !isCurrentMonth(date) && "bg-gray-50 dark:bg-neutral-800/40"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-sm mb-1 text-gray-700 dark:text-gray-200",
                    isToday(date) && "bg-blue-600 text-white font-semibold",
                    !isCurrentMonth(date) && "text-gray-400 dark:text-gray-500"
                  )}
                >
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(event);
                      }}
                      className={cn(
                        "w-full text-left px-2 py-1 rounded text-xs truncate flex items-center gap-1",
                        STATUS_COLORS[event.status]
                      )}
                    >
                      {STATUS_ICONS[event.status]}
                      <span className="truncate">{event.title}</span>
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-neutral-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingEvent ? "Edit Event" : "Create Event"}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event title"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Event description..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Start Time
                  </label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    End Time
                  </label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              {!editingEvent && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={syncToInstagram}
                    onChange={(e) => setSyncToInstagram(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Sync to Instagram (requires Events permission)
                  </span>
                </label>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-neutral-800 gap-3">
              {editingEvent && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-orange-600"
                    onClick={() => {
                      handleCancel(editingEvent.id);
                      setShowModal(false);
                    }}
                    disabled={isLoading || editingEvent.status === "CANCELLED"}
                  >
                    Cancel Event
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={() => {
                      handleDelete(editingEvent.id);
                      setShowModal(false);
                    }}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {editingEvent ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
