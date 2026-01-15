import { automationService } from "@/services/automation.service";
import { schedulerService } from "@/services/scheduler.service";
import { getDbUser } from "@/actions/user";
import SchedulerView from "./_components/scheduler-view";
import { redirect } from "next/navigation";

export default async function SchedulerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Get current user
  const dbUser = await getDbUser();
  if (!dbUser) {
    return redirect("/sign-in");
  }

  // Fetch automations using service
  const automationsResult = await automationService.listByUser(dbUser.id, {
    limit: 100,
  });
  const automations = automationsResult.data.map((a) => ({
    id: a.id,
    name: a.name,
    active: a.active,
  }));

  // Fetch scheduled posts using service
  const postsResult = await schedulerService.listPosts(dbUser.id, {
    limit: 100,
  });
  const scheduledPosts = postsResult.data.map((p) => ({
    id: p.id,
    caption: p.caption ?? undefined,
    mediaUrl: p.mediaUrl ?? undefined,
    mediaType: p.mediaType,
    postType: p.postType,
    scheduledFor: new Date(p.scheduledFor),
    hashtags: p.hashtags ?? undefined,
    status: p.status,
    automationId: p.automationId ?? undefined,
    location: p.location ?? undefined,
    altText: p.altText ?? undefined,
  }));

  // Fetch drafts using service
  const draftsResult = await schedulerService.getDrafts(dbUser.id);
  const drafts = draftsResult.map((d) => ({
    id: d.id,
    title: d.title || "Untitled",
    type: (d.mediaType === "VIDEO" ? "REEL" : "POST") as
      | "POST"
      | "REEL"
      | "STORY",
    status: "draft" as const,
    updatedAt: new Date(d.updatedAt),
  }));

  return (
    <div className="h-full overflow-hidden">
      <SchedulerView
        slug={slug}
        automations={automations}
        initialScheduledPosts={scheduledPosts}
        initialDrafts={drafts}
      />
    </div>
  );
}
