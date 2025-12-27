import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { client } from "@/lib/prisma";
import CollabsView from "./_components/collabs-view";

export default async function CollabsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Get user's partnerships
  const partnerships = await client.brandPartnership.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <CollabsView slug={slug} initialPartnerships={partnerships} />
    </div>
  );
}
