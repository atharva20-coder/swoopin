"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Film, Camera, Clock, Instagram, Check, AlertCircle, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type CalendarPost = {
  id: string;
  caption?: string;
  mediaUrl?: string;
  postType?: "POST" | "REEL" | "STORY";
  scheduledFor: Date;
  status: "SCHEDULED" | "POSTED" | "FAILED" | "CANCELLED";
  automationId?: string;
  hashtags?: string[];
};

type SchedulerCalendarProps = {
  scheduledPosts?: CalendarPost[];
  onDateClick?: (date: Date) => void;
  onPostClick?: (post: CalendarPost) => void;
  onPostDelete?: (postId: string) => void;
  onAutomationDrop?: (date: Date, automation: { id: string; name: string }) => void;
  onPostReschedule?: (postId: string, newDate: Date) => void;
};

type ViewMode = "Month" | "Week" | "Day";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function SchedulerCalendar({
  scheduledPosts = [],
  onDateClick,
  onPostClick,
  onPostDelete,
  onAutomationDrop,
  onPostReschedule,
}: SchedulerCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("Month");
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [draggingPostId, setDraggingPostId] = useState<string | null>(null);

  // Handle keyboard delete - only for non-published posts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedPostId) {
        const post = scheduledPosts.find(p => p.id === selectedPostId);
        // Only allow deletion of non-published posts
        if (post && post.status !== "POSTED") {
          e.preventDefault();
          onPostDelete?.(selectedPostId);
          setSelectedPostId(null);
        }
      }
      if (e.key === "Escape") {
        setSelectedPostId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPostId, onPostDelete, scheduledPosts]);

  // Get week days for week view
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  }, [currentDate]);
  
  // Calendar days for month view
  const { calendarDays, monthStart } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const endPadding = 6 - lastDay.getDay();
    
    const days: Date[] = [];
    
    for (let i = startPadding - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push(prevDate);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    for (let i = 1; i <= endPadding; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return { calendarDays: days, monthStart: firstDay };
  }, [currentDate]);

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduledFor);
      return (
        postDate.getDate() === date.getDate() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getPostsForHour = (date: Date, hour: number) => {
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduledFor);
      return (
        postDate.getDate() === date.getDate() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getFullYear() === date.getFullYear() &&
        postDate.getHours() === hour
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const navigate = (direction: number) => {
    if (viewMode === "Month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    } else if (viewMode === "Week") {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + (direction * 7));
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + direction);
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getHeaderTitle = () => {
    if (viewMode === "Month") {
      return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (viewMode === "Week") {
      const start = weekDays[0];
      const end = weekDays[6];
      if (start.getMonth() === end.getMonth()) {
        return `${MONTHS[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${MONTHS[start.getMonth()]} ${start.getDate()} - ${MONTHS[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
    } else {
      return `${DAYS_FULL[currentDate.getDay()]}, ${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    }
  };

  // Post card with draggable for rescheduling (only if not published)
  const PostCard = ({ post, compact = false }: { post: CalendarPost; compact?: boolean }) => {
    const isSelected = selectedPostId === post.id;
    const isPublished = post.status === "POSTED";
    const isFailed = post.status === "FAILED";
    const isDragging = draggingPostId === post.id;
    
    const typeColors = {
      POST: "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800",
      REEL: "bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800",
      STORY: "bg-orange-100 dark:bg-orange-900/40 border-orange-200 dark:border-orange-800",
    };

    const typeLabels = {
      POST: { icon: Camera, label: "Post", bg: "bg-blue-500" },
      REEL: { icon: Film, label: "Reel", bg: "bg-purple-500" },
      STORY: { icon: Clock, label: "Story", bg: "bg-orange-500" },
    };

    const type = post.postType || "POST";
    const TypeIcon = typeLabels[type].icon;

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isSelected) {
        setSelectedPostId(null);
        onPostClick?.(post);
      } else {
        setSelectedPostId(post.id);
        onPostClick?.(post);
      }
    };

    const handleDragStart = (e: React.DragEvent) => {
      if (isPublished) {
        e.preventDefault();
        return;
      }
      e.stopPropagation();
      setDraggingPostId(post.id);
      e.dataTransfer.setData("post", JSON.stringify(post));
      e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnd = () => {
      setDraggingPostId(null);
    };

    if (compact) {
      return (
        <div
          draggable={!isPublished}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onClick={handleClick}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all",
            typeColors[type],
            isSelected && "ring-2 ring-blue-500",
            isDragging && "opacity-50",
            !isPublished && "cursor-grab active:cursor-grabbing",
            isPublished && "cursor-pointer"
          )}
        >
          {!isPublished && <GripVertical className="w-3 h-3 text-gray-400 shrink-0" />}
          {isPublished && <Check className="w-3 h-3 text-green-500 shrink-0" />}
          {isFailed && <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />}
          <span className="truncate">{post.caption?.split(' ').slice(0, 3).join(' ')}...</span>
          <span className="text-gray-500 shrink-0">
            {new Date(post.scheduledFor).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
      );
    }

    return (
      <div
        draggable={!isPublished}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={cn(
          "w-full text-left p-2 rounded-lg border transition-all hover:shadow-md",
          typeColors[type],
          isSelected && "ring-2 ring-blue-500",
          isDragging && "opacity-50",
          !isPublished && "cursor-grab active:cursor-grabbing",
          isPublished && "cursor-pointer"
        )}
        onClick={handleClick}
      >
        {/* Status indicator */}
        <div className="flex items-center gap-1.5 mb-1">
          {!isPublished && <GripVertical className="w-3 h-3 text-gray-400" />}
          <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium text-white flex items-center gap-1", typeLabels[type].bg)}>
            <TypeIcon className="w-2.5 h-2.5" />
            {typeLabels[type].label}
          </span>
          {isPublished && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-500 text-white flex items-center gap-1">
              <Check className="w-2.5 h-2.5" />
              Posted
            </span>
          )}
          {isFailed && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500 text-white flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5" />
              Failed
            </span>
          )}
        </div>
        
        <p className="text-[11px] text-gray-700 dark:text-gray-300 line-clamp-2 mb-1">
          {post.caption?.split(' ').slice(0, 4).join(' ')}...
        </p>
        
        {post.hashtags && post.hashtags.length > 0 && (
          <p className="text-[10px] text-blue-500 truncate mb-1.5">
            #{post.hashtags[0]}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
              <Instagram className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <span className="text-[10px] text-gray-500">
            {new Date(post.scheduledFor).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        </div>
      </div>
    );
  };

  // Handle drop for both automation and post reschedule
  const handleDrop = (e: React.DragEvent, targetDate: Date, hour?: number) => {
    e.preventDefault();
    setDragOverDate(null);

    const automationData = e.dataTransfer.getData("automation");
    const postData = e.dataTransfer.getData("post");

    if (automationData) {
      try {
        const automation = JSON.parse(automationData);
        const dropDate = hour !== undefined ? new Date(targetDate.setHours(hour, 0, 0, 0)) : targetDate;
        onAutomationDrop?.(dropDate, automation);
      } catch (err) {
        console.error("Failed to parse automation data", err);
      }
    } else if (postData) {
      try {
        const post = JSON.parse(postData);
        // Don't allow rescheduling published posts
        if (post.status === "POSTED") return;
        
        const newDate = hour !== undefined 
          ? new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), hour, 0, 0)
          : new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 9, 0, 0);
        onPostReschedule?.(post.id, newDate);
      } catch (err) {
        console.error("Failed to parse post data", err);
      }
    }
  };

  // Month View
  const MonthView = () => (
    <>
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800">
        {DAYS.map((day) => (
          <div key={day} className="py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
        {calendarDays.map((date, index) => {
          const posts = getPostsForDate(date);
          const isCurrentDay = isToday(date);
          const inCurrentMonth = isCurrentMonth(date);
          const dateKey = date.toISOString();
          const isDragOver = dragOverDate === dateKey;

          return (
            <div
              key={`${dateKey}-${index}`}
              onClick={() => onDateClick?.(date)}
              onDragOver={(e) => { e.preventDefault(); setDragOverDate(dateKey); }}
              onDragLeave={() => setDragOverDate(null)}
              onDrop={(e) => handleDrop(e, date)}
              className={cn(
                "border-b border-r border-gray-100 dark:border-gray-800 p-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors min-h-[120px] overflow-hidden",
                !inCurrentMonth && "bg-gray-50 dark:bg-gray-900/50",
                isCurrentDay && "bg-blue-50/50 dark:bg-blue-950/30",
                isDragOver && "bg-green-100 dark:bg-green-900/30 ring-2 ring-green-400 ring-inset"
              )}
            >
              <div className="flex flex-col h-full">
                <span className={cn(
                  "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                  isCurrentDay ? "bg-blue-600 text-white" : inCurrentMonth ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-600"
                )}>
                  {date.getDate()}
                </span>
                
                {isDragOver ? (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-xs text-green-600 font-medium">Drop to schedule</span>
                  </div>
                ) : (
                  <div className="flex-1 space-y-1 overflow-y-auto">
                    {posts.slice(0, 2).map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                    {posts.length > 2 && (
                      <span className="text-[10px] text-gray-500 block text-center">+{posts.length - 2} more</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  // Week View
  const WeekView = () => (
    <>
      <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-800">
        <div className="py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-800">
          Time
        </div>
        {weekDays.map((day) => (
          <div key={day.toISOString()} className={cn(
            "py-3 text-center text-xs font-medium border-r border-gray-100 dark:border-gray-800",
            isToday(day) ? "text-blue-600 bg-blue-50/50 dark:bg-blue-950/30" : "text-gray-500 dark:text-gray-400"
          )}>
            <div>{DAYS[day.getDay()]}</div>
            <div className={cn("text-lg font-semibold", isToday(day) ? "text-blue-600" : "text-gray-900 dark:text-white")}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-800 min-h-[60px]">
            <div className="py-2 px-2 text-xs text-gray-500 border-r border-gray-200 dark:border-gray-800 text-right">
              {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
            </div>
            {weekDays.map((day) => {
              const posts = getPostsForHour(day, hour);
              const dateKey = `${day.toISOString()}-${hour}`;
              const isDragOver = dragOverDate === dateKey;

              return (
                <div
                  key={dateKey}
                  onClick={() => {
                    const clickDate = new Date(day);
                    clickDate.setHours(hour, 0, 0, 0);
                    onDateClick?.(clickDate);
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragOverDate(dateKey); }}
                  onDragLeave={() => setDragOverDate(null)}
                  onDrop={(e) => handleDrop(e, day, hour)}
                  className={cn(
                    "border-r border-gray-100 dark:border-gray-800 p-1 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors",
                    isDragOver && "bg-green-100 dark:bg-green-900/30"
                  )}
                >
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} compact />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );

  // Day View
  const DayView = () => (
    <>
      <div className="flex items-center justify-center py-4 border-b border-gray-200 dark:border-gray-800">
        <span className={cn(
          "text-2xl font-bold px-4 py-2 rounded-lg",
          isToday(currentDate) && "bg-blue-600 text-white"
        )}>
          {currentDate.getDate()}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {HOURS.map((hour) => {
          const posts = getPostsForHour(currentDate, hour);
          const dateKey = `${currentDate.toISOString()}-${hour}`;
          const isDragOver = dragOverDate === dateKey;

          return (
            <div key={hour} className="flex border-b border-gray-100 dark:border-gray-800 min-h-[80px]">
              <div className="w-20 py-2 px-3 text-sm text-gray-500 border-r border-gray-200 dark:border-gray-800 text-right shrink-0">
                {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
              </div>
              <div
                onClick={() => {
                  const clickDate = new Date(currentDate);
                  clickDate.setHours(hour, 0, 0, 0);
                  onDateClick?.(clickDate);
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOverDate(dateKey); }}
                onDragLeave={() => setDragOverDate(null)}
                onDrop={(e) => handleDrop(e, currentDate, hour)}
                className={cn(
                  "flex-1 p-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors space-y-1",
                  isDragOver && "bg-green-100 dark:bg-green-900/30"
                )}
              >
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Calendar Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {getHeaderTitle()}
        </h2>
        
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(["Month", "Week", "Day"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                  viewMode === mode
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
          
          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button onClick={() => navigate(1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Views */}
      {viewMode === "Month" && <MonthView />}
      {viewMode === "Week" && <WeekView />}
      {viewMode === "Day" && <DayView />}
    </div>
  );
}
