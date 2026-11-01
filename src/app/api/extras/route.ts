import { NextResponse } from "next/server";
import { getPublicExtras } from "@/lib/menu";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const extras = await getPublicExtras();
    return NextResponse.json(extras);
  } catch (error) {
    console.error("Failed to fetch extras:", error);
    return NextResponse.json(
      { error: "Failed to load meal extras" },
      { status: 500 }
    );
  }
}
