"use client";

import React, { useState } from "react";
import SchedulerCalendar from "./scheduler-calendar";
import ContentLibrary from "./content-library";
import PostPreviewModal from "./post-preview";
import { toast } from "sonner";
import { 
  createScheduledPost, 
  updateScheduledPost, 
  deleteScheduledPost, 
  publishScheduledPost,
  createDraft 
} from "@/actions/scheduler";

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
  music?: string;
  taggedUsers?: string[];
  collaborators?: string[];
  altText?: string;
};

type Draft = {
  id: string;
  title: string;
  type: "POST" | "REEL" | "STORY";
  status: "draft" | "processing";
  updatedAt: Date;
};

type SchedulerViewProps = {
  slug: string;
  automations: Automation[];
  initialScheduledPosts?: ScheduledPost[];
  initialDrafts?: Draft[];
};

export default function SchedulerView({ 
  slug, 
  automations,
  initialScheduledPosts = [],
  initialDrafts = [] 
}: SchedulerViewProps) {
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(initialScheduledPosts);
  const [isLoading, setIsLoading] = useState(false);

  const handleDateClick = (date: Date) => {
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
    setSelectedPost(null);
    setSelectedDate(new Date());
    setIsModalOpen(true);
  };

  const handleConnectCanva = () => {
    toast.info("Coming soon!", { description: "Canva integration is in development" });
  };

  const handleSchedule = async (postData: Partial<ScheduledPost>) => {
    setIsLoading(true);
    try {
      if (postData.id && scheduledPosts.find(p => p.id === postData.id)) {
        // Update existing
        const result = await updateScheduledPost(postData.id, {
          caption: postData.caption,
          mediaUrl: postData.mediaUrl,
          mediaType: postData.mediaType,
          postType: postData.postType,
          scheduledFor: postData.scheduledFor,
          hashtags: postData.hashtags,
          automationId: postData.automationId,
        });
        if (result.status === 200) {
          setScheduledPosts(scheduledPosts.map(p => 
            p.id === postData.id ? { ...p, ...postData } as ScheduledPost : p
          ));
          toast.success("Post updated!");
        } else {
          toast.error("Failed to update post");
        }
      } else {
        // Create new
        const result = await createScheduledPost({
          caption: postData.caption,
          mediaUrl: postData.mediaUrl,
          mediaType: postData.mediaType,
          postType: postData.postType,
          scheduledFor: postData.scheduledFor || new Date(),
          hashtags: postData.hashtags,
          automationId: postData.automationId,
          carouselItems: postData.mediaUrls?.map(url => ({ imageUrl: url })),
        });
        if (result.status === 200 && result.data && typeof result.data !== 'string') {
          const newPost: ScheduledPost = {
            id: result.data.id,
            ...postData,
            scheduledFor: postData.scheduledFor || new Date(),
            status: "SCHEDULED",
          } as ScheduledPost;
          setScheduledPosts([...scheduledPosts, newPost]);
          toast.success("Post scheduled!");
        } else {
          toast.error("Failed to create post");
        }
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
      handleCloseModal();
    }
  };

  const handlePostNow = async (postData: Partial<ScheduledPost>) => {
    setIsLoading(true);
    try {
      // First create the post if it doesn't exist
      let postId = postData.id;
      if (!postId || !scheduledPosts.find(p => p.id === postId)) {
        const createResult = await createScheduledPost({
          caption: postData.caption,
          mediaUrl: postData.mediaUrl,
          mediaType: postData.mediaType,
          postType: postData.postType,
          scheduledFor: new Date(),
          hashtags: postData.hashtags,
          automationId: postData.automationId,
          carouselItems: postData.mediaUrls?.map(url => ({ imageUrl: url })),
        });
        if (createResult.status === 200 && createResult.data && typeof createResult.data !== 'string') {
          postId = createResult.data.id;
        } else {
          toast.error("Failed to create post");
          return;
        }
      }
      
      // Now publish it
      const result = await publishScheduledPost(postId!);
      if (result.status === 200) {
        setScheduledPosts(scheduledPosts.map(p => 
          p.id === postId ? { ...p, status: "POSTED" as const } : p
        ));
        toast.success("Post published to Instagram!");
      } else {
        toast.error(typeof result.data === 'string' ? result.data : "Failed to publish");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
      handleCloseModal();
    }
  };

  const handleSaveDraft = async (postData: Partial<ScheduledPost>) => {
    setIsLoading(true);
    try {
      const result = await createDraft({
        title: postData.caption?.slice(0, 50) || "Untitled",
        caption: postData.caption,
        mediaUrl: postData.mediaUrl,
        mediaType: postData.mediaType,
      });
      if (result.status === 200) {
        toast.success("Saved to drafts");
      } else {
        toast.error("Failed to save draft");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
      handleCloseModal();
    }
  };

  const handleDeletePost = async (postId: string) => {
    // Don't allow deletion of published posts
    const post = scheduledPosts.find(p => p.id === postId);
    if (post?.status === "POSTED") {
      toast.error("Cannot delete published posts");
      return;
    }
    
    try {
      const result = await deleteScheduledPost(postId);
      if (result.status === 200) {
        setScheduledPosts(scheduledPosts.filter(p => p.id !== postId));
        toast.success("Post deleted");
      } else {
        toast.error("Failed to delete post");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
    setSelectedPost(null);
  };

  const handleReschedule = async (postId: string, newDate: Date) => {
    // Don't allow rescheduling of published posts
    const post = scheduledPosts.find(p => p.id === postId);
    if (post?.status === "POSTED") {
      toast.error("Cannot reschedule published posts");
      return;
    }
    
    try {
      const result = await updateScheduledPost(postId, {
        scheduledFor: newDate,
      });
      if (result.status === 200) {
        setScheduledPosts(scheduledPosts.map(p => 
          p.id === postId ? { ...p, scheduledFor: newDate } : p
        ));
        toast.success("Post rescheduled!", {
          description: `Moved to ${newDate.toLocaleDateString()} at ${newDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
        });
      } else {
        toast.error("Failed to reschedule post");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleAutomationDrop = async (date: Date, automation: { id: string; name: string }) => {
    try {
      const result = await createScheduledPost({
        caption: `Automation: ${automation.name}`,
        scheduledFor: date,
        postType: "POST",
        automationId: automation.id,
      });
      if (result.status === 200 && result.data && typeof result.data !== 'string') {
        const newPost: ScheduledPost = {
          id: result.data.id,
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
      }
    } catch (error) {
      toast.error("Failed to schedule automation");
    }
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
          drafts={initialDrafts}
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
          onPostReschedule={handleReschedule}
        />
      </div>

      {/* iPhone Modal */}
      <PostPreviewModal
        isOpen={isModalOpen}
        post={selectedPost}
        initialDate={selectedDate || undefined}
        automations={automations}
        onClose={handleCloseModal}
        onSave={handleSchedule}
        onDelete={handleDeletePost}
        onSchedule={handleSchedule}
        onPostNow={handlePostNow}
        onSaveDraft={handleSaveDraft}
      />
    </div>
  );
}
