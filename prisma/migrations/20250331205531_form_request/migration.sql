-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "LegalWorkProcessing" AS ENUM ('Cadre légal général', 'Cadre légal spécifique', 'Délibération', 'Aucun - demande décret DNUM', 'Décret suffisant', 'Décret insuffisant - révision nécessaire');

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',
    "formData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceData" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferenceData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalData" (
    "id" SERIAL NOT NULL,
    "recipient" TEXT NOT NULL,
    "retentionPeriodInMonths" INTEGER NOT NULL,
    "processingType" TEXT NOT NULL,
    "dataController" TEXT NOT NULL,
    "authRequired" BOOLEAN NOT NULL DEFAULT true,
    "securityMeasures" TEXT NOT NULL,
    "legalWorkProcessing" "LegalWorkProcessing" NOT NULL,
    "referenceDataId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RequestReferenceData" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "Request_status_idx" ON "Request"("status");

-- CreateIndex
CREATE INDEX "ReferenceData_name_idx" ON "ReferenceData"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalData_referenceDataId_key" ON "PersonalData"("referenceDataId");

-- CreateIndex
CREATE INDEX "PersonalData_referenceDataId_idx" ON "PersonalData"("referenceDataId");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestReferenceData_AB_unique" ON "_RequestReferenceData"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestReferenceData_B_index" ON "_RequestReferenceData"("B");

-- AddForeignKey
ALTER TABLE "PersonalData" ADD CONSTRAINT "PersonalData_referenceDataId_fkey" FOREIGN KEY ("referenceDataId") REFERENCES "ReferenceData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestReferenceData" ADD CONSTRAINT "_RequestReferenceData_A_fkey" FOREIGN KEY ("A") REFERENCES "ReferenceData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestReferenceData" ADD CONSTRAINT "_RequestReferenceData_B_fkey" FOREIGN KEY ("B") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
