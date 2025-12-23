import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { client } from "@/lib/prisma";

// GET - Load onboarding state
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ status: 401, message: "Unauthorized" });
    }

    const userId = session.user.id;

    // Get onboarding state
    const onboardingState = await client.onboardingState.findUnique({
      where: { userId },
    });

    // Get user profile
    const profile = await client.userProfile.findUnique({
      where: { userId },
    });

    // Get organization
    const organization = await client.organization.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      status: 200,
      data: {
        currentStep: onboardingState?.currentStep || 0,
        isCompleted: onboardingState?.isCompleted || false,
        profile,
        organization,
      },
    });
  } catch (error) {
    console.error("Failed to get onboarding state:", error);
    return NextResponse.json({ status: 500, message: "Internal server error" });
  }
}

// POST - Save onboarding progress
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ status: 401, message: "Unauthorized" });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { currentStep, isCompleted, profile, organization } = body;

    // Upsert onboarding state
    await client.onboardingState.upsert({
      where: { userId },
      create: {
        userId,
        currentStep,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        currentStep,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // Upsert user profile
    if (profile) {
      console.log("Saving profile:", JSON.stringify(profile, null, 2));
      
      // Handle followerRange - convert empty string to null
      const followerRange = profile.followerRange && profile.followerRange !== "" 
        ? profile.followerRange 
        : null;
      
      // Handle age - ensure it's a number or null
      const age = profile.age 
        ? (typeof profile.age === 'string' ? parseInt(profile.age) : profile.age)
        : null;

      await client.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          displayName: profile.displayName || null,
          phoneNumber: profile.phoneNumber || null,
          bio: profile.bio || null,
          pronouns: profile.pronouns || null,
          age,
          profileType: profile.profileType || "EXPLORING",
          contentCategories: profile.contentCategories || [],
          platforms: profile.platforms || [],
          primaryPlatform: profile.primaryPlatform || null,
          followerRange,
          sellsCoaching: profile.sellsCoaching || false,
          sellsCourses: profile.sellsCourses || false,
          sellsWorkshops: profile.sellsWorkshops || false,
          sellsMemberships: profile.sellsMemberships || false,
          bookingLink: profile.bookingLink || null,
          automationGoals: profile.automationGoals || [],
        },
        update: {
          displayName: profile.displayName || null,
          phoneNumber: profile.phoneNumber || null,
          bio: profile.bio || null,
          pronouns: profile.pronouns || null,
          age,
          profileType: profile.profileType || "EXPLORING",
          contentCategories: profile.contentCategories || [],
          platforms: profile.platforms || [],
          primaryPlatform: profile.primaryPlatform || null,
          followerRange,
          sellsCoaching: profile.sellsCoaching || false,
          sellsCourses: profile.sellsCourses || false,
          sellsWorkshops: profile.sellsWorkshops || false,
          sellsMemberships: profile.sellsMemberships || false,
          bookingLink: profile.bookingLink || null,
          automationGoals: profile.automationGoals || [],
        },
      });

      console.log("Profile saved successfully");

      // Also update the User name if displayName provided
      if (profile.displayName) {
        await client.user.update({
          where: { id: userId },
          data: { name: profile.displayName },
        });
      }
    }

    // Upsert organization if provided
    if (organization && organization.orgType) {
      await client.organization.upsert({
        where: { userId },
        create: {
          userId,
          orgType: organization.orgType,
          name: organization.name,
          logoUrl: organization.logoUrl,
          website: organization.website,
          teamSize: organization.teamSize || null,
          industryFocus: organization.industryFocus || [],
          clientHandles: organization.clientHandles || [],
          offeringType: organization.offeringType || null,
          monthlyDmVolume: organization.monthlyDmVolume,
          isSupportFocused: organization.isSupportFocused || false,
        },
        update: {
          orgType: organization.orgType,
          name: organization.name,
          logoUrl: organization.logoUrl,
          website: organization.website,
          teamSize: organization.teamSize || null,
          industryFocus: organization.industryFocus || [],
          clientHandles: organization.clientHandles || [],
          offeringType: organization.offeringType || null,
          monthlyDmVolume: organization.monthlyDmVolume,
          isSupportFocused: organization.isSupportFocused || false,
        },
      });
    }

    return NextResponse.json({ status: 200, message: "Saved successfully" });
  } catch (error) {
    console.error("Failed to save onboarding progress:", error);
    return NextResponse.json({ status: 500, message: "Internal server error" });
  }
}
