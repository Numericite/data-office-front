-- AlterTable
ALTER TABLE "public"."Request" ADD COLUMN     "dataContractS3Key" TEXT,
ADD COLUMN     "validatedAt" TIMESTAMP(3);
