"use client"

import { useState, useEffect } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from '@heroui/input'

const SignUpPage = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [shouldShowContent, setShouldShowContent] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    setShouldShowContent(true);
  }, [isLoaded]);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
  
    try {
      // Check if user exists in database
      const response = await fetch('/api/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
  
      if (data.exists) {
        setError('An account with this email already exists. Please sign in instead.');
        return;
      }
  
      // Proceed with sign up if user doesn't exist
      await signUp.create({
        emailAddress: email,
        password,
      });
      setVerifying(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'An error occurred. Please try again.');
    }
  };

{/**
  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sign-in",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      setError(err.errors[0]?.message || "An error occurred during Google sign-up.");
    }
  };
  
*/}


  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sign-up",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      setError(err.errors[0]?.message || "An error occurred during Google sign-in.");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsCompleting(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/dashboard");
      } else {
        setIsCompleting(false);
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.errors[0]?.message || "Verification failed. Please try again.");
      setIsCompleting(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    } catch (err: any) {
      setError("Failed to resend code. Please try again.");
    }
  };

  if (!shouldShowContent || isCompleting) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {!verifying ? (
        <div className="w-full space-y-6">
          <button
            onClick={handleGoogleSignUp}
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
  
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">Currently email sign-up service is not available. Please use Google sign-up instead.</p>
          </div>
        </div>
      ) : verifying ? (
        <form onSubmit={handleVerify} className="space-y-4">
          <p className="text-sm text-gray-600">We sent a verification code to {email}</p>
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            label="Verification Code"
            placeholder="Enter verification code"
            variant="bordered"
            isInvalid={!!error}
            errorMessage={error}
            className={`w-full bg-[#EBEBEB] text-black px-6 py-4 text-lg rounded-xl transition-all duration-200 ${error ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-black'} focus:ring-0`}
            required
          />
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-black text-white py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Verify email
          </button>
          <button
            type="button"
            onClick={handleResendCode}
            className="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            Didn&apos;t receive a code? Click to resend
          </button>
        </form>
      ) : (
        <div className="w-full space-y-6">
          <form onSubmit={handleEmailSignUp} className="space-y-4">
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
            <button
              type="submit"
              className="w-full bg-black text-white py-4 text-lg font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Sign up with email
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default SignUpPage;