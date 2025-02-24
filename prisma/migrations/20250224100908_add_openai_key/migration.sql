/*
  Warnings:

  - A unique constraint covering the columns `[openAiKey]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "openAiKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_openAiKey_key" ON "User"("openAiKey");
