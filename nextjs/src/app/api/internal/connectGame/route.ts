import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyInternalSecret } from "@/lib/internal-secret-check";

// Body: { connectYellowPlayerId: number, connectRedPlayerId: number, winner: "yellow" | "red" | "draw", reason: string }
export async function POST(req: NextRequest) {
  const unauthorized = verifyInternalSecret(req);
  if (unauthorized) return unauthorized;

  const { connectYellowPlayerId, connectRedPlayerId, winner, reason } =
    await req.json();

  if (!connectYellowPlayerId || !connectRedPlayerId) {
    return NextResponse.json(
      { error: "connectYellowPlayerId and connectRedPlayerId are required" },
      { status: 400 },
    );
  }

  if (!["yellow", "red", "draw"].includes(winner)) {
    return NextResponse.json(
      { error: "winner must be 'yellow', 'red', or 'draw'" },
      { status: 400 },
    );
  }

  if (!reason) {
    return NextResponse.json({ error: "reason is required" }, { status: 400 });
  }

  const getStatUpdate = (color: "yellow" | "red") => {
    if (winner === color)
      return { connectWins: { increment: 1 }, xp: { increment: 2 } };
    if (winner === "draw")
      return { connectDraws: { increment: 1 }, xp: { increment: 1 } };
    return { connectLosses: { increment: 1 } };
  };

  try {
    const [connectGame] = await prisma.$transaction([
      prisma.connectGame.create({
        data: {
          connectYellowPlayerId,
          connectRedPlayerId,
          winner,
          reason,
          finishedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: connectYellowPlayerId },
        data: getStatUpdate("yellow"),
      }),
      prisma.user.update({
        where: { id: connectRedPlayerId },
        data: getStatUpdate("red"),
      }),
    ]);

    return NextResponse.json(connectGame, { status: 200 });
  } catch (e: unknown) {
    const error = e as { code?: string };
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }
    throw e;
  }
}
