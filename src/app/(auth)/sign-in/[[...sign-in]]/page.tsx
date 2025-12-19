"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authClient, sendVerificationEmail } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationNeeded, setShowVerificationNeeded] = useState(false);

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        if (result.error.message?.toLowerCase().includes("email") && 
            result.error.message?.toLowerCase().includes("verif")) {
          setShowVerificationNeeded(true);
        } else {
          toast.error(result.error.message || "Sign in failed");
        }
      } else {
        toast.success("Signed in successfully!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWithEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setShowPasswordField(true);
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      await sendVerificationEmail({
        email,
        callbackURL: "/dashboard",
      });
      toast.success("Verification email sent! Check your inbox.");
    } catch (error) {
      toast.error("Failed to send verification email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      toast.error("Google sign in failed");
      setIsLoading(false);
    }
  };

  // Verification needed screen
  if (showVerificationNeeded) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex">
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-12">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-8">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-serif text-gray-900 dark:text-white mb-2">
                Email Not Verified
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Please verify your email address
              </p>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-2">
              We sent a verification link to:
            </p>
            <p className="text-gray-900 dark:text-white font-medium mb-6">{email}</p>

            <div className="space-y-3">
              <Button
                onClick={handleResendVerification}
                disabled={isLoading}
                className="w-full h-11 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full font-medium"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Resend Verification Email
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => setShowVerificationNeeded(false)}
                className="w-full h-11 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        </div>

        {/* Right side - Image */}
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

  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-12">
        <div className="max-w-sm mx-auto w-full">
          {/* Tagline */}
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-serif text-gray-900 dark:text-white leading-tight">
              Automate.<br />
              Engage. Grow.
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mt-4">
              AI-powered Instagram automation for creators
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Google Sign In */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              variant="outline"
              className="w-full h-11 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-full font-medium"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="flex items-center my-5">
              <div className="flex-1 border-t border-gray-200 dark:border-gray-600"></div>
              <span className="px-4 text-sm text-gray-500 dark:text-gray-400 uppercase">or</span>
              <div className="flex-1 border-t border-gray-200 dark:border-gray-600"></div>
            </div>

            {/* Email Form */}
            {!showPasswordField ? (
              <form onSubmit={handleContinueWithEmail} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 rounded-full px-5 border border-gray-200 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-gray-200 dark:focus-visible:ring-gray-600"
                  required
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-full font-medium"
                >
                  Continue with email
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSignIn} className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">{email}</span>
                  <button
                    type="button"
                    onClick={() => setShowPasswordField(false)}
                    className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                  >
                    Change
                  </button>
                </div>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 rounded-full px-5 border border-gray-200 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-gray-200 dark:focus-visible:ring-gray-600"
                  required
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-full font-medium"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Sign In
                </Button>
                <div className="text-center">
                  <Link href="/forgot-password" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                    Forgot password?
                  </Link>
                </div>
              </form>
            )}
          </div>

          {/* Sign up link */}
          <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-gray-900 dark:text-white hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Image */}
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