"use server";

import { redirect } from "next/navigation";
import { onCurrentUser } from "../user";
import { createIntegration, getIntegration } from "./queries";
import { generateTokens } from "@/lib/fetch";
import axios from "axios";

export const onOAuthInstagram = (strategy: "INSTAGRAM" | "CRM") => {
  if (strategy === "INSTAGRAM") {
    return redirect(process.env.INSTAGRAM_EMBEDDED_OAUTH_URL as string);
  }
};

export const onIntegrate = async (code: string) => {
  const user = await onCurrentUser();
  try {
    const integration = await getIntegration(user.id);

    if (integration && integration.integrations.length === 0) {
      const { access_token, instagram_id } = await generateTokens(code);
      console.log("Token and ID:", { access_token, instagram_id });

      if (access_token && instagram_id) {
        const today = new Date();
        const expire_date = today.setDate(today.getDate() + 60);
        const create = await createIntegration(
          user.id,
          access_token,
          new Date(expire_date),
          instagram_id
        );
        return { status: 200, data: create };
      }
      console.log("🔴 401");
      return { status: 401 };
    }
    console.log("🔴 404");
    return { status: 404 };
  } catch (error) {
    console.log("🔴 500", error);
    return { status: 500 };
  }
};