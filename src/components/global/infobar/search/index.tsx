"use client";

import { Input } from "@/components/ui/input";
import { useQueryAutomations } from "@/hooks/user-queries";
import { SearchIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useMemo, useState, useRef, useEffect } from "react";

type Props = {
  slug: string;
};

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
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearchValue = useDebounce(searchValue, 300);

  useEffect(() => {
    const event = new CustomEvent('automationSearch', {
      detail: { searchTerm: debouncedSearchValue }
    });
    window.dispatchEvent(event);
  }, [debouncedSearchValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const clearSearch = () => {
    setSearchValue("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <div className={`
        flex items-center gap-3 px-4 py-3 
        bg-white dark:bg-gray-900 
        border-2 rounded-xl 
        transition-all duration-200
        ${isFocused 
          ? 'border-indigo-500 shadow-lg shadow-indigo-500/10' 
          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
        }
      `}>
        <SearchIcon className={`w-5 h-5 transition-colors ${isFocused ? 'text-indigo-500' : 'text-gray-400'}`} />
        <Input
          ref={inputRef}
          placeholder="Search automations by name..."
          className="border-none bg-transparent text-base placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white focus-visible:ring-0 p-0"
          value={searchValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {searchValue && (
          <button
            onClick={clearSearch}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Search;