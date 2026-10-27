import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/authz";
import { DEFAULT_SITE_SETTINGS } from "@/lib/settings";

export async function GET() {
  const { user, response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response || !user) return response;

  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: {},
      create: {
        id: "singleton",
        ...DEFAULT_SITE_SETTINGS,
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return NextResponse.json(
      { error: "Failed to retrieve site settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const { user, response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response || !user) return response;

  try {
    const body = await req.json();
    const {
      businessHoursText,
      deliveryFeeText,
      deliveryNoteText,
      whatsappPhone,
    } = body;

    const updated = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: {
        ...(typeof businessHoursText === "string" ? { businessHoursText: businessHoursText.trim() } : {}),
        ...(typeof deliveryFeeText === "string" ? { deliveryFeeText: deliveryFeeText.trim() } : {}),
        ...(typeof deliveryNoteText === "string" ? { deliveryNoteText: deliveryNoteText.trim() } : {}),
        ...(typeof whatsappPhone === "string" ? { whatsappPhone: whatsappPhone.trim() } : {}),
      },
      create: {
        id: "singleton",
        businessHoursText: businessHoursText?.trim() || DEFAULT_SITE_SETTINGS.businessHoursText,
        deliveryFeeText: deliveryFeeText?.trim() || DEFAULT_SITE_SETTINGS.deliveryFeeText,
        deliveryNoteText: deliveryNoteText?.trim() || DEFAULT_SITE_SETTINGS.deliveryNoteText,
        whatsappPhone: whatsappPhone?.trim() || DEFAULT_SITE_SETTINGS.whatsappPhone,
      },
    });

    return NextResponse.json({
      success: true,
      settings: updated,
    });
  } catch (error) {
    console.error("Failed to update site settings:", error);
    return NextResponse.json(
      { error: "Failed to update site settings" },
      { status: 500 }
    );
  }
}
