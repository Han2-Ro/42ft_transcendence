import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const internalSecret = process.env.INTERNAL_SECRET;
  const headerSecret = req.headers.get("x-internal-secret");
  const hostHeader = (req.headers.get("host") || "").split(":")[0];

  const isLocalhost =
    hostHeader === "localhost" ||
    hostHeader === "127.0.0.1" ||
    hostHeader === "::1";

  if (isLocalhost) {
    return NextResponse.next();
  }

  if (internalSecret && headerSecret === internalSecret) {
    return NextResponse.next();
  }

  return new NextResponse("Not Found", { status: 404 });
}
