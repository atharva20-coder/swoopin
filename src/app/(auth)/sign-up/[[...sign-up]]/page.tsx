"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail, Lock, User, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"email" | "details">("email");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinueWithEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setStep("details");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        toast.error(result.error.message || "Sign up failed");
      } else {
        setShowSuccess(true);
        toast.success("Account created! Check your email for verification link.");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        newUserCallbackURL: "/dashboard",
      });
    } catch (error) {
      toast.error("Google sign up failed");
      setIsLoading(false);
    }
  };

  // Success screen after sign up
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1e1e1e] flex items-center justify-center p-4 transition-colors">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Check your email
            </h1>
            <p className="text-gray-500 dark:text-[#8c8c8c]">
              We sent a verification link to
            </p>
            <p className="text-gray-900 dark:text-white font-medium mt-1">{email}</p>
          </div>

          <p className="text-gray-500 dark:text-[#8c8c8c] text-sm text-center mb-6">
            Click the link in the email to verify your account and complete registration.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => {
                authClient.sendVerificationEmail({
                  email,
                  callbackURL: "/dashboard",
                });
                toast.success("Verification email resent!");
              }}
              variant="outline"
              className="w-full h-12 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-[#383838] border-gray-200 dark:border-[#383838] text-gray-900 dark:text-white rounded-lg font-medium"
            >
              Resend verification email
            </Button>
            
            <Link href="/sign-in">
              <Button
                variant="ghost"
                className="w-full h-12 text-gray-500 hover:text-gray-900 dark:text-[#8c8c8c] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2c2c2c] rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1e1e1e] flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-[#0d99ff] dark:to-[#7c3aed] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            Create an account
          </h1>
          <p className="text-gray-500 dark:text-[#8c8c8c]">
            Get started with Auctorn for free
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-[#2c2c2c] rounded-2xl p-6 border border-gray-200 dark:border-[#383838] shadow-sm dark:shadow-none">
          {/* Google Sign Up */}
          <Button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            variant="outline"
            className="w-full h-12 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-[#383838] border-gray-200 dark:border-[#383838] text-gray-900 dark:text-white rounded-lg font-medium"
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
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200 dark:border-[#383838]"></div>
            <span className="px-4 text-sm text-gray-400 dark:text-[#8c8c8c]">or</span>
            <div className="flex-1 border-t border-gray-200 dark:border-[#383838]"></div>
          </div>

          {/* Email Form - Step 1 */}
          {step === "email" && (
            <form onSubmit={handleContinueWithEmail} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-[#8c8c8c]" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-gray-50 dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#5c5c5c] rounded-lg pl-12 border-gray-200 dark:border-[#383838] focus-visible:ring-1 focus-visible:ring-blue-500 dark:focus-visible:ring-[#0d99ff] focus-visible:border-blue-500 dark:focus-visible:border-[#0d99ff]"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 dark:bg-[#0d99ff] dark:hover:bg-[#0b87e3] text-white rounded-lg font-medium"
              >
                Continue
              </Button>
            </form>
          )}

          {/* Details Form - Step 2 */}
          {step === "details" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-900 dark:text-[#8c8c8c] dark:hover:text-white text-sm mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-gray-900 dark:text-white">{email}</span>
              </button>
              
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-[#8c8c8c]" />
                <Input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 bg-gray-50 dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#5c5c5c] rounded-lg pl-12 border-gray-200 dark:border-[#383838] focus-visible:ring-1 focus-visible:ring-blue-500 dark:focus-visible:ring-[#0d99ff] focus-visible:border-blue-500 dark:focus-visible:border-[#0d99ff]"
                  required
                  autoFocus
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-[#8c8c8c]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-gray-50 dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#5c5c5c] rounded-lg pl-12 pr-12 border-gray-200 dark:border-[#383838] focus-visible:ring-1 focus-visible:ring-blue-500 dark:focus-visible:ring-[#0d99ff] focus-visible:border-blue-500 dark:focus-visible:border-[#0d99ff]"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:text-[#8c8c8c] dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 dark:bg-[#0d99ff] dark:hover:bg-[#0b87e3] text-white rounded-lg font-medium"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create account
              </Button>
              
              <p className="text-gray-400 dark:text-[#5c5c5c] text-xs text-center">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-gray-500 hover:text-gray-900 dark:text-[#8c8c8c] dark:hover:text-white">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy_policy" className="text-gray-500 hover:text-gray-900 dark:text-[#8c8c8c] dark:hover:text-white">Privacy Policy</Link>
              </p>
            </form>
          )}
        </div>

        {/* Sign in link */}
        <p className="text-center text-gray-500 dark:text-[#8c8c8c] mt-6">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-blue-600 hover:text-blue-700 dark:text-[#0d99ff] dark:hover:text-[#0b87e3] font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}