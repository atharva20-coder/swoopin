/*
  Warnings:

  - Made the column `userId` on table `Template` required. This step will fail if there are existing NULL values in that column.
  - Made the column `automationId` on table `Template` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Template" ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "automationId" SET NOT NULL;
