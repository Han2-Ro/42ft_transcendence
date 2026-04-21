import { NextRequest } from "next/server";
import { redirect } from "next/navigation";

export async function GET(req: NextRequest) {
  const host = req.headers.get("host");
  const redirectUri = `https://${host}/api/auth/42/callback`;

  const params = new URLSearchParams({
    client_id: process.env.FORTYTWO_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "public",
  });

  redirect(`https://api.intra.42.fr/oauth/authorize?${params}`);
}
