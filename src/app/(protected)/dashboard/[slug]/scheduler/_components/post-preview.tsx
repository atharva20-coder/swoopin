"use client";

import React, { useState, useEffect } from "react";
import { 
  X, ChevronLeft, ChevronRight, Clock, MapPin, Hash, Music2, Users, AtSign, 
  Zap, Calendar, Send, Save, Image, Film, Plus, Trash2,
  User, Heart, MessageCircle, Bookmark, MoreHorizontal, Play, Layers, Battery, Wifi, Signal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
};

type Automation = {
  id: string;
  name: string;
  active: boolean;
};

type PostPreviewModalProps = {
  isOpen: boolean;
  post?: ScheduledPost | null;
  initialDate?: Date;
  automations?: Automation[];
  onClose: () => void;
  onSave?: (post: Partial<ScheduledPost>) => void;
  onDelete?: (postId: string) => void;
  onSchedule?: (post: Partial<ScheduledPost>) => void;
  onPostNow?: (post: Partial<ScheduledPost>) => void;
  onSaveDraft?: (post: Partial<ScheduledPost>) => void;
};

const POST_TYPES = [
  { value: "POST", label: "Post", icon: Image },
  { value: "REEL", label: "Reel", icon: Film },
  { value: "STORY", label: "Story", icon: Clock },
] as const;

