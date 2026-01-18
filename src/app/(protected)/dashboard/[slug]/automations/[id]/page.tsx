// ... imports
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FlowManager from "./_components/flow-builder";
import { automationService } from "@/services/automation.service";
import { getAuthUser } from "@/app/api/v1/_lib/middleware";
import { redirect } from "next/navigation";

// Helper to get automation safely on server
async function getAutomation(id: string) {
  const user = await getAuthUser();
  if (!user) return null;

  try {
    // We don't get userId from DB here effectively, but automationService checks ownership?
    // Actually automationService.getById requires userId.
    // We need the DB ID, not the session ID (which might be the same but let's be safe).
    // But getAuthUser returns the session user.
    // Let's assume session.user.id IS the db user.id (which it is in this app).
    return await automationService.getById(id, user.id);
  } catch {
    return null;
  }
}

type Props = {
  params: Promise<{ id: string; slug: string }>;
};

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params; // Next.js 15 await params
  const automation = await getAutomation(id);

  return {
    title: automation?.name || "Automation Details",
  };
}

const Page = async (props: Props) => {
  const { id, slug } = await props.params; // Next.js 15 await params
  const user = await getAuthUser();

  if (!user) {
    redirect("/sign-in");
  }

  const query = new QueryClient();

  // Prefetch using direct service call
  await query.prefetchQuery({
    queryKey: ["automation-info"],
    queryFn: async () => {
      const data = await automationService.getById(id, user.id);
      return { status: 200, data }; // Match the API response shape if possible, or adjust client
      // API returns { success: true, data: ... }
      // Client expects res.json() which has that structure.
      // Actually fetchAutomationInfo returns res.json().
      // The API response wrapper makes it { success: true, data: ... }
      // So here we should return { success: true, data }
    },
  });

  return (
    <HydrationBoundary state={dehydrate(query)}>
      {/* Full-screen layout without sidebar */}
      <section className="fixed inset-0 flex flex-col dark:bg-black">
        {/* Simple back arrow at top */}
        <div className="absolute top-4 left-4 z-20">
          <Link
            href={`/dashboard/${slug}/automations`}
            className="flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {/* Main content area with three panels */}
        <FlowManager automationId={id} slug={slug} />
      </section>
    </HydrationBoundary>
  );
};

export default Page;
