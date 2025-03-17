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
      <div className="w-10/12 lg:w-8/12 relative xl:w-4/12 p-6 rounded-2xl flex flex-col bg-white dark:bg-gray-800 gap-y-4 shadow-lg dark:shadow-gray-900/30 transition-all duration-300 hover:shadow-xl dark:hover:shadow-gray-900/40">
        <div className="absolute h-20 left-1/2 bottom-full flex flex-col items-center z-50">
          <span className="h-2.5 w-2.5 bg-primary dark:bg-primary rounded-full shadow-md" />
          <Separator
            orientation="vertical"
            className="bottom-full flex-1 border border-primary/30 dark:border-primary/30 border-dashed"
          />
          <span className="h-2.5 w-2.5 bg-primary dark:bg-primary rounded-full shadow-md" />
        </div>
        <div className="flex gap-x-3 items-center">
          <Warning className="text-amber-500 dark:text-amber-400" />
          <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">If they comment on...</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex flex-col gap-y-3 backdrop-blur-sm">
          <div className="flex gap-x-3 items-center">
            <InstagramBlue className="w-5 h-5" />
            <p className="text-gray-700 dark:text-gray-200 font-medium">These posts</p>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {data.data.posts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square rounded-lg cursor-pointer overflow-hidden group ring-1 ring-black/5 dark:ring-white/10"
              >
                {post.mediaType === "VIDEO" ? (
                  <video
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    src={post.media}
                    muted
                    loop
                    playsInline
                    autoPlay
                    onError={(e) => {
                      const video = e.target as HTMLVideoElement;
                      if (video.src === post.media) {
                        video.src = `/api/instagram-proxy?url=${encodeURIComponent(post.media)}`;
                      }
                    }}
                  />
                ) : (
                  <Image 
                    fill 
                    sizes="100vw" 
                    src={post.media} 
                    alt="post media"
                    className="object-cover transition-transform duration-300 group-hover:scale-110" 
                  />
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );
};

export default PostNode;
