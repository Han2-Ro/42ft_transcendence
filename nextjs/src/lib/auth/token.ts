import "server-only";

import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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

export async function createToken(user: JwtUser): Promise<string> {
  const token = await new SignJWT({
    userId: user.id,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJwtSecret());
  return token;
}

export function getCookieOptions() {
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