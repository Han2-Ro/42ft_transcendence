import { NextRequest, NextResponse } from "next/server";

export function verifyInternalSecret(req: NextRequest): NextResponse | null {
  const secret = process.env.INTERNAL_SECRET;
  if (!secret || req.headers.get("x-internal-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
