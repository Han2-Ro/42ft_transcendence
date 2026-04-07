import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";

/**
 * Gets user data from current session (from token cookie)
 * Only for the game-server. For the frontend use the server action `fetchSession()`
 * For this api route to work the caller (game-server) has to set the token cookie. (If that doesn't work well we can maybe change it.)
 *
 * @returns `userId` and `username` or `undefined` if there's no valid and active session token
 */
export async function GET() {
  //TODO: check for internal secret
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(session);
}
