import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/authz";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/admin/companies - List all registered companies with analytics
export async function GET() {
  const { response } = await requireApiRole(["ADMIN", "ORDER_HANDLER", "MENU_MANAGER"]);
  if (response) return response;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const companies = await prisma.company.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            createdAt: true,
            status: true,
          },
        },
      },
    });

    const formatted = companies.map((c) => {
      const todayOrders = c.orders.filter((o) => new Date(o.createdAt) >= today);
      const totalRevenue = c.orders.reduce((sum, o) => sum + Number(o.total), 0);

      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        address: c.address,
        city: c.city,
        region: c.region,
        dropoffLocation: c.dropoffLocation,
        contactPersonName: c.contactPersonName,
        contactPhone: c.contactPhone,
        contactEmail: c.contactEmail,
        cutoffTime: c.cutoffTime,
        batchDeliveryTime: c.batchDeliveryTime,
        discountPercent: Number(c.discountPercent),
        freeDelivery: c.freeDelivery,
        customPackaging: c.customPackaging,
        isActive: c.isActive,
        notes: c.notes,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        totalOrdersCount: c.orders.length,
        todayOrdersCount: todayOrders.length,
        totalRevenue,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/admin/companies error:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

// POST /api/admin/companies - Register a new company for corporate batch orders
export async function POST(req: Request) {
  const { response } = await requireApiRole(["ADMIN", "ORDER_HANDLER"]);
  if (response) return response;

  try {
    const body = await req.json();
    const {
      name,
      slug: customSlug,
      address,
      city = "Accra",
      region = "Greater Accra",
      dropoffLocation,
      contactPersonName,
      contactPhone,
      contactEmail,
      cutoffTime = "10:30 AM",
      batchDeliveryTime = "12:00 PM - 1:00 PM",
      discountPercent = 0,
      freeDelivery = true,
      customPackaging = true,
      isActive = true,
      notes,
    } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { error: "Company name is required." },
        { status: 400 }
      );
    }
    if (!address || !String(address).trim()) {
      return NextResponse.json(
        { error: "Office delivery address is required." },
        { status: 400 }
      );
    }

    let slug = customSlug ? generateSlug(customSlug) : generateSlug(name);
    if (!slug) {
      slug = `company-${Date.now().toString(36)}`;
    }

    // Check slug collision
    const existing = await prisma.company.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    const company = await prisma.company.create({
      data: {
        name: String(name).trim(),
        slug,
        address: String(address).trim(),
        city: String(city).trim() || "Accra",
        region: region ? String(region).trim() : "Greater Accra",
        dropoffLocation: dropoffLocation ? String(dropoffLocation).trim() : null,
        contactPersonName: contactPersonName ? String(contactPersonName).trim() : null,
        contactPhone: contactPhone ? String(contactPhone).trim() : null,
        contactEmail: contactEmail ? String(contactEmail).trim() : null,
        cutoffTime: cutoffTime ? String(cutoffTime).trim() : "10:30 AM",
        batchDeliveryTime: batchDeliveryTime ? String(batchDeliveryTime).trim() : "12:00 PM - 1:00 PM",
        discountPercent: Math.max(0, Math.min(100, Number(discountPercent) || 0)),
        freeDelivery: Boolean(freeDelivery),
        customPackaging: Boolean(customPackaging),
        isActive: Boolean(isActive),
        notes: notes ? String(notes).trim() : null,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/companies error:", error);
    return NextResponse.json(
      { error: "Failed to register company" },
      { status: 500 }
    );
  }
}
