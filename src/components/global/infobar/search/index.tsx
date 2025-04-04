"use client";

import { Input } from "@/components/ui/input";
import { useQueryAutomations } from "@/hooks/user-queries";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useMemo, useState, useRef, useEffect } from "react";
import CreateAutomation from "../../create-automation";

type Props = {
  slug: string;
};

// Inline useDebounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const Search = ({ slug }: Props) => {
  const { data, isLoading } = useQueryAutomations();
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Use the inline useDebounce hook
  const debouncedSearchValue = useDebounce(searchValue, 300);

  // Expose the search value to parent components through a custom event
  useEffect(() => {
    const event = new CustomEvent('automationSearch', {
      detail: { searchTerm: debouncedSearchValue }
    });
    window.dispatchEvent(event);
  }, [debouncedSearchValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  return (
    <div className="relative flex-1 w-full max-w-4xl">
      <div className="flex items-center gap-x-3 px-3 sm:px-5 py-2 sm:py-3 bg-[#18181B1A] dark:bg-gray-800/50 rounded-lg transition-all duration-200 hover:bg-[#18181B30] dark:hover:bg-gray-700/50">
        <SearchIcon className="min-w-[20px] w-5 h-5 text-[#9B9CA0] dark:text-gray-400" />
        <Input
          ref={inputRef}
          placeholder="Search automations..."
          className="border-none bg-transparent text-sm sm:text-base placeholder:text-[#9B9CA0] dark:placeholder:text-gray-400 text-[#000000] dark:text-white focus-visible:ring-0 p-0 w-full"
          value={searchValue}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default Search;