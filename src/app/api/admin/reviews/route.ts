import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/authz";

// GET /api/admin/reviews - List all customer reviews (ADMIN only)
export async function GET() {
  const { response } = await requireApiRole(["ADMIN"]);
  if (response) return response;

  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            orderNumber: true,
            customerName: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const formatted = reviews.map((r) => ({
      id: r.id,
      orderId: r.orderId,
      rating: r.rating,
      comment: r.comment,
      isVisible: r.isVisible,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      order: {
        orderNumber: r.order.orderNumber,
        customerName: r.order.customerName,
      },
      user: r.user ? { name: r.user.name, email: r.user.email } : null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/admin/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
