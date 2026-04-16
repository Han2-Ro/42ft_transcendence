import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyInternalSecret } from "@/lib/internal-secret-check";

export async function POST(req: NextRequest) {
  const unauthorized = verifyInternalSecret(req);
  if (unauthorized) return unauthorized;

  const {
    bluePlayerId,
    greenPlayerId,
    yellowPlayerId,
    redPlayerId,
    winner,
    reason,
  } = await req.json();

  if (!bluePlayerId || !greenPlayerId || !yellowPlayerId || !redPlayerId) {
    return NextResponse.json(
      { error: "all player IDs are required" },
      { status: 400 },
    );
  }

  if (!["blue", "green", "yellow", "red", "draw"].includes(winner)) {
    return NextResponse.json(
      { error: "winner must be 'blue', 'green', 'yellow', 'red' or 'draw'" },
      { status: 400 },
    );
  }

  if (!reason) {
    return NextResponse.json({ error: "reason is required" }, { status: 400 });
  }

  const getStatUpdate = (color: "blue" | "green" | "yellow" | "red") => {
    if (winner === "draw") return { draws: { increment: 1 } };
    if (
      (winner === "blue" || winner === "green") &&
      (color === "blue" || color === "green")
    )
      return { wins: { increment: 1 } };
    if (
      (winner === "yellow" || winner === "red") &&
      (color === "yellow" || color === "red")
    )
      return { wins: { increment: 1 } };
    return { losses: { increment: 1 } };
  };

  try {
    const [gameFour] = await prisma.$transaction([
      prisma.gameFour.create({
        data: {
          bluePlayerId,
          greenPlayerId,
          yellowPlayerId,
          redPlayerId,
          winner,
          reason,
          finishedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: bluePlayerId },
        data: getStatUpdate("blue"),
      }),
      prisma.user.update({
        where: { id: greenPlayerId },
        data: getStatUpdate("green"),
      }),
      prisma.user.update({
        where: { id: yellowPlayerId },
        data: getStatUpdate("yellow"),
      }),
      prisma.user.update({
        where: { id: redPlayerId },
        data: getStatUpdate("red"),
      }),
    ]);

    return NextResponse.json(gameFour, { status: 200 });
  } catch (e: unknown) {
    const error = e as { code?: string };
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }
    throw e;
  }
}
