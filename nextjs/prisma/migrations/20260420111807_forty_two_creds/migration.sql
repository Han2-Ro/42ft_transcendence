/*
  Warnings:

  - Made the column `passwordHash` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fortyTwoEmail" TEXT,
ADD COLUMN     "fortyTwoLogin" TEXT,
ALTER COLUMN "passwordHash" SET NOT NULL;
