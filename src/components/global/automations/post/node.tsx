"use client";
import { Separator } from "@/components/ui/separator";
import { useQueryAutomation } from "@/hooks/user-queries";
import { InstagramBlue, Warning } from "@/icons";
import Image from "next/image";
import React from "react";

type Props = {
  id: string;
};

const PostNode = ({ id }: Props) => {
  const { data } = useQueryAutomation(id);

  return (
    data?.data &&
    data.data.posts.length > 0 && (
      <div className="w-10/12 lg:w-8/12 relative xl:w-4/12 p-5 rounded-xl flex flex-col bg-[#F6F7F9] gap-y-3">
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
          <p className="font-bold text-lg text-black">If they comment on...</p>
        </div>
        <div className="bg-[#ededef] p-3 rounded-xl flex flex-col gap-y-2">
          <div className="flex gap-x-2 items-center">
            <InstagramBlue />
            <p className="text-black">These posts</p>
          </div>
          <div className="flex gap-x-2 flex-wrap mt-3">
            {data.data.posts.map((post) => (
              <div
                key={post.id}
                className="relative w-4/12 aspect-square rounded-lg cursor-pointer overflow-hidden"
              >
                {post.mediaType === "VIDEO" ? (
                  <video
                    className="w-full h-full object-cover"
                    src={post.media}
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : (
                  <Image fill sizes="100vw" src={post.media} alt="post media" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );
};

export default PostNode;
