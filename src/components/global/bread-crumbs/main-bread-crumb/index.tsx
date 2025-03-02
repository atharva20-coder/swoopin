import { PAGE_ICON } from "@/constants/pages";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { HomeDuoToneBlue } from "@/icons/home-duotone-blue";
import { useUser } from "@clerk/nextjs";
import { Sigmar } from 'next/font/google';
import { UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import {Switch} from "@heroui/switch";

const sigmar = Sigmar({ weight: '400', subsets: ['latin'] })

type Props = {
  page: string;
  slug?: string;
};

const MainBreadCrumb = ({ page, slug }: Props) => {
  const { user } = useUser();
  const firstName = user?.firstName || "user";
  const [notifications, setNotifications] = React.useState(true);

  return (
    <div className="flex flex-col items-start w-full">
      <div className="flex items-center justify-between w-full pb-1 pr-4">
        {page === "Home" ? (
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-black">
              Hello, <span className="text-[#2E329F]">{firstName}!</span>
            </h2>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              {PAGE_ICON[page.toUpperCase()] || <HomeDuoToneBlue />}
            </div>
            <h1 className="text-[32px] font-medium text-black">{page.charAt(0).toUpperCase() + page.slice(1)}</h1>
          </div>
        )}
        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900" />
          <Separator orientation="vertical" className="h-6" />
          <UserButton afterSignOutUrl="/" appearance={{
            elements: {
              avatarBox: "w-9 h-9 mr-2",
              userButtonAvatarBox: "w-12 h-12"
            }
          }} />
        </div>
      </div>
      <Separator className="w-full my-2" />
    </div>
  );
};

export default MainBreadCrumb;
