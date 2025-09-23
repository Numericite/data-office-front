/*
  Warnings:

  - You are about to drop the column `reviewStatus` on the `Request` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Request" DROP COLUMN "reviewStatus";

-- CreateTable
CREATE TABLE "public"."RequestReview" (
    "id" SERIAL NOT NULL,
    "status" "public"."RequestReviewStatus" NOT NULL,
    "content" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" INTEGER NOT NULL,
    "reviewerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RequestReview_status_idx" ON "public"."RequestReview"("status");

-- CreateIndex
CREATE INDEX "RequestReview_requestId_idx" ON "public"."RequestReview"("requestId");

-- CreateIndex
CREATE INDEX "RequestReview_reviewerId_idx" ON "public"."RequestReview"("reviewerId");

-- AddForeignKey
ALTER TABLE "public"."RequestReview" ADD CONSTRAINT "RequestReview_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RequestReview" ADD CONSTRAINT "RequestReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
