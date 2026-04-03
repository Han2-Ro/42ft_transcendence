import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyInternalSecret } from "@/lib/internal-secret-check";

// POST /api/internal/game
// Body: { whitePlayerId: number, blackPlayerId?: number }
// Creates a new game and returns it
export async function POST(req: NextRequest) {
  const unauthorized = verifyInternalSecret(req);
  if (unauthorized) return unauthorized;

  const { whitePlayerId, blackPlayerId } = await req.json();

  if (!whitePlayerId) {
    return NextResponse.json(
      { error: "whitePlayerId is required" },
      { status: 400 },
    );
  }

  if (blackPlayerId && whitePlayerId === blackPlayerId) {
    return NextResponse.json(
      { error: "whitePlayerId and blackPlayerId must be different" },
      { status: 400 },
    );
  }

  try {
    const game = await prisma.game.create({
      data: {
        whitePlayerId,
        blackPlayerId: blackPlayerId ?? null,
        status: blackPlayerId ? "IN_PROGRESS" : "WAITING",
      },
      include: {
        whitePlayer: { select: { id: true, username: true } },
        blackPlayer: { select: { id: true, username: true } },
      },
    });
    return NextResponse.json(game, { status: 201 });
  } catch (e: unknown) {
    const error = e as { code?: string };
    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "One or more player IDs do not exist" },
        { status: 404 },
      );
    }
    throw e;
  }
}
