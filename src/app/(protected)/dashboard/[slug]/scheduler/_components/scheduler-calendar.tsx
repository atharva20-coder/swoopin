"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Film, Camera, Clock, Instagram } from "lucide-react";
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
};

type ViewMode = "Month" | "Week" | "Day";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function SchedulerCalendar({
  scheduledPosts = [],
  onDateClick,
  onPostClick,
  onPostDelete,
  onAutomationDrop,
}: SchedulerCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("Month");
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedPostId) {
        e.preventDefault();
        onPostDelete?.(selectedPostId);
        setSelectedPostId(null);
      }
      if (e.key === "Escape") {
        setSelectedPostId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPostId, onPostDelete]);
  
  const { calendarDays, monthStart } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const endPadding = 6 - lastDay.getDay();
    
    const days: Date[] = [];
    
    // Add padding for days before month starts
    for (let i = startPadding - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push(prevDate);
    }
    
    // Add all days in month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add padding for days after month ends
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

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Post card component matching the reference UI
  const PostCard = ({ post }: { post: CalendarPost }) => {
    const isSelected = selectedPostId === post.id;
    
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
      // Toggle selection
      if (isSelected) {
        setSelectedPostId(null);
        onPostClick?.(post);
      } else {
        setSelectedPostId(post.id);
        onPostClick?.(post);
      }
    };

    return (
      <div
        className={cn(
          "w-full text-left p-2 rounded-lg border transition-all hover:shadow-md cursor-pointer",
          typeColors[type],
          isSelected && "opacity-75 scale-[0.98]"
        )}
        onClick={handleClick}
      >
        {/* Type Badge */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium text-white flex items-center gap-1", typeLabels[type].bg)}>
            <TypeIcon className="w-2.5 h-2.5" />
            {typeLabels[type].label}
          </span>
        </div>
        
        {/* Caption Preview */}
        <p className="text-[11px] text-gray-700 dark:text-gray-300 line-clamp-2 mb-1">
          {post.caption?.split(' ').slice(0, 4).join(' ')}...
        </p>
        
        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <p className="text-[10px] text-blue-500 truncate mb-1.5">
            #{post.hashtags[0]}
          </p>
        )}
        
        {/* Platform & Time */}
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

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Calendar Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
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
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
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

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800">
        {DAYS.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
        {calendarDays.map((date, index) => {
          const posts = getPostsForDate(date);
          const isCurrentDay = isToday(date);
          const inCurrentMonth = isCurrentMonth(date);

          const dateKey = date.toISOString();
          const isDragOver = dragOverDate === dateKey;

          const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            setDragOverDate(dateKey);
          };

          const handleDragLeave = () => {
            setDragOverDate(null);
          };

          const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            setDragOverDate(null);
            const automationData = e.dataTransfer.getData("automation");
            if (automationData) {
              try {
                const automation = JSON.parse(automationData);
                onAutomationDrop?.(date, automation);
              } catch (err) {
                console.error("Failed to parse automation data", err);
              }
            }
          };

          return (
            <div
              key={`${dateKey}-${index}`}
              onClick={() => onDateClick?.(date)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-b border-r border-gray-100 dark:border-gray-800 p-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors min-h-[120px] overflow-hidden",
                !inCurrentMonth && "bg-gray-50 dark:bg-gray-900/50",
                isCurrentDay && "bg-blue-50/50 dark:bg-blue-950/30",
                isDragOver && "bg-green-100 dark:bg-green-900/30 ring-2 ring-green-400 ring-inset"
              )}
            >
              <div className="flex flex-col h-full">
                <span
                  className={cn(
                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                    isCurrentDay
                      ? "bg-blue-600 text-white"
                      : inCurrentMonth
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400 dark:text-gray-600"
                  )}
                >
                  {date.getDate()}
                </span>
                
                {isDragOver && (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-xs text-green-600 font-medium">Drop to schedule</span>
                  </div>
                )}
                
                {!isDragOver && (
                  <div className="flex-1 space-y-1 overflow-y-auto">
                    {posts.slice(0, 2).map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                    {posts.length > 2 && (
                      <span className="text-[10px] text-gray-500 block text-center">
                        +{posts.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
