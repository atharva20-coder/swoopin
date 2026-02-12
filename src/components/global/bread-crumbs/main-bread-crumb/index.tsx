import { PAGE_ICON } from "@/constants/pages";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { HomeDuoToneBlue } from "@/icons/home-duotone-blue";

type Props = {
  page: string;
  slug?: string;
};

const MainBreadCrumb = ({ page }: Props) => {
  const isDashboard = page.toLowerCase() === "atharvajoshi";

  return (
    <div className="w-full py-4 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-8 h-8 flex items-center justify-center dark:bg-neutral-800/30 rounded-lg">
          {PAGE_ICON[page.toUpperCase()] || <HomeDuoToneBlue />}
        </div>
        <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
          {isDashboard
            ? "Dashboard"
            : page.charAt(0).toUpperCase() + page.slice(1)}
        </h1>
      </div>
      <Breadcrumb>
        <BreadcrumbList className="text-sm">
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              ninthnode
            </BreadcrumbLink>
          </BreadcrumbItem>
          {!isDashboard && (
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
          <BreadcrumbItem>
            <BreadcrumbLink
              href={
                isDashboard ? "/dashboard" : `/dashboard/${page.toLowerCase()}`
              }
              className="text-gray-900 font-medium dark:text-gray-100"
            >
              {isDashboard
                ? "Dashboard"
                : page.charAt(0).toUpperCase() + page.slice(1)}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default MainBreadCrumb;
