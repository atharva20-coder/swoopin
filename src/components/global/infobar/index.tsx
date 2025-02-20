"use client";

import { PAGE_BREAD_CRUMBS } from "@/constants/pages";
import { Menu } from "lucide-react";
import React from "react";
import Sheet from "../sheet";
import Items from "../sidebar/items";
import { Separator } from "@/components/ui/separator";
import ClerkAuthState from "../clerk-auth-state";
import { HelpDuoToneWhite } from "@/icons/help-duotone-white";
import { SubscriptionPlan } from "../subscription-plan";
import UpgradeCard from "../sidebar/upgrade";
import { LogoSmall } from "../../../app/svgs/logo-small";
import CreateAutomation from "../create-automation";
import Search from "./search";
import { Notifications } from "./notifications";
import MainBreadCrumb from "../bread-crumbs/main-bread-crumb";
import { usePaths } from "@/hooks/use-nav";

type Props = {
  slug: string;
};

const InfoBar = ({ slug }: Props) => {
  const { page } = usePaths();
  const currentPage = PAGE_BREAD_CRUMBS.includes(page) || page == slug;

  return (
    currentPage && (
      <div className="flex flex-col">
        <div className="flex gap-x-3 lg:gap-x-5 justify-between items-center">
          
        </div>
        <MainBreadCrumb page={page === slug ? "Home" : page} slug={slug} />
      </div>
    )
  );
};

export default InfoBar;