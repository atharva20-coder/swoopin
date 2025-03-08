"use client";
import { Separator } from "@/components/ui/separator";
import { useQueryAutomation } from "@/hooks/user-queries";
import { PlaneBlue, SmartAi, Warning } from "@/icons";
import { cn } from "@/lib/utils";
import React from "react";
import PostButton from "../post";

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
          ) : (
            <SmartAi />
          )}
          <p className="text-lg text-black">
            {data.data.listener.listener === "MESSAGE"
              ? "Send the user a message."
              : "Let Smart AI take over"}
          </p>
        </div>
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