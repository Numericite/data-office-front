/*
  Warnings:

  - You are about to drop the column `updateFrequency` on the `RequestForm` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."RequestForm" DROP COLUMN "updateFrequency",
ADD COLUMN     "dataUpdateFrequency" TEXT NOT NULL DEFAULT '1 semaine';
