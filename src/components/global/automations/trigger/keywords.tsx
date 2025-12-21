"use client";

import { Input } from "@/components/ui/input";
import { useKeywords } from "@/hooks/use-automations";
import { useMutationDataState } from "@/hooks/use-mutation-data";
import { useQueryAutomation } from "@/hooks/user-queries";
import { Loader2 } from "lucide-react";
import React from "react";
import KeywordItem from "./keyword-item";

type Props = {
  id: string;
};

type KeywordChangeEvent = CustomEvent<{ keyword: string; hasKeywords: boolean }>;

export const Keywords = ({ id }: Props) => {
  const { onValueChange, keyword, onKeyPress, deleteMutation } =
    useKeywords(id);
  const { latestVariable } = useMutationDataState(["add-keyword"]);
  const { latestVariable: latesDeleteVariable } = useMutationDataState([
    "delete-keyword",
  ]);
  const { data } = useQueryAutomation(id);

  // Expose keyword state to parent component
  React.useEffect(() => {
    const event = new CustomEvent('keywordChange', { 
      detail: { 
        keyword, 
        hasKeywords: Boolean(data?.data?.keywords && data.data.keywords.length > 0) 
      } 
    }) as KeywordChangeEvent;
    window.dispatchEvent(event);
  }, [keyword, data?.data?.keywords]);

  const keywords = data?.data?.keywords ?? [];
  const hasKeywords = keywords.length > 0;

  return (
    <div className="bg-[#F6F7F9] dark:bg-neutral-900 flex flex-col gap-y-3 p-3 rounded-xl">
      <div className="flex flex-wrap justify-start gap-2 items-center">
        {hasKeywords &&
          keywords.map(
            (word) =>
              word.id !== latestVariable?.variables?.id && (
                <KeywordItem
                  key={word.id}
                  word={word}
                  automationId={id}
                  isDeleting={latesDeleteVariable?.variables?.id === word.id}
                  onDelete={() => deleteMutation({ id: word.id })}
                />
              )
          )}
        {latestVariable && latestVariable.status === "pending" && (
          <div className="cursor-progress relative bg-[#F6F7F9] dark:bg-neutral-900 flex items-center gap-x-2 text-[#59677D] dark:text-gray-300 py-1 px-4 rounded-full">
            <div className="absolute inset-0 bg-[#80C2FF] dark:bg-blue-600 opacity-30 rounded-full" />
            <p>{latestVariable.variables.keyword}</p>
            <span className="text-[#3352CC] dark:text-blue-400 rounded-full">
              <Loader2 size={12} className="animate-spin" />
            </span>
          </div>
        )}
        <Input
          placeholder="Add keyword..."
          style={{
            width: `${Math.max(Math.min(Math.max(keyword.length || 15, 15), 50), 15)}ch`,
          }}
          value={keyword}
          className="p-2 bg-gray-100/50 dark:bg-neutral-700/50 ring-0 border-none outline-none rounded-full dark:text-gray-200 dark:placeholder-gray-400"
          onChange={onValueChange}
          onKeyUp={onKeyPress}
          required
        />
      </div>
    </div>
  );
};

export default Keywords;
