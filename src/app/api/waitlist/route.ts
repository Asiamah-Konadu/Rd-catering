import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function generatePromoCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomStr = "";
  const randomBytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    randomStr += chars[randomBytes[i] % chars.length];
  }
  return `RDFREE-${randomStr}`;
}

function normalizeContact(input: string): { contact: string; type: "PHONE" | "EMAIL" } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Check if valid email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmed)) {
    return { contact: trimmed.toLowerCase(), type: "EMAIL" };
  }

  // Check phone number format
  const digitsOnly = trimmed.replace(/[^\d+]/g, "");
  let formattedPhone = digitsOnly;

  if (formattedPhone.startsWith("0") && formattedPhone.length === 10) {
    formattedPhone = "+233" + formattedPhone.slice(1);
  } else if (formattedPhone.startsWith("233") && formattedPhone.length === 12) {
    formattedPhone = "+" + formattedPhone;
  }

  const phoneRegex = /^[+\d][\d]{7,15}$/;
  if (phoneRegex.test(formattedPhone)) {
    return { contact: formattedPhone, type: "PHONE" };
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { contact: rawContact, name: rawName } = body as {
      contact?: unknown;
      name?: unknown;
    };

    if (typeof rawContact !== "string" || !rawContact.trim()) {
      return NextResponse.json(
        { error: "Please provide a valid WhatsApp number or email address." },
        { status: 400 }
      );
    }

    const normalized = normalizeContact(rawContact);
    if (!normalized) {
      return NextResponse.json(
        { error: "Please enter a valid Ghanaian phone number (e.g., 054XXXXXXX) or email address." },
        { status: 400 }
      );
    }

    const name = typeof rawName === "string" && rawName.trim().length > 0
      ? rawName.trim().slice(0, 100)
      : null;

    // Check if contact is already registered
    const existing = await prisma.waitlistEntry.findUnique({
      where: { contact: normalized.contact },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyRegistered: true,
        promoCode: existing.promoCode,
        isUsed: existing.isUsed,
        perk: "Free delivery on your first order (GH₵ 20 discount)",
        message: "You're already on the VIP launch list! Here is your unique promo code.",
      });
    }

    // Generate a unique promo code
    let promoCode = generatePromoCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      const codeExists = await prisma.waitlistEntry.findUnique({
        where: { promoCode },
      });
      if (!codeExists) {
        isUnique = true;
      } else {
        promoCode = generatePromoCode();
        attempts++;
      }
    }

    const entry = await prisma.waitlistEntry.create({
      data: {
        contact: normalized.contact,
        contactType: normalized.type,
        name,
        promoCode,
      },
    });

    return NextResponse.json(
      {
        success: true,
        alreadyRegistered: false,
        promoCode: entry.promoCode,
        isUsed: false,
        perk: "Free delivery on your first order (GH₵ 20 discount)",
        message: "🎉 You're on the list! Save your unique code for launch day.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Unable to join waitlist right now. Please try again." },
      { status: 500 }
    );
  }
}
