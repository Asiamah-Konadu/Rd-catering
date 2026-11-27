import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/authz";
import {
  AD_SLOT_DEFINITIONS,
  DEFAULT_ADSENSE_CONFIG,
  getAdSenseConfig,
  mergeAdSlots,
  type AdSlotConfig,
} from "@/lib/ads";

export async function GET() {
  const { user, response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response || !user) return response;

  try {
    const config = await getAdSenseConfig();
    return NextResponse.json({ config });
  } catch (error) {
    console.error("Failed to fetch AdSense config:", error);
    return NextResponse.json(
      { error: "Failed to retrieve AdSense configuration" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const { user, response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response || !user) return response;

  try {
    const body = await req.json();
    const enabled = typeof body.enabled === "boolean" ? body.enabled : false;
    const publisherId =
      typeof body.publisherId === "string" ? body.publisherId.trim() : "";

    if (publisherId && !/^ca-pub-\d{10,20}$/.test(publisherId)) {
      return NextResponse.json(
        {
          error:
            "Invalid AdSense Publisher ID. Expected format: ca-pub-XXXXXXXXXXXXXXXX",
        },
        { status: 400 }
      );
    }

    const validKeys = new Set(AD_SLOT_DEFINITIONS.map((d) => d.key));
    const rawSlots: Partial<AdSlotConfig>[] = Array.isArray(body.slots)
      ? body.slots.filter(
          (s: unknown): s is Partial<AdSlotConfig> =>
            typeof s === "object" &&
            s !== null &&
            validKeys.has((s as Partial<AdSlotConfig>).key as never)
        )
      : [];

    const normalizedSlots = mergeAdSlots(JSON.stringify(rawSlots));
    const slotsJson = JSON.stringify(normalizedSlots);

    const updated = await prisma.adSenseConfig.upsert({
      where: { id: "singleton" },
      update: {
        enabled,
        publisherId,
        slotsJson,
      },
      create: {
        id: "singleton",
        enabled: enabled ?? DEFAULT_ADSENSE_CONFIG.enabled,
        publisherId,
        slotsJson,
      },
    });

    return NextResponse.json({
      success: true,
      config: {
        enabled: updated.enabled,
        publisherId: updated.publisherId,
        slots: mergeAdSlots(updated.slotsJson),
      },
    });
  } catch (error) {
    console.error("Failed to update AdSense config:", error);
    return NextResponse.json(
      {
        error:
          "Failed to save AdSense settings. Ensure the database migration (0002_adsense.sql) has been applied.",
      },
      { status: 500 }
    );
  }
}
