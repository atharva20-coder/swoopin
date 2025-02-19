"use client";
import { usePaths } from "@/hooks/use-nav";
import { cn, getMonth } from "@/lib/utils";
import Link from "next/link";
import React, { useMemo } from "react";
import GradientButton from "../gradient-button";
import { Button } from "@/components/ui/button";
import { useQueryAutomations } from "@/hooks/user-queries";
import CreateAutomation from "../create-automation";
import { useMutationDataState } from "@/hooks/use-mutation-data";

type Props = {};

// AutomationList component displays a list of automation cards with their details
const AutomationList = (props: Props) => {
  const { data } = useQueryAutomations();
  const { latestVariable } = useMutationDataState(["create-automation"]);
  const { pathname } = usePaths();
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const optimisticUiData = useMemo(() => {
    if (latestVariable && latestVariable?.variables && data) {
      const test = [latestVariable.variables, ...data.data];
      return { data: test };
    }
    return data || { data: [] };
  }, [latestVariable, data]);

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
      {optimisticUiData.data!.map((automation) => (
        <Link
          href={`${pathname}/${automation.id}`}
          key={automation.id}
          onClick={() => setLoadingId(automation.id)}
          className="bg-white hover:bg-gray-50 transition-all duration-200 rounded-lg p-6 border border-gray-200 shadow-sm flex gap-6 relative"
        >
          {loadingId === automation.id && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {/* Left section with automation details */}
          <div className="flex flex-col flex-1 items-start">
            <h2 className="text-2xl font-medium text-gray-900 mb-1">{automation.name}</h2>
            <p className="text-gray-600 text-sm mb-4">
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
              <div className="rounded-full border border-gray-300 border-dashed px-3 py-1">
                <p className="text-sm text-gray-500">No Keywords</p>
              </div>
            )}
          </div>
          
          {/* Right section with date and automation type */}
          <div className="flex flex-col justify-between items-end relative">
            <div className="flex flex-col items-end gap-y-2 absolute -top-6 -right-6">
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded-tr-lg rounded-bl-lg",
                automation.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
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
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Smart AI
              </GradientButton>
            ) : (
              <Button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
                Standard
              </Button>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default AutomationList;
