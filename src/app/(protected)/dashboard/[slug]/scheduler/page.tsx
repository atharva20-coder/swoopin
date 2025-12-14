import { getAllAutomations } from "@/actions/automations";
import { getScheduledPosts, getContentDrafts } from "@/actions/scheduler";
import SchedulerView from "./_components/scheduler-view";

export default async function SchedulerPage({
  params,
}: {
  params: { slug: string };
}) {
  // Fetch automations
  const automationsResult = await getAllAutomations();
  const automations = automationsResult.status === 200 && automationsResult.data
    ? automationsResult.data.map((a: any) => ({
        id: a.id,
        name: a.name,
        active: a.active,
      }))
    : [];

  // Fetch scheduled posts
  const postsResult = await getScheduledPosts();
  const scheduledPosts = postsResult.status === 200 && postsResult.data
    ? postsResult.data.map((p: any) => ({
        id: p.id,
        caption: p.caption,
        mediaUrl: p.mediaUrl,
        mediaUrls: p.carouselItems ? (p.carouselItems as any[]).map(item => item.imageUrl || item.videoUrl) : undefined,
        mediaType: p.mediaType,
        postType: p.postType,
        scheduledFor: new Date(p.scheduledFor),
        hashtags: p.hashtags,
        status: p.status,
        automationId: p.automationId,
        location: p.location,
        music: p.music,
        taggedUsers: p.taggedUsers,
        collaborators: p.collaborators,
        altText: p.altText,
      }))
    : [];

  // Fetch drafts
  const draftsResult = await getContentDrafts();
  const drafts = draftsResult.status === 200 && draftsResult.data
    ? draftsResult.data.map((d: any) => ({
        id: d.id,
        title: d.title || "Untitled",
        type: (d.mediaType === "VIDEO" ? "REEL" : "POST") as "POST" | "REEL" | "STORY",
        status: "draft" as const,
        updatedAt: new Date(d.updatedAt),
      }))
    : [];

  return (
    <div className="h-full overflow-hidden">
      <SchedulerView 
        slug={params.slug} 
        automations={automations} 
        initialScheduledPosts={scheduledPosts}
        initialDrafts={drafts}
      />
    </div>
  );
}
