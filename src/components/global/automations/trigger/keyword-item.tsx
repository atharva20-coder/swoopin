import { useEditKeyword } from "@/hooks/use-keyword";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface KeywordItemProps {
  word: {
    id: string;
    word: string;
  };
  automationId: string;
  isDeleting: boolean;
  onDelete: () => void;
}

const KeywordItem = ({
  word,
  automationId,
  isDeleting,
  onDelete,
}: KeywordItemProps) => {
  const { EditContainer, isPending, currentValue } = useEditKeyword(
    automationId,
    word.id,
    word.word
  );

  return (
    <div
      className={cn(
        "group bg-[#D6E9FF] dark:bg-blue-900 hover:bg-[#D6E9FF] dark:hover:bg-blue-800 border border-[#80C2FF] dark:border-blue-700 text-[#59677D] dark:text-gray-300 flex items-center gap-x-2 py-1 px-4 rounded-full relative",
        isDeleting && "hidden",
        isPending && "opacity-50 cursor-progress pointer-events-none"
      )}
    >
      <EditContainer>
        <p>{currentValue}</p>
      </EditContainer>
      <button
        className="group-hover:opacity-100 opacity-0 absolute top-0 right-0 rounded-full bg-red-500 dark:bg-red-600"
        onClick={onDelete}
        disabled={isPending}
      >
        <X className="text-white" size={12} />
      </button>
    </div>
  );
};

export default KeywordItem;
