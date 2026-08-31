import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/authz";
import {
  getAdminAnalytics,
  getKitchenAnalytics,
  getMenuManagerAnalytics,
  getDeliveryAgentAnalytics,
  TimeRange,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { user, response } = await requireApiRole();
  if (response || !user) return response;

  const searchParams = req.nextUrl.searchParams;
  const timeRange = (searchParams.get("timeRange") as TimeRange) || "7d";

  try {
    if (user.role === "ADMIN") {
      const data = await getAdminAnalytics(timeRange);
      return NextResponse.json({ success: true, role: "ADMIN", data });
    }

    if (user.role === "ORDER_HANDLER") {
      const data = await getKitchenAnalytics();
      return NextResponse.json({ success: true, role: "ORDER_HANDLER", data });
    }

    if (user.role === "MENU_MANAGER") {
      const data = await getMenuManagerAnalytics();
      return NextResponse.json({ success: true, role: "MENU_MANAGER", data });
    }

    if (user.role === "DELIVERY_AGENT") {
      const data = await getDeliveryAgentAnalytics(user.id, timeRange);
      return NextResponse.json({ success: true, role: "DELIVERY_AGENT", data });
    }

    return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
  } catch (error) {
    console.error("[ANALYTICS_API_ERROR]", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
