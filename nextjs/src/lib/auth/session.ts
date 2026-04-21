import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export type User = {
  userId: number;
  username: string;
  twoFactorEnabled: boolean;
  fortyTwoLogin: string | null;
};

/**
 * Gets user data from current session (from token cookie)
 *
 * @returns `userId` and `username` or `undefined` if there's no valid and active session token
 */
export const getSession = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as number },
    });
    if (!user) {
      return null;
    }
    console.log("db", user?.username);
    return {
      userId: payload.userId as number,
      username: user.username,
      twoFactorEnabled: user.twoFactorEnabled,
      fortyTwoLogin: user.fortyTwoLogin,
    };
  } catch {
    return null;
  }
});
