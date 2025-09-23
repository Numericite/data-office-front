-- CreateEnum
CREATE TYPE "public"."RequestReviewState" AS ENUM ('open', 'closed');

-- AlterTable
ALTER TABLE "public"."RequestReview" ADD COLUMN     "state" "public"."RequestReviewState" NOT NULL DEFAULT 'open';
