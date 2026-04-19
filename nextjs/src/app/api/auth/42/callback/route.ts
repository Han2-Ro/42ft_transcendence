import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken, getCookieOptions } from "@/lib/auth/token";

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
    return NextResponse.json({ tokenError: tokenData }, { status: 400 });

  const userRes = await fetch("https://api.intra.42.fr/v2/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const userData = await userRes.json();

  let user = await prisma.user.findUnique({
    where: { fortyTwoId: String(userData.id) },
  });

  if (!user) {
    const existingByEmail = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingByEmail) {
      // Link 42 account to existing user
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: { fortyTwoId: String(userData.id) },
      });
    } else {
      let username = userData.login;
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        username = `${userData.login}_${userData.id}`;
      }

      user = await prisma.user.create({
        data: {
          fortyTwoId: String(userData.id),
          email: userData.email,
          username: username,
        },
      });
    }
  }

  const baseUrl = process.env.SERVICE_URL_NEXTJS ?? "https://localhost";
  const response = NextResponse.redirect(new URL("/", baseUrl));
  response.cookies.set("token", await createToken(user), getCookieOptions());
  return response;
}
