"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sanitizeErrorMessage } from "@/lib/error-sanitizer";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log full error in console for debugging (only visible to developers)
    console.error("Dashboard error:", error);
  }, [error]);

  // Sanitize error message to hide sensitive information in production
  const safeMessage = sanitizeErrorMessage(error);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Something went wrong
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
        {safeMessage}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
        <Button variant="outline" onClick={() => window.location.href = "/"} className="gap-2">
          <Home className="w-4 h-4" />
          Go Home
        </Button>
      </div>
      {error.digest && (
        <p className="text-xs text-gray-400 mt-4">Error ID: {error.digest}</p>
      )}
    </div>
  );
}
