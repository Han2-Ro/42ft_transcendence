import { NextRequest, NextResponse } from "next/server";
import { verifyInternalSecret } from "@/lib/internal-secret-check";
import { getSession } from "@/lib/auth/session";

/**
 * Gets user data from current session (from token cookie)
 * Only for the game-server. For the frontend use the server action `fetchSession()`
 * For this api route to work the caller (game-server) has to set the token cookie. (If that doesn't work well we can maybe change it.)
 *
 * @returns `userId` and `username` or `undefined` if there's no valid and active session token
 */
export async function GET(req: NextRequest) {
  const unauthorized = verifyInternalSecret(req);
  if (unauthorized) return unauthorized;
  const session = await getSession();
  if (!session) {
    console.log("auth failed");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("auth successfull");
  return NextResponse.json(session);
}
