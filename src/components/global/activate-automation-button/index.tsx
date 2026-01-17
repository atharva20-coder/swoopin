import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import React from "react";
import { useQueryAutomation } from "@/hooks/user-queries";
import { useMutationData } from "@/hooks/use-mutation-data";

// REST API helper for activating automation
async function activateAutomationApi(id: string, state: boolean) {
  const res = await fetch(`/api/v1/automations/${id}/activate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active: state }),
  });
  return res.json();
}

type Props = {
  id: string;
};

const ActivateAutomationButton = ({ id }: Props) => {
  const { data } = useQueryAutomation(id);
  const { mutate, isPending } = useMutationData(
    ["activate"],
    (data: { state: boolean }) => activateAutomationApi(id, data.state),
    "automation-info",
  );

  const [optimisticState, setOptimisticState] = React.useState(
    data?.data?.active || false,
  );

  React.useEffect(() => {
    if (!isPending) {
      setOptimisticState(data?.data?.active || false);
    }
  }, [data?.data?.active, isPending]);

  const isActivationAllowed = React.useMemo(() => {
    if (!data?.data) return false;

    // Check for flow-based automation (new flow builder)
    const hasFlowNodes = data.data.flowNodes && data.data.flowNodes.length > 0;
    if (hasFlowNodes) {
      // Flow-based: need at least one trigger and one action node
      const hasTrigger = data.data.flowNodes.some(
        (n: any) => n.type === "trigger",
      );
      const hasAction = data.data.flowNodes.some(
        (n: any) => n.type === "action",
      );
      return hasTrigger && hasAction;
    }

    // Legacy: need triggers and keywords
    if (!data.data.trigger || data.data.trigger.length === 0) return false;
    if (!data.data.keywords || data.data.keywords.length === 0) return false;
    return true;
  }, [data?.data]);

  const handleStateChange = (checked: boolean) => {
    if (!isActivationAllowed && checked) return;
    setOptimisticState(checked);
    mutate({ state: checked });
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        disabled={isPending || !isActivationAllowed}
        checked={optimisticState}
        onCheckedChange={handleStateChange}
        className="data-[state=checked]:hover:bg-green-600 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-slate-400 h-6 w-11 mx-4 [&>span]:data-[state=checked]:translate-x-6 [&>span]:bg-white transition-colors duration-200"
      />
      <span className="text-sm font-medium">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-black" />
        ) : (
          <strong className={optimisticState ? "text-green-500" : "text-black"}>
            {optimisticState ? "Active" : "Inactive"}
          </strong>
        )}
      </span>
    </div>
  );
};

export default ActivateAutomationButton;
