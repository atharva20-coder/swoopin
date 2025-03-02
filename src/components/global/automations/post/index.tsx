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
        <div className="flex flex-col gap-y-4 w-full max-h-[70vh] overflow-y-auto p-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
            {data?.data?.data?.map((post: InstagramPostProps) => (
              <div
                className="relative aspect-square rounded-xl cursor-pointer overflow-hidden bg-gray-100 group"
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
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <Film className="absolute top-2 right-2 text-white z-10" size={20} />
                  </div>
                ) : (
                  <div className="w-full h-full">
                    <Image
                      fill
                      src={post.media_url}
                      alt={post.caption || "Instagram post"}
                      className="object-cover transition-all duration-200 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 33vw"
                      priority
                    />
                    {post.media_type === "CAROSEL_ALBUM" && (
                      <ImageIcon className="absolute top-2 right-2 text-white z-10" size={20} />
                    )}
                  </div>
                )}
                {posts.find((p) => p.postid === post.id) && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <CheckCircle
                      className="text-white"
                      size={24}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <Button
            onClick={mutate}
            disabled={posts.length === 0}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
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
