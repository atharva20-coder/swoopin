"use client";

import React, { useState } from "react";
import SchedulerCalendar from "./scheduler-calendar";
import ContentLibrary from "./content-library";
import PostPreviewModal from "./post-preview";
import CanvaPicker from "@/components/global/canva-picker";
import { toast } from "sonner";
import { X, Menu } from "lucide-react";
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
  productTags?: { productId: string; x: number; y: number }[];
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
  const [isCanvaPickerOpen, setIsCanvaPickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(initialScheduledPosts);
  const [drafts, setDrafts] = useState(initialDrafts);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<{ id: string; name: string } | null>(null);

  const handleDateClick = (date: Date) => {
    // If an automation is selected (mobile tap-to-schedule), schedule it
    if (selectedAutomation) {
      handleAutomationDrop(date, selectedAutomation);
      setSelectedAutomation(null);
      setIsSidebarOpen(false);
      return;
    }
    
    setSelectedPost(null);
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  // Handle automation selection for mobile tap-to-schedule
  const handleAutomationTap = (automation: { id: string; name: string; active: boolean }) => {
    if (selectedAutomation?.id === automation.id) {
      // Deselect if already selected
      setSelectedAutomation(null);
    } else {
      setSelectedAutomation({ id: automation.id, name: automation.name });
    }
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
    setIsCanvaPickerOpen(true);
  };

  const handleCanvaDesignSelect = (imageUrl: string, designTitle: string) => {
    setIsCanvaPickerOpen(false);
    // Open post modal with the Canva design
    setSelectedPost(null);
    setSelectedDate(new Date());
    setIsModalOpen(true);
    toast.success(`Imported: ${designTitle}`);
    // The mediaUrl will be set via the modal - for now we'll store it
    // This could be enhanced to pass the imageUrl to the modal
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

  // Handle draft click - open modal with draft data
  const handleDraftClick = (draft: Draft) => {
    // Convert draft to ScheduledPost format for editing
    const draftAsPost: ScheduledPost = {
      id: draft.id,
      caption: draft.title,
      postType: draft.type,
      scheduledFor: draft.updatedAt, // Use last saved date
      status: "SCHEDULED",
    };
    setSelectedPost(draftAsPost);
    setSelectedDate(draft.updatedAt);
    setIsModalOpen(true);
  };

  // Remove draft when scheduled
  const removeDraft = (draftId: string) => {
    setDrafts(prev => prev.filter(d => d.id !== draftId));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Breadcrumbs with mobile toggle */}
      <div className="flex items-center justify-between px-1 py-3 text-sm">
        <div className="flex items-center gap-2">
          <a href={`/dashboard/${slug}`} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Dashboard
          </a>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white font-medium">Scheduler</span>
        </div>
        
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
          aria-label="Open content library"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden gap-4">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Left Sidebar - Content Library */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 lg:relative lg:inset-auto lg:z-auto lg:w-72 lg:transform-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <ContentLibrary
            automations={automations}
            drafts={drafts}
            onCreatePost={() => { handleCreatePost(); setIsSidebarOpen(false); }}
            onConnectCanva={() => { handleConnectCanva(); setIsSidebarOpen(false); }}
            onDraftClick={(draft) => { handleDraftClick(draft); setIsSidebarOpen(false); }}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onAutomationSelect={handleAutomationTap}
            selectedAutomationId={selectedAutomation?.id || null}
          />
        </div>

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

      {/* Canva Picker Modal */}
      {isCanvaPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden relative">
            <button
              onClick={() => setIsCanvaPickerOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700"
            >
              <X className="w-4 h-4" />
            </button>
            <CanvaPicker
              onSelect={handleCanvaDesignSelect}
              onCancel={() => setIsCanvaPickerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
