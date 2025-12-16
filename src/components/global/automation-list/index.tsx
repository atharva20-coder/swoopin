"use client";
import { usePaths } from "@/hooks/use-nav";
import { cn, getMonth } from "@/lib/utils";
import Link from "next/link";
import React, { useMemo, useEffect, useState } from "react";
import GradientButton from "../gradient-button";
import { Button } from "@/components/ui/button";
import { useQueryAutomations } from "@/hooks/user-queries";
import CreateAutomation from "../create-automation";
import { useMutationDataState } from "@/hooks/use-mutation-data";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {};

const ITEMS_PER_PAGE = 10;

// AutomationList component displays a list of automation cards with their details
const AutomationList = (props: Props) => {
  const { data } = useQueryAutomations();
  const { latestVariable } = useMutationDataState(["create-automation"]);
  const { pathname } = usePaths();
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handleSearch = (event: CustomEvent<{ searchTerm: string }>) => {
      setSearchTerm(event.detail.searchTerm);
      setCurrentPage(1); // Reset to first page on search
    };

    window.addEventListener('automationSearch', handleSearch as EventListener);
    return () => {
      window.removeEventListener('automationSearch', handleSearch as EventListener);
    };
  }, []);

  const optimisticUiData = useMemo(() => {
    let automations = [];
    if (latestVariable && latestVariable?.variables && data) {
      automations = [latestVariable.variables, ...data.data];
    } else {
      automations = data?.data || [];
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filteredAutomations = automations
        .filter(automation => automation.name.toLowerCase().includes(term))
        .sort((a, b) => {
          const aStartsWith = a.name.toLowerCase().startsWith(term);
          const bStartsWith = b.name.toLowerCase().startsWith(term);
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          return a.name.localeCompare(b.name);
        });

      return {
        data: filteredAutomations.length > 0 ? filteredAutomations : [{
          id: 'no-results',
          name: `${searchTerm}`,
          keywords: [],
          active: false,
          createdAt: new Date(),
          listener: null
        }]
      };
    }

    return { data: automations };
  }, [latestVariable, data, searchTerm]);

  // Pagination calculation
  const totalItems = optimisticUiData.data?.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = optimisticUiData.data?.slice(startIndex, endIndex) || [];

  // Reset page if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  if (data?.status !== 200 || data.data.length <= 0) {
    return (
      <div className="h-[70vh] flex justify-center items-center flex-col gap-y-3">
        <h3 className="text-lg text-gray-400">No Automations </h3>
        <CreateAutomation />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-3">
      {paginatedData.map((automation) => (
        <div
          key={automation.id}
          className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex gap-6 relative"
        >
          {automation.id !== 'no-results' ? (
            <Link
              href={`${pathname}/${automation.id}`}
              onClick={() => setLoadingId(automation.id)}
              className="flex gap-6 flex-1"
            >
              {loadingId === automation.id && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {/* Left section with automation details */}
              <div className="flex flex-col flex-1 items-start">
                <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-1">{automation.name}</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {automation.listener?.listener === "SMARTAI" 
                    ? "AI-powered automation with smart responses" 
                    : automation.keywords.length > 0 
                      ? `Responds to messages containing ${automation.keywords.length} keyword${automation.keywords.length === 1 ? '' : 's'}` 
                      : "Standard automation response"}
                </p>

                {/* Keywords section with conditional rendering */}
                {automation.keywords.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {automation.keywords.map((keyword: { id: string; word: string }, key: number) => (
                      <div
                        key={keyword.id}
                        className={cn(
                          "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                          key % 4 === 0 && "bg-emerald-100 text-emerald-700",
                          key % 4 === 1 && "bg-purple-100 text-purple-700",
                          key % 4 === 2 && "bg-amber-100 text-amber-700", 
                          key % 4 === 3 && "bg-rose-100 text-rose-700"
                        )}
                      >
                        {keyword.word}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-full border border-gray-300 dark:border-gray-600 border-dashed px-3 py-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No Keywords</p>
                  </div>
                )}
              </div>
              
              {/* Right section with date and automation type */}
              <div className="flex flex-col justify-between items-end relative">
                <div className="flex flex-col items-end gap-y-2 absolute -top-6 -right-6">
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-tr-lg rounded-bl-lg",
                    automation.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-black"
                  )}>
                    {automation.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-8">
                  <p className="text-sm text-gray-600">
                    {getMonth(automation.createdAt.getUTCMonth() + 1)}{" "}
                    {automation.createdAt.getUTCDate() === 1
                      ? `${automation.createdAt.getUTCDate()}st`
                      : `${automation.createdAt.getUTCDate()}th`}{" "}
                    {automation.createdAt.getUTCFullYear()}
                  </p>
                </div>
              
                {automation.listener?.listener === "SMARTAI" ? (
                  <GradientButton
                    type="BUTTON"
                    className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(30,64,175,0.6)] border border-blue-600/30 relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-800/10 before:to-indigo-900/10 before:rounded-lg before:animate-pulse before:duration-2000 hover:shadow-[0_4px_25px_rgba(30,64,175,0.75)] hover:scale-[1.02]"
                  >
                    <strong>Smart AI</strong>
                  </GradientButton>
                ) : (
                  <Button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors">
                    Standard
                  </Button>
                )}
              </div>
            </Link>
          ) : (
            <>
              {/* Left section with automation details */}
              <div className="flex flex-col flex-1 items-start">
                <h2 className="text-2xl font-medium text-gray-900 mb-1">{automation.name}</h2>
                <p className="text-gray-600 text-sm mb-4">Create a new automation with your search term</p>
                <div className="rounded-full border border-gray-300 border-dashed px-3 py-1">
                  <p className="text-sm text-gray-500">No Keywords</p>
                </div>
              </div>
              
              {/* Right section with Create Automation button */}
              <div className="flex flex-col justify-between items-end relative">
                <div className="flex flex-col items-end gap-y-2 absolute -top-6 -right-6">
                  <span className="text-xs font-medium px-2 py-1 rounded-tr-lg rounded-bl-lg bg-gray-100 text-gray-600">
                    Not Created
                  </span>
                </div>
                <div className="mt-8">
                  <p className="text-sm text-gray-600">
                    {getMonth(automation.createdAt.getUTCMonth() + 1)}{" "}
                    {automation.createdAt.getUTCDate()}{"th"}{" "}
                    {automation.createdAt.getUTCFullYear()}
                  </p>
                </div>
                <CreateAutomation />
              </div>
            </>
          )}
        </div>
      ))}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} automations
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Show first 5 pages, or pages around current page
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
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "w-8 h-8 p-0",
                      currentPage === pageNum && "bg-blue-600 text-white hover:bg-blue-700"
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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationList;
