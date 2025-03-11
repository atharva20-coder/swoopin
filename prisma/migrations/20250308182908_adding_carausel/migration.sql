-- CreateEnum
CREATE TYPE "ButtonType" AS ENUM ('WEB_URL', 'POSTBACK');

-- AlterEnum
ALTER TYPE "LISTENERS" ADD VALUE 'CAROUSEL';

-- CreateTable
CREATE TABLE "CarouselTemplate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "automationId" UUID,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarouselTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Element" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(80) NOT NULL,
    "subtitle" VARCHAR(80),
    "imageUrl" TEXT,
    "carouselTemplateId" UUID,
    "defaultAction" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Element_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Button" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "ButtonType" NOT NULL,
    "title" VARCHAR(20) NOT NULL,
    "url" TEXT,
    "payload" TEXT,
    "elementId" UUID,

    CONSTRAINT "Button_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CarouselTemplate" ADD CONSTRAINT "CarouselTemplate_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarouselTemplate" ADD CONSTRAINT "CarouselTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Element" ADD CONSTRAINT "Element_carouselTemplateId_fkey" FOREIGN KEY ("carouselTemplateId") REFERENCES "CarouselTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Button" ADD CONSTRAINT "Button_elementId_fkey" FOREIGN KEY ("elementId") REFERENCES "Element"("id") ON DELETE CASCADE ON UPDATE CASCADE;
