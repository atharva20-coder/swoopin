import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { client } from "@/lib/prisma";
import AdsView from "./_components/ads-view";
import type { AdCampaign } from "@prisma/client";

// Re-export the Prisma type for use in child components
export type { AdCampaign };

export default async function AdsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Get user's campaigns
  let campaigns: AdCampaign[] = [];
  try {
    campaigns = await client.adCampaign.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // Database might be unreachable
    console.log("Could not fetch campaigns");
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AdsView slug={slug} initialCampaigns={campaigns} />
    </div>
  );
}
