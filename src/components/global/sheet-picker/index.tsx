"use client";

import React, { useState, useEffect } from "react";
import { Sheet, RefreshCw, Plus, ChevronDown, FileSpreadsheet, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getUserSpreadsheets,
  createNewSpreadsheet,
  getSpreadsheetTabs,
} from "@/actions/google";
import { cn } from "@/lib/utils";

interface SheetConfig {
  spreadsheetId: string;
  spreadsheetName: string;
  sheetName: string;
}

interface SheetPickerProps {
  value?: SheetConfig | null;
  onChange: (config: SheetConfig | null) => void;
  disabled?: boolean;
}

export default function SheetPicker({ value, onChange, disabled }: SheetPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [spreadsheets, setSpreadsheets] = useState<Array<{ id: string; name: string }>>([]);
  const [tabs, setTabs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"spreadsheet" | "tab">("spreadsheet");
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<{ id: string; name: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (isOpen && spreadsheets.length === 0) {
      loadSpreadsheets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadSpreadsheets = async () => {
    setIsLoading(true);
    try {
      const result = await getUserSpreadsheets();
      if (result.status === 200 && Array.isArray(result.data)) {
        setSpreadsheets(result.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadTabs = async (spreadsheetId: string) => {
    setIsLoading(true);
    try {
      const result = await getSpreadsheetTabs(spreadsheetId);
      if (result.status === 200 && Array.isArray(result.data)) {
        setTabs(result.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSpreadsheet = async (sheet: { id: string; name: string }) => {
    setSelectedSpreadsheet(sheet);
    await loadTabs(sheet.id);
    setStep("tab");
  };

  const handleSelectTab = (tabName: string) => {
    if (selectedSpreadsheet) {
      onChange({
        spreadsheetId: selectedSpreadsheet.id,
        spreadsheetName: selectedSpreadsheet.name,
        sheetName: tabName,
      });
      setIsOpen(false);
      setStep("spreadsheet");
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsLoading(true);
    try {
      const result = await createNewSpreadsheet(newName);
      if (result.status === 200 && typeof result.data === "object") {
        await loadSpreadsheets();
        setShowCreate(false);
        setNewName("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    onChange(null);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors",
          "bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700",
          "hover:border-gray-300 dark:hover:border-neutral-600",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-5 h-5 text-green-600" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {value ? `${value.spreadsheetName} → ${value.sheetName}` : "Select spreadsheet..."}
          </span>
        </div>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700 shadow-lg max-h-72 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-neutral-800">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {step === "spreadsheet" ? "Select Spreadsheet" : "Select Sheet Tab"}
            </span>
            <div className="flex items-center gap-2">
              {step === "tab" && (
                <button
                  onClick={() => setStep("spreadsheet")}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Back
                </button>
              )}
              <button onClick={loadSpreadsheets} disabled={isLoading}>
                <RefreshCw className={cn("w-4 h-4 text-gray-400", isLoading && "animate-spin")} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : step === "spreadsheet" ? (
              <>
                {spreadsheets.map((sheet) => (
                  <button
                    key={sheet.id}
                    onClick={() => handleSelectSpreadsheet(sheet)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-neutral-800 text-left"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{sheet.name}</span>
                  </button>
                ))}
                {spreadsheets.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No spreadsheets found</p>
                )}
              </>
            ) : (
              tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleSelectTab(tab)}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-neutral-800 text-left"
                >
                  <Sheet className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{tab}</span>
                </button>
              ))
            )}
          </div>

          {/* Create New */}
          {step === "spreadsheet" && (
            <div className="border-t border-gray-100 dark:border-neutral-800 p-2">
              {showCreate ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Spreadsheet name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 h-9"
                  />
                  <Button size="sm" onClick={handleCreate} disabled={isLoading}>
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreate(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                >
                  <Plus className="w-4 h-4" />
                  Create New Spreadsheet
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
