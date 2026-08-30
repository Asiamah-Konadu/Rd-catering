import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/authz";
import { DeliveryStatus, OrderStatus } from "@prisma/client";

// GET /api/admin/deliveries
export async function GET() {
  const { user, response } = await requireApiRole([
    "ADMIN",
    "ORDER_HANDLER",
    "DELIVERY_AGENT",
  ]);
  if (response || !user) return response;

  try {
    const isDeliveryAgentOnly = user.role === "DELIVERY_AGENT";

    const deliveries = await prisma.delivery.findMany({
      where: isDeliveryAgentOnly ? { agentId: user.id } : {},
      orderBy: { assignedAt: "desc" },
      include: {
        agent: { select: { id: true, name: true, phone: true } },
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error("GET /api/admin/deliveries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deliveries" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/deliveries - Update status of a delivery
export async function PATCH(req: Request) {
  const { user, response } = await requireApiRole([
    "ADMIN",
    "ORDER_HANDLER",
    "DELIVERY_AGENT",
  ]);
  if (response || !user) return response;

  try {
    const body = await req.json();
    const { deliveryId, status } = body;

    if (!deliveryId || !status) {
      return NextResponse.json(
        { error: "deliveryId and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = Object.values(DeliveryStatus);
    if (!validStatuses.includes(status as DeliveryStatus)) {
      return NextResponse.json(
        { error: `Invalid delivery status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const existingDelivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!existingDelivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    // Delivery agent can only update deliveries assigned to them
    if (user.role === "DELIVERY_AGENT" && existingDelivery.agentId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Delivery is not assigned to you." },
        { status: 403 }
      );
    }

    const nextDeliveryStatus = status as DeliveryStatus;
    let nextOrderStatus: OrderStatus | undefined;

    if (nextDeliveryStatus === "IN_TRANSIT" || nextDeliveryStatus === "PICKED_UP") {
      nextOrderStatus = "OUT_FOR_DELIVERY";
    } else if (nextDeliveryStatus === "DELIVERED") {
      nextOrderStatus = "DELIVERED";
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedDelivery = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: nextDeliveryStatus,
          ...(nextDeliveryStatus === "DELIVERED" ? { deliveredAt: new Date() } : {}),
        },
        include: {
          agent: { select: { id: true, name: true, phone: true } },
          order: { include: { items: true } },
        },
      });

      if (nextOrderStatus) {
        await tx.order.update({
          where: { id: existingDelivery.orderId },
          data: { status: nextOrderStatus },
        });
      }

      return updatedDelivery;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/admin/deliveries error:", error);
    return NextResponse.json(
      { error: "Failed to update delivery status" },
      { status: 500 }
    );
  }
}
