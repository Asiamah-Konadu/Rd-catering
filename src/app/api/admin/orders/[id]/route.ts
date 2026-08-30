import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/authz";
import { OrderStatus, DeliveryStatus } from "@prisma/client";

const VALID_ORDER_STATUSES = new Set(Object.values(OrderStatus));
const VALID_DELIVERY_STATUSES = new Set(Object.values(DeliveryStatus));

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireApiRole([
    "ADMIN",
    "ORDER_HANDLER",
    "DELIVERY_AGENT",
  ]);
  if (response) return response;

  const { id } = await params;

  try {
    const body = await req.json();
    const { status, deliveryStatus } = body;

    if (status && !VALID_ORDER_STATUSES.has(status)) {
      return NextResponse.json(
        { error: "Invalid order status value" },
        { status: 400 }
      );
    }

    if (deliveryStatus && !VALID_DELIVERY_STATUSES.has(deliveryStatus)) {
      return NextResponse.json(
        { error: "Invalid delivery status value" },
        { status: 400 }
      );
    }

    const updateData: { status?: OrderStatus } = {};
    if (status) updateData.status = status;

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (status) {
        await tx.order.update({
          where: { id },
          data: { status },
        });
      }

      if (deliveryStatus) {
        await tx.delivery.updateMany({
          where: { orderId: id },
          data: {
            status: deliveryStatus,
            ...(deliveryStatus === "DELIVERED" ? { deliveredAt: new Date() } : {}),
          },
        });
      }

      return tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: { extras: { include: { extra: true } } },
          },
          payment: true,
          delivery: true,
        },
      });
    });

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
