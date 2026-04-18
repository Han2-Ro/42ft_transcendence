"use server";

import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getSession } from "./session";

type ActionResult = { success: true } | { success: false; error: string };

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

type JwtUser = {
  id: number;
  email: string;
  username: string;
};

async function createToken(user: JwtUser): Promise<string> {
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    username: user.username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJwtSecret());
  return token;
}

function getCookieOptions() {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 60 * 60 * 24, // 24h
    domain: undefined as string | undefined,
    path: "/",
  };
  if (process.env.COOKIE_DOMAIN) {
    cookieOptions.domain = process.env.COOKIE_DOMAIN;
  }
  return cookieOptions;
}

export type LoginResult =
  | { success: true; user: { id: number; email: string; username: string } }
  | { requiresTwoFactor: true; userId: number }
  | { error: string };

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { error: "Invalid email or password" };
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);

  if (!passwordValid) {
    return { error: "Invalid email or password" };
  }

  if (user.twoFactorEnabled) {
    return { requiresTwoFactor: true, userId: user.id };
  }

  (await cookies()).set("token", await createToken(user), getCookieOptions());

  return {
    success: true,
    user: { id: user.id, email: user.email, username: user.username },
  };
}

export type RegisterResult =
  | {
      success: true;
      user: {
        id: number;
        email: string;
        username: string;
        createdAt: Date;
      };
    }
  | { error: string };

export async function register(
  email: string,
  username: string,
  password: string,
): Promise<RegisterResult> {
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existingUser) {
    return { error: "User with this email or username already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, username, passwordHash },
    select: { id: true, email: true, username: true, createdAt: true },
  });

  (await cookies()).set("token", await createToken(user), getCookieOptions());

  return { success: true, user };
}

/**
 * server action to make getSession() available for client components
 */
export async function fetchSession() {
  return await getSession();
}

export async function logout() {
  const cookieOptions = {
    name: "token",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    domain: undefined as string | undefined,
    path: "/",
  };
  if (process.env.COOKIE_DOMAIN) {
    cookieOptions.domain = process.env.COOKIE_DOMAIN;
  }
  (await cookies()).delete(cookieOptions);
  //TODO: What else needs to be done on logout?
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
): Promise<ActionResult> {
  const session = await getSession();
  const user = await prisma.user.findUnique({ where: { id: session?.userId } });
  if (!user) return { success: false, error: "User not found" };
  const userId = user.id;
  const passwordValid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!passwordValid) {
    return { success: false, error: "Invalid password" };
  }
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(newPassword, 12) },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to change password" };
  }
}

export async function changeUsername(
  newUsername: string,
): Promise<ActionResult> {
  const session = await getSession();
  const user = await prisma.user.findUnique({ where: { id: session?.userId } });
  if (!user) return { success: false, error: "User not found" };
  const userId = session?.userId;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { username: newUsername },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update username" };
  }
}

export async function getGameTwoHistory() {
  const session = await getSession();
  if (!session) return { error: "Not logged in." };
  const userId = session.userId;

  const games = await prisma.game.findMany({
    where: {
      OR: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
    },
    include: {
      whitePlayer: { select: { id: true, username: true } },
      blackPlayer: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return games
    .filter((game) => game.winner !== null)
    .map((game) => {
      const playedAsWhite = game.whitePlayerId === userId;
      const opponent = playedAsWhite ? game.blackPlayer : game.whitePlayer;

      let result: "win" | "lose" | "draw";
      if (game.winner === "draw") {
        result = "draw";
      } else if (
        (game.winner === "white" && playedAsWhite) ||
        (game.winner === "black" && !playedAsWhite)
      ) {
        result = "win";
      } else {
        result = "lose";
      }

      return {
        date: game.createdAt,
        opponent: opponent?.username ?? "Unknown",
        result,
        reason: game.reason,
      };
    });
}

// {date, teammate, opponents(array), result, reason}
export async function getGameFourHistory() {
  const session = await getSession();
  const user = await prisma.user.findUnique({ where: { id: session?.userId } });
  if (!user) return { error: "Not logged in." };
  const userId = user.id;

  const gamesFour = await prisma.gameFour.findMany({
    where: {
      OR: [
        { bluePlayerId: userId },
        { greenPlayerId: userId },
        { yellowPlayerId: userId },
        { redPlayerId: userId },
      ],
    },
    include: {
      bluePlayer: { select: { id: true, username: true } },
      greenPlayer: { select: { id: true, username: true } },
      yellowPlayer: { select: { id: true, username: true } },
      redPlayer: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return gamesFour
    .filter((gameFour) => gameFour.winner !== null)
    .map((gameFour) => {
      const playedAsBlue = gameFour.bluePlayerId === userId;
      const playedAsGreen = gameFour.greenPlayerId === userId;
      const playedAsYellow = gameFour.yellowPlayerId === userId;
      const playedAsRed = gameFour.redPlayerId === userId;

      const opponents = [];
      let teammate: "blue" | "green" | "yellow" | "red";
      if (playedAsBlue) teammate = "green";
      else if (playedAsGreen) teammate = "blue";
      else if (playedAsYellow) teammate = "red";
      else teammate = "yellow";

      if (playedAsBlue || playedAsGreen) {
        opponents.push(gameFour.yellowPlayer.username);
        opponents.push(gameFour.redPlayer.username);
      } else {
        opponents.push(gameFour.bluePlayer.username);
        opponents.push(gameFour.greenPlayer.username);
      }

      let result: "win" | "lose" | "draw";
      if (gameFour.winner === "draw") result = "draw";
      else if (
        (gameFour.winner === "blue" || gameFour.winner === "green") &&
        (playedAsBlue || playedAsGreen)
      )
        result = "win";
      else if (
        (gameFour.winner === "yellow" || gameFour.winner === "red") &&
        (playedAsYellow || playedAsRed)
      )
        result = "win";
      else result = "lose";

      return {
        date: gameFour.createdAt,
        opponents,
        result,
        reason: gameFour.reason,
      };
    });
}
