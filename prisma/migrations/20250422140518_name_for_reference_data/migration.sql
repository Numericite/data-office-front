/*
  Warnings:

  - Added the required column `name` to the `ReferenceData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReferenceData" ADD COLUMN     "name" TEXT NOT NULL;
