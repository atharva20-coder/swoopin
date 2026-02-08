"use client";
import { usePaths } from "@/hooks/use-nav";
import { cn, getMonth } from "@/lib/utils";
import Link from "next/link";
import React, { useMemo, useEffect, useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  useQueryAutomations,
  type AutomationListItem,
} from "@/hooks/user-queries";
import CreateAutomation from "../create-automation";
import { useMutationDataState } from "@/hooks/use-mutation-data";
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  MessageCircle,
  Sparkles,
  Calendar,
  Hash,
} from "lucide-react";

/**
 * Using Zod-inferred types from schema
 * No local type definitions needed - Zero-Patchwork Protocol
 */
type Automation = AutomationListItem;

type AutomationCardProps = {
  automation: Automation;
  pathname: string;
  loadingId: string | null;
  onLoadingChange: (id: string) => void;
};

// Memoized automation card component - prevents re-render when other items change
const AutomationCard = memo(function AutomationCard({
  automation,
  pathname,
  loadingId,
  onLoadingChange,
}: AutomationCardProps) {
  const isLoading = loadingId === automation.id;

  if (automation.id === "no-results") {
    return (
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                <Zap className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {automation.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Create a new automation with this name
                </p>
              </div>
            </div>
          </div>
          <CreateAutomation />
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`${pathname}/${automation.id}`}
      onClick={() => onLoadingChange(automation.id)}
      className="block p-5"
    >
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Left Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                automation.listener?.listener === "SMARTAI"
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                  : "bg-gray-100 dark:bg-neutral-800",
              )}
            >
              {automation.listener?.listener === "SMARTAI" ? (
                <Sparkles className="w-5 h-5 text-white" />
              ) : (
                <MessageCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {automation.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {automation.listener?.listener === "SMARTAI"
                  ? "AI-powered responses"
                  : automation.keywords.length > 0
                    ? `${automation.keywords.length} keyword trigger${
                        automation.keywords.length === 1 ? "" : "s"
                      }`
                    : "Standard automation"}
              </p>
            </div>
          </div>

          {/* Keywords */}
          {automation.keywords.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap mt-3">
              <Hash className="w-3.5 h-3.5 text-gray-400" />
              {automation.keywords.slice(0, 5).map((keyword, key) => (
                <span
                  key={keyword.id}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium",
                    key % 4 === 0 &&
                      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                    key % 4 === 1 &&
                      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                    key % 4 === 2 &&
                      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                    key % 4 === 3 &&
                      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
                  )}
                >
                  {keyword.word}
                </span>
              ))}
              {automation.keywords.length > 5 && (
                <span className="text-xs text-gray-500">
                  +{automation.keywords.length - 5} more
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-gray-400 border border-dashed border-gray-300 dark:border-neutral-700 rounded-full px-3 py-1">
                No keywords set
              </span>
            </div>
          )}
        </div>

        {/* Right Content */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          {/* Status Badge */}
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              automation.active
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400",
            )}
          >
            {automation.active ? "Active" : "Inactive"}
          </span>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {(() => {
                const date = new Date(automation.createdAt);
                return `${getMonth(
                  date.getUTCMonth() + 1,
                )} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
              })()}
            </span>
          </div>

          {/* Type Badge */}
          {automation.listener?.listener === "SMARTAI" ? (
            <span className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium rounded-lg shadow-sm">
              Smart AI
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-lg">
              Standard
            </span>
          )}
        </div>
      </div>
    </Link>
  );
});

const ITEMS_PER_PAGE = 10;

const AutomationList = () => {
  const { data } = useQueryAutomations();
  const { latestVariable } = useMutationDataState(["create-automation"]);
  const { pathname } = usePaths();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Memoized search handler
  const handleSearch = useCallback(
    (event: CustomEvent<{ searchTerm: string }>) => {
      setSearchTerm(event.detail.searchTerm);
      setCurrentPage(1);
    },
    [],
  );

  useEffect(() => {
    window.addEventListener("automationSearch", handleSearch as EventListener);
    return () => {
      window.removeEventListener(
        "automationSearch",
        handleSearch as EventListener,
      );
    };
  }, [handleSearch]);

  // Memoized loading change handler
  const handleLoadingChange = useCallback((id: string) => {
    setLoadingId(id);
  }, []);

  // Memoized data computation - data is properly typed from Zod parsing in hook
  const optimisticUiData = useMemo(() => {
    // Data is already validated by Zod in the hook - no type assertions needed
    const apiData = data?.data ?? [];
    let automations: Automation[] = [];

    if (latestVariable?.variables && data) {
      // Optimistic update: prepend latest variable
      automations = [latestVariable.variables as Automation, ...apiData];
    } else {
      automations = apiData;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filteredAutomations = automations
        .filter((automation) => automation.name.toLowerCase().includes(term))
        .sort((a, b) => {
          const aStartsWith = a.name.toLowerCase().startsWith(term);
          const bStartsWith = b.name.toLowerCase().startsWith(term);
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          return a.name.localeCompare(b.name);
        });

      return {
        data:
          filteredAutomations.length > 0
            ? filteredAutomations
            : [
                {
                  id: "no-results",
                  name: `${searchTerm}`,
                  keywords: [],
                  active: false,
                  createdAt: new Date(),
                  listener: null,
                  flowNodes: [],
                },
              ],
      };
    }

    return { data: automations };
  }, [latestVariable, data, searchTerm]);

  // Memoized pagination values
  const { totalItems, totalPages, startIndex, endIndex, paginatedData } =
    useMemo(() => {
      const total = optimisticUiData.data?.length || 0;
      const pages = Math.ceil(total / ITEMS_PER_PAGE);
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const paginated = optimisticUiData.data?.slice(start, end) || [];

      return {
        totalItems: total,
        totalPages: pages,
        startIndex: start,
        endIndex: end,
        paginatedData: paginated,
      };
    }, [optimisticUiData.data, currentPage]);

  // Memoized page handlers
  const goToPreviousPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  }, [totalPages]);

  const goToPage = useCallback((pageNum: number) => {
    setCurrentPage(pageNum);
  }, []);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  if (!data?.success || data.data.length <= 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-6">
          <Zap className="w-10 h-10 text-indigo-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No automations yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-sm">
          Create your first automation to start engaging with your audience
          automatically
        </p>
        <CreateAutomation />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Automation Cards */}
      <div className="grid gap-4">
        {paginatedData.map((automation) => (
          <div
            key={automation.id}
            className={cn(
              "group relative bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden transition-all duration-300",
              automation.id !== "no-results" &&
                "hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800",
            )}
          >
            <AutomationCard
              automation={automation}
              pathname={pathname}
              loadingId={loadingId}
              onLoadingChange={handleLoadingChange}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing{" "}
            <span className="font-medium">
              {startIndex + 1}-{Math.min(endIndex, totalItems)}
            </span>{" "}
            of <span className="font-medium">{totalItems}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="h-9"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className={cn(
                      "w-9 h-9",
                      currentPage === pageNum &&
                        "bg-indigo-600 hover:bg-indigo-700",
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="h-9"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(AutomationList);
