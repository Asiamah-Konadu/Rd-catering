import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/companies/[slug] - Public details for a specific active company portal
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Company slug is required" }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { slug: slug.toLowerCase().trim() },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!company || !company.isActive) {
      return NextResponse.json(
        { error: "Company not found or corporate ordering portal is currently inactive." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: company.id,
      name: company.name,
      slug: company.slug,
      address: company.address,
      city: company.city,
      region: company.region,
      dropoffLocation: company.dropoffLocation,
      contactPersonName: company.contactPersonName,
      cutoffTime: company.cutoffTime,
      batchDeliveryTime: company.batchDeliveryTime,
      discountPercent: Number(company.discountPercent),
      freeDelivery: company.freeDelivery,
      customPackaging: company.customPackaging,
      totalOrders: company._count.orders,
    });
  } catch (error) {
    console.error("GET /api/companies/[slug] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch company details" },
      { status: 500 }
    );
  }
}
