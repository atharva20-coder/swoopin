"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createNotification } from "@/actions/notifications";
import { createUser, findUser, findUserByEmail, updateSubscription } from "./queries";
import { refreshToken } from "@/lib/fetch";
import { updateIntegration } from "../integrations/queries";
import { getOrderStatus, calculateSubscriptionEndDate } from "@/lib/payments/cashfree/orders";

// Get current authenticated user from Better-Auth session
export const onCurrentUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect("/sign-in");
  }
  
  return session.user;
};

// Get database user from Better-Auth session (returns user with database UUID)
export const getDbUser = async () => {
  const authUser = await onCurrentUser();
  const dbUser = await findUserByEmail(authUser.email);
  
  if (!dbUser) {
    return redirect("/sign-in");
  }
  
  return dbUser;
};

// Get session without redirect (for optional auth checks)
export const getSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
};

export const onBoardUser = async () => {
  const user = await onCurrentUser();
  try {
    // Parse admin emails from env
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0);
      
    // Find user by email instead of clerkId
    const found = await findUserByEmail(user.email);
    if (found) {
      if (found.integrations.length > 0) {
        const today = new Date();
        const time_left =
          found.integrations[0].expiresAt?.getTime()! - today.getTime();

        const days = Math.round(time_left / (1000 * 3600 * 24));
        if (days < 5) {


          const refresh = await refreshToken(found.integrations[0].token);


          const today = new Date();
          const expire_date = today.setDate(today.getDate() + 60);

          const update_token = await updateIntegration(
            refresh.access_token,
            new Date(expire_date),
            found.integrations[0].id
          );
          if (!update_token) {

          } else if (update_token.userId) {
            createNotification(
              "You have been reintegrated!",
              update_token.userId
            );
          }
        }
      }
      // Check if user is admin
      const isAdmin = adminEmails.includes(user.email.toLowerCase());

      return {
        status: 200,
        data: {
          name: found.name,
          isAdmin,
        },
      };
    }
    
    // Create new user if not found
    const nameParts = user.name?.split(" ") || [];
    const created = await createUser(
      user.id,
      nameParts[0] || "",
      nameParts.slice(1).join(" ") || "",
      user.email
    );
    
    // Check if new user is admin
    const isAdmin = adminEmails.includes(user.email.toLowerCase());
    return { status: 201, data: { ...created, isAdmin } };
  } catch (error) {

    return { status: 500 };
  }
};

export const onUserInfo = async () => {
  const user = await onCurrentUser();
  try {
    const profile = await findUserByEmail(user.email);
    if (profile) {
      // Parse admin emails from env
      const adminEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0);
        
      const isAdmin = adminEmails.includes(user.email.toLowerCase());
      
      return { 
        status: 200, 
        data: { ...profile, isAdmin } 
      };
    }

    return { status: 404 };
  } catch (error) {
    return { status: 500 };
  }
};

/**
 * Handle subscription after successful Cashfree payment
 * Called from payment return page with order_id
 */
export const onSubscribe = async (order_id: string) => {
  const user = await onCurrentUser();
  try {
    // Verify order status with Cashfree
    const orderResult = await getOrderStatus(order_id);
    
    if (!orderResult.success || orderResult.status !== 'PAID') {
      console.log('[onSubscribe] Order not paid:', orderResult);
      return { status: 400, error: 'Payment not completed' };
    }
    
    const dbUser = await findUserByEmail(user.email);
    if (!dbUser) return { status: 404 };
    
    // Calculate subscription end date (default to monthly if unknown)
    const periodEnd = calculateSubscriptionEndDate('monthly', 'PRO');
    
    const subscribed = await updateSubscription(dbUser.id, {
      cashfreeCustomerId: dbUser.id,
      plan: "PRO",
    });

    if (subscribed) {
      createNotification("You have subscribed to Pro! Enjoy your premium features.", dbUser.id);
      return { status: 200 };
    }
    return { status: 401 };
  } catch (error) {
    console.error('[onSubscribe] Error:', error);
    return { status: 500 };
  }
};

export const getInstagramProfile = async () => {
  const user = await onCurrentUser();
  try {
    const profile = await findUserByEmail(user.email);
    if (!profile || profile.integrations.length === 0) {
      return { status: 404, error: "No Instagram integration found" };
    }

    const token = profile.integrations[0].token;
    const { getInstagramUserProfile } = await import("@/lib/fetch");
    const result = await getInstagramUserProfile(token);

    if (result.success && result.data) {
      return { 
        status: 200, 
        data: {
          ...result.data,
          instagramId: profile.integrations[0].instagramId,
        }
      };
    }

    return { status: 400, error: result.error };
  } catch (error) {
    console.error("Error fetching Instagram profile:", error);
    return { status: 500, error: "Server error" };
  }
};