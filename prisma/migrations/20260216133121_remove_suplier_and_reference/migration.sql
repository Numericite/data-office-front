/*
  Warnings:

  - You are about to drop the `Reference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Supplier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RequestReference` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Reference" DROP CONSTRAINT "Reference_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reference" DROP CONSTRAINT "Reference_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_RequestReference" DROP CONSTRAINT "_RequestReference_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_RequestReference" DROP CONSTRAINT "_RequestReference_B_fkey";

-- DropTable
DROP TABLE "public"."Reference";

-- DropTable
DROP TABLE "public"."Supplier";

-- DropTable
DROP TABLE "public"."_RequestReference";
