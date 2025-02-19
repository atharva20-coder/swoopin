import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import React from "react";
import { useQueryAutomation } from "@/hooks/user-queries";
import { useMutationData } from "@/hooks/use-mutation-data";
import { activateAutomation } from "@/actions/automations";

type Props = {
  id: string;
};

const ActivateAutomationButton = ({ id }: Props) => {
  const { data } = useQueryAutomation(id);
  const { mutate, isPending } = useMutationData(
    ["activate"],
    (data: { state: boolean }) => activateAutomation(id, data.state),
    "automation-info"
  );

  const [optimisticState, setOptimisticState] = React.useState(data?.data?.active || false);

  React.useEffect(() => {
    if (!isPending) {
      setOptimisticState(data?.data?.active || false);
    }
  }, [data?.data?.active, isPending]);

  const handleStateChange = (checked: boolean) => {
    setOptimisticState(checked);
    mutate({ state: checked });
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        disabled={isPending}
        checked={optimisticState}
        onCheckedChange={handleStateChange}
        className="data-[state=checked]:hover:bg-green-600 data-[state=checked]:bg-green-500 data-[state=unchecked]:hover:bg-slate-500 data-[state=unchecked]:bg-slate-400 h-6 w-11 mx-4 [&>span]:data-[state=checked]:translate-x-6 [&>span]:bg-white transition-colors duration-200"
      />
      <span className="text-sm font-medium">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <strong className={optimisticState ? "text-green-500" : ""}>
            {optimisticState ? "Active" : "Inactive"}
          </strong>
        )}
      </span>
    </div>
  );
};

export default ActivateAutomationButton;
