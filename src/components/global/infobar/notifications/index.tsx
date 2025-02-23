"use client";
import { Button } from "@/components/ui/button";
import { useUserUnseenNotifications } from "../../../../hooks/use-notifications";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";

export const Notifications = ({ slug }: { slug: string }) => {
  const router = useRouter();
  const { notifications } = useUserUnseenNotifications();
  const unSeenNotification = notifications?.filter((n) => n.isSeen == false);

  return (
    <Button
      className="bg-white rounded-full py-6 relative"
      onClick={() => router.push(`/dashboard/${slug}/notifications`)}
    >
      <Bell color="#3352CC" fill="#3352CC" />
      {unSeenNotification && unSeenNotification?.length > 0 ? (
        <span className="absolute text-white font-semibold bg-blue-800 -top-2 -left-3 size-7 flex items-center justify-center rounded-full">
          {unSeenNotification?.length}
        </span>
      ) : null}
    </Button>
  );
};