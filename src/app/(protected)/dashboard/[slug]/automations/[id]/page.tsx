import { getAutomationInfo } from "@/actions/automations";
import AutomationsBreadCrumb from "@/components/global/bread-crumbs/automations";

import { PrefetchUserAutomation } from "@/react-query/prefetch";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import React from "react";
import DeleteAutomationButton from "./_components/delete-automation-button";
import FlowCanvas from "@/components/global/automations/flow-canvas";
import ComponentsPanel from "@/components/global/automations/components-panel";
import ConfigPanel from "@/components/global/automations/config-panel";
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
        {/* Top bar with breadcrumb and actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/${params.slug}/automations`}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <AutomationsBreadCrumb id={params.id} />
          </div>
          <div className="flex gap-x-4">
            <DeleteAutomationButton id={params.id} />
          </div>
        </div>

        {/* Main content area with three panels */}
        <FlowManager automationId={params.id} slug={params.slug} />
      </section>
    </HydrationBoundary>
  );
};

export default Page;
