"use client";
import { ChevronRight, PencilIcon } from "lucide-react";
import React from "react";
import ActivateAutomationButton from "../../activate-automation-button";
import { useQueryAutomation } from "@/hooks/user-queries";
import { useEditAutomation } from "@/hooks/use-automations";
import { useMutationDataState } from "@/hooks/use-mutation-data";
import { Input } from "@/components/ui/input";

type Props = {
  id: string;
};

const AutomationsBreadCrumb = ({ id }: Props) => {
  const { data } = useQueryAutomation(id);
  const { edit, enableEdit, inputRef, isPending } = useEditAutomation(id);
  const { latestVariable } = useMutationDataState(["update-automation"]);

  return (
    <div className="relative w-full px-6 py-4 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-md flex items-center gap-x-4 backdrop-filter backdrop-blur-sm">
      <div className="flex items-center gap-x-3 min-w-0">
        <p className="text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer">Automations</p>
        <ChevronRight className="flex-shrink-0 w-4 h-4" color="#6B7280" />
        <div className="flex items-center gap-x-2 min-w-0">
          {edit ? (
            <Input
              ref={inputRef}
              placeholder={isPending ? latestVariable.variables : "Add a new name"}
              className="bg-transparent h-auto text-base font-medium border-none p-0 focus:ring-2 focus:ring-blue-500/20 rounded transition-all dark:text-gray-100 dark:placeholder-gray-400"
            />
          ) : (
            <p className="text-gray-900 dark:text-gray-100 font-medium truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-default">
              {latestVariable?.variables ? latestVariable.variables.name : data?.data?.name}
            </p>
          )}
          {!edit && (
            <button
              onClick={enableEdit}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors group"
            >
              <PencilIcon size={14} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-x-6 ml-auto">
        <div className="hidden md:flex items-center gap-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            All changes auto-saved
          </p>
        </div>
        <div className="h-6 w-px bg-gray-200 dark:bg-neutral-700" />
        <ActivateAutomationButton id={id} />
      </div>
    </div>
  );
};

export default AutomationsBreadCrumb;
