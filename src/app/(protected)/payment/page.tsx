"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { onSubscribe } from "@/actions/user";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");
  const cancel = searchParams.get("cancel");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verifyPayment() {
      if (cancel) {
        setStatus("error");
        setMessage("Payment was cancelled");
        return;
      }
      
      if (!orderId) {
        setStatus("error");
        setMessage("No order ID found");
        return;
      }

      try {
        const result = await onSubscribe(orderId);
        
        if (result.status === 200) {
          setStatus("success");
          setMessage("Payment successful! Your subscription is now active.");
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(result.error || "Payment verification failed. Please contact support.");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("error");
        setMessage("Something went wrong. Please contact support.");
      }
    }

    verifyPayment();
  }, [orderId, cancel, router]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-200 dark:border-neutral-800">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 mx-auto text-blue-500 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verifying Payment...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we confirm your payment.
            </p>
          </>
        )}
        
        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Successful! 🎉
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {message}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Redirecting to dashboard...
            </p>
          </>
        )}
        
        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Issue
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
              </Button>
              <Button 
                onClick={() => router.back()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try Again
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
