-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('pending', 'under_instruction', 'instructed', 'validated', 'closed');

-- CreateEnum
CREATE TYPE "public"."RequestReviewStatus" AS ENUM ('rssi', 'dpo', 'daj');

-- CreateEnum
CREATE TYPE "public"."RequestReviewState" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "public"."ProductKind" AS ENUM ('IA', 'Dashboard', 'Fichier', 'API', 'Cartographie');

-- CreateEnum
CREATE TYPE "public"."LegalWorkProcessing" AS ENUM ('Cadre légal général', 'Cadre légal spécifique', 'Délibération', 'Aucun - demande décret DNUM', 'Décret suffisant', 'Décret insuffisant - révision nécessaire');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('superadmin', 'admin', 'dpo', 'rssi', 'daj', 'instructor');

-- CreateTable
CREATE TABLE "public"."Request" (
    "id" SERIAL NOT NULL,
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'pending',
    "formData" JSONB NOT NULL,
    "yamlFile" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RequestReview" (
    "id" SERIAL NOT NULL,
    "status" "public"."RequestReviewStatus" NOT NULL,
    "state" "public"."RequestReviewState" NOT NULL DEFAULT 'open',
    "content" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" INTEGER NOT NULL,
    "reviewerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reference" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "kindProduct" "public"."ProductKind" NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "domain" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Supplier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'instructor',
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session" (
    "id" SERIAL NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."account" (
    "id" SERIAL NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_RequestReference" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RequestReference_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Request_status_idx" ON "public"."Request"("status");

-- CreateIndex
CREATE INDEX "RequestReview_status_idx" ON "public"."RequestReview"("status");

-- CreateIndex
CREATE INDEX "RequestReview_requestId_idx" ON "public"."RequestReview"("requestId");

-- CreateIndex
CREATE INDEX "RequestReview_reviewerId_idx" ON "public"."RequestReview"("reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "Reference_supplierId_key" ON "public"."Reference"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "public"."session"("token");

-- CreateIndex
CREATE INDEX "_RequestReference_B_index" ON "public"."_RequestReference"("B");

-- AddForeignKey
ALTER TABLE "public"."Request" ADD CONSTRAINT "Request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RequestReview" ADD CONSTRAINT "RequestReview_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RequestReview" ADD CONSTRAINT "RequestReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reference" ADD CONSTRAINT "Reference_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RequestReference" ADD CONSTRAINT "_RequestReference_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Reference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RequestReference" ADD CONSTRAINT "_RequestReference_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
