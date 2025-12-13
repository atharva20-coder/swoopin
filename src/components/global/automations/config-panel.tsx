"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Node } from "reactflow";
import { FlowNodeData } from "./flow-node";
import { useQueryAutomation, useQueryUser, useQueryAutomationPosts } from "@/hooks/user-queries";
import { useListener, useAutomationPosts, useEditAutomation, useDeleteAutomation } from "@/hooks/use-automations";
import { Loader2, Save, X, CheckCircle, Film, ImageIcon, Edit2, Check } from "lucide-react";
import CarouselTemplateForm from "../carouselTemplateForm";
import Image from "next/image";
import { InstagramPostProps } from "@/types/posts.type";
import { Button } from "@/components/ui/button";
import Loader from "../loader";
import ActivateAutomationButton from "../activate-automation-button";
import { toast } from "sonner";
import { useDebouncedCallback } from "@/hooks/use-debounce";

type ConfigPanelProps = {
  id: string;
  selectedNode?: Node<FlowNodeData> | null;
  onUpdateNode?: (nodeId: string, config: Record<string, any>) => void;
  onDeleteNode?: (nodeId: string) => void;
  className?: string;
};

const ConfigPanel = ({ id, selectedNode, onUpdateNode, onDeleteNode, className }: ConfigPanelProps) => {
  const { data } = useQueryAutomation(id);
  const { data: userData } = useQueryUser();
  const { data: instagramPosts } = useQueryAutomationPosts();
  const { posts: selectedPosts, onSelectPost, mutate: savePosts, isPending: isSavingPosts } = useAutomationPosts(id);
  const { onSetListener, register, onFormSubmit, listener, isPending } = useListener(id);
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [expanded, setExpanded] = useState(true);

  const isPro = userData?.data?.subscription?.plan === "PRO";

  // Load existing config when node is selected
  useEffect(() => {
    if (selectedNode?.data?.config) {
      setFormData(selectedNode.data.config);
    } else {
      setFormData({});
    }
  }, [selectedNode]);

  const handleSave = () => {
    if (!selectedNode) return;
    
    // Set the listener type based on node
    const listenerTypeMap: Record<string, "SMARTAI" | "MESSAGE" | "CAROUSEL"> = {
      MESSAGE: "MESSAGE",
      REPLY_COMMENT: "MESSAGE",
      CAROUSEL: "CAROUSEL",
      SMARTAI: "SMARTAI",
    };

    const listenerType = listenerTypeMap[selectedNode.data.subType];
    
    if (listenerType) {
      onSetListener(listenerType);
    }

    if (onUpdateNode) {
      onUpdateNode(selectedNode.id, formData);
      toast.success("Configuration saved!", {
        description: `${selectedNode.data.label} configuration updated.`,
      });
    }
  };

  const [newKeyword, setNewKeyword] = useState("");

  const addKeyword = () => {
    if (!newKeyword.trim() || !selectedNode) return;
    const currentKeywords = formData.keywords || [];
    if (!currentKeywords.includes(newKeyword.trim())) {
      const updatedKeywords = [...currentKeywords, newKeyword.trim()];
      const newConfig = { ...formData, keywords: updatedKeywords };
      setFormData(newConfig);
      // Auto-save to node
      if (onUpdateNode) {
        onUpdateNode(selectedNode.id, newConfig);
        toast.success("Keyword added!", {
          description: `"${newKeyword.trim()}" will trigger this automation.`,
        });
      }
    }
    setNewKeyword("");
  };

  const removeKeyword = (keyword: string) => {
    if (!selectedNode) return;
    const currentKeywords = formData.keywords || [];
    const updatedKeywords = currentKeywords.filter((k: string) => k !== keyword);
    const newConfig = { ...formData, keywords: updatedKeywords };
    setFormData(newConfig);
    // Auto-save to node
    if (onUpdateNode) {
      onUpdateNode(selectedNode.id, newConfig);
      toast.success("Keyword removed!", {
        description: `"${keyword}" has been removed.`,
      });
    }
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  const renderTriggerConfig = () => (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          {selectedNode?.data.label}
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          {selectedNode?.data.subType === "DM" && "Triggers when a user sends a direct message"}
          {selectedNode?.data.subType === "COMMENT" && "Triggers when a user comments on a post"}
          {selectedNode?.data.subType === "KEYWORDS" && "Triggers when a message contains specific keywords"}
        </p>
      </div>

      {selectedNode?.data.subType === "KEYWORDS" && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Keywords to Match
          </label>
          
          {/* Current keywords list */}
          <div className="flex flex-wrap gap-2">
            {(formData.keywords || []).map((keyword: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
              >
                <span>{keyword}</span>
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:text-red-500 dark:hover:text-red-400"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Add new keyword input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={handleKeywordKeyDown}
              placeholder="Enter keyword and press Enter..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addKeyword}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Messages containing any of these keywords will trigger this automation.
          </p>

          {/* Save Configuration Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || !formData.keywords || formData.keywords.length === 0}
            className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isPending ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      )}
    </div>
  );

  // Debounced auto-save to prevent rapid API calls
  const debouncedAutoSave = useDebouncedCallback(
    (nodeId: string, config: Record<string, any>) => {
      if (onUpdateNode) {
        onUpdateNode(nodeId, config);
      }
    },
    300
  );

  const handleAutoSave = (field: string, value: any) => {
    if (!selectedNode || !onUpdateNode) return;
    const newConfig = { ...formData, [field]: value };
    setFormData(newConfig);
    debouncedAutoSave(selectedNode.id, newConfig);
  };

  const renderMessageConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Message to Send
        </label>
        <textarea
          value={formData.message || ""}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          onBlur={(e) => handleAutoSave("message", e.target.value)}
          placeholder="Enter your message..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        />
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || !formData.message}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isPending ? "Saving..." : "Save Configuration"}
      </button>
    </div>
  );

  const renderReplyCommentConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Comment Reply
        </label>
        <textarea
          value={formData.commentReply || ""}
          onChange={(e) => setFormData({ ...formData, commentReply: e.target.value })}
          onBlur={(e) => handleAutoSave("commentReply", e.target.value)}
          placeholder="Enter your reply..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        />
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || !formData.commentReply}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isPending ? "Saving..." : "Save Configuration"}
      </button>
    </div>
  );

  const renderSmartAIConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          AI Prompt
        </label>
        <textarea
          value={formData.prompt || ""}
          onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
          onBlur={(e) => handleAutoSave("prompt", e.target.value)}
          placeholder="Describe how AI should respond..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        AI will use this prompt to generate contextual responses.
      </p>
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || !formData.prompt}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isPending ? "Saving..." : "Save Configuration"}
      </button>
    </div>
  );

  const renderCarouselConfig = () => {
    const hasCarouselTemplate = data?.data?.carouselTemplates && data.data.carouselTemplates.length > 0;
    const template = data?.data?.carouselTemplates?.[0];

    return (
      <div className="space-y-4">
        {!isPro ? (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Upgrade to PRO to use carousel templates
            </p>
          </div>
        ) : hasCarouselTemplate ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Carousel template configured
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {template?.elements?.map((element: any, index: number) => (
                <div key={index} className="min-w-[150px] bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 flex-shrink-0">
                  {element.imageUrl && (
                    <div className="w-full h-16 bg-gray-100 dark:bg-gray-700 rounded mb-2 overflow-hidden relative">
                      <Image src={element.imageUrl} alt={element.title || ""} fill className="object-cover" />
                    </div>
                  )}
                  <p className="text-xs font-medium truncate text-gray-900 dark:text-gray-100">{element.title}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <CarouselTemplateForm automationId={id} onSuccess={() => {}} />
        )}
      </div>
    );
  };

  const renderPostsConfig = () => {
    // Already attached posts from automation
    const attachedPosts = data?.data?.posts || [];
    // All Instagram posts available
    const allPosts = instagramPosts?.data?.data || [];
    
    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Select Posts
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Choose Instagram posts to attach to this trigger
          </p>
        </div>

        {/* Already attached posts */}
        {attachedPosts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Currently Attached ({attachedPosts.length})
            </p>
            <div className="grid grid-cols-3 gap-2">
              {attachedPosts.map((post: any) => (
                <div
                  key={post.postid}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
                >
                  <Image
                    fill
                    src={post.media}
                    alt="Attached post"
                    className="object-cover"
                    sizes="80px"
                  />
                  <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                    <CheckCircle className="text-white" size={20} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Instagram posts for selection */}
        {allPosts.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Posts to Attach
            </p>
            <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
              {allPosts.map((post: InstagramPostProps) => (
                <div
                  key={post.id}
                  className="relative aspect-square rounded-lg cursor-pointer overflow-hidden bg-gray-100 dark:bg-gray-800 group hover:ring-2 hover:ring-blue-500 transition-all"
                  onClick={() => onSelectPost({
                    postid: post.id,
                    media: post.media_url,
                    mediaType: post.media_type,
                    caption: post.caption,
                  })}
                >
                  {post.media_type === "VIDEO" ? (
                    <>
                      <video
                        src={post.media_url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                      <Film className="absolute top-1 right-1 text-white/90 z-10" size={14} />
                    </>
                  ) : (
                    <>
                      <Image
                        fill
                        src={post.media_url}
                        alt={post.caption || "Instagram post"}
                        className="object-cover"
                        sizes="80px"
                      />
                      {post.media_type === "CAROUSEL_ALBUM" && (
                        <ImageIcon className="absolute top-1 right-1 text-white/90 z-10" size={14} />
                      )}
                    </>
                  )}
                  {selectedPosts.find((p) => p.postid === post.id) && (
                    <div className="absolute inset-0 bg-blue-500/50 flex items-center justify-center">
                      <CheckCircle className="text-white" size={20} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button
              onClick={() => savePosts(undefined as any)}
              disabled={selectedPosts.length === 0 || isSavingPosts}
              className="w-full"
            >
              <Loader state={isSavingPosts}>
                Attach {selectedPosts.length} Post{selectedPosts.length !== 1 ? 's' : ''}
              </Loader>
            </Button>
          </div>
        ) : (
          <div className="p-4 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No Instagram posts found
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Connect your Instagram account to see your posts
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderConditionConfig = () => (
    <div className="space-y-4">
      <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
          {selectedNode?.data.label}
        </h4>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          {selectedNode?.data.description}
        </p>
      </div>

      {selectedNode?.data.subType === "DELAY" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Delay Duration (seconds)
          </label>
          <input
            type="number"
            value={formData.delay || 0}
            onChange={(e) => setFormData({ ...formData, delay: parseInt(e.target.value) })}
            placeholder="Enter delay in seconds"
            min={0}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      )}

      {selectedNode?.data.subType === "HAS_TAG" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tag Name
          </label>
          <input
            type="text"
            value={formData.tagName || ""}
            onChange={(e) => setFormData({ ...formData, tagName: e.target.value })}
            placeholder="Enter tag name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      )}
    </div>
  );

  const renderConfigForm = () => {
    if (!selectedNode) return null;

    switch (selectedNode.data.subType) {
      case "DM":
      case "COMMENT":
      case "KEYWORDS":
        return renderTriggerConfig();
      case "MESSAGE":
        return renderMessageConfig();
      case "REPLY_COMMENT":
        return renderReplyCommentConfig();
      case "SMARTAI":
        return renderSmartAIConfig();
      case "CAROUSEL":
        return renderCarouselConfig();
      case "POSTS":
      case "SELECT_POSTS":
        return renderPostsConfig();
      case "YES":
      case "NO":
      case "IS_FOLLOWER":
      case "DELAY":
      case "HAS_TAG":
        return renderConditionConfig();
      default:
        return (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No configuration available for this node type.
          </p>
        );
    }
  };

  return (
    <div
      className={cn(
        "w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {selectedNode ? "Configure Node" : "Configuration"}
        </h2>
        {selectedNode && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {selectedNode.data.type === "trigger" ? "Trigger" : "Action"}: {selectedNode.data.label}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedNode ? (
          <div className="space-y-4">
            {renderConfigForm()}

            {/* Delete Node Button */}
            {onDeleteNode && (
              <button
                onClick={() => onDeleteNode(selectedNode.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                Delete Node
              </button>
            )}
          </div>
        ) : (
          <AutomationControls automationId={id} automationData={data?.data} />
        )}
      </div>
    </div>
  );
};

// Automation Controls Component (shown when no node is selected)
const AutomationControls = ({ automationId, automationData }: { automationId: string; automationData: any }) => {
  const { inputRef, edit, enableEdit, disableEdit, isPending, mutate } = useEditAutomation(automationId);
  const { isPending: isDeleting, mutate: deleteAutomation } = useDeleteAutomation(automationId);
  const [name, setName] = useState(automationData?.name || "Untitled Automation");

  useEffect(() => {
    setName(automationData?.name || "Untitled Automation");
  }, [automationData?.name]);

  const handleSaveName = () => {
    if (name && name !== automationData?.name) {
      mutate({ name });
    }
    disableEdit();
  };

  const handleDeleteAutomation = () => {
    if (confirm("Are you sure you want to delete this automation? This action cannot be undone.")) {
      deleteAutomation({}, {
        onSuccess: () => {
          // Get the slug from the URL and redirect
          const pathParts = window.location.pathname.split('/');
          const slug = pathParts[2];
          window.location.href = `/dashboard/${slug}/automations`;
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Automation Name */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Automation Name
        </h3>
        <div className="relative p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {edit ? (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveName();
                  }
                }}
                className="flex-1 text-lg font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              {isPending && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            </div>
          ) : (
            <div className="flex items-center justify-between group">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {name}
              </p>
              <button
                onClick={enableEdit}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
              >
                <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Status */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Status
        </h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              automationData?.active ? "bg-green-500" : "bg-gray-400"
            )} />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {automationData?.active ? "Active" : "Inactive"}
            </span>
          </div>
          <ActivateAutomationButton id={automationId} />
        </div>
      </div>

      {/* Automation Stats */}
      {automationData?.listener && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Activity
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">DMs Sent</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                {automationData.listener.dmCount || 0}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">Comments</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                {automationData.listener.commentCount || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Button */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="destructive"
          className="w-full"
          disabled={isDeleting}
          onClick={handleDeleteAutomation}
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Deleting...
            </>
          ) : (
            "Delete Automation"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ConfigPanel;
