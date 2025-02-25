import { PAGE_ICON } from "@/constants/pages";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { HomeDuoToneBlue } from "@/icons/home-duotone-blue";
import { useUser } from "@clerk/nextjs";
import { Sigmar } from 'next/font/google'

const sigmar = Sigmar({ weight: '400', subsets: ['latin'] })

type Props = {
  page: string;
  slug?: string;
};

const MainBreadCrumb = ({ page, slug }: Props) => {
  const { user } = useUser();
  const firstName = user?.firstName || "user";

  return (
    <div className="flex flex-col items-start w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
            {PAGE_ICON[page.toUpperCase()] || <HomeDuoToneBlue />}
          </div>
          <h1 className="text-[32px] font-medium">{page.charAt(0).toUpperCase() + page.slice(1)}</h1>
        </div>
      </div>
      <Separator className="w-full my-6" />
      {page === "Home" && (
        <div className="flex flex-col gap-2 my-16">
          <h2 className={`${sigmar.className} text-4xl font-bold text-gray-900 mb-2`}>
            Hello, {firstName}!
          </h2>
        </div>
      )}
    </div>
  );
};

export default MainBreadCrumb;
