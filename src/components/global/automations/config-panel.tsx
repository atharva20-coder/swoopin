"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Node } from "reactflow";
import { FlowNodeData } from "./flow-node";
import {
  useQueryAutomation,
  useQueryUser,
  useQueryAutomationPosts,
  useQueryYouTubeVideos,
} from "@/hooks/user-queries";
import {
  useListener,
  useAutomationPosts,
  useEditAutomation,
  useDeleteAutomation,
  useDetachPost,
} from "@/hooks/use-automations";
import {
  Loader2,
  Save,
  X,
  CheckCircle,
  Film,
  ImageIcon,
  Edit2,
  Check,
  ChevronLeft,
  ChevronRight,
  Reply,
} from "lucide-react";
import CarouselTemplateForm from "../carouselTemplateForm";
import Image from "next/image";
import { InstagramPostProps } from "@/types/posts.type";
import { Button } from "@/components/ui/button";
import Loader from "../loader";
import ActivateAutomationButton from "../activate-automation-button";
import { toast } from "sonner";
import { useDebouncedCallback } from "@/hooks/use-debounce";
import SheetPicker from "@/components/global/sheet-picker";

type ConfigPanelProps = {
  id: string;
  selectedNode?: Node<FlowNodeData> | null;
  onUpdateNode?: (nodeId: string, config: Record<string, any>) => void;
  onDeleteNode?: (nodeId: string) => void;
  className?: string;
};

