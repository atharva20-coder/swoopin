/*
  Warnings:

  - You are about to drop the column `customerId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cashfreeCustomerId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ENQUIRY_STATUS" AS ENUM ('PENDING', 'CONTACTED', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST');

-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('CREATOR', 'INFLUENCER', 'AGENCY', 'BRAND', 'COACH', 'EDUCATOR', 'ECOMMERCE', 'EXPLORING');

-- CreateEnum
CREATE TYPE "FollowerRange" AS ENUM ('UNDER_1K', 'FROM_1K_TO_10K', 'FROM_10K_TO_50K', 'FROM_50K_TO_100K', 'OVER_100K');

-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('BRAND', 'AGENCY');

-- CreateEnum
CREATE TYPE "TeamSize" AS ENUM ('SIZE_1_5', 'SIZE_6_10', 'SIZE_11_25', 'SIZE_25_PLUS');

-- CreateEnum
CREATE TYPE "OfferingType" AS ENUM ('PHYSICAL_PRODUCTS', 'DIGITAL_PRODUCTS', 'SERVICES', 'SUBSCRIPTIONS');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PartnershipStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PartnershipType" AS ENUM ('BRAND_TO_CREATOR', 'CREATOR_TO_BRAND');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "CampaignObjective" AS ENUM ('BRAND_AWARENESS', 'REACH', 'TRAFFIC', 'ENGAGEMENT', 'CONVERSIONS', 'POST_ENGAGEMENT');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CollectionSource" AS ENUM ('STORY_POLL', 'STORY_QUESTION', 'DM_KEYWORD', 'COMMENT_KEYWORD', 'BROADCAST_CHANNEL');

-- CreateEnum
CREATE TYPE "CollectionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EarlyAccessStatus" AS ENUM ('PENDING', 'CONTACTED', 'ENROLLED', 'REJECTED');

-- AlterEnum
ALTER TYPE "INTEGRATIONS" ADD VALUE 'YOUTUBE';

-- AlterEnum
ALTER TYPE "SUBSCRIPTION_PLAN" ADD VALUE 'ENTERPRISE';

-- DropForeignKey
ALTER TABLE "Analytics" DROP CONSTRAINT "Analytics_userId_fkey";

-- DropForeignKey
ALTER TABLE "Automation" DROP CONSTRAINT "Automation_userId_fkey";

-- DropForeignKey
ALTER TABLE "CarouselTemplate" DROP CONSTRAINT "CarouselTemplate_userId_fkey";

-- DropForeignKey
ALTER TABLE "ContentDraft" DROP CONSTRAINT "ContentDraft_userId_fkey";

-- DropForeignKey
ALTER TABLE "Integrations" DROP CONSTRAINT "Integrations_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduledPost" DROP CONSTRAINT "ScheduledPost_userId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- DropIndex
DROP INDEX "Subscription_customerId_key";

-- AlterTable
ALTER TABLE "Automation" ADD COLUMN     "editCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "editCountResetAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ScheduledPost" ADD COLUMN     "productTags" JSONB;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "customerId",
ADD COLUMN     "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cashfreeCustomerId" TEXT,
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3);

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openAiKey" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "name" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "refreshTokenExpiresAt" TIMESTAMP(3),

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "impersonatedBy" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnterpriseEnquiry" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "company" TEXT,
    "teamSize" TEXT,
    "useCase" TEXT,
    "expectedVolume" TEXT,
    "status" "ENQUIRY_STATUS" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "customDmsLimit" INTEGER,
    "customAutomationsLimit" INTEGER,
    "customScheduledLimit" INTEGER,
    "customAiLimit" INTEGER,
    "dealAmount" DOUBLE PRECISION,
    "dealClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentLinkExpiresAt" TIMESTAMP(3),
    "paymentLinkUrl" TEXT,
    "paymentStatus" TEXT DEFAULT 'PENDING',
    "phone" TEXT,
    "stripeSessionId" TEXT,
    "transactionId" TEXT,
    "userType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionEndDate" TIMESTAMP(3),

    CONSTRAINT "EnterpriseEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "displayName" TEXT,
    "phoneNumber" TEXT,
    "profileType" "ProfileType" NOT NULL DEFAULT 'EXPLORING',
    "contentCategories" TEXT[],
    "platforms" TEXT[],
    "primaryPlatform" TEXT,
    "followerRange" "FollowerRange",
    "sellsCoaching" BOOLEAN NOT NULL DEFAULT false,
    "sellsCourses" BOOLEAN NOT NULL DEFAULT false,
    "sellsWorkshops" BOOLEAN NOT NULL DEFAULT false,
    "sellsMemberships" BOOLEAN NOT NULL DEFAULT false,
    "bookingLink" TEXT,
    "automationGoals" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bio" TEXT,
    "age" INTEGER,
    "pronouns" TEXT,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "orgType" "OrgType" NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "website" TEXT,
    "teamSize" "TeamSize",
    "industryFocus" TEXT[],
    "clientHandles" TEXT[],
    "offeringType" "OfferingType",
    "monthlyDmVolume" TEXT,
    "isSupportFocused" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_state" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "onboarding_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstagramEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "eventId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "status" "EventStatus" NOT NULL DEFAULT 'SCHEDULED',
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstagramEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandPartnership" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "partnerId" TEXT NOT NULL,
    "partnerName" TEXT NOT NULL,
    "partnerUsername" TEXT,
    "status" "PartnershipStatus" NOT NULL DEFAULT 'PENDING',
    "type" "PartnershipType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandPartnership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCatalog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "catalogId" TEXT NOT NULL,
    "name" TEXT,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "catalogId" UUID NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "imageUrl" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdCampaign" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "campaignId" TEXT NOT NULL,
    "adAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "objective" "CampaignObjective" NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'PAUSED',
    "budget" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "insights" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleIntegration" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "accessToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataCollection" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "source" "CollectionSource" NOT NULL,
    "status" "CollectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "sheetsConfig" JSONB,
    "triggerConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionResponse" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "collectionId" UUID NOT NULL,
    "senderName" TEXT,
    "senderId" TEXT,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "exportedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanvaIntegration" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "canvaUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanvaIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "early_access_request" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'INSTAGRAM',
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "instagramHandle" TEXT,
    "note" TEXT,
    "status" "EarlyAccessStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "early_access_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instagramId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "isFollower" BOOLEAN NOT NULL DEFAULT false,
    "lastInteraction" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_openAiKey_key" ON "user"("openAiKey");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_identifier_value_key" ON "verification"("identifier", "value");

-- CreateIndex
CREATE INDEX "EnterpriseEnquiry_userId_idx" ON "EnterpriseEnquiry"("userId");

-- CreateIndex
CREATE INDEX "EnterpriseEnquiry_status_idx" ON "EnterpriseEnquiry"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_userId_key" ON "user_profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_userId_key" ON "organization"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_state_userId_key" ON "onboarding_state"("userId");

-- CreateIndex
CREATE INDEX "InstagramEvent_userId_idx" ON "InstagramEvent"("userId");

-- CreateIndex
CREATE INDEX "InstagramEvent_startTime_idx" ON "InstagramEvent"("startTime");

-- CreateIndex
CREATE INDEX "InstagramEvent_status_idx" ON "InstagramEvent"("status");

-- CreateIndex
CREATE INDEX "BrandPartnership_userId_idx" ON "BrandPartnership"("userId");

-- CreateIndex
CREATE INDEX "BrandPartnership_status_idx" ON "BrandPartnership"("status");

-- CreateIndex
CREATE INDEX "BrandPartnership_partnerId_idx" ON "BrandPartnership"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCatalog_userId_key" ON "ProductCatalog"("userId");

-- CreateIndex
CREATE INDEX "Product_catalogId_idx" ON "Product"("catalogId");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Product_catalogId_externalId_key" ON "Product"("catalogId", "externalId");

-- CreateIndex
CREATE INDEX "AdCampaign_userId_idx" ON "AdCampaign"("userId");

-- CreateIndex
CREATE INDEX "AdCampaign_status_idx" ON "AdCampaign"("status");

-- CreateIndex
CREATE INDEX "AdCampaign_campaignId_idx" ON "AdCampaign"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleIntegration_userId_key" ON "GoogleIntegration"("userId");

-- CreateIndex
CREATE INDEX "DataCollection_userId_idx" ON "DataCollection"("userId");

-- CreateIndex
CREATE INDEX "DataCollection_status_idx" ON "DataCollection"("status");

-- CreateIndex
CREATE INDEX "CollectionResponse_collectionId_idx" ON "CollectionResponse"("collectionId");

-- CreateIndex
CREATE INDEX "CollectionResponse_createdAt_idx" ON "CollectionResponse"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CanvaIntegration_userId_key" ON "CanvaIntegration"("userId");

-- CreateIndex
CREATE INDEX "CanvaIntegration_userId_idx" ON "CanvaIntegration"("userId");

-- CreateIndex
CREATE INDEX "early_access_request_status_idx" ON "early_access_request"("status");

-- CreateIndex
CREATE UNIQUE INDEX "early_access_request_userId_platform_key" ON "early_access_request"("userId", "platform");

-- CreateIndex
CREATE INDEX "contact_pageId_idx" ON "contact"("pageId");

-- CreateIndex
CREATE INDEX "contact_instagramId_idx" ON "contact"("instagramId");

-- CreateIndex
CREATE UNIQUE INDEX "contact_instagramId_pageId_key" ON "contact"("instagramId", "pageId");

-- CreateIndex
CREATE INDEX "Automation_userId_idx" ON "Automation"("userId");

-- CreateIndex
CREATE INDEX "Automation_userId_active_idx" ON "Automation"("userId", "active");

-- CreateIndex
CREATE INDEX "Automation_createdAt_idx" ON "Automation"("createdAt");

-- CreateIndex
CREATE INDEX "Dms_automationId_idx" ON "Dms"("automationId");

-- CreateIndex
CREATE INDEX "Dms_senderId_idx" ON "Dms"("senderId");

-- CreateIndex
CREATE INDEX "Dms_automationId_senderId_idx" ON "Dms"("automationId", "senderId");

-- CreateIndex
CREATE INDEX "FlowNode_automationId_idx" ON "FlowNode"("automationId");

-- CreateIndex
CREATE INDEX "Integrations_userId_idx" ON "Integrations"("userId");

-- CreateIndex
CREATE INDEX "Keyword_automationId_idx" ON "Keyword"("automationId");

-- CreateIndex
CREATE INDEX "Keyword_word_idx" ON "Keyword"("word");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_isSeen_idx" ON "Notification"("userId", "isSeen");

-- CreateIndex
CREATE INDEX "Post_automationId_idx" ON "Post"("automationId");

-- CreateIndex
CREATE INDEX "Post_postid_idx" ON "Post"("postid");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_cashfreeCustomerId_key" ON "Subscription"("cashfreeCustomerId");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integrations" ADD CONSTRAINT "Integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Automation" ADD CONSTRAINT "Automation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarouselTemplate" ADD CONSTRAINT "CarouselTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledPost" ADD CONSTRAINT "ScheduledPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentDraft" ADD CONSTRAINT "ContentDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseEnquiry" ADD CONSTRAINT "EnterpriseEnquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_state" ADD CONSTRAINT "onboarding_state_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstagramEvent" ADD CONSTRAINT "InstagramEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandPartnership" ADD CONSTRAINT "BrandPartnership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalog" ADD CONSTRAINT "ProductCatalog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "ProductCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdCampaign" ADD CONSTRAINT "AdCampaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleIntegration" ADD CONSTRAINT "GoogleIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataCollection" ADD CONSTRAINT "DataCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionResponse" ADD CONSTRAINT "CollectionResponse_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "DataCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvaIntegration" ADD CONSTRAINT "CanvaIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "early_access_request" ADD CONSTRAINT "early_access_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
