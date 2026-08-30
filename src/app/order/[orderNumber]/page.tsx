import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrderTrackerClient } from "./OrderTrackerClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      delivery: true,
    },
  });

  if (!order) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-md p-8 rounded-2xl max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">Order Not Found</h1>
          <p className="text-sm text-slate-600">
            We couldn't find an order matching reference code{" "}
            <strong className="font-mono">{orderNumber}</strong>.
          </p>
          <Link
            href="/menu"
            className="inline-block px-5 py-2.5 bg-amber-600 text-white font-semibold text-sm rounded-xl hover:bg-amber-700 transition"
          >
            Back to Menu
          </Link>
        </div>
      </main>
    );
  }

  const formattedOrder = {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    discount: Number(order.discount),
    total: Number(order.total),
    status: order.status,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      totalPrice: Number(i.totalPrice),
    })),
    delivery: order.delivery
      ? {
          address: order.delivery.address,
          city: order.delivery.city,
          region: order.delivery.region,
          status: order.delivery.status,
        }
      : null,
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <OrderTrackerClient initialOrder={formattedOrder} />
    </main>
  );
}
