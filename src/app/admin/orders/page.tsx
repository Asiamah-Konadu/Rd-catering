import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireAnyRole } from "@/lib/authz";
import { OrdersAdminClient } from "./OrdersAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrdersAdminPage() {
  const user = await requireAnyRole();
  if (!user) redirect("/admin/login");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      items: {
        include: {
          extras: {
            include: {
              extra: true,
            },
          },
        },
      },
      payment: true,
      delivery: true,
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
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      totalPrice: Number(i.totalPrice),
      extras: i.extras.map((e) => ({
        id: e.id,
        extra: {
          name: e.extra.name,
          price: Number(e.extra.price),
        },
      })),
    })),
    payment: o.payment
      ? {
          id: o.payment.id,
          method: o.payment.method,
          status: o.payment.status,
          amount: Number(o.payment.amount),
        }
      : null,
    delivery: o.delivery
      ? {
          id: o.delivery.id,
          address: o.delivery.address,
          city: o.delivery.city,
          region: o.delivery.region,
          status: o.delivery.status,
        }
      : null,
  }));

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase">
            Staff Operations
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">Order Management</h1>
        </div>
      </div>
      <OrdersAdminClient initialOrders={formattedOrders} />
    </main>
  );
}