const ConfigPanel = ({
  id,
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  className,
}: ConfigPanelProps) => {
  const { data } = useQueryAutomation(id);
  const { data: userData } = useQueryUser();
  const { data: instagramPosts } = useQueryAutomationPosts();
  const {
    posts: selectedPosts,
    onSelectPost,
    mutate: savePosts,
    isPending: isSavingPosts,
  } = useAutomationPosts(id);
  const { detach: detachPost, isDetaching } = useDetachPost(id);
  const { onSetListener, register, onFormSubmit, listener, isPending } =
    useListener(id);

  const [formData, setFormData] = useState<Record<string, any>>({});
  // Use expanded for the node config sections if needed, but we need a panel-level collapse
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  const isPro = userData?.data?.subscription?.plan === "PRO";

  // Load existing config when node is selected
  useEffect(() => {
    if (selectedNode?.data?.config) {
      setFormData(selectedNode.data.config);
      // Auto-expand panel when a node is selected
      setIsPanelExpanded(true);
    } else {
      setFormData({});
    }
  }, [selectedNode]);

  const handleSave = () => {
    if (!selectedNode) return;

    // Set the listener type based on node
    const listenerTypeMap: Record<string, "SMARTAI" | "MESSAGE" | "CAROUSEL"> =
      {
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
    const updatedKeywords = currentKeywords.filter(
      (k: string) => k !== keyword,
    );
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
          {selectedNode?.data.subType === "DM" &&
            "Triggers when a user sends a direct message"}
          {selectedNode?.data.subType === "COMMENT" &&
            "Triggers when a user comments on a post"}
          {selectedNode?.data.subType === "KEYWORDS" &&
            "Triggers when a message contains specific keywords"}
          {selectedNode?.data.subType === "STORY_REPLY" &&
            "Triggers when a user replies to your story"}
          {selectedNode?.data.subType === "POSTBACK" &&
            "Triggers when a user clicks a button you sent"}
        </p>
      </div>

      {(selectedNode?.data.subType === "KEYWORDS" ||
        selectedNode?.data.subType === "POSTBACK") && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {selectedNode?.data.subType === "POSTBACK"
              ? "Payloads to Match"
              : "Keywords to Match"}
          </label>

          {selectedNode?.data.subType === "POSTBACK" && (
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 mb-2">
              Enter the exact payload values from your buttons (e.g., BUY_NOW,
              YES, INTERESTED)
            </p>
          )}

          {/* Current keywords/payloads list */}
          <div className="flex flex-wrap gap-2">
            {(formData.keywords || []).map((keyword: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-mono"
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

          {/* Add new keyword/payload input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) =>
                setNewKeyword(
                  selectedNode?.data.subType === "POSTBACK"
                    ? e.target.value.toUpperCase().replace(/\s+/g, "_")
                    : e.target.value,
                )
              }
              onKeyDown={handleKeywordKeyDown}
              placeholder={
                selectedNode?.data.subType === "POSTBACK"
                  ? "e.g., BUY_NOW, INTERESTED..."
                  : "Enter keyword and press Enter..."
              }
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
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
            {selectedNode?.data.subType === "POSTBACK"
              ? "When a user clicks a button with any of these payloads, this automation triggers."
              : "Messages containing any of these keywords will trigger this automation."}
          </p>

          {/* Save Configuration Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={
              isPending || !formData.keywords || formData.keywords.length === 0
            }
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
    300,
  );

  const handleAutoSave = (field: string, value: any) => {
    if (!selectedNode || !onUpdateNode) return;
    const newConfig = { ...formData, [field]: value };
    setFormData(newConfig);
    debouncedAutoSave(selectedNode.id, newConfig);
  };

  const renderMessageConfig = () => (
    <div className="space-y-4">
      {/* Info box */}
      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
        <p className="text-sm text-green-700 dark:text-green-300">
          📩 This message will be sent as a DM to the user who triggered the
          automation.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Message to Send
        </label>
        <textarea
          value={formData.message || ""}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          onBlur={(e) => handleAutoSave("message", e.target.value)}
          placeholder="Enter your message..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Live Preview */}
      {formData.message && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Preview
          </label>
          <div className="p-3 bg-gray-100 dark:bg-neutral-800 rounded-xl">
            <div className="flex justify-end">
              <div className="max-w-[85%] px-4 py-2 bg-blue-500 text-white rounded-2xl rounded-br-md text-sm">
                {formData.message}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || !formData.message}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isPending ? "Saving..." : "Save Message"}
      </button>
    </div>
  );

  const renderReplyCommentConfig = () => (
    <div className="space-y-4">
      {/* Info box */}
      <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
        <p className="text-sm text-orange-700 dark:text-orange-300">
          💬 This reply will be posted publicly under the user&apos;s comment on
          your post.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Comment Reply
        </label>
        <textarea
          value={formData.commentReply || ""}
          onChange={(e) =>
            setFormData({ ...formData, commentReply: e.target.value })
          }
          onBlur={(e) => handleAutoSave("commentReply", e.target.value)}
          placeholder="Enter your reply..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Live Preview */}
      {formData.commentReply && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Preview
          </label>
          <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                Y
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  Your Business
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                  {formData.commentReply}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || !formData.commentReply}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isPending ? "Saving..." : "Save Reply"}
      </button>
    </div>
  );

  const renderSmartAIConfig = () => (
    <div className="space-y-4">
      {/* Info Box */}
      <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
        <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
          ✨ Gemini AI Powered
        </h4>
        <p className="text-sm text-purple-700 dark:text-purple-300">
          Responds as you, using chat history for context. Rate limited: 5
          msgs/min per user.
        </p>
      </div>

      {/* Persona Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Persona & Response Style
        </label>
        <textarea
          value={formData.prompt || ""}
          onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
          onBlur={(e) => handleAutoSave("prompt", e.target.value)}
          placeholder="Describe how you communicate, your brand voice, and what you want AI to help with..."
          rows={5}
          maxLength={750}
          className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {(formData.prompt || "").length}/750 characters
        </p>
      </div>

      {/* Example Prompts */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Example prompts:
        </p>
        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <p className="p-2 bg-gray-50 dark:bg-neutral-800 rounded">
            &quot;I&apos;m a friendly fitness coach. Help users with workout
            tips and motivation. Keep it upbeat!&quot;
          </p>
          <p className="p-2 bg-gray-50 dark:bg-neutral-800 rounded">
            &quot;I run a bakery. Answer questions about our menu, hours
            (9am-6pm), and take cake orders.&quot;
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        AI uses conversation history to personalize responses and maintain
        context.
      </p>

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || !formData.prompt}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isPending ? "Saving..." : "Save AI Configuration"}
      </button>
    </div>
  );

  const renderCarouselConfig = () => {
    const hasCarouselTemplate =
      data?.data?.carouselTemplates && data.data.carouselTemplates.length > 0;
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
                <div
                  key={index}
                  className="min-w-[150px] bg-white dark:bg-neutral-800 p-2 rounded border border-gray-200 dark:border-neutral-700 flex-shrink-0"
                >
                  {element.imageUrl && (
                    <div className="w-full h-16 bg-gray-100 dark:bg-neutral-700 rounded mb-2 overflow-hidden relative">
                      <Image
                        src={element.imageUrl}
                        alt={element.title || ""}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="text-xs font-medium truncate text-gray-900 dark:text-gray-100">
                    {element.title}
                  </p>
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

  const renderButtonTemplateConfig = () => {
    const buttons = formData.buttons || [];

    const addButton = () => {
      if (buttons.length >= 3) {
        toast.error("Maximum 3 buttons allowed");
        return;
      }
      const newButtons = [...buttons, { type: "web_url", title: "", url: "" }];
      setFormData({ ...formData, buttons: newButtons });
    };

    const updateButton = (index: number, field: string, value: string) => {
      const newButtons = buttons.map((btn: any, i: number) =>
        i === index ? { ...btn, [field]: value } : btn,
      );
      setFormData({ ...formData, buttons: newButtons });
    };

    const removeButton = (index: number) => {
      const newButtons = buttons.filter((_: any, i: number) => i !== index);
      setFormData({ ...formData, buttons: newButtons });
    };

    return (
      <div className="space-y-4">
        {/* Message Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message Text
          </label>
          <textarea
            value={formData.text || ""}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            onBlur={(e) => handleAutoSave("text", e.target.value)}
            placeholder="Enter message text (appears above buttons)..."
            rows={3}
            maxLength={640}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            {(formData.text || "").length}/640 characters
          </p>
        </div>

        {/* Buttons */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Buttons ({buttons.length}/3)
            </label>
            {buttons.length < 3 && (
              <button
                type="button"
                onClick={addButton}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Button
              </button>
            )}
          </div>

          <div className="space-y-3">
            {buttons.map((button: any, index: number) => (
              <div
                key={index}
                className="p-3 border border-gray-200 dark:border-neutral-700 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    Button {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeButton(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>

                {/* Button Type */}
                <select
                  value={button.type}
                  onChange={(e) => updateButton(index, "type", e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                >
                  <option value="web_url">URL Button</option>
                  <option value="postback">Postback Button</option>
                </select>

                {/* Button Title */}
                <input
                  type="text"
                  value={button.title}
                  onChange={(e) => updateButton(index, "title", e.target.value)}
                  placeholder="Button text (max 20 chars)"
                  maxLength={20}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                />

                {/* URL or Payload */}
                {button.type === "web_url" ? (
                  <input
                    type="url"
                    value={button.url || ""}
                    onChange={(e) => updateButton(index, "url", e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                  />
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={button.payload || ""}
                      onChange={(e) =>
                        updateButton(
                          index,
                          "payload",
                          e.target.value.toUpperCase().replace(/\s+/g, "_"),
                        )
                      }
                      placeholder="e.g., BUY_NOW, VIEW_DETAILS, GET_STARTED"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white font-mono"
                    />
                    <p className="text-[10px] text-gray-400">
                      Unique ID sent to your webhook when clicked
                    </p>
                  </div>
                )}
              </div>
            ))}

            {buttons.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                Add at least one button
              </p>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !formData.text || buttons.length === 0}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isPending ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    );
  };

  const renderIceBreakersConfig = () => {
    const iceBreakers = formData.iceBreakers || [];

    const addIceBreaker = () => {
      if (iceBreakers.length >= 4) {
        toast.error("Maximum 4 ice breakers allowed");
        return;
      }
      const newIceBreakers = [...iceBreakers, { question: "", payload: "" }];
      setFormData({ ...formData, iceBreakers: newIceBreakers });
    };

    const updateIceBreaker = (index: number, field: string, value: string) => {
      const newIceBreakers = iceBreakers.map((ib: any, i: number) =>
        i === index ? { ...ib, [field]: value } : ib,
      );
      setFormData({ ...formData, iceBreakers: newIceBreakers });
    };

    const removeIceBreaker = (index: number) => {
      const newIceBreakers = iceBreakers.filter(
        (_: any, i: number) => i !== index,
      );
      setFormData({ ...formData, iceBreakers: newIceBreakers });
    };

    return (
      <div className="space-y-4">
        {/* Info Box */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Ice Breakers
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            FAQ questions shown when users start a conversation. Max 4
            questions.
          </p>
        </div>

        {/* Ice Breakers List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Questions ({iceBreakers.length}/4)
            </label>
            {iceBreakers.length < 4 && (
              <button
                type="button"
                onClick={addIceBreaker}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Question
              </button>
            )}
          </div>

          <div className="space-y-3">
            {iceBreakers.map((ib: any, index: number) => (
              <div
                key={index}
                className="p-3 border border-gray-200 dark:border-neutral-700 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    Question {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeIceBreaker(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>

                {/* Question */}
                <input
                  type="text"
                  value={ib.question}
                  onChange={(e) =>
                    updateIceBreaker(index, "question", e.target.value)
                  }
                  placeholder="e.g., What are your business hours?"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                />

                {/* Payload */}
                <div className="space-y-1">
                  <input
                    type="text"
                    value={ib.payload}
                    onChange={(e) =>
                      updateIceBreaker(
                        index,
                        "payload",
                        e.target.value.toUpperCase().replace(/\s+/g, "_"),
                      )
                    }
                    placeholder="e.g., HOURS_INFO, PRICING, CONTACT_US"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white font-mono"
                  />
                  <p className="text-[10px] text-gray-400">
                    Action ID when user taps this option
                  </p>
                </div>
              </div>
            ))}

            {iceBreakers.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                Add at least one ice breaker question
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Ice breakers appear as quick-reply options when users start a new
          conversation.
        </p>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={
            isPending ||
            iceBreakers.length === 0 ||
            iceBreakers.some((ib: any) => !ib.question || !ib.payload)
          }
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isPending ? "Saving..." : "Save Ice Breakers"}
        </button>
      </div>
    );
  };

  const renderPersistentMenuConfig = () => {
    const menuItems = formData.menuItems || [];

    const addMenuItem = () => {
      if (menuItems.length >= 5) {
        toast.error("Maximum 5 menu items recommended");
        return;
      }
      const newItems = [
        ...menuItems,
        { type: "postback", title: "", payload: "" },
      ];
      setFormData({ ...formData, menuItems: newItems });
    };

    const updateMenuItem = (index: number, field: string, value: string) => {
      const newItems = menuItems.map((item: any, i: number) =>
        i === index ? { ...item, [field]: value } : item,
      );
      setFormData({ ...formData, menuItems: newItems });
    };

    const removeMenuItem = (index: number) => {
      const newItems = menuItems.filter((_: any, i: number) => i !== index);
      setFormData({ ...formData, menuItems: newItems });
    };

    return (
      <div className="space-y-4">
        {/* Info Box */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Persistent Menu
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Always-visible menu in conversations. Limit to 5 items for best UX.
          </p>
        </div>

        {/* Menu Items List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Menu Items ({menuItems.length}/5)
            </label>
            {menuItems.length < 5 && (
              <button
                type="button"
                onClick={addMenuItem}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Item
              </button>
            )}
          </div>

          <div className="space-y-3">
            {menuItems.map((item: any, index: number) => (
              <div
                key={index}
                className="p-3 border border-gray-200 dark:border-neutral-700 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    Item {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMenuItem(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>

                {/* Item Type */}
                <select
                  value={item.type}
                  onChange={(e) =>
                    updateMenuItem(index, "type", e.target.value)
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                >
                  <option value="postback">Postback (Action)</option>
                  <option value="web_url">URL (Open Link)</option>
                </select>

                {/* Title */}
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) =>
                    updateMenuItem(index, "title", e.target.value)
                  }
                  placeholder="Menu item title"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                />

                {/* URL or Payload */}
                {item.type === "web_url" ? (
                  <input
                    type="url"
                    value={item.url || ""}
                    onChange={(e) =>
                      updateMenuItem(index, "url", e.target.value)
                    }
                    placeholder="https://example.com"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                  />
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={item.payload || ""}
                      onChange={(e) =>
                        updateMenuItem(
                          index,
                          "payload",
                          e.target.value.toUpperCase().replace(/\s+/g, "_"),
                        )
                      }
                      placeholder="e.g., MENU_HOURS, MENU_HELP, MENU_PRICING"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white font-mono"
                    />
                    <p className="text-[10px] text-gray-400">
                      Action ID sent when user taps
                    </p>
                  </div>
                )}
              </div>
            ))}

            {menuItems.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                Add at least one menu item
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Use descriptive titles. Menu appears in all conversations.
        </p>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={
            isPending ||
            menuItems.length === 0 ||
            menuItems.some(
              (item: any) =>
                !item.title ||
                (item.type === "web_url" ? !item.url : !item.payload),
            )
          }
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isPending ? "Saving..." : "Save Persistent Menu"}
        </button>
      </div>
    );
  };

  const renderSenderActionConfig = () => {
    const actionDescriptions: Record<
      string,
      { title: string; description: string }
    > = {
      TYPING_ON: {
        title: "Show Typing Indicator",
        description:
          "Displays a typing indicator to the user, letting them know you're composing a response. Use this before processing a message to create a natural conversational feel.",
      },
      TYPING_OFF: {
        title: "Hide Typing Indicator",
        description:
          "Hides the typing indicator. Use this after you're done processing if you need to stop the indicator without sending a message.",
      },
      MARK_SEEN: {
        title: "Mark Message as Seen",
        description:
          "Marks the most recent message as seen. Send this when your bot receives a message so the user doesn't feel ignored.",
      },
    };

    const action = selectedNode?.data.subType || "";
    const info = actionDescriptions[action] || {
      title: action,
      description: "",
    };

    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
            {info.title}
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            {info.description}
          </p>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          This action requires no configuration. It will execute automatically
          when reached in the flow.
        </p>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isPending ? "Saving..." : "Confirm Action"}
        </button>
      </div>
    );
  };

  const renderProductTemplateConfig = () => {
    const productIds = formData.productIds || [];
    const newProductId = formData.newProductId || "";

    const addProductId = () => {
      if (!newProductId.trim()) return;
      if (productIds.length >= 10) {
        toast.error("Maximum 10 products allowed");
        return;
      }
      if (productIds.includes(newProductId.trim())) {
        toast.error("Product ID already added");
        return;
      }
      const newIds = [...productIds, newProductId.trim()];
      setFormData({ ...formData, productIds: newIds, newProductId: "" });
    };

    const removeProductId = (id: string) => {
      const newIds = productIds.filter((pid: string) => pid !== id);
      setFormData({ ...formData, productIds: newIds });
    };

    return (
      <div className="space-y-4">
        {/* Info Box */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Product Template
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Send products from your Facebook catalog. 1 product = single
            message, 2+ = carousel (max 10).
          </p>
        </div>

        {/* Product IDs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Product IDs ({productIds.length}/10)
          </label>

          {/* Current products */}
          <div className="space-y-2 mb-3">
            {productIds.map((id: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-neutral-800 rounded"
              >
                <span className="flex-1 text-sm font-mono truncate text-gray-700 dark:text-gray-300">
                  {id}
                </span>
                <button
                  type="button"
                  onClick={() => removeProductId(id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Add new product */}
          {productIds.length < 10 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newProductId}
                onChange={(e) =>
                  setFormData({ ...formData, newProductId: e.target.value })
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addProductId())
                }
                placeholder="Enter product ID from catalog"
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={addProductId}
                className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Get product IDs from Facebook Commerce Manager or Catalog API.
        </p>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || productIds.length === 0}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isPending ? "Saving..." : "Save Product Template"}
        </button>
      </div>
    );
  };

  const renderQuickRepliesConfig = () => {
    const quickReplies = formData.quickReplies || [];
    const text = formData.text || "";

    const addQuickReply = (type: "text" | "user_phone_number") => {
      if (quickReplies.length >= 13) {
        toast.error("Maximum 13 quick replies allowed");
        return;
      }
      const newReply =
        type === "user_phone_number"
          ? { content_type: "user_phone_number" }
          : { content_type: "text", title: "", payload: "" };
      setFormData({ ...formData, quickReplies: [...quickReplies, newReply] });
    };

    const updateQuickReply = (index: number, field: string, value: string) => {
      const updated = [...quickReplies];
      updated[index] = { ...updated[index], [field]: value };
      setFormData({ ...formData, quickReplies: updated });
    };

    const removeQuickReply = (index: number) => {
      const updated = quickReplies.filter(
        (_: unknown, i: number) => i !== index,
      );
      setFormData({ ...formData, quickReplies: updated });
    };

    return (
      <div className="space-y-4">
        {/* Info Box */}
        <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
            Quick Replies
          </h4>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Add buttons users can tap to respond. Max 13 replies, 20 chars each.
            Mobile only.
          </p>
        </div>

        {/* Message Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            placeholder="Enter message to display with quick replies..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Quick Replies List */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Replies ({quickReplies.length}/13)
          </label>

          <div className="space-y-2">
            {quickReplies.map(
              (
                qr: { content_type: string; title?: string; payload?: string },
                index: number,
              ) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700"
                >
                  {qr.content_type === "user_phone_number" ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        📱 Request Phone Number
                      </span>
                      <button
                        type="button"
                        onClick={() => removeQuickReply(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={qr.title || ""}
                          onChange={(e) =>
                            updateQuickReply(
                              index,
                              "title",
                              e.target.value.substring(0, 20),
                            )
                          }
                          placeholder="Button title (max 20 chars)"
                          maxLength={20}
                          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
                        />
                        <span className="text-xs text-gray-400">
                          {(qr.title || "").length}/20
                        </span>
                        <button
                          type="button"
                          onClick={() => removeQuickReply(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={qr.payload || ""}
                          onChange={(e) =>
                            updateQuickReply(
                              index,
                              "payload",
                              e.target.value.toUpperCase().replace(/\s+/g, "_"),
                            )
                          }
                          placeholder="e.g., OPTION_A, YES, NO, INTERESTED"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-gray-900 dark:text-white font-mono"
                        />
                        <p className="text-[10px] text-gray-400">
                          User&apos;s choice sent to your automation
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>

          {/* Add Buttons */}
          {quickReplies.length < 13 && (
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => addQuickReply("text")}
                className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300"
              >
                + Add Text Button
              </button>
              <button
                type="button"
                onClick={() => addQuickReply("user_phone_number")}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
              >
                + Phone Number
              </button>
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !text || quickReplies.length === 0}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isPending ? "Saving..." : "Save Quick Replies"}
        </button>
      </div>
    );
  };

  const renderLogToSheetsConfig = () => {
    const sheetsConfig = formData.sheetsConfig || null;

    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
            Log to Google Sheets
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            Save trigger data (sender, message) to a Google Spreadsheet.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Spreadsheet
          </label>
          <SheetPicker
            value={sheetsConfig}
            onChange={(config) =>
              setFormData({ ...formData, sheetsConfig: config })
            }
          />
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Data columns: Timestamp, Sender, Message, Trigger Type
        </p>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !sheetsConfig}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isPending ? "Saving..." : "Save Sheets Config"}
        </button>
      </div>
    );
  };

  const renderPostsConfig = () => {
    // Already attached posts from automation
    const attachedPosts = data?.data?.posts || [];
    // All Instagram posts available - data is properly typed from Zod parsing
    const allPosts = instagramPosts?.data || [];

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
              {attachedPosts.map((post: any, index: number) => (
                <div
                  key={`${post.postid}-${index}`}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-800 group"
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
                  {/* Detach button on hover */}
                  <button
                    onClick={() => detachPost({ postid: post.postid })}
                    disabled={isDetaching}
                    className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    title="Detach post"
                  >
                    <X size={12} />
                  </button>
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
              {/* Data is normalized at Zod schema layer - no patchwork needed */}
              {allPosts.map((post: InstagramPostProps) => (
                <div
                  key={post.id}
                  className="relative aspect-square rounded-lg cursor-pointer overflow-hidden bg-gray-100 dark:bg-neutral-800 group hover:ring-2 hover:ring-blue-500 transition-all"
                  onClick={() =>
                    onSelectPost({
                      postid: post.id,
                      media: post.media_url,
                      mediaType: post.media_type,
                      caption: post.caption || undefined,
                    })
                  }
                >
                  {post.media_type === "VIDEO" ? (
                    <>
                      <video
                        src={post.media_url || undefined}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                      <Film
                        className="absolute top-1 right-1 text-white/90 z-10"
                        size={14}
                      />
                    </>
                  ) : (
                    <>
                      {post.media_url && (
                        <Image
                          fill
                          src={post.media_url}
                          alt={post.caption || "Instagram post"}
                          className="object-cover"
                          sizes="80px"
                        />
                      )}
                      {post.media_type === "CAROUSEL_ALBUM" && (
                        <ImageIcon
                          className="absolute top-1 right-1 text-white/90 z-10"
                          size={14}
                        />
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
                Attach {selectedPosts.length} Post
                {selectedPosts.length !== 1 ? "s" : ""}
              </Loader>
            </Button>
          </div>
        ) : (
          <div className="p-4 text-center bg-gray-50 dark:bg-neutral-800 rounded-lg">
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
            onChange={(e) =>
              setFormData({ ...formData, delay: parseInt(e.target.value) })
            }
            placeholder="Enter delay in seconds"
            min={0}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
            onChange={(e) =>
              setFormData({ ...formData, tagName: e.target.value })
            }
            placeholder="Enter tag name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      )}

      {selectedNode?.data.subType === "IS_FOLLOWER" && (
        <div className="space-y-4">
          {/* Default Settings Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
              Default Settings
            </h4>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <li>
                • <strong>Follow Prompt:</strong> Enabled
              </li>
              <li>
                • <strong>Message:</strong> &quot;Hey! Follow us to stay
                updated...&quot;
              </li>
              <li>
                • <strong>Follow Button:</strong> &quot;Follow Us&quot;
              </li>
              <li>
                • <strong>Recheck Button:</strong> Enabled, &quot;I&apos;ve
                Followed ✓&quot;
              </li>
            </ul>
          </div>

          {/* Send Follow Prompt Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Send Follow Prompt
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Send a button template when user is not following
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  sendFollowPrompt: !formData.sendFollowPrompt,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.sendFollowPrompt !== false
                  ? "bg-green-500"
                  : "bg-gray-300 dark:bg-neutral-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.sendFollowPrompt !== false
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Prompt Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prompt Message
            </label>
            <textarea
              value={
                formData.promptMessage ||
                "Hey! Follow us to stay updated with our latest content!"
              }
              onChange={(e) =>
                setFormData({ ...formData, promptMessage: e.target.value })
              }
              placeholder="Message to show non-followers"
              rows={3}
              maxLength={640}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              {(formData.promptMessage || "").length}/640 characters
            </p>
          </div>

          {/* Button Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Follow Button Text
            </label>
            <input
              type="text"
              value={formData.buttonText || "Follow Us"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  buttonText: e.target.value.substring(0, 20),
                })
              }
              placeholder="Follow Us"
              maxLength={20}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">
              {(formData.buttonText || "Follow Us").length}/20 characters
            </p>
          </div>

          {/* Follow Button URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Instagram Profile URL
            </label>
            <input
              type="url"
              value={formData.followUrl || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  followUrl: e.target.value,
                })
              }
              placeholder="https://instagram.com/yourprofile"
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              URL opened when user clicks &quot;Follow Us&quot; button
            </p>
          </div>

          {/* Recheck Button Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Recheck Button
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add a button to verify follow again
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  enableRecheckButton: !formData.enableRecheckButton,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.enableRecheckButton !== false
                  ? "bg-green-500"
                  : "bg-gray-300 dark:bg-neutral-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.enableRecheckButton !== false
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Recheck Button Text */}
          {formData.enableRecheckButton !== false && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recheck Button Text
              </label>
              <input
                type="text"
                value={formData.recheckButtonText || "I've Followed ✓"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recheckButtonText: e.target.value.substring(0, 20),
                  })
                }
                placeholder="I've Followed ✓"
                maxLength={20}
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                {(formData.recheckButtonText || "I've Followed ✓").length}/20
                characters
              </p>
            </div>
          )}

          {/* Postback Payload Preview (Read-only) */}
          {formData.enableRecheckButton !== false && (
            <div className="bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg border border-gray-200 dark:border-neutral-700">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Postback Payload (Auto-generated)
              </label>
              <code className="text-xs text-gray-700 dark:text-gray-300 font-mono break-all">
                SWOOPIN_RECHECK_FOLLOWER::{"{"}&lt;automationId&gt;{"}"}
              </code>
              <p className="text-xs text-gray-400 mt-2">
                This payload triggers re-verification when the user clicks the
                recheck button
              </p>
            </div>
          )}

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isPending ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      )}
    </div>
  );

  // ============================================
  // YOUTUBE CONFIG FUNCTIONS
  // ============================================

  const renderYouTubeTriggerConfig = () => (
    <div className="space-y-4">
      <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
        <h4 className="font-medium text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
          </svg>
          {selectedNode?.data.label}
        </h4>
        <p className="text-sm text-red-700 dark:text-red-300">
          {selectedNode?.data.subType === "YT_COMMENT" &&
            "Triggers when a user comments on your YouTube video"}
          {selectedNode?.data.subType === "YT_MENTION" &&
            "Triggers when someone @mentions your channel in a comment"}
        </p>
      </div>
    </div>
  );

  // YouTube Video Selector Config - using React Query
  const isSelectVideosNode = selectedNode?.data.subType === "YT_SELECT_VIDEOS";
  const {
    data: youtubeVideosData,
    isLoading: isLoadingVideos,
    error: videosError,
  } = useQueryYouTubeVideos(isSelectVideosNode);

  const youtubeVideos = youtubeVideosData?.data?.videos || [];

  const toggleVideoSelection = (videoId: string) => {
    if (!selectedNode) return;
    const currentVideos: string[] = formData.selectedVideos || [];
    const updated = currentVideos.includes(videoId)
      ? currentVideos.filter((id: string) => id !== videoId)
      : [...currentVideos, videoId];
    const newConfig = { ...formData, selectedVideos: updated };
    setFormData(newConfig);
    if (onUpdateNode) {
      onUpdateNode(selectedNode.id, newConfig);
    }
  };

  const renderYouTubeSelectVideosConfig = () => {
    const selectedVideos: string[] = formData.selectedVideos || [];

    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
          <h4 className="font-medium text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
            Select Videos
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300">
            Choose which YouTube videos to monitor for comments
          </p>
        </div>

        {/* Loading State */}
        {isLoadingVideos && (
          <div className="flex items-center justify-center gap-2 py-4 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading your videos...</span>
          </div>
        )}

        {/* Error Message */}
        {videosError && (
          <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg border border-red-300 dark:border-red-700">
            <p className="text-sm text-red-700 dark:text-red-300">
              {videosError instanceof Error
                ? videosError.message
                : "Failed to load videos"}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Make sure YouTube is connected in Integrations settings.
            </p>
          </div>
        )}

        {/* Selected Count */}
        {selectedVideos.length > 0 && (
          <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              {selectedVideos.length} video
              {selectedVideos.length !== 1 ? "s" : ""} selected
            </span>
            <button
              type="button"
              onClick={() => {
                const newConfig = { ...formData, selectedVideos: [] };
                setFormData(newConfig);
                if (onUpdateNode && selectedNode) {
                  onUpdateNode(selectedNode.id, newConfig);
                }
              }}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Video Grid */}
        {youtubeVideos.length > 0 && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Click to select/deselect videos:
            </p>
            <div className="grid gap-2">
              {youtubeVideos.map((video) => {
                const isSelected = selectedVideos.includes(video.id);
                return (
                  <div
                    key={video.id}
                    onClick={() => toggleVideoSelection(video.id)}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all",
                      isSelected
                        ? "border-red-500 bg-red-50 dark:bg-red-950"
                        : "border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600",
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-12 rounded overflow-hidden bg-gray-100 dark:bg-neutral-800 flex-shrink-0 relative">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {video.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(video.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {/* Checkbox indicator */}
                    <div
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                        isSelected
                          ? "bg-red-500 border-red-500"
                          : "border-gray-300 dark:border-neutral-600",
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || selectedVideos.length === 0}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isPending ? "Saving..." : "Save Selection"}
        </button>
      </div>
    );
  };

  // YouTube Keywords Config
  const [newYouTubeKeyword, setNewYouTubeKeyword] = useState("");

  const addYouTubeKeyword = () => {
    if (!newYouTubeKeyword.trim() || !selectedNode) return;
    const currentKeywords: string[] = formData.keywords || [];
    if (!currentKeywords.includes(newYouTubeKeyword.trim())) {
      const updated = [...currentKeywords, newYouTubeKeyword.trim()];
      const newConfig = { ...formData, keywords: updated };
      setFormData(newConfig);
      if (onUpdateNode) {
        onUpdateNode(selectedNode.id, newConfig);
        toast.success("Keyword added!", {
          description: `"${newYouTubeKeyword.trim()}" will trigger this automation.`,
        });
      }
    }
    setNewYouTubeKeyword("");
  };

  const removeYouTubeKeyword = (keyword: string) => {
    if (!selectedNode) return;
    const currentKeywords: string[] = formData.keywords || [];
    const updated = currentKeywords.filter((k: string) => k !== keyword);
    const newConfig = { ...formData, keywords: updated };
    setFormData(newConfig);
    if (onUpdateNode) {
      onUpdateNode(selectedNode.id, newConfig);
      toast.success("Keyword removed!", {
        description: `"${keyword}" has been removed.`,
      });
    }
  };

  const renderYouTubeKeywordsConfig = () => {
    const keywords: string[] = formData.keywords || [];

    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
          <h4 className="font-medium text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
            <Reply className="w-5 h-5" />
            Keyword Match
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300">
            Filter comments that contain specific keywords before triggering
            actions
          </p>
        </div>

        {/* Current Keywords */}
        {keywords.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Active Keywords ({keywords.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm"
                >
                  <span>{keyword}</span>
                  <button
                    type="button"
                    onClick={() => removeYouTubeKeyword(keyword)}
                    className="ml-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Keyword */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Add Keywords
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newYouTubeKeyword}
              onChange={(e) => setNewYouTubeKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addYouTubeKeyword();
                }
              }}
              placeholder="Enter keyword and press Enter..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addYouTubeKeyword}
              disabled={!newYouTubeKeyword.trim()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Comments containing any of these keywords will pass this condition.
          </p>
        </div>

        {/* Match Mode */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Match Mode
          </label>
          <select
            value={formData.matchMode || "any"}
            onChange={(e) => handleAutoSave("matchMode", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
          >
            <option value="any">Match ANY keyword (OR)</option>
            <option value="all">Match ALL keywords (AND)</option>
          </select>
        </div>

        {/* Case Sensitivity */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.caseSensitive || false}
            onChange={(e) => handleAutoSave("caseSensitive", e.target.checked)}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Case-sensitive matching
          </span>
        </label>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || keywords.length === 0}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isPending ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    );
  };

  const renderYouTubeReplyConfig = () => (
    <div className="space-y-4">
      {/* Info box */}
      <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
        <p className="text-sm text-red-700 dark:text-red-300">
          💬 This reply will be posted publicly under the user&apos;s comment on
          your YouTube video.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Comment Reply
        </label>
        <textarea
          value={formData.commentReply || ""}
          onChange={(e) =>
            setFormData({ ...formData, commentReply: e.target.value })
          }
          onBlur={(e) => handleAutoSave("commentReply", e.target.value)}
          placeholder="Enter your reply..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Live Preview */}
      {formData.commentReply && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Preview
          </label>
          <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                Y
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  Your Channel
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                  {formData.commentReply}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || !formData.commentReply}
        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isPending ? "Saving..." : "Save Reply"}
      </button>
    </div>
  );

  const renderYouTubeCollectDataConfig = () => (
    <div className="space-y-4">
      <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
        <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
          📊 Collect Comment Data
        </h4>
        <p className="text-sm text-red-700 dark:text-red-300">
          Save YouTube comment data for analytics and follow-up.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Data to Collect
        </label>
        <div className="space-y-2">
          {["commentText", "authorName", "videoId", "timestamp"].map(
            (field) => (
              <label key={field} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.collectFields?.includes(field) ?? true}
                  onChange={(e) => {
                    const current = formData.collectFields || [
                      "commentText",
                      "authorName",
                      "videoId",
                      "timestamp",
                    ];
                    const updated = e.target.checked
                      ? [...current, field]
                      : current.filter((f: string) => f !== field);
                    handleAutoSave("collectFields", updated);
                  }}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {field.replace(/([A-Z])/g, " $1").trim()}
                </span>
              </label>
            ),
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isPending ? "Saving..." : "Save Configuration"}
      </button>
    </div>
  );

  const renderConfigForm = () => {
    if (!selectedNode) return null;

    switch (selectedNode.data.subType) {
      case "DM":
      case "COMMENT":
      case "KEYWORDS":
      case "STORY_REPLY":
      case "POSTBACK":
        return renderTriggerConfig();
      case "MESSAGE":
        return renderMessageConfig();
      case "REPLY_COMMENT":
        return renderReplyCommentConfig();
      case "SMARTAI":
        return renderSmartAIConfig();
      case "CAROUSEL":
        return renderCarouselConfig();
      case "BUTTON_TEMPLATE":
        return renderButtonTemplateConfig();
      case "ICE_BREAKERS":
        return renderIceBreakersConfig();
      case "PERSISTENT_MENU":
        return renderPersistentMenuConfig();
      case "TYPING_ON":
      case "TYPING_OFF":
      case "MARK_SEEN":
        return renderSenderActionConfig();
      case "PRODUCT_TEMPLATE":
        return renderProductTemplateConfig();
      case "QUICK_REPLIES":
        return renderQuickRepliesConfig();
      case "LOG_TO_SHEETS":
        return renderLogToSheetsConfig();
      case "POSTS":
      case "SELECT_POSTS":
        return renderPostsConfig();
      case "YES":
      case "NO":
      case "IS_FOLLOWER":
      case "DELAY":
      case "HAS_TAG":
        return renderConditionConfig();
      // YouTube Triggers
      case "YT_COMMENT":
      case "YT_MENTION":
        return renderYouTubeTriggerConfig();
      case "YT_SELECT_VIDEOS":
        return renderYouTubeSelectVideosConfig();
      case "YT_KEYWORDS":
        return renderYouTubeKeywordsConfig();
      // YouTube Actions
      case "YT_REPLY_COMMENT":
        return renderYouTubeReplyConfig();
      case "YT_SMARTAI":
        return renderSmartAIConfig(); // Reuse existing Smart AI config
      case "YT_COLLECT_DATA":
        return renderYouTubeCollectDataConfig();
      default:
        return (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No configuration available for this node type.
          </p>
        );
    }
  };

  // When collapsed, we only show the floating button
  // When expanded, we show the full panel

  // When collapsed, we show the floating button (via CSS)
  // When expanded, we show the full panel

  return (
    <div
      className={cn(
        "flex flex-col transition-all duration-300 ease-in-out", // Standard easing for cleaner feel
        isPanelExpanded
          ? "w-96 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-2xl rounded-xl h-[calc(100vh-2rem)]"
          : "w-12 h-12 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-lg rounded-full cursor-pointer hover:scale-110 active:scale-95", // Added active state
        className, // This contains 'absolute right-4 top-4 z-20'
      )}
      onClick={(e) => {
        // If collapsed, clicking anywhere expands it
        if (!isPanelExpanded) {
          setIsPanelExpanded(true);
        }
      }}
      style={{
        // If expanded, fit to screen height minus margins
        maxHeight: isPanelExpanded ? "calc(100vh - 2rem)" : "3rem",
        bottom: isPanelExpanded ? "1rem" : "auto",
        overflow: "hidden", // Important for masking content during resize
      }}
    >
      <div className="relative w-full h-full">
        {/* Collapsed State Icon - Absolute Center */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
            isPanelExpanded
              ? "opacity-0 pointer-events-none delay-0"
              : "opacity-100 delay-100",
          )}
        >
          <Edit2 size={20} className="text-gray-500 dark:text-gray-400" />
        </div>

        {/* Expanded State Content - Absolute Cover or Relative */}
        {/* Use min-w-[24rem] (96) to prevent reflow during width animation */}
        <div
          className={cn(
            "w-96 h-full flex flex-col transition-opacity duration-300",
            isPanelExpanded
              ? "opacity-100 delay-100 pointer-events-auto"
              : "opacity-0 pointer-events-none",
          )}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between shrink-0 h-16">
            <div className="overflow-hidden flex items-center gap-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                <Edit2 size={16} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {selectedNode ? "Configure Node" : "Configuration"}
                </h2>
                {selectedNode && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {selectedNode.data.type === "trigger"
                      ? "Trigger"
                      : "Action"}
                    : {selectedNode.data.label}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPanelExpanded(false);
              }}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors shrink-0"
              title="Collapse"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 w-full">
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
              <AutomationControls
                automationId={id}
                automationData={data?.data}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Automation Controls Component (shown when no node is selected)
const AutomationControls = ({
  automationId,
  automationData,
}: {
  automationId: string;
  automationData: any;
}) => {
  const { inputRef, edit, enableEdit, disableEdit, isPending, mutate } =
    useEditAutomation(automationId);
  const { isPending: isDeleting, mutate: deleteAutomation } =
    useDeleteAutomation(automationId);
  const [name, setName] = useState(
    automationData?.name || "Untitled Automation",
  );

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
    if (
      confirm(
        "Are you sure you want to delete this automation? This action cannot be undone.",
      )
    ) {
      deleteAutomation(
        {},
        {
          onSuccess: () => {
            // Get the slug from the URL and redirect
            const pathParts = window.location.pathname.split("/");
            const slug = pathParts[2];
            window.location.href = `/dashboard/${slug}/automations`;
          },
        },
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Automation Name */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Automation Name
        </h3>
        <div className="relative p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
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
                className="flex-1 text-lg font-semibold bg-white dark:bg-neutral-900 text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              {isPending && (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between group">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {name}
              </p>
              <button
                onClick={enableEdit}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded transition-opacity"
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
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                automationData?.active ? "bg-green-500" : "bg-gray-400",
              )}
            />
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
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                DMs Sent
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                {automationData.listener.dmCount || 0}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                Comments
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                {automationData.listener.commentCount || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Button */}
      <div className="pt-4 border-t border-gray-200 dark:border-neutral-800">
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
