import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/authz";
import { getShowcaseConfig, saveShowcaseConfig, type ShowcaseConfig } from "@/lib/showcase";

export async function GET() {
  const { user, response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response || !user) return response;

  try {
    const config = await getShowcaseConfig();

    const menuItems = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      include: { category: { select: { name: true } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      config,
      menuItems: menuItems.map((m) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        description: m.description || "",
        category: m.category?.name || "Kitchen Special",
        imageUrl: m.imageUrl || "/coming-soon/jolof.avif",
        price: Number(m.price),
      })),
    });
  } catch (err) {
    console.error("Failed to load showcase data:", err);
    return NextResponse.json({ error: "Failed to load showcase data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { user, response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response || !user) return response;

  try {
    const body: ShowcaseConfig = await req.json();

    if (!body || !Array.isArray(body.items)) {
      return NextResponse.json({ error: "Invalid configuration format." }, { status: 400 });
    }

    const success = await saveShowcaseConfig(body);
    if (!success) {
      return NextResponse.json({ error: "Failed to persist configuration." }, { status: 500 });
    }

    return NextResponse.json({ success: true, config: body });
  } catch (err) {
    console.error("Failed to save showcase data:", err);
    return NextResponse.json({ error: "Failed to save showcase configuration" }, { status: 500 });
  }
}
