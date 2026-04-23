-- AlterTable
ALTER TABLE "User" ADD COLUMN     "connectDraws" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "connectLosses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "connectWins" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "connectGame" (
    "id" SERIAL NOT NULL,
    "connectRedPlayerId" INTEGER NOT NULL,
    "connectYellowPlayerId" INTEGER NOT NULL,
    "winner" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "connectGame_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "connectGame" ADD CONSTRAINT "connectGame_connectRedPlayerId_fkey" FOREIGN KEY ("connectRedPlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connectGame" ADD CONSTRAINT "connectGame_connectYellowPlayerId_fkey" FOREIGN KEY ("connectYellowPlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
