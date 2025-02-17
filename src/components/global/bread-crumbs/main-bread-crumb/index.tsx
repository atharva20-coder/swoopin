import { PAGE_ICON } from "@/constants/pages";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { HomeDuoToneBlue } from "@/icons/home-duotone-blue";
import { useUser } from "@clerk/nextjs";

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
          <HomeDuoToneBlue />
          <h1 className="text-[32px] font-medium">{page}</h1>
        </div>
      </div>
      <Separator className="w-full my-6" />
      {page === "Home" && (
        <div className="flex flex-col gap-2 my-16">
          <h2 style={{ fontFamily: "'Sigmar', serif" }} className="text-[48px] font-normal">
            Hello, {firstName}!
          </h2>
        </div>
      )}
    </div>
  );
};

export default MainBreadCrumb;
