/*
  Warnings:

  - Made the column `url` on table `Button` required. This step will fail if there are existing NULL values in that column.
  - Made the column `payload` on table `Button` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Button" ALTER COLUMN "url" SET NOT NULL,
ALTER COLUMN "payload" SET NOT NULL;

-- AlterTable
ALTER TABLE "Element" ALTER COLUMN "defaultAction" SET DATA TYPE TEXT;
