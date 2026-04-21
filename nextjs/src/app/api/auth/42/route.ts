import { redirect } from "next/navigation";

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.FORTYTWO_CLIENT_ID!,
    redirect_uri: process.env.FORTYTWO_REDIRECT_URI!,
    response_type: "code",
    scope: "public",
  });

  redirect(`https://api.intra.42.fr/oauth/authorize?${params}`);
}
