import { getAutomationInfo } from "@/actions/automations";
import PostNode from "@/components/global/automations/post/node";
import ThenNode from "@/components/global/automations/then/node";
import Trigger from "@/components/global/automations/trigger";
import AutomationsBreadCrumb from "@/components/global/bread-crumbs/automations";
import { Warning } from "@/icons";

import { PrefetchUserAutomation } from "@/react-query/prefetch";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import React from "react";
import DeleteAutomationButton from "./_components/delete-automation-button";
import DrawerButton from "./_components/drawer-button";

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
      <section className="relative min-h-screen pb-24 dark:bg-black">
        <div className="flex flex-col items-center gap-y-20">
          <div className="flex w-full items-center justify-between">
            <AutomationsBreadCrumb id={params.id} />
          </div>
          <div className="w-full lg:w-10/12 xl:w-6/12 p-5 rounded-xl flex flex-col bg-[#F6F7F9] dark:bg-gray-900 gap-y-3">
            <div className="flex gap-x-2 text-black dark:text-white">
              <Warning />
              <strong className="text-black dark:text-white">When...</strong>
            </div>
            <Trigger id={params.id} />
          </div>
          <ThenNode id={params.id} />
          <PostNode id={params.id} />
        </div>
        <div className="fixed bottom-8 right-8 flex gap-x-4">
          <DrawerButton id={params.id} />
          <DeleteAutomationButton id={params.id} />
        </div>
      </section>
    </HydrationBoundary>
  );
};

export default Page;
