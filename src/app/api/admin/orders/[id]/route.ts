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
    const { status, deliveryStatus, agentId } = body;

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

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (status) {
        await tx.order.update({
          where: { id },
          data: { status },
        });
      }

      if (deliveryStatus || agentId !== undefined) {
        const order = await tx.order.findUnique({
          where: { id },
          include: { delivery: true },
        });

        if (order) {
          if (!order.delivery) {
            // Create delivery record if missing
            await tx.delivery.create({
              data: {
                orderId: id,
                address: "Customer Address",
                city: "Accra",
                agentId: agentId || null,
                status: agentId ? "ASSIGNED" : (deliveryStatus || "PENDING"),
                assignedAt: agentId ? new Date() : null,
              },
            });
          } else {
            const updateDeliveryData: {
              status?: DeliveryStatus;
              agentId?: string | null;
              assignedAt?: Date | null;
              deliveredAt?: Date | null;
            } = {};

            if (deliveryStatus) {
              updateDeliveryData.status = deliveryStatus;
              if (deliveryStatus === "DELIVERED") {
                updateDeliveryData.deliveredAt = new Date();
              }
            }

            if (agentId !== undefined) {
              updateDeliveryData.agentId = agentId || null;
              if (agentId) {
                updateDeliveryData.assignedAt = new Date();
                if (order.delivery.status === "PENDING") {
                  updateDeliveryData.status = "ASSIGNED";
                }
              }
            }

            await tx.delivery.update({
              where: { orderId: id },
              data: updateDeliveryData,
            });
          }
        }
      }

      return tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: { extras: { include: { extra: true } } },
          },
          payment: true,
          delivery: {
            include: {
              agent: { select: { id: true, name: true, phone: true } },
            },
          },
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
