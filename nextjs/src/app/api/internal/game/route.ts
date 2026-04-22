import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyInternalSecret } from "@/lib/internal-secret-check";

// Body: { whitePlayerId: number, blackPlayerId: number, winner: "white" | "black" | "draw", reason: string }
export async function POST(req: NextRequest) {
  const unauthorized = verifyInternalSecret(req);
  if (unauthorized) return unauthorized;

  const { whitePlayerId, blackPlayerId, winner, reason } = await req.json();

  if (!whitePlayerId || !blackPlayerId) {
    return NextResponse.json(
      { error: "whitePlayerId and blackPlayerId are required" },
      { status: 400 },
    );
  }

  if (!["white", "black", "draw"].includes(winner)) {
    return NextResponse.json(
      { error: "winner must be 'white', 'black', or 'draw'" },
      { status: 400 },
    );
  }

  if (!reason) {
    return NextResponse.json({ error: "reason is required" }, { status: 400 });
  }

  const getStatUpdate = (color: "white" | "black") => {
    if (winner === color) return { wins: { increment: 1 } , xp: {increment: 2}};
    if (winner === "draw") return { draws: { increment: 1 } , xp: {increment: 1}};
    return { losses: { increment: 1 }, xp: {increment: 1}};
  };

  try {
    const [game] = await prisma.$transaction([
      prisma.game.create({
        data: {
          whitePlayerId,
          blackPlayerId,
          winner,
          reason,
          finishedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: whitePlayerId },
        data: getStatUpdate("white"),
      }),
      prisma.user.update({
        where: { id: blackPlayerId },
        data: getStatUpdate("black"),
      }),
    ]);

    return NextResponse.json(game, { status: 200 });
  } catch (e: unknown) {
    const error = e as { code?: string };
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }
    throw e;
  }
}
