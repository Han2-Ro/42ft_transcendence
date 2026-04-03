import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyInternalSecret } from "@/lib/internal-secret-check";

// PATCH /api/internal/game/[id]
// Body: { status: "IN_PROGRESS" | "FINISHED", winner?: "white" | "black" | "draw" }
// Updates game state and user stats when finished

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = verifyInternalSecret(req);
  if (unauthorized) return unauthorized;

  const gameId = parseInt((await params).id);
  if (isNaN(gameId)) {
    return NextResponse.json({ error: "Invalid game id" }, { status: 400 });
  }

  const { status, winner } = await req.json();

  if (!status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  if (status === "FINISHED" && !winner) {
    return NextResponse.json(
      { error: "winner is required when status is FINISHED ('white', 'black', or 'draw')" },
      { status: 400 }
    );
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
  });

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  if (game.status === "FINISHED") {
    return NextResponse.json({ error: "Game is already finished" }, { status: 409 });
  }

  const updatedGame = await prisma.game.update({
    where: { id: gameId },
    data: {
      status,
      winner: winner ?? null,
      finishedAt: status === "FINISHED" ? new Date() : null,
    },
    include: {
      whitePlayer: { select: { id: true, username: true } },
      blackPlayer: { select: { id: true, username: true } },
    },
  });

  // Update user stats when game finishes
  if (status === "FINISHED" && game.blackPlayerId) {
    if (winner === "white") {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: game.whitePlayerId },
          data: { wins: { increment: 1 } },
        }),
        prisma.user.update({
          where: { id: game.blackPlayerId },
          data: { losses: { increment: 1 } },
        }),
      ]);
    } else if (winner === "black") {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: game.blackPlayerId },
          data: { wins: { increment: 1 } },
        }),
        prisma.user.update({
          where: { id: game.whitePlayerId },
          data: { losses: { increment: 1 } },
        }),
      ]);
    } else if (winner === "draw") {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: game.whitePlayerId },
          data: { draws: { increment: 1 } },
        }),
        prisma.user.update({
          where: { id: game.blackPlayerId },
          data: { draws: { increment: 1 } },
        }),
      ]);
    }
  }

  return NextResponse.json(updatedGame);
}
