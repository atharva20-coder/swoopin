import { getAllAutomations } from "@/actions/automations";
import SchedulerView from "./_components/scheduler-view";

export default async function SchedulerPage({
  params,
}: {
  params: { slug: string };
}) {
  const automationsResult = await getAllAutomations();
  
  const automations = automationsResult.status === 200 && automationsResult.data
    ? automationsResult.data.map((a: any) => ({
        id: a.id,
        name: a.name,
        active: a.active,
      }))
    : [];

  return (
    <div className="h-full overflow-hidden">
      <SchedulerView slug={params.slug} automations={automations} />
    </div>
  );
}
