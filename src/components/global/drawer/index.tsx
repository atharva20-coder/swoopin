"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Drawer = ({ isOpen, onClose, children }: Props) => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] bg-black/50 transition-opacity",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-[400px] bg-white dark:bg-black shadow-lg transition-transform duration-300 ease-in-out transform",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors z-50"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
        <ScrollArea className="h-full">
          <div className="p-6">
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Drawer;