"use client";

import { Input } from "@/components/ui/input";
import { useQueryAutomations } from "@/hooks/user-queries";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useMemo, useState, useRef, useEffect } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Use the inline useDebounce hook
  const debouncedSearchValue = useDebounce(searchValue, 300);

  const filteredAutomations = useMemo(() => {
    if (!debouncedSearchValue) return [];
    return (
      data?.data.filter((automation) =>
        automation.name
          .toLowerCase()
          .includes(debouncedSearchValue.toLowerCase())
      ) || []
    );
  }, [data?.data, debouncedSearchValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setSelectedIndex(-1);
    setIsOpen(true);
  };

  const handleSuggestionClick = (automationId: string) => {
    router.push(`/dashboard/${slug}/automations/${automationId}`);
    setIsOpen(false);
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return (
      <span>
        {parts.filter(String).map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      setIsOpen(true);
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredAutomations.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex !== -1) {
          handleSuggestionClick(filteredAutomations[selectedIndex].id);
        } else if (filteredAutomations.length > 0) {
          handleSuggestionClick(filteredAutomations[0].id);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  useEffect(() => {
    if (listRef.current && selectedIndex !== -1) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="relative flex-1 w-full max-w-4xl">
      <div className="flex items-center gap-x-3 px-5 py-3 bg-[#18181B1A] rounded-lg transition-all duration-200 hover:bg-[#18181B30]">
        <SearchIcon className="w-5 h-5 text-[#9B9CA0]" />
        <Input
          ref={inputRef}
          placeholder="Search automations by name..."
          className="border-none bg-transparent text-base placeholder:text-[#9B9CA0] text-[#9B9CA0] focus-visible:ring-0 p-0 w-full"
          value={searchValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {isOpen && (
        <ul
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-2 bg-[#18181B0D] rounded-lg overflow-hidden shadow-xl max-h-[300px] overflow-y-auto z-10"
        >
          {isLoading ? (
            <li className="px-4 py-3 text-[#9B9CA0]">
              Loading...
            </li>
          ) : filteredAutomations.length > 0 ? (
            filteredAutomations.map((automation, index) => (
              <li
                key={automation.id}
                className={`px-4 py-3 cursor-pointer transition-colors duration-150 ${index === selectedIndex ? 'bg-[#18181B30]' : 'hover:bg-[#18181B30]'}`}
                onClick={() => handleSuggestionClick(automation.id)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {highlightText(automation.name, searchValue)}
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-[#9B9CA0]">
              No results found
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default Search;