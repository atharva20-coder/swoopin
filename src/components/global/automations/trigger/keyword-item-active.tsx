import { useEditKeyword } from "@/hooks/use-keyword";
import {
  useMutationData,
  useMutationDataState,
} from "@/hooks/use-mutation-data";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import React from "react";

// REST API helper for deleting keyword
async function deleteKeywordApi(id: string) {
  const res = await fetch(`/api/v1/automations/keywords/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

interface KeywordItemProps {
  word: {
    id: string;
    word: string;
  };
  automationId: string;
}

const KeywordItemActive = ({ automationId, word }: KeywordItemProps) => {
  const { mutate: deleteMutation } = useMutationData(
    ["delete-keyword"],
    (data: { id: string }) => deleteKeywordApi(data.id),
    "automation-info"
  );
  const { latestVariable: latesDeleteVariable } = useMutationDataState([
    "delete-keyword",
  ]);
  const { EditContainer, isPending, currentValue } = useEditKeyword(
    automationId,
    word.id,
    word.word
  );

  return (
    <div
      className={cn(
        "group bg-[#D6E9FF] dark:bg-blue-900 hover:bg-[#D6E9FF] dark:hover:bg-blue-800 border border-[#80C2FF] dark:border-blue-700 text-[#59677D] dark:text-gray-300 flex items-center gap-x-2 py-1 px-4 rounded-full relative",
        latesDeleteVariable?.variables?.id === word.id &&
          "opacity-50 cursor-progress pointer-events-none",
        isPending && "opacity-50 cursor-progress pointer-events-none"
      )}
    >
      <EditContainer>
        <p>{currentValue}</p>
      </EditContainer>
      <button
        className="group-hover:opacity-100 opacity-0 absolute top-0 right-0 rounded-full bg-red-500 dark:bg-red-600"
        onClick={() => deleteMutation({ id: word.id })}
        disabled={isPending}
      >
        <X className="text-white" size={12} />
      </button>
    </div>
  );
};

export default KeywordItemActive;
