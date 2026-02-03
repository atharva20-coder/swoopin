"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  MessageCircle,
  FileSpreadsheet,
  Plus,
  Download,
  RefreshCw,
  X,
  Trash2,
  Play,
  Pause,
  MoreVertical,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import SheetPicker from "@/components/global/sheet-picker";
import { toast } from "sonner";

// REST API calls
async function getUserCollections() {
  const res = await fetch("/api/v1/data-hub/collections");
  return res.json();
}

async function createCollection(data: {
  name: string;
  source: string;
  sheetsConfig?: {
    spreadsheetId: string;
    spreadsheetName: string;
    sheetName: string;
  } | null;
  triggerConfig?: { keyword: string };
}) {
  const res = await fetch("/api/v1/data-hub/collections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function deleteCollection(id: string) {
  const res = await fetch(`/api/v1/data-hub/collections/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

async function updateCollectionStatus(id: string, status: string) {
  const res = await fetch(`/api/v1/data-hub/collections/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

async function exportResponsesToSheet(id: string) {
  const res = await fetch(`/api/v1/data-hub/collections/${id}/export`, {
    method: "POST",
  });
  return res.json();
}

async function demoExportToSheet(sheetConfig: {
  spreadsheetId: string;
  spreadsheetName: string;
  sheetName: string;
}) {
  const res = await fetch("/api/v1/data-hub/demo-export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sheetConfig),
  });
  return res.json();
}

async function isGoogleConnected() {
  const res = await fetch("/api/v1/google/status");
  return res.json();
}

type Tab = "collections" | "responses" | "demo";

interface SheetConfig {
  spreadsheetId: string;
  spreadsheetName: string;
  sheetName: string;
}

interface DataHubViewProps {
  slug: string;
}

const SOURCE_OPTIONS = [
  {
    id: "STORY_POLL",
    label: "Story Polls",
    icon: "📊",
    desc: "Collect poll responses",
  },
  {
    id: "STORY_QUESTION",
    label: "Story Questions",
    icon: "❓",
    desc: "Collect question answers",
  },
  {
    id: "DM_KEYWORD",
    label: "DM Keyword",
    icon: "💬",
    desc: "Collect DMs with keywords",
  },
  {
    id: "COMMENT_KEYWORD",
    label: "Comment Keyword",
    icon: "💭",
    desc: "Collect matching comments",
  },
] as const;

export default function DataHubView({ slug }: DataHubViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("collections");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [googleConnected, setGoogleConnected] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [sheetConfig, setSheetConfig] = useState<SheetConfig | null>(null);
  const [keyword, setKeyword] = useState("");

  // Demo state
  const [demoSheetConfig, setDemoSheetConfig] = useState<SheetConfig | null>(
    null,
  );
  const [isDemoExporting, setIsDemoExporting] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [collectionsRes, googleRes] = await Promise.all([
        getUserCollections(),
        isGoogleConnected(),
      ]);
      if (collectionsRes.status === 200) {
        setCollections(collectionsRes.data as any[]);
      }
      setGoogleConnected(googleRes.connected);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name || !selectedSource) {
      toast.error("Please fill all required fields");
      return;
    }

    const result = await createCollection({
      name,
      source: selectedSource as any,
      sheetsConfig: sheetConfig,
      triggerConfig: keyword ? { keyword } : undefined,
    });

    if (result.status === 200) {
      toast.success("Collection created!");
      setShowCreateModal(false);
      setName("");
      setSelectedSource(null);
      setSheetConfig(null);
      setKeyword("");
      loadData();
    } else {
      toast.error(result.data as string);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this collection?")) return;
    const result = await deleteCollection(id);
    if (result.status === 200) {
      toast.success("Deleted");
      loadData();
    }
  };

  const handleExport = async (id: string) => {
    const result = await exportResponsesToSheet(id);
    if (result.status === 200) {
      toast.success(result.data as string);
    } else {
      toast.error(result.data as string);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    const result = await updateCollectionStatus(id, newStatus);
    if (result.status === 200) {
      loadData();
    }
  };

  const handleDemoExport = async () => {
    if (!demoSheetConfig) {
      toast.error("Please select a sheet first");
      return;
    }
    setIsDemoExporting(true);
    setDemoSuccess(false);
    try {
      const result = await demoExportToSheet(demoSheetConfig);
      if (result.status === 200) {
        setDemoSuccess(true);
        toast.success("Demo data exported to sheet!");
      } else {
        toast.error(result.data as string);
      }
    } finally {
      setIsDemoExporting(false);
    }
  };

  const tabs = [
    {
      id: "collections" as Tab,
      label: "Collections",
      icon: <Database className="w-4 h-4" />,
    },
    {
      id: "responses" as Tab,
      label: "Responses",
      icon: <MessageCircle className="w-4 h-4" />,
    },
    {
      id: "demo" as Tab,
      label: "Demo Export",
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
  ];

  const stats = {
    collections: collections.length,
    responses: collections.reduce(
      (acc, c) => acc + (c._count?.responses || 0),
      0,
    ),
    active: collections.filter((c) => c.status === "ACTIVE").length,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-sm">
          <a
            href={`/dashboard/${slug}`}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Dashboard
          </a>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
            Data Hub
            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Beta
            </span>
          </span>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Collection
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-100 dark:border-neutral-800">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.collections}
          </p>
          <p className="text-sm text-gray-500">Collections</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-100 dark:border-neutral-800">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.responses}
          </p>
          <p className="text-sm text-gray-500">Total Responses</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-100 dark:border-neutral-800">
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          <p className="text-sm text-gray-500">Active</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-6 border-b border-gray-100 dark:border-neutral-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition",
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "collections" && (
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : collections.length === 0 ? (
              <div className="text-center py-12">
                <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No collections yet</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  Create Collection
                </Button>
              </div>
            ) : (
              collections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {SOURCE_OPTIONS.find((s) => s.id === collection.source)
                        ?.icon || "📋"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {collection.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {collection._count?.responses || 0} responses
                        {collection.sheetsConfig && " • Sheets connected"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded",
                        collection.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {collection.status}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleToggleStatus(collection.id, collection.status)
                      }
                    >
                      {collection.status === "ACTIVE" ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    {collection.sheetsConfig && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleExport(collection.id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(collection.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "responses" && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Responses will appear as data is collected
            </p>
          </div>
        )}

        {activeTab === "demo" && (
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-100 dark:border-neutral-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Demo: Export to Sheets
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Test the Google Sheets integration by exporting sample data.
              </p>

              {!googleConnected ? (
                <p className="text-sm text-orange-600">
                  Please connect Google Sheets in the Integrations page first.
                </p>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Select Sheet
                    </label>
                    <SheetPicker
                      value={demoSheetConfig}
                      onChange={setDemoSheetConfig}
                    />
                  </div>

                  <Button
                    onClick={handleDemoExport}
                    disabled={!demoSheetConfig || isDemoExporting}
                    className="w-full gap-2"
                  >
                    {isDemoExporting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : demoSuccess ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isDemoExporting
                      ? "Exporting..."
                      : demoSuccess
                        ? "Exported!"
                        : "Export Demo Data"}
                  </Button>

                  {demoSuccess && (
                    <p className="text-sm text-green-600 mt-3 text-center">
                      ✓ Sample data added to your sheet!
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Create Collection
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Name
                </label>
                <Input
                  placeholder="My Collection"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Source
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {SOURCE_OPTIONS.map((source) => (
                    <button
                      key={source.id}
                      onClick={() => setSelectedSource(source.id)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition",
                        selectedSource === source.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-neutral-700 hover:border-gray-300",
                      )}
                    >
                      <span className="text-2xl mb-2 block">{source.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {source.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {(selectedSource === "DM_KEYWORD" ||
                selectedSource === "COMMENT_KEYWORD") && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Keyword
                  </label>
                  <Input
                    placeholder="Enter trigger keyword"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
              )}

              {googleConnected && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Export to Sheets (Optional)
                  </label>
                  <SheetPicker value={sheetConfig} onChange={setSheetConfig} />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 dark:border-neutral-800">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Collection</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
