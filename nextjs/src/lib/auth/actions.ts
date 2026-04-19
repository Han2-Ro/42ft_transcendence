"use server";

import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getSession } from "./session";
import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { error } from "console";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function checkPasswordStrength(password: string) {
  if (password.length < 8) return false;
  else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) return false;
  else if (!/[0-9]/.test(password)) return false;
  return true;
}

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
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJwtSecret());
  return token;
}

function getCookieOptions() {
  const cookieOptions = {
    // TODO check if https is needed for this
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

export type LoginResult = ActionResult<
  | {
      requiresTwoFactor: false;
      userId: number;
      email: string;
      username: string;
    }
  | { requiresTwoFactor: true; userId: number }
>;

export async function login(
  username: string,
  password: string,
): Promise<LoginResult> {
  let user = await prisma.user.findUnique({ where: { username: username } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { email: username } });
  }
  if (!user) {
    return { success: false, error: "Invalid username or password" };
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);

  if (!passwordValid) {
    return { success: false, error: "Invalid username or password" };
  }

  if (user.twoFactorEnabled) {
    return {
      success: true,
      data: { requiresTwoFactor: true, userId: user.id },
    };
  }

  (await cookies()).set("token", await createToken(user), getCookieOptions());

  return {
    success: true,
    data: {
      requiresTwoFactor: false,
      userId: user.id,
      email: user.email,
      username: user.username,
    },
  };
}

export type RegisterResult = ActionResult<{
  id: number;
  email: string;
  username: string;
  createdAt: Date;
}>;

export async function register(
  email: string,
  username: string,
  password: string,
): Promise<RegisterResult> {
  if (!checkPasswordStrength(password)) {
    return {
      success: false,
      error:
        "Password must be at least 8 characters and contain one number, uppercase and lowecase letter.",
    };
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existingUser) {
    return {
      success: false,
      error: "User with this email or username already exists",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, username, passwordHash },
    select: { id: true, email: true, username: true, createdAt: true },
  });

  (await cookies()).set("token", await createToken(user), getCookieOptions());

  return { success: true, data: user };
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
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
): Promise<ActionResult<null>> {
  const session = await getSession();
  const user = await prisma.user.findUnique({ where: { id: session?.userId } });
  if (!user) return { success: false, error: "User not found" };
  const userId = user.id;
  const passwordValid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!passwordValid) {
    return { success: false, error: "Invalid password" };
  }
  if (!checkPasswordStrength(newPassword))
    return { success: false, error: "Weak password" };
  if (newPassword === oldPassword)
    return { success: false, error: "New password can't be same as old one" };
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(newPassword, 12) },
    });
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Failed to change password" };
  }
}

export async function changeUsername(
  newUsername: string,
): Promise<ActionResult<null>> {
  const session = await getSession();
  const user = await prisma.user.findUnique({ where: { id: session?.userId } });
  if (!user) return { success: false, error: "User not found" };
  const userId = session?.userId;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { username: newUsername },
    });
    return { success: true, data: null };
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
        teammate,
        opponents,
        result,
        reason: gameFour.reason,
      };
    });
}

export async function getLeaderboard() {
  const topUsers = await prisma.user.findMany({
    orderBy: { wins: "desc" },
    select: { username: true, wins: true, losses: true, draws: true },
  });

  return topUsers;
}

export async function setup2FA(): Promise<ActionResult<string>> {
  const session = await getSession();
  const user = await prisma.user.findUnique({ where: { id: session?.userId } });
  if (!user) return { success: false, error: "User not found" };
  const userId = user?.id;
  const secret2FA = generateSecret();
  const uri = generateURI({
    secret: secret2FA,
    label: user.email,
    issuer: "42Chess",
  });
  const qrDataUrl = await QRCode.toDataURL(uri);
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret2FA },
    });
    return { success: true, data: qrDataUrl };
  } catch {
    return { success: false, error: "Failed to generate 2FA secret" };
  }
}

export async function verify2FA(code: string): Promise<ActionResult<null>> {
  const session = await getSession();
  const user = await prisma.user.findUnique({ where: { id: session?.userId } });

  if (!user) return { success: false, error: "User not found" };

  const userId = user.id;
  const secret = user?.twoFactorSecret;

  if (!secret) return { success: false, error: "No secret found for user" };

  let valid: Awaited<ReturnType<typeof verify>>;
  try {
    valid = await verify({ secret, token: code });
  } catch {
    return { success: false, error: "Invalid code" };
  }
  if (!valid?.valid) return { success: false, error: "Invalid code" };
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Failed to enable 2FA" };
  }
}

export async function login2FA(
  code: string,
  userId: number,
): Promise<ActionResult<{ userId: number; email: string; username: string }>> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: "Failed to find user" };

  const secret = user.twoFactorSecret;
  if (!secret) return { success: false, error: "No secret found for user" };

  let valid: Awaited<ReturnType<typeof verify>>;
  try {
    valid = await verify({ secret, token: code });
  } catch {
    return { success: false, error: "Invalid code" };
  }
  if (!valid?.valid) return { success: false, error: "Invalid code" };

  (await cookies()).set("token", await createToken(user), getCookieOptions());

  return {
    success: true,
    data: { userId: user.id, email: user.email, username: user.username },
  };
}

export async function disable2FA(code: string): Promise<ActionResult<null>> {
  const session = await getSession();
  const user = await prisma.user.findUnique({ where: { id: session?.userId } });
  if (!user) return { success: false, error: "User not found" };

  const secret = user.twoFactorSecret;
  if (!secret) return { success: false, error: "No secret found for user" };

  let valid: Awaited<ReturnType<typeof verify>>;
  try {
    valid = await verify({ secret, token: code });
  } catch {
    return { success: false, error: "Invalid code" };
  }
  if (!valid?.valid) return { success: false, error: "Invalid code" };

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Failed to disable 2FA" };
  }
}
