/*
  Warnings:

  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: add gender as nullable first, backfill existing rows, then enforce NOT NULL
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gender" TEXT;
UPDATE "User" SET "gender" = 'unknown' WHERE "gender" IS NULL;
ALTER TABLE "User" ALTER COLUMN "gender" SET NOT NULL;
