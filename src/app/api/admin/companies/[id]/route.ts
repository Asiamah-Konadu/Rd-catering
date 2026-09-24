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

// PUT /api/admin/companies/[id] - Update company details
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireApiRole(["ADMIN", "ORDER_HANDLER"]);
  if (response) return response;

  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name,
      slug: customSlug,
      address,
      city,
      region,
      dropoffLocation,
      contactPersonName,
      contactPhone,
      contactEmail,
      cutoffTime,
      batchDeliveryTime,
      discountPercent,
      freeDelivery,
      customPackaging,
      isActive,
      notes,
    } = body;

    const existing = await prisma.company.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    let slug = existing.slug;
    if (customSlug && customSlug !== existing.slug) {
      slug = generateSlug(customSlug);
      const duplicate = await prisma.company.findUnique({ where: { slug } });
      if (duplicate && duplicate.id !== id) {
        return NextResponse.json(
          { error: "A company with this URL slug already exists." },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.company.update({
      where: { id },
      data: {
        name: name !== undefined ? String(name).trim() : existing.name,
        slug,
        address: address !== undefined ? String(address).trim() : existing.address,
        city: city !== undefined ? String(city).trim() : existing.city,
        region: region !== undefined ? String(region).trim() : existing.region,
        dropoffLocation: dropoffLocation !== undefined ? (dropoffLocation ? String(dropoffLocation).trim() : null) : existing.dropoffLocation,
        contactPersonName: contactPersonName !== undefined ? (contactPersonName ? String(contactPersonName).trim() : null) : existing.contactPersonName,
        contactPhone: contactPhone !== undefined ? (contactPhone ? String(contactPhone).trim() : null) : existing.contactPhone,
        contactEmail: contactEmail !== undefined ? (contactEmail ? String(contactEmail).trim() : null) : existing.contactEmail,
        cutoffTime: cutoffTime !== undefined ? String(cutoffTime).trim() : existing.cutoffTime,
        batchDeliveryTime: batchDeliveryTime !== undefined ? String(batchDeliveryTime).trim() : existing.batchDeliveryTime,
        discountPercent: discountPercent !== undefined ? Math.max(0, Math.min(100, Number(discountPercent) || 0)) : existing.discountPercent,
        freeDelivery: freeDelivery !== undefined ? Boolean(freeDelivery) : existing.freeDelivery,
        customPackaging: customPackaging !== undefined ? Boolean(customPackaging) : existing.customPackaging,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
        notes: notes !== undefined ? (notes ? String(notes).trim() : null) : existing.notes,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/admin/companies/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/companies/[id] - Delete or deactivate company
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireApiRole(["ADMIN"]);
  if (response) return response;

  try {
    const { id } = await params;

    // Check if company has orders
    const ordersCount = await prisma.order.count({ where: { companyId: id } });
    if (ordersCount > 0) {
      // Soft-deactivate if orders exist to preserve order history
      const deactivated = await prisma.company.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        message: "Company has active history and was deactivated instead of permanently deleted.",
        company: deactivated,
      });
    }

    await prisma.company.delete({ where: { id } });
    return NextResponse.json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/companies/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete company" },
      { status: 500 }
    );
  }
}
