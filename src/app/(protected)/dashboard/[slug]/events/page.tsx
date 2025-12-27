import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { client } from "@/lib/prisma";
import EventsView from "./_components/events-view";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Get user's events
  const events = await client.instagramEvent.findMany({
    where: { userId: session.user.id },
    orderBy: { startTime: "asc" },
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <EventsView slug={slug} initialEvents={events} />
    </div>
  );
}
