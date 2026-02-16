/*
  Warnings:

  - Added the required column `remoteGristStatus` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Request" ADD COLUMN     "remoteGristStatus" TEXT NOT NULL;
