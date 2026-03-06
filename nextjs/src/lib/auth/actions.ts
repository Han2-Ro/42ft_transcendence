"use server";

import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getSession } from "./session";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

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

  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    username: user.username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  (await cookies()).set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24h
  });

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

  return { success: true, user };
}

/**
 * server action to make getSession() available for client components
 */
export async function fetchSession() {
  return await getSession();
}

export async function logout() {
  (await cookies()).delete("token");
  //TODO: What else needs to be done on logout?
}
