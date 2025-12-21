import { useListener } from "@/hooks/use-automations";
import React, { useState } from "react";
import TriggerButton from "../trigger-button";
import { AUTOMATION_LISTENERS } from "@/constants/automation";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "../../loader";
import { useQueryUser, useQueryAutomation } from "@/hooks/user-queries";
import Image from "next/image";

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
  const { data: automationData } = useQueryAutomation(id);
  const isPro = data?.data?.subscription?.plan === "PRO";
  const hasCarouselTemplates = automationData?.data?.carouselTemplates && automationData.data.carouselTemplates.length > 0;

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
                ? "bg-transparent text-black dark:text-white shadow-lg ring-1 ring-primary/30 ring-offset-1 ring-offset-white dark:ring-offset-gray-800 border border-primary/20"
                : "bg-gray-50 hover:bg-gray-100 dark:bg-neutral-900 dark:hover:bg-gray-600",
              listener.type === "SMARTAI" && !isPro && "opacity-50 cursor-not-allowed",
              listener.type === "SMARTAI" && "border border-blue-200 shadow-[0_4px_20px_rgba(59,130,246,0.25)]",
              listener.type === "CAROUSEL" && "border border-white"
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
          {Listener === "CAROUSEL" && hasCarouselTemplates && (
            <div className="space-y-3">
              {automationData?.data?.carouselTemplates[0]?.elements.map((element: any, index: number) => (
                <div key={index} className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                  {element.imageUrl && (
                    <div className="w-full h-48 bg-gray-100 dark:bg-neutral-800 rounded-lg mb-3 overflow-hidden relative">
                      <Image
                        src={element.imageUrl}
                        alt={element.title || "Template element"}
                        className="object-cover w-full h-full"
                        width={800}
                        height={384}
                      />
                    </div>
                  )}
                  <h3 className="font-medium text-lg mb-1">{element.title}</h3>
                  {element.subtitle && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{element.subtitle}</p>
                  )}
                  {element.buttons?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {element.buttons.map((button: any, btnIndex: number) => (
                        <div
                          key={btnIndex}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-full",
                            button.type === "WEB_URL"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          )}
                        >
                          {button.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <input type="hidden" {...register("carouselTemplateId", { value: automationData?.data?.carouselTemplates[0]?.id })} />
            </div>
          )}
          <Textarea
            placeholder={Listener === "SMARTAI" ? "Add a prompt that your smart AI can use..." : "Add a message you want to send to your customers"}
            {...register("prompt")}
            className={cn(
              "min-h-[100px] bg-gray-50 dark:bg-neutral-700 border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-primary dark:text-white",
              Listener === "SMARTAI" && "border border-blue-200 shadow-[0_4px_20px_rgba(59,130,246,0.25)]"
            )}
          />
          <Input
            {...register("reply")}
            placeholder="Add a reply for comments (Optional)"
            className="bg-gray-50 dark:bg-neutral-700 border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-primary text-black dark:text-white"
          />
          <Button 
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium"
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