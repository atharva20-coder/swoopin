import { integrationService } from "@/services/integration.service";
import { getDbUser } from "@/actions/user";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  searchParams: Promise<{ code?: string }>;
};

const Page = async ({ searchParams }: Props) => {
  const { code } = await searchParams;

  if (code) {
    console.log("Instagram OAuth code received");

    // Get the current user
    const dbUser = await getDbUser();
    if (!dbUser) {
      return redirect("/sign-in");
    }

    // Connect Instagram using the service
    const result = await integrationService.connectInstagram(
      dbUser.id,
      code.split("#_")[0]
    );

    if (!("error" in result)) {
      // Success - redirect to integrations page
      const slug = dbUser.name?.replace(/\s+/g, "") || "user";
      return redirect(`/dashboard/${slug}/integrations`);
    }

    console.error("Instagram integration error:", result.error);
  }

  return redirect("/sign-up");
};

export default Page;
