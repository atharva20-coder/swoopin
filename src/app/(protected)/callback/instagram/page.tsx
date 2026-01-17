import { integrationService } from "@/services/integration.service";
import { getDbUser } from "@/actions/user";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  searchParams: Promise<{
    code?: string;
    error?: string;
    error_reason?: string;
  }>;
};

const Page = async ({ searchParams }: Props) => {
  const { code, error, error_reason } = await searchParams;

  // Handle OAuth error from Instagram
  if (error) {
    console.error("Instagram OAuth error:", error, error_reason);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-xl font-bold text-red-500">
          Instagram Connection Failed
        </h1>
        <p className="text-gray-600 mt-2">{error_reason || error}</p>
        <a href="/dashboard" className="mt-4 text-blue-600 underline">
          Go back to Dashboard
        </a>
      </div>
    );
  }

  if (code) {
    console.log(
      "Instagram OAuth code received:",
      code.substring(0, 20) + "...",
    );

    // Get the current user
    const dbUser = await getDbUser();
    if (!dbUser) {
      console.error("Instagram callback: No database user found");
      return redirect("/sign-in");
    }

    console.log("Instagram callback: User found:", dbUser.id);

    // Connect Instagram using the service
    try {
      const result = await integrationService.connectInstagram(
        dbUser.id,
        code.split("#_")[0],
      );

      if (!("error" in result)) {
        console.log("Instagram connected successfully!");
        // Success - redirect to integrations page
        const slug = dbUser.name?.replace(/\s+/g, "") || "user";
        return redirect(`/dashboard/${slug}/integrations?instagram=connected`);
      }

      console.error("Instagram integration error:", result.error);
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-xl font-bold text-red-500">Integration Failed</h1>
          <p className="text-gray-600 mt-2">{result.error}</p>
          <a href="/dashboard" className="mt-4 text-blue-600 underline">
            Go back to Dashboard
          </a>
        </div>
      );
    } catch (err) {
      console.error("Instagram callback exception:", err);
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-xl font-bold text-red-500">An Error Occurred</h1>
          <p className="text-gray-600 mt-2">
            {err instanceof Error ? err.message : "Unknown error"}
          </p>
          <a href="/dashboard" className="mt-4 text-blue-600 underline">
            Go back to Dashboard
          </a>
        </div>
      );
    }
  }

  // No code provided
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-xl font-bold text-red-500">Invalid Request</h1>
      <p className="text-gray-600 mt-2">No authorization code provided</p>
      <a href="/dashboard" className="mt-4 text-blue-600 underline">
        Go back to Dashboard
      </a>
    </div>
  );
};

export default Page;
