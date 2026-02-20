/*
  Warnings:

  - Made the column `name` on table `Couple` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Couple" ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "User_coupleId_idx" ON "User"("coupleId");
