/*
  Warnings:

  - You are about to drop the column `status` on the `Game` table. All the data in the column will be lost.
  - Made the column `blackPlayerId` on table `Game` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_blackPlayerId_fkey";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "status",
ADD COLUMN     "reason" TEXT,
ALTER COLUMN "blackPlayerId" SET NOT NULL;

-- DropEnum
DROP TYPE "GameStatus";

-- CreateTable
CREATE TABLE "GameFour" (
    "id" SERIAL NOT NULL,
    "bluePlayerId" INTEGER NOT NULL,
    "greenPlayerId" INTEGER NOT NULL,
    "yellowPlayerId" INTEGER NOT NULL,
    "redPlayerId" INTEGER NOT NULL,
    "winner" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "GameFour_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_blackPlayerId_fkey" FOREIGN KEY ("blackPlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameFour" ADD CONSTRAINT "GameFour_bluePlayerId_fkey" FOREIGN KEY ("bluePlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameFour" ADD CONSTRAINT "GameFour_yellowPlayerId_fkey" FOREIGN KEY ("yellowPlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameFour" ADD CONSTRAINT "GameFour_redPlayerId_fkey" FOREIGN KEY ("redPlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameFour" ADD CONSTRAINT "GameFour_greenPlayerId_fkey" FOREIGN KEY ("greenPlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
