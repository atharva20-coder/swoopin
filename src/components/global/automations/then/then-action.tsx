import { useListener } from "@/hooks/use-automations";
import React from "react";
import TriggerButton from "../trigger-button";
import { AUTOMATION_LISTENERS } from "@/constants/automation";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "../../loader";
import { useQueryUser } from "@/hooks/user-queries";

type Props = {
  id: string;
};

const ThenAction = ({ id }: Props) => {
  const {
    onSetListener,
    listener: Listener,
    onFormSubmit,
    register,
    isPending,
  } = useListener(id);
  const { data } = useQueryUser();
  const isPro = data?.data?.subscription?.plan === "PRO";

  return (
    <TriggerButton label="Then">
      <div className="flex flex-col gap-y-3">
        {AUTOMATION_LISTENERS.map((listener) => (
          <button
            onClick={() => onSetListener(listener.type)}
            key={listener.id}
            disabled={listener.type === "SMARTAI" && !isPro}
            className={cn(
              "text-left p-4 rounded-xl flex flex-col gap-y-2 transition-all duration-200",
              Listener === listener.type
                ? "bg-primary text-white shadow-md"
                : "bg-gray-50 hover:bg-gray-100",
              listener.type === "SMARTAI" && !isPro && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex gap-x-2 items-center">
              {listener.icon}
              <p className="font-medium">{listener.label}</p>
            </div>
            <p className="text-sm opacity-90">
              {listener.type === "SMARTAI" && !isPro
                ? "(Upgrade to use this feature)"
                : listener.description}
            </p>
          </button>
        ))}
        <form onSubmit={onFormSubmit} className="flex flex-col gap-y-3 mt-2">
          <Textarea
            placeholder={
              Listener === "SMARTAI"
                ? "Add a prompt that your smart AI can use..."
                : "Add a message you want to send to your customers"
            }
            {...register("prompt")}
            className="min-h-[100px] bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary"
          />
          <Input
            {...register("reply")}
            placeholder="Add a reply for comments (Optional)"
            className="bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary"
          />
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
            disabled={isPending}
          >
            <Loader state={isPending}>Add listener</Loader>
          </Button>
        </form>
      </div>
    </TriggerButton>
  );
};

export default ThenAction;
