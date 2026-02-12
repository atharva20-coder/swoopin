"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultEmail?: string;
  defaultName?: string;
};

async function submitEarlyAccessRequest(data: {
  fullName: string;
  email: string;
  instagramHandle?: string;
  note?: string;
}) {
  const res = await fetch("/api/v1/early-access/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export default function EarlyAccessFormDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultEmail = "",
  defaultName = "",
}: Props) {
  const [fullName, setFullName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [instagramHandle, setInstagramHandle] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim()) {
      toast.error("Please fill in your name and email");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitEarlyAccessRequest({
        fullName: fullName.trim(),
        email: email.trim(),
        instagramHandle: instagramHandle.trim() || undefined,
        note: note.trim() || undefined,
      });

      if (result.success) {
        setIsSubmitted(true);
        toast.success("Request submitted! We'll contact you shortly.");
        onSuccess();
      } else {
        toast.error(
          result.error?.message ||
            "Failed to submit request. Please try again.",
        );
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      // Reset form state on close
      setIsSubmitted(false);
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md dark:bg-[#1e1e1e] dark:border-neutral-700/50">
        {isSubmitted ? (
          /* ── Success State ── */
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              You&apos;re on the list!
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              We value our early users and will personally set up your Instagram
              connection. Expect to hear from us very soon!
            </p>
            <Button
              onClick={() => handleClose(false)}
              className="mt-6 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white"
            >
              Got it!
            </Button>
          </div>
        ) : (
          /* ── Form State ── */
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Early Access — Instagram
              </DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400">
                We value our early users! To ensure a smooth integration
                experience, our team will personally set up your Instagram
                connection.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <label
                  htmlFor="ea-fullname"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="ea-fullname"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="dark:bg-[#2a2a2a] dark:border-neutral-600"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="ea-email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  id="ea-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="dark:bg-[#2a2a2a] dark:border-neutral-600"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="ea-instagram"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Instagram Username{" "}
                  <span className="text-gray-400 dark:text-gray-500">
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    @
                  </span>
                  <Input
                    id="ea-instagram"
                    type="text"
                    placeholder="username"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    className="pl-7 dark:bg-[#2a2a2a] dark:border-neutral-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="ea-note"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Anything else?{" "}
                  <span className="text-gray-400 dark:text-gray-500">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="ea-note"
                  rows={2}
                  placeholder="Let us know if you have any specific needs..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#2a2a2a] dark:border-neutral-600 resize-none"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleClose(false)}
                  className="dark:border-neutral-600 dark:text-gray-300 dark:hover:bg-neutral-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Request Early Access
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
