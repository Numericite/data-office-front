/*
  Warnings:

  - You are about to drop the column `name` on the `ReferenceData` table. All the data in the column will be lost.
  - Added the required column `description` to the `ReferenceData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `peopleAccess` to the `ReferenceData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `processingDone` to the `ReferenceData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storageLocation` to the `ReferenceData` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ReferenceData_name_idx";

-- AlterTable
ALTER TABLE "ReferenceData" DROP COLUMN "name",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "peopleAccess" TEXT NOT NULL,
ADD COLUMN     "processingDone" TEXT NOT NULL,
ADD COLUMN     "storageLocation" TEXT NOT NULL;
