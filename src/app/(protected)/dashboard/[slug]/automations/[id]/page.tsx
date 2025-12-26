import { getAutomationInfo } from "@/actions/automations";
import { PrefetchUserAutomation } from "@/react-query/prefetch";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FlowManager from "./_components/flow-builder";

type Props = {
  params: { id: string; slug: string };
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const info = await getAutomationInfo(params.id);
    return {
      title: info.data?.name || 'Automation Details',
    };
  } catch (error) {
    return {
      title: 'Automation Details',
    };
  }
}

const Page = async ({ params }: Props) => {
  const query = new QueryClient();
  await PrefetchUserAutomation(query, params.id);

  return (
    <HydrationBoundary state={dehydrate(query)}>
      {/* Full-screen layout without sidebar */}
      <section className="fixed inset-0 flex flex-col dark:bg-black">
        {/* Simple back arrow at top */}
        <div className="absolute top-4 left-4 z-20">
          <Link
            href={`/dashboard/${params.slug}/automations`}
            className="flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {/* Main content area with three panels */}
        <FlowManager automationId={params.id} slug={params.slug} />
      </section>
    </HydrationBoundary>
  );
};

export default Page;
