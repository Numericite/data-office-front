/*
  Warnings:

  - The values [approved,rejected] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [USER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "RequestReviewStatus" AS ENUM ('rssi', 'dpo', 'daj');

-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('pending', 'under_instruction', 'instructed', 'validated', 'closed');
ALTER TABLE "Request" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Request" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "RequestStatus_old";
ALTER TABLE "Request" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('SUPERADMIN', 'ADMIN', 'DPO', 'RSSI', 'DAJ', 'INSTRUCTOR');
ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'INSTRUCTOR';
COMMIT;

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "reviewStatus" "RequestReviewStatus";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'INSTRUCTOR';
