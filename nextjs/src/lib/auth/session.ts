import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { jwtVerify } from "jose";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export type User = {
  userId: number;
  username: string;
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
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as number,
      username: payload.username as string,
    };
  } catch {
    return null;
  }
});
