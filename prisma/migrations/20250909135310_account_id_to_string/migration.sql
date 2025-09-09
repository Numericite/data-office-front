/*
  Warnings:

  - The primary key for the `verification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `verification` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "account" ALTER COLUMN "accountId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "verification" DROP CONSTRAINT "verification_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "verification_pkey" PRIMARY KEY ("id");
