import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
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
