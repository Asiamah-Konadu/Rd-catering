import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/companies - Public list of active companies for corporate ordering
export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        city: true,
        region: true,
        dropoffLocation: true,
        cutoffTime: true,
        batchDeliveryTime: true,
        discountPercent: true,
        freeDelivery: true,
        customPackaging: true,
        _count: {
          select: { orders: true },
        },
      },
    });

    const formatted = companies.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      address: c.address,
      city: c.city,
      region: c.region,
      dropoffLocation: c.dropoffLocation,
      cutoffTime: c.cutoffTime,
      batchDeliveryTime: c.batchDeliveryTime,
      discountPercent: Number(c.discountPercent),
      freeDelivery: c.freeDelivery,
      customPackaging: c.customPackaging,
      totalOrders: c._count.orders,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/companies error:", error);
    return NextResponse.json(
      { error: "Failed to fetch registered companies" },
      { status: 500 }
    );
  }
}
