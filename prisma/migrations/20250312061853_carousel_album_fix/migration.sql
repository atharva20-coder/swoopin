/*
  Warnings:

  - The values [CAROSEL_ALBUM] on the enum `MEDIATYPE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MEDIATYPE_new" AS ENUM ('IMAGE', 'VIDEO', 'CAROUSEL_ALBUM');
ALTER TABLE "Post" ALTER COLUMN "mediaType" DROP DEFAULT;
ALTER TABLE "Post" ALTER COLUMN "mediaType" TYPE "MEDIATYPE_new" USING ("mediaType"::text::"MEDIATYPE_new");
ALTER TYPE "MEDIATYPE" RENAME TO "MEDIATYPE_old";
ALTER TYPE "MEDIATYPE_new" RENAME TO "MEDIATYPE";
DROP TYPE "MEDIATYPE_old";
ALTER TABLE "Post" ALTER COLUMN "mediaType" SET DEFAULT 'IMAGE';
COMMIT;
