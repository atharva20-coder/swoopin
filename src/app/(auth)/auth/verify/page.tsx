"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authClient, sendVerificationEmail } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import NinthNodeLogo from "@/components/global/ninth-node-logo";

type SearchParamsRecord = { [key: string]: string | string[] | undefined };

type VerifyContentProps = {
  searchParams: Promise<SearchParamsRecord>;
};

function VerifyContent({ searchParams }: VerifyContentProps) {
  const router = useRouter();
  const resolved = React.use(searchParams);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const raw = resolved?.error;
  const error = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;

  useEffect(() => {
    if (error) {
      setStatus("error");
      return;
    }

    setStatus("success");
    
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [error, router]);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);
    try {
      await sendVerificationEmail({
        email,
        callbackURL: "/auth/verify",
      });
      toast.success("Verification email sent! Check your inbox.");
    } catch (error) {
      toast.error("Failed to send verification email");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-[calc(100vh-80px)] flex">
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-12">
          <div className="max-w-sm mx-auto w-full text-center">
            <div className="flex justify-center mb-8">
              <NinthNodeLogo showText={true} className="h-10" />
            </div>
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-gray-900 dark:text-white" />
            <p className="text-gray-600 dark:text-gray-400 mt-4">Verifying your email...</p>
          </div>
        </div>
        <div className="hidden lg:block lg:w-1/2 p-6">
          <div className="relative h-full w-full rounded-2xl overflow-hidden">
            <Image
              src="/auth/auth-hero.jpg"
              alt="Authentication"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="min-h-[calc(100vh-80px)] flex">
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-12">
          <div className="max-w-sm mx-auto w-full">
            <div className="flex justify-center lg:justify-start mb-8">
              <NinthNodeLogo showText={true} className="h-10" />
            </div>
            <div className="mb-8">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-serif text-gray-900 dark:text-white mb-2">
                Email Verified!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your account is now active
              </p>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-8">
              Your email has been successfully verified. Redirecting to dashboard...
            </p>

            <Link href="/dashboard">
              <Button className="w-full h-11 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full font-medium">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 p-6">
          <div className="relative h-full w-full rounded-2xl overflow-hidden">
            <Image
              src="/auth/auth-hero.jpg"
              alt="Authentication"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-12">
        <div className="max-w-sm mx-auto w-full">
          <div className="flex justify-center lg:justify-start mb-8">
            <NinthNodeLogo showText={true} className="h-10" />
          </div>
          <div className="mb-8">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif text-gray-900 dark:text-white mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {error === "invalid_token" 
                ? "The verification link is invalid or has expired."
                : "Email verification failed. Please try again."}
            </p>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Enter your email below to receive a new verification link.
          </p>

          <form onSubmit={handleResendVerification} className="space-y-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-full px-5 border border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-gray-200 dark:focus-visible:ring-gray-700 focus-visible:border-gray-400 dark:focus-visible:border-gray-500"
              required
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full font-medium"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Resend Verification Email
            </Button>
          </form>

          <div className="mt-6">
            <Link href="/sign-in">
              <Button
                variant="ghost"
                className="w-full h-11 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full"
              >
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 p-6">
        <div className="relative h-full w-full rounded-2xl overflow-hidden">
          <Image
            src="/auth/auth-hero.jpg"
            alt="Authentication"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-12">
        <div className="max-w-sm mx-auto w-full text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-gray-900 dark:text-white" />
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2 p-6">
        <div className="relative h-full w-full rounded-2xl overflow-hidden">
          <Image
            src="/auth/auth-hero.jpg"
            alt="Authentication"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}

type PageProps = {
  searchParams?: Promise<SearchParamsRecord>;
};

export default function VerifyPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ?? Promise.resolve({});
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyContent searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
