/*
  Warnings:

  - The values [SUPERADMIN,ADMIN,DPO,RSSI,DAJ,INSTRUCTOR] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserRole_new" AS ENUM ('superadmin', 'admin', 'dpo', 'rssi', 'daj', 'instructor');
ALTER TABLE "public"."user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."user" ALTER COLUMN "role" TYPE "public"."UserRole_new" USING ("role"::text::"public"."UserRole_new");
ALTER TYPE "public"."UserRole" RENAME TO "UserRole_old";
ALTER TYPE "public"."UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "public"."user" ALTER COLUMN "role" SET DEFAULT 'instructor';
COMMIT;

-- AlterTable
ALTER TABLE "public"."_RequestReferenceData" ADD CONSTRAINT "_RequestReferenceData_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_RequestReferenceData_AB_unique";

-- AlterTable
ALTER TABLE "public"."user" ALTER COLUMN "role" SET DEFAULT 'instructor';
