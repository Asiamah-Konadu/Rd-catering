import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust path if your prisma client lives elsewhere

// Keeps the Neon compute from scaling to zero by running a trivial query
// on a schedule (see setup instructions). Not meant to be called by users.
export async function GET(request: Request) {
  // Optional but recommended: require a shared secret so randoms on the
  // internet can't spam this route. Set KEEP_WARM_SECRET in Vercel env vars,
  // and configure the same value as a query param or header in your
  // external scheduler.
  const secret = process.env.KEEP_WARM_SECRET;
  if (secret) {
    const provided =
      request.headers.get("x-keep-warm-secret") ??
      new URL(request.url).searchParams.get("secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const ms = Date.now() - start;
    return NextResponse.json({ ok: true, ms, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("keep-warm ping failed:", err);
    return NextResponse.json({ ok: false, error: "Database unreachable" }, { status: 503 });
  }
}
