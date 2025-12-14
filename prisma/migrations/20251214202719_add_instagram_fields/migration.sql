-- CreateEnum
CREATE TYPE "PostMediaType" AS ENUM ('IMAGE', 'VIDEO', 'CAROUSEL');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('POST', 'REEL', 'STORY');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('SCHEDULED', 'POSTED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "FlowNode" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nodeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subType" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "positionX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "positionY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "config" JSONB,
    "automationId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlowNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowEdge" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "edgeId" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "sourceHandle" TEXT,
    "targetHandle" TEXT,
    "automationId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlowEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledPost" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caption" TEXT,
    "mediaUrl" TEXT,
    "mediaType" "PostMediaType" NOT NULL DEFAULT 'IMAGE',
    "postType" "PostType" NOT NULL DEFAULT 'POST',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
    "hashtags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "containerId" TEXT,
    "igMediaId" TEXT,
    "errorMessage" TEXT,
    "carouselItems" JSONB,
    "altText" TEXT,
    "location" TEXT,
    "locationId" TEXT,
    "music" TEXT,
    "taggedUsers" TEXT[],
    "collaborators" TEXT[],
    "trialParams" JSONB,
    "userId" UUID,
    "automationId" UUID,

    CONSTRAINT "ScheduledPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentDraft" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT,
    "caption" TEXT,
    "mediaUrl" TEXT,
    "mediaType" "PostMediaType" NOT NULL DEFAULT 'IMAGE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID,

    CONSTRAINT "ContentDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FlowNode_automationId_nodeId_key" ON "FlowNode"("automationId", "nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "FlowEdge_automationId_edgeId_key" ON "FlowEdge"("automationId", "edgeId");

-- AddForeignKey
ALTER TABLE "FlowNode" ADD CONSTRAINT "FlowNode_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowEdge" ADD CONSTRAINT "FlowEdge_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledPost" ADD CONSTRAINT "ScheduledPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledPost" ADD CONSTRAINT "ScheduledPost_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentDraft" ADD CONSTRAINT "ContentDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
