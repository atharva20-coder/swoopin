import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import DataHubView from "./_components/data-hub-view";

export default async function DataHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <DataHubView slug={slug} />
    </div>
  );
}
