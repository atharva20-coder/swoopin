import { useAutomationPosts } from "@/hooks/use-automations";
import { useQueryAutomationPosts } from "@/hooks/user-queries";
import React from "react";
import TriggerButton from "../trigger-button";
import { InstagramPostProps } from "@/types/posts.type";
import { CheckCircle, ImageIcon, Film } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Loader from "../../loader";

type Props = {
  id: string;
};

const PostButton = ({ id }: Props) => {
  const { data } = useQueryAutomationPosts();
  const { posts, onSelectPost, mutate, isPending } = useAutomationPosts(id);

  return (
    <TriggerButton label="Attach a post">
      {data?.status === 200 && data?.data?.data?.length > 0 ? (
        <div className="flex flex-col gap-y-6 w-full max-h-[70vh] overflow-y-auto p-4 dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
            {data?.data?.data?.map((post: InstagramPostProps) => (
              <div
                className="relative aspect-square rounded-xl cursor-pointer overflow-hidden bg-gray-50 dark:bg-gray-800/80 group ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300 hover:ring-primary/30 dark:hover:ring-primary/30"
                key={post.id}
                onClick={() =>
                  onSelectPost({
                    postid: post.id,
                    media: post.media_url,
                    mediaType: post.media_type,
                    caption: post.caption,
                  })
                }
              >
                {post.media_type === "VIDEO" ? (
                  <div className="w-full h-full">
                    <video
                      src={post.media_url}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      muted
                      playsInline
                      onError={(e) => {
                        const video = e.target as HTMLVideoElement;
                        if (video.src === post.media_url) {
                          video.src = `/api/instagram-proxy?url=${encodeURIComponent(post.media_url)}`;
                        }
                      }}
                    />
                    <Film className="absolute top-3 right-3 text-white/90 z-10 drop-shadow-md" size={20} />
                  </div>
                ) : (
                  <div className="w-full h-full">
                    <Image
                      fill
                      src={post.media_url}
                      alt={post.caption || "Instagram post"}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 33vw"
                      priority
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        if (img.src === post.media_url) {
                          img.src = `/api/instagram-proxy?url=${encodeURIComponent(post.media_url)}`;
                        }
                      }}
                    />
                    {post.media_type === "CAROUSEL_ALBUM" && (
                      <ImageIcon className="absolute top-3 right-3 text-white/90 z-10 drop-shadow-md" size={20} />
                    )}
                  </div>
                )}
                {posts.find((p) => p.postid === post.id) && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                    <CheckCircle
                      className="text-white drop-shadow-lg"
                      size={24}
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
          <Button
            onClick={mutate}
            disabled={posts.length === 0}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Loader state={isPending}>Attach {posts.length} Post{posts.length !== 1 ? 's' : ''}</Loader>
          </Button>
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-500">No Instagram posts found</p>
          <p className="text-sm text-gray-400 mt-1">Connect your Instagram account to see your posts</p>
        </div>
      )}
    </TriggerButton>
  );
};

export default PostButton;
