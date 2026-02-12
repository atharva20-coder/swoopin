import { onBoardUser } from "@/actions/user";
import { redirect } from "next/navigation";
import React from "react";

type Props = {};

const Page = async (props: Props) => {
  const user = await onBoardUser();

  if (user.status === 200 || user.status === 201) {
    // Use name field and remove spaces for URL slug
    const slug = user.data?.name?.replace(/\s+/g, "") || "user";

    // Redirect admins to admin dashboard with their slug
    if (user.data?.isAdmin) {
      return redirect(`/dashboard/${slug}/admin`);
    }
    return redirect(`/dashboard/${slug}`);
  }

  // If onBoardUser returned 500 (server error), show an error page
  // instead of redirecting to /sign-in, which causes a loop because
  // proxy.ts redirects authenticated users away from /sign-in back to /dashboard.
  if (user.status === 500) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            We encountered an error setting up your account. Please try again.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </a>
        </div>
      </div>
    );
  }

  // Only redirect to sign-in if user is truly not authenticated
  return redirect("/sign-in");
};

export default Page;
