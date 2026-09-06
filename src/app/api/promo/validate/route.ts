import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid promo validation request" }, { status: 400 });
    }

    const { code } = body as { code?: unknown };
    if (typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Please provide a promo code." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const entry = await prisma.waitlistEntry.findUnique({
      where: { promoCode: cleanCode },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Invalid promo code. Please check and try again." },
        { status: 404 }
      );
    }

    if (entry.isUsed) {
      return NextResponse.json(
        { error: "This early-bird promo code has already been used on a previous order." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      code: entry.promoCode,
      discountType: "FREE_DELIVERY",
      discountAmount: 20,
      description: "Free Delivery Applied (GH₵ 20 discount)",
    });
  } catch (error) {
    console.error("Promo validation error:", error);
    return NextResponse.json(
      { error: "Unable to validate promo code. Please try again." },
      { status: 500 }
    );
  }
}
