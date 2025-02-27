"use client"

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from '@heroui/input'

const SignInPage = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/dashboard");
      }
    } catch (err: any) {
      setError(err.errors[0]?.message || "Invalid email or password");
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sign-in",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      setError(err.errors[0]?.message || "An error occurred during Google sign-in.");
    }
  };

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full space-y-6">
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 text-base font-bold text-white bg-black border border-gray-300 rounded-lg hover:bg-gray-900 transition-colors duration-200"
        >
          <Image
              src="/icons/google-logo.svg"
              alt="Google"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full p-1.5"
            />
          Continue with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <div className="w-full space-y-6">
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                variant="bordered"
                isInvalid={!!error}
                errorMessage={error}
                className={`w-full bg-[#EBEBEB] text-black px-6 py-4 text-lg rounded-xl transition-all duration-200 border-2 ${error ? 'border-red-600 focus:border-red-600 focus:ring-red-300' : 'border-gray-300 hover:border-gray-400 focus:border-black focus:ring-black/20'} focus:ring-2 focus:ring-offset-0 !text-black`}
                required
              />
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                variant="bordered"
                isInvalid={!!error}
                errorMessage={error}
                className={`w-full bg-[#EBEBEB] text-black px-6 py-4 text-lg rounded-xl transition-all duration-200 border-2 ${error ? 'border-red-600 focus:border-red-600 focus:ring-red-300' : 'border-gray-300 hover:border-gray-400 focus:border-black focus:ring-black/20'} focus:ring-2 focus:ring-offset-0`}
                required
                minLength={8}
              />
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
            </div>
            {/*
            <button
              type="submit"
              className="w-full bg-black text-white py-4 text-lg font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Sign up with email
            </button>
            */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">Currently email sign-in service is not available. Please login using Google instead.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;