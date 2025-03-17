"use client";

// Import necessary dependencies and components
import { useQueryAutomation } from "@/hooks/user-queries";
import React from "react";
import ActiveTrigger from "./active";
import { Separator } from "@/components/ui/separator";
import ThenAction from "../then/then-action";
import TriggerButton from "../trigger-button";
import { AUTOMATION_TRIGGERS } from "@/constants/automation";
import { useTriggers } from "@/hooks/use-automations";
import { cn } from "@/lib/utils";
import Keywords from "./keywords";
import { Button } from "@/components/ui/button";
import Loader from "../../loader";

// Define the component's props interface
type Props = {
  id: string; // Automation ID
};

// Trigger component handles the automation trigger selection and display
const Trigger = ({ id }: Props) => {
  const { types, onSetTrigger, onSaveTrigger, isPending } = useTriggers(id);
  const { data } = useQueryAutomation(id);
  const [hasKeywords, setHasKeywords] = React.useState(false);
  const [keywordInputValue, setKeywordInputValue] = React.useState("");

  React.useEffect(() => {
    const handleKeywordChange = (event: CustomEvent<{ keyword: string; hasKeywords: boolean }>) => {
      setKeywordInputValue(event.detail.keyword);
      setHasKeywords(event.detail.hasKeywords);
    };

    window.addEventListener('keywordChange', handleKeywordChange as EventListener);
    return () => {
      window.removeEventListener('keywordChange', handleKeywordChange as EventListener);
    };
  }, []);

  // If triggers exist, display the active trigger configuration
  if (data?.data && data?.data?.trigger.length > 0) {
    return (
      <div className="flex flex-col gap-y-6 items-center dark:bg-gray-900">
        {/* Display the first trigger type */}
        <ActiveTrigger
          type={data.data.trigger[0].type as "DM" | "COMMENT" | "KEYWORDS"}
          automationId={id}
        />

        {/* If there's a second trigger, display it with an 'or' separator */}
        {data?.data?.trigger.length > 1 && (
          <>
            <div className="relative w-6/12 my-4">
              <p className="absolute transform px-2 -translate-y-1/2 top-1/2 -translate-x-1/2 left-1/2 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
                or
              </p>
              <Separator className="border-gray-200 dark:border-gray-900" />
            </div>
            <ActiveTrigger
              type={data.data.trigger[1].type as "DM" | "COMMENT" | "KEYWORDS"}
              automationId={id}
            />
          </>
        )}

        {/* Display keywords section with separator */}
        <div className="relative w-6/12 my-4">
          <p className="absolute transform px-2 -translate-y-1/2 top-1/2 -translate-x-1/2 left-1/2 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
            with key words
          </p>
          <Separator className="border-gray-200 dark:border-gray-900" />
        </div>

        {/* Display keywords trigger */}
        <ActiveTrigger
          type={"KEYWORDS"}
          keywords={data.data.keywords}
          automationId={id}
        />

        {/* Show ThenAction component if no listener is configured */}
        {!data.data.listener && <ThenAction id={id} />}
      </div>
    );
  }

  // If no triggers exist, display the trigger selection interface
  return (
    <TriggerButton label="Add Trigger">
      <div className="flex flex-col gap-y-3 dark:bg-gray-900">
        {/* Map through available trigger types */}
        {AUTOMATION_TRIGGERS.map((trigger) => (
          <div
            key={trigger.id}
            onClick={() => onSetTrigger(trigger.type)}
            className={cn(
              "p-4 rounded-xl flex cursor-pointer flex-col gap-y-2 transition-all duration-200 border",
              !types?.find((t) => t === trigger.type)
                ? "border-black dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white"
                : "border-green-500 border-2 dark:text-white"
            )}
          >
            <div className="flex gap-x-2 items-center">
              {trigger.icon}
              <p className="font-medium dark:text-white">{trigger.label}</p>
            </div>
            <p className="text-sm opacity-90 dark:text-gray-300">{trigger.description}</p>
          </div>
        ))}

        {/* Keywords input component */}
        <Keywords id={id} />

        {/* Save trigger button with loading state */}
        <Button
          onClick={onSaveTrigger}
          disabled={types?.length === 0 || (!hasKeywords && !keywordInputValue)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:text-white"
        >
          <Loader state={isPending}>Create Trigger</Loader>
        </Button>
      </div>
    </TriggerButton>
  );
};

export default Trigger;
