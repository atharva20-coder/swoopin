import { onBoardUser } from "@/actions/user";
import Loader from "@/components/global/loader";
import { redirect } from "next/navigation";
import React from "react";

type Props = {};

const Page = async (props: Props) => {
  const user = await onBoardUser();
  if (user.status === 200 || user.status === 201) {
    // Use name field and remove spaces for URL slug
    const slug = user.data?.name?.replace(/\s+/g, '') || 'user';
    
    // Redirect admins to admin dashboard with their slug
    if (user.data?.isAdmin) {
      return redirect(`/dashboard/${slug}/admin`);
    }
    return redirect(`dashboard/${slug}`);
  }

  return redirect("/sign-in");
};

export default Page;
