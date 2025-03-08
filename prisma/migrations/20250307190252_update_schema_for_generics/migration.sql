/*
  Warnings:

  - A unique constraint covering the columns `[automationId]` on the table `Template` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Template_automationId_key" ON "Template"("automationId");

-- CreateIndex
CREATE INDEX "Template_userId_automationId_idx" ON "Template"("userId", "automationId");
