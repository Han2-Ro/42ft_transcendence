import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken, getCookieOptions } from "@/lib/auth/token";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "No code" }, { status: 400 });

  const tokenRes = await fetch("https://api.intra.42.fr/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: process.env.FORTYTWO_CLIENT_ID,
      client_secret: process.env.FORTYTWO_CLIENT_SECRET,
      code,
      redirect_uri: process.env.FORTYTWO_REDIRECT_URI,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok)
    return NextResponse.json({ error: "Token exchange failed" }, { status: 400 });

  const userRes = await fetch("https://api.intra.42.fr/v2/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const userData = await userRes.json();

  const baseUrl = process.env.SERVICE_URL_NEXTJS ?? "https://localhost";
  const session = await getSession();

  if (session) {
    // User is logged in — link their 42 account
    try {
      await prisma.user.update({
        where: { id: session.userId },
        data: {
          fortyTwoId: String(userData.id),
          fortyTwoEmail: userData.email,
          fortyTwoLogin: userData.login,
        },
      });
    } catch {
      return NextResponse.redirect(new URL("/?error=42_already_linked", baseUrl));
    }
    return NextResponse.redirect(new URL("/", baseUrl));
  }

  // User is not logged in — find by fortyTwoId and log in
  const user = await prisma.user.findUnique({
    where: { fortyTwoId: String(userData.id) },
  });

  if (!user)
    return NextResponse.json(
      { error: "No account linked to this 42 profile. Please log in and link your account first." },
      { status: 401 }
    );

  const response = NextResponse.redirect(new URL("/", baseUrl));
  response.cookies.set("token", await createToken(user), getCookieOptions());
  return response;
}
