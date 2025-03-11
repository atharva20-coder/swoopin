"use client";
import { Separator } from "@/components/ui/separator";
import { useQueryAutomation } from "@/hooks/user-queries";
import { PlaneBlue, SmartAi, Warning } from "@/icons";
import { cn } from "@/lib/utils";
import React from "react";
import PostButton from "../post";
import Image from "next/image";
import { LayoutPanelTop } from "lucide-react";

type Props = {
  id: string;
};

const ThenNode = ({ id }: Props) => {
  const { data } = useQueryAutomation(id);
  const commentTrigger = data?.data?.trigger.find((t) => t.type === "COMMENT");

  return !data?.data?.listener ? (
    <></>
  ) : (
    <div className="w-full lg:w-10/12 relative xl:w-6/12 p-5 rounded-xl flex flex-col bg-[#F6F7F9] gap-y-3">
      <div className="absolute h-20 left-1/2 bottom-full flex flex-col items-center z-50">
        <span className="h-[9px] w-[9px] bg-black rounded-full" />
        <Separator
          orientation="vertical"
          className="bottom-full flex-1 border-[1px] border-dashed border-black"
        />
        <span className="h-[9px] w-[9px] bg-black rounded-full" />
      </div>
      <div className="flex gap-x-2">
        <Warning />
        <strong className="text-black">Then...</strong>
      </div>
      <div className="bg-[#ededef] hover:bg-[#dfdfdf] p-3 rounded-xl flex flex-col gap-y-2">
        <div className="flex gap-x-2 items-center">
          {data.data.listener.listener === "MESSAGE" ? (
            <PlaneBlue />
          ) : data.data.listener.listener === "SMARTAI" ? (
            <SmartAi />
          ) : (
            <LayoutPanelTop className="text-blue-500" />
          )}
          <p className="text-lg text-black">
            {data.data.listener.listener === "MESSAGE"
              ? "Send the user a message."
              : data.data.listener.listener === "SMARTAI"
              ? "Let Smart AI take over"
              : "Send a Generic Template"}
          </p>
        </div>
        
        {/* Display prompt and comment reply for all listener types */}
        <div className="mb-3">
          <p className={cn(
            "font-light text-black",
            data.data.listener.listener === "SMARTAI" && "border border-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.5)] p-3 rounded-xl"
          )}>
            {data.data.listener.prompt}
          </p>
          {data.data.listener.commentReply && (
            <div className="mt-3 bg-white/50 p-3 rounded-xl border border-gray-200 shadow-sm">
              <p className="font-light text-black">
                <span className="font-medium">Reply:</span> {data.data.listener.commentReply}
              </p>
            </div>
          )}
        </div>
        
        {/* Display carousel template if available */}
        {data.data.listener.listener === "CAROUSEL" && data.data.carouselTemplates && data.data.carouselTemplates.length > 0 && (
          <div className="space-y-3 mt-4 border-t border-gray-200 pt-4">
            <p className="font-medium text-black mb-2">Template Preview:</p>
            {data.data.carouselTemplates[0]?.elements.map((element: any, index: number) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                {element.imageUrl && (
                  <div className="w-full h-48 bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
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
                  <p className="text-gray-600 text-sm mb-3">{element.subtitle}</p>
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
          </div>
        )}
      </div>
      {data.data.posts.length > 0 ? (
        <></>
      ) : commentTrigger ? (
        <PostButton id={id} />
      ) : (
        <></>
      )}
    </div>
  );
};

export default ThenNode;