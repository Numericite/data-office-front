/*
  Warnings:

  - You are about to drop the column `formData` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `yamlFile` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the `RequestReview` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[requestFormId]` on the table `Request` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gristId` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestFormId` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."RequestReview" DROP CONSTRAINT "RequestReview_requestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RequestReview" DROP CONSTRAINT "RequestReview_reviewerId_fkey";

-- DropIndex
DROP INDEX "public"."Request_status_idx";

-- AlterTable
ALTER TABLE "public"."Request" DROP COLUMN "formData",
DROP COLUMN "status",
DROP COLUMN "yamlFile",
ADD COLUMN     "gristId" TEXT NOT NULL,
ADD COLUMN     "requestFormId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."RequestReview";

-- DropEnum
DROP TYPE "public"."LegalWorkProcessing";

-- DropEnum
DROP TYPE "public"."RequestReviewState";

-- DropEnum
DROP TYPE "public"."RequestReviewStatus";

-- DropEnum
DROP TYPE "public"."RequestStatus";

-- CreateTable
CREATE TABLE "public"."RequestForm" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "emailPro" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "ministry" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "kind" "public"."ProductKind" NOT NULL DEFAULT 'API',
    "developmentManagement" TEXT NOT NULL,
    "updateFrequency" TEXT NOT NULL DEFAULT '1 semaine',
    "expectedProductionDate" TEXT NOT NULL,
    "personalData" TEXT NOT NULL DEFAULT 'Oui',
    "additionalFiles" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestForm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Request_requestFormId_key" ON "public"."Request"("requestFormId");

-- AddForeignKey
ALTER TABLE "public"."Request" ADD CONSTRAINT "Request_requestFormId_fkey" FOREIGN KEY ("requestFormId") REFERENCES "public"."RequestForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
