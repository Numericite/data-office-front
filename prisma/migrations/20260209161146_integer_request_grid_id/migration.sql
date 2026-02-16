/*
  Warnings:

  - Changed the type of `gristId` on the `Request` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Request" DROP COLUMN "gristId",
ADD COLUMN     "gristId" INTEGER NOT NULL;
