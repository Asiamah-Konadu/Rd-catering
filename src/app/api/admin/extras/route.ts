import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/authz";

// GET /api/admin/extras - Fetch all extras for admin management
export async function GET() {
  const { user, response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response || !user) return response;

  try {
    const extras = await prisma.extra.findMany({
      orderBy: [{ isActive: "desc" }, { price: "desc" }],
      include: {
        _count: {
          select: { orderExtras: true },
        },
      },
    });

    return NextResponse.json(
      extras.map((e) => ({
        id: e.id,
        name: e.name,
        price: Number(e.price),
        isActive: e.isActive,
        ordersCount: e._count.orderExtras,
      }))
    );
  } catch (error) {
    console.error("Failed to fetch admin extras:", error);
    return NextResponse.json(
      { error: "Failed to retrieve extras" },
      { status: 500 }
    );
  }
}

// POST /api/admin/extras - Create a new extra
export async function POST(req: Request) {
  const { user, response } = await requireApiRole(["ADMIN", "MENU_MANAGER"]);
  if (response || !user) return response;

  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const price = typeof body.price === "number" ? body.price : parseFloat(body.price);

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters long." },
        { status: 400 }
      );
    }

    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Price must be a valid positive number." },
        { status: 400 }
      );
    }

    const created = await prisma.extra.create({
      data: {
        name,
        price,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
    });

    return NextResponse.json(
      {
        id: created.id,
        name: created.name,
        price: Number(created.price),
        isActive: created.isActive,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create extra:", error);
    return NextResponse.json(
      { error: "Failed to create extra item" },
      { status: 500 }
    );
  }
}