export default function PostPreviewModal({
  isOpen,
  post,
  initialDate,
  automations = [],
  onClose,
  onSave,
  onDelete,
  onSchedule,
  onPostNow,
  onSaveDraft,
}: PostPreviewModalProps) {
  const [postType, setPostType] = useState<"POST" | "REEL" | "STORY">("POST");
  const [caption, setCaption] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [location, setLocation] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
  const [music, setMusic] = useState("");
  const [taggedUsers, setTaggedUsers] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [newCollab, setNewCollab] = useState("");
  const [selectedAutomation, setSelectedAutomation] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (post) {
        setPostType(post.postType || "POST");
        setCaption(post.caption || "");
        setMediaUrls(post.mediaUrls || (post.mediaUrl ? [post.mediaUrl] : []));
        setLocation(post.location || "");
        setHashtags(post.hashtags || []);
        setMusic(post.music || "");
        setTaggedUsers(post.taggedUsers || []);
        setCollaborators(post.collaborators || []);
        setSelectedAutomation(post.automationId || "");
        if (post.scheduledFor) {
          const date = new Date(post.scheduledFor);
          setScheduledDate(date.toISOString().slice(0, 10));
          setScheduledTime(date.toTimeString().slice(0, 5));
        }
      } else {
        // Reset for new post
        setPostType("POST");
        setCaption("");
        setMediaUrls([]);
        setLocation("");
        setHashtags([]);
        setMusic("");
        setTaggedUsers([]);
        setCollaborators([]);
        setSelectedAutomation("");
        if (initialDate) {
          setScheduledDate(initialDate.toISOString().slice(0, 10));
          setScheduledTime("09:00");
        } else {
          setScheduledDate(new Date().toISOString().slice(0, 10));
          setScheduledTime("09:00");
        }
      }
      setCurrentSlide(0);
      setShowMediaInput(false);
    }
  }, [isOpen, post, initialDate]);

  if (!isOpen) return null;

  const addMediaUrl = () => {
    if (newMediaUrl.trim()) {
      setMediaUrls([...mediaUrls, newMediaUrl.trim()]);
      setNewMediaUrl("");
      setShowMediaInput(false);
    }
  };

  const removeMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
    if (currentSlide >= mediaUrls.length - 1 && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const addHashtag = () => {
    if (newHashtag.trim() && !hashtags.includes(newHashtag.trim())) {
      setHashtags([...hashtags, newHashtag.trim().replace(/^#/, "")]);
      setNewHashtag("");
    }
  };

  const addTaggedUser = () => {
    if (newTag.trim() && !taggedUsers.includes(newTag.trim())) {
      setTaggedUsers([...taggedUsers, newTag.trim().replace(/^@/, "")]);
      setNewTag("");
    }
  };

  const addCollaborator = () => {
    if (newCollab.trim() && !collaborators.includes(newCollab.trim())) {
      setCollaborators([...collaborators, newCollab.trim().replace(/^@/, "")]);
      setNewCollab("");
    }
  };

  const getScheduledDateTime = () => {
    const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    return dateTime;
  };

  const getPostData = (): Partial<ScheduledPost> => ({
    ...post,
    id: post?.id || `new-${Date.now()}`,
    postType,
    caption,
    mediaUrl: mediaUrls[0],
    mediaUrls,
    mediaType: mediaUrls.length > 1 ? "CAROUSEL" : postType === "REEL" ? "VIDEO" : "IMAGE",
    location,
    hashtags,
    music,
    taggedUsers,
    collaborators,
    automationId: selectedAutomation || undefined,
    scheduledFor: getScheduledDateTime(),
    status: "SCHEDULED",
  });

  const handleSchedule = () => {
    if (!scheduledDate) {
      toast.error("Please set a schedule date");
      return;
    }
    onSchedule?.(getPostData());
    toast.success("Post scheduled!");
    onClose();
  };

  const handlePostNow = () => {
    onPostNow?.(getPostData());
    toast.success("Publishing post...");
    onClose();
  };

  const handleSaveDraft = () => {
    onSaveDraft?.(getPostData());
    toast.success("Saved to drafts");
    onClose();
  };

  const currentTime = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  // Instagram Post Preview
  const InstagramPostPreview = () => (
    <div className="bg-white dark:bg-black h-full flex flex-col">
      {/* Instagram Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-0.5">
            <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">your_account</span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location..."
              className="text-[10px] text-gray-500 bg-transparent border-none outline-none w-full placeholder:text-gray-400 block"
            />
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-gray-400" />
      </div>
      
      {/* Media Area */}
      <div className="aspect-square bg-gray-50 dark:bg-gray-900 relative flex-shrink-0">
        {mediaUrls.length > 0 ? (
          <>
            <img src={mediaUrls[currentSlide]} alt="" className="w-full h-full object-cover" />
            {mediaUrls.length > 1 && (
              <>
                {currentSlide > 0 && (
                  <button onClick={() => setCurrentSlide(c => c - 1)} className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {currentSlide < mediaUrls.length - 1 && (
                  <button onClick={() => setCurrentSlide(c => c + 1)} className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                <div className="absolute top-2 right-2 bg-black/60 rounded-full px-2 py-0.5 text-[10px] text-white flex items-center gap-1">
                  <Layers className="w-2.5 h-2.5" />
                  {currentSlide + 1}/{mediaUrls.length}
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {mediaUrls.map((_, i) => (
                    <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i === currentSlide ? "bg-blue-500" : "bg-white/60")} />
                  ))}
                </div>
              </>
            )}
            <button onClick={() => removeMedia(currentSlide)} className="absolute top-2 left-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Trash2 className="w-3 h-3 text-white" />
            </button>
          </>
        ) : (
          <button onClick={() => setShowMediaInput(true)} className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600">
            <Image className="w-10 h-10" />
            <span className="text-xs">Add Media</span>
          </button>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-1 p-2 bg-gray-50 dark:bg-gray-900 overflow-x-auto">
        {mediaUrls.map((url, i) => (
          <button key={i} onClick={() => setCurrentSlide(i)} className={cn("w-10 h-10 rounded shrink-0 overflow-hidden", i === currentSlide && "ring-2 ring-blue-500")}>
            <img src={url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
        <button onClick={() => setShowMediaInput(true)} className="w-10 h-10 shrink-0 rounded border border-dashed border-gray-300 flex items-center justify-center hover:border-blue-400">
          <Plus className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {showMediaInput && (
        <div className="p-2 bg-gray-100 dark:bg-gray-800">
          <div className="flex gap-1">
            <input type="url" value={newMediaUrl} onChange={(e) => setNewMediaUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addMediaUrl()} placeholder="Paste URL..." className="flex-1 px-2 py-1 text-xs rounded border" autoFocus />
            <Button size="sm" className="h-7 text-xs" onClick={addMediaUrl}>Add</Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-3 py-1.5 flex items-center justify-between">
        <div className="flex gap-3">
          <Heart className="w-5 h-5" />
          <MessageCircle className="w-5 h-5" />
          <Send className="w-5 h-5" />
        </div>
        <Bookmark className="w-5 h-5" />
      </div>

      {/* Caption */}
      <div className="px-3 flex-1 overflow-y-auto">
        <div className="flex gap-1 text-xs">
          <span className="font-semibold">your_account</span>
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write caption..." rows={2} className="flex-1 bg-transparent outline-none resize-none placeholder:text-gray-400 text-xs" />
        </div>
        
        {/* Hashtags */}
        <div className="flex flex-wrap gap-1 mt-1">
          {hashtags.map((h, i) => (
            <button key={i} onClick={() => setHashtags(hashtags.filter((_, idx) => idx !== i))} className="text-[10px] text-blue-500">#{h}</button>
          ))}
          <input type="text" value={newHashtag} onChange={(e) => setNewHashtag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHashtag())} placeholder="#tag" className="text-[10px] text-blue-500 w-12 bg-transparent outline-none placeholder:text-blue-300" />
        </div>

        {/* Tags & Collabs */}
        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <AtSign className="w-3 h-3 text-gray-400" />
          {taggedUsers.map((u, i) => (
            <button key={i} onClick={() => setTaggedUsers(taggedUsers.filter((_, idx) => idx !== i))} className="text-[10px] text-blue-600 bg-blue-50 px-1 rounded">@{u}</button>
          ))}
          <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTaggedUser())} placeholder="@user" className="text-[10px] w-12 bg-transparent outline-none placeholder:text-gray-400" />
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          <Users className="w-3 h-3 text-gray-400" />
          {collaborators.map((c, i) => (
            <button key={i} onClick={() => setCollaborators(collaborators.filter((_, idx) => idx !== i))} className="text-[10px] text-purple-600 bg-purple-50 px-1 rounded">@{c}</button>
          ))}
          <input type="text" value={newCollab} onChange={(e) => setNewCollab(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCollaborator())} placeholder="@collab" className="text-[10px] w-12 bg-transparent outline-none placeholder:text-gray-400" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative flex gap-6 items-start">
        {/* iPhone Frame */}
        <div className="relative">
          {/* iPhone Outer Frame */}
          <div className="relative w-[320px] h-[680px] bg-gray-900 rounded-[50px] p-3 shadow-2xl">
            {/* iPhone Inner Bezel */}
            <div className="w-full h-full bg-black rounded-[38px] overflow-hidden relative">
              {/* Dynamic Island */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 flex items-center justify-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
              </div>
              
              {/* Status Bar */}
              <div className="absolute top-0 left-0 right-0 h-12 z-10 flex items-end justify-between px-8 pb-1">
                <span className="text-white text-xs font-semibold">{currentTime}</span>
                <div className="flex items-center gap-1">
                  <Signal className="w-3.5 h-3.5 text-white" />
                  <Wifi className="w-3.5 h-3.5 text-white" />
                  <Battery className="w-5 h-3 text-white" />
                </div>
              </div>

              {/* Screen Content */}
              <div className="w-full h-full pt-12 flex flex-col">
                {/* Post Type Tabs */}
                <div className="flex bg-gray-100 dark:bg-gray-800 mx-2 rounded-lg p-0.5">
                  {POST_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setPostType(type.value)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-medium transition-all",
                        postType === type.value ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow" : "text-gray-500"
                      )}
                    >
                      <type.icon className="w-3 h-3" />
                      {type.label}
                    </button>
                  ))}
                </div>

                {/* Preview Content */}
                <div className="flex-1 overflow-hidden mt-1">
                  <InstagramPostPreview />
                </div>

                {/* Home Indicator */}
                <div className="h-8 flex items-center justify-center">
                  <div className="w-32 h-1 bg-white/30 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel - Schedule & Actions */}
        <div className="w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">Schedule Post</h3>
          </div>

          <div className="p-4 space-y-4">
            {/* Date Picker */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* Time Picker */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                <Clock className="w-3 h-3" /> Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              />
            </div>

            {/* Automation */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                <Zap className="w-3 h-3" /> Automation
              </label>
              <select
                value={selectedAutomation}
                onChange={(e) => setSelectedAutomation(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              >
                <option value="">None</option>
                {automations.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSchedule}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={handlePostNow}>
                <Send className="w-4 h-4 mr-1" />
                Post Now
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleSaveDraft}>
                <Save className="w-4 h-4 mr-1" />
                Draft
              </Button>
            </div>
            {post?.id && (
              <Button variant="outline" className="w-full text-red-600 hover:bg-red-50" onClick={() => { onDelete?.(post.id); onClose(); }}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>

          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
