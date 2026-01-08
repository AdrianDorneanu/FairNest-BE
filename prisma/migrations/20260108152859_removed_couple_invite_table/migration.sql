/*
  Warnings:

  - You are about to drop the column `currency` on the `Couple` table. All the data in the column will be lost.
  - You are about to drop the `CoupleInvite` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CoupleInvite" DROP CONSTRAINT "CoupleInvite_coupleId_fkey";

-- AlterTable
ALTER TABLE "Couple" DROP COLUMN "currency";

-- DropTable
DROP TABLE "CoupleInvite";
