"use client";

import React, { useState } from "react";
import SchedulerCalendar from "./scheduler-calendar";
import ContentLibrary from "./content-library";
import PostPreviewModal from "./post-preview";
import { toast } from "sonner";

type Automation = {
  id: string;
  name: string;
  active: boolean;
};

type ScheduledPost = {
  id: string;
  caption?: string;
  mediaUrl?: string;
  mediaUrls?: string[];
  mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL";
  postType?: "POST" | "REEL" | "STORY";
  scheduledFor: Date;
  hashtags?: string[];
  status: "SCHEDULED" | "POSTED" | "FAILED" | "CANCELLED";
  automationId?: string;
  automationName?: string;
  location?: string;
};

type SchedulerViewProps = {
  slug: string;
  automations: Automation[];
};

export default function SchedulerView({ slug, automations }: SchedulerViewProps) {
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Get dates for demo posts (spread across current month)
  const today = new Date();
  const getDateInMonth = (dayOffset: number, hour: number = 9, minute: number = 0) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset);
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
    {
      id: "demo-1",
      caption: "Morning brew & big ideas...",
      postType: "POST",
      hashtags: ["coffee"],
      scheduledFor: getDateInMonth(1, 9, 0),
      status: "SCHEDULED",
      location: "Seattle, WA",
    },
    {
      id: "demo-2",
      caption: "Morning brew & big ideas...",
      postType: "POST",
      hashtags: ["coffee"],
      scheduledFor: getDateInMonth(2, 9, 0),
      status: "SCHEDULED",
    },
    {
      id: "demo-3",
      caption: "Dance challenge! Duet this...",
      postType: "REEL",
      hashtags: ["dance"],
      scheduledFor: getDateInMonth(4, 12, 30),
      status: "SCHEDULED",
    },
    {
      id: "demo-4",
      caption: "Morning brew & big ideas...",
      postType: "POST",
      hashtags: ["coffee"],
      scheduledFor: getDateInMonth(6, 9, 0),
      status: "SCHEDULED",
    },
    {
      id: "demo-5",
      caption: "Drop to Schedule",
      postType: "STORY",
      scheduledFor: getDateInMonth(8, 14, 0),
      status: "SCHEDULED",
    },
  ]);

  const handleDateClick = (date: Date) => {
    // Open modal for new post on this date
    setSelectedPost(null);
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handlePostClick = (post: { id: string }) => {
    const fullPost = scheduledPosts.find(p => p.id === post.id);
    if (fullPost) {
      setSelectedPost(fullPost);
      setSelectedDate(null);
      setIsModalOpen(true);
    }
  };

  const handleCreatePost = () => {
    // Open modal for new post
    setSelectedPost(null);
    setSelectedDate(new Date());
    setIsModalOpen(true);
  };

  const handleConnectCanva = () => {
    toast.info("Coming soon!", { description: "Canva integration is in development" });
  };

  const handleSavePost = (postData: Partial<ScheduledPost>) => {
    if (postData.id && scheduledPosts.find(p => p.id === postData.id)) {
      // Update existing
      setScheduledPosts(scheduledPosts.map(p => 
        p.id === postData.id ? { ...p, ...postData } as ScheduledPost : p
      ));
    } else {
      // Add new
      const newPost: ScheduledPost = {
        id: postData.id || `post-${Date.now()}`,
        scheduledFor: postData.scheduledFor || new Date(),
        status: postData.status || "SCHEDULED",
        ...postData,
      } as ScheduledPost;
      setScheduledPosts([...scheduledPosts, newPost]);
    }
  };

  const handleDeletePost = (postId: string) => {
    setScheduledPosts(scheduledPosts.filter(p => p.id !== postId));
    setSelectedPost(null);
    toast.success("Post deleted");
  };

  const handleAutomationDrop = (date: Date, automation: { id: string; name: string }) => {
    const newPost: ScheduledPost = {
      id: `automation-${Date.now()}`,
      caption: `Automation: ${automation.name}`,
      scheduledFor: date,
      status: "SCHEDULED",
      postType: "POST",
      automationId: automation.id,
      automationName: automation.name,
    };
    setScheduledPosts([...scheduledPosts, newPost]);
    toast.success("Automation scheduled!", {
      description: `${automation.name} scheduled for ${date.toLocaleDateString()}`
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
    setSelectedDate(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 px-1 py-3 text-sm">
        <a href={`/dashboard/${slug}`} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          Dashboard
        </a>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white font-medium">Scheduler</span>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden gap-4">
      {/* Left Sidebar - Content Library */}
      <ContentLibrary
        automations={automations}
        onCreatePost={handleCreatePost}
        onConnectCanva={handleConnectCanva}
      />

      {/* Main Calendar */}
      <SchedulerCalendar
        scheduledPosts={scheduledPosts.map(p => ({
          id: p.id,
          caption: p.caption,
          mediaUrl: p.mediaUrl,
          postType: p.postType,
          scheduledFor: p.scheduledFor,
          status: p.status,
          automationId: p.automationId,
          hashtags: p.hashtags,
        }))}
        onDateClick={handleDateClick}
        onPostClick={handlePostClick}
        onPostDelete={handleDeletePost}
        onAutomationDrop={handleAutomationDrop}
      />
      </div>

      {/* iPhone Modal */}
      <PostPreviewModal
        isOpen={isModalOpen}
        post={selectedPost}
        initialDate={selectedDate || undefined}
        automations={automations}
        onClose={handleCloseModal}
        onSave={handleSavePost}
        onDelete={handleDeletePost}
        onSchedule={(postData) => {
          handleSavePost(postData);
        }}
        onPostNow={(postData) => {
          const updatedPost = { ...postData, status: "SCHEDULED" as const, scheduledFor: new Date() };
          handleSavePost(updatedPost);
        }}
        onSaveDraft={(postData) => {
          const draftPost = { ...postData, status: "CANCELLED" as const };
          handleSavePost(draftPost);
        }}
      />
    </div>
  );
}
