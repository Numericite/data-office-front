/*
  Warnings:

  - Changed the type of `accountId` on the `account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "account" DROP COLUMN "accountId",
ADD COLUMN     "accountId" INTEGER NOT NULL;
