import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/settings";
import { checkIsKitchenOpen } from "@/lib/kitchen-hours";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getSiteSettings();
    const kitchenStatus = checkIsKitchenOpen(settings.openingTime, settings.closingTime);

    return NextResponse.json({
      settings,
      kitchenStatus,
    });
  } catch (error) {
    console.error("Failed to retrieve public settings:", error);
    return NextResponse.json(
      { error: "Failed to retrieve settings" },
      { status: 500 }
    );
  }
}

