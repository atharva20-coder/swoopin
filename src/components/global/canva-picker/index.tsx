"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Palette, Loader2, Check, Search, RefreshCw, Download } from "lucide-react";
import { getCanvaDesigns, exportCanvaDesign, isCanvaConnected } from "@/actions/canva";
import Image from "next/image";

interface CanvaDesign {
  id: string;
  title: string;
  thumbnail?: { url: string };
  urls?: { viewUrl: string; editUrl: string };
  createdAt: string;
  updatedAt: string;
}

interface CanvaPickerProps {
  onSelect: (imageUrl: string, designTitle: string) => void;
  onCancel?: () => void;
}

export default function CanvaPicker({ onSelect, onCancel }: CanvaPickerProps) {
  const [designs, setDesigns] = useState<CanvaDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [continuation, setContinuation] = useState<string | undefined>();

  useEffect(() => {
    checkConnectionAndFetch();
  }, []);

  const checkConnectionAndFetch = async () => {
    const connectionStatus = await isCanvaConnected();
    setConnected(connectionStatus.connected);
    if (connectionStatus.connected) {
      await fetchDesigns();
    } else {
      setLoading(false);
    }
  };

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const result = await getCanvaDesigns({ limit: 20 });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setDesigns(result.designs || []);
      setContinuation(result.continuation);
    } catch (error) {
      toast.error("Failed to fetch designs");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!continuation) return;
    try {
      const result = await getCanvaDesigns({ limit: 20, continuation });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setDesigns([...designs, ...(result.designs || [])]);
      setContinuation(result.continuation);
    } catch (error) {
      toast.error("Failed to load more designs");
    }
  };

  const handleSelectDesign = async (design: CanvaDesign) => {
    setExporting(design.id);
    try {
      const result = await exportCanvaDesign(design.id, "png");
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      if (result.urls && result.urls.length > 0) {
        onSelect(result.urls[0], design.title);
        toast.success("Design imported!");
      }
    } catch (error) {
      toast.error("Failed to export design");
    } finally {
      setExporting(null);
    }
  };

  const filteredDesigns = designs.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!connected) {
    return (
      <div className="p-8 text-center">
        <Palette className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Canva Not Connected
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Connect your Canva account in Integrations to import designs.
        </p>
        <a
          href="/dashboard/integrations"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          Connect Canva
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Palette className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Your Canva Designs
          </h3>
        </div>
        <button
          onClick={fetchDesigns}
          disabled={loading}
          className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-neutral-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search designs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Designs Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchQuery ? "No designs match your search" : "No designs found"}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredDesigns.map((design) => (
                <button
                  key={design.id}
                  onClick={() => handleSelectDesign(design)}
                  disabled={exporting === design.id}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700 hover:border-purple-500 transition-colors bg-gray-100 dark:bg-neutral-800"
                >
                  {design.thumbnail?.url ? (
                    <Image
                      src={design.thumbnail.url}
                      alt={design.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Palette className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2">
                    {exporting === design.id ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-6 h-6 mb-2" />
                        <span className="text-xs text-center line-clamp-2">{design.title}</span>
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {continuation && (
              <button
                onClick={loadMore}
                className="w-full mt-4 py-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Load More
              </button>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {onCancel && (
        <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
          <button
            onClick={onCancel}
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
