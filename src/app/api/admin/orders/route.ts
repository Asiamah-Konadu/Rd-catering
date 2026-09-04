import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/authz";

// GET /api/admin/orders - Fetch all orders for admin orders dashboard
export async function GET() {
  const { user, response } = await requireApiRole([
    "ADMIN",
    "ORDER_HANDLER",
    "MENU_MANAGER",
    "DELIVERY_AGENT",
  ]);
  if (response || !user) return response;

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            extras: {
              include: { extra: true },
            },
          },
        },
        payment: true,
        delivery: {
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    const formattedOrders = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      customerEmail: o.customerEmail,
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.deliveryFee),
      discount: Number(o.discount),
      total: Number(o.total),
      status: o.status,
      notes: o.notes,
      isScheduled: o.isScheduled,
      scheduledFor: o.scheduledFor ? o.scheduledFor.toISOString() : null,
      scheduledSlot: o.scheduledSlot,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        totalPrice: Number(i.totalPrice),
        extras: i.extras?.map((e) => ({
          id: e.id,
          extra: {
            name: e.extra.name,
            price: Number(e.price),
          },
        })),
      })),
      payment: o.payment
        ? {
            id: o.payment.id,
            method: o.payment.method,
            status: o.payment.status,
            amount: Number(o.payment.amount),
            transactionId: o.payment.transactionId,
          }
        : null,
      delivery: o.delivery
        ? {
            id: o.delivery.id,
            address: o.delivery.address,
            city: o.delivery.city,
            region: o.delivery.region,
            latitude: o.delivery.latitude ? Number(o.delivery.latitude) : null,
            longitude: o.delivery.longitude ? Number(o.delivery.longitude) : null,
            status: o.delivery.status,
            agentId: o.delivery.agentId,
            agent: o.delivery.agent,
          }
        : null,
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
