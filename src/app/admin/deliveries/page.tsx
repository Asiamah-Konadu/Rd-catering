import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireAnyRole } from "@/lib/authz";
import { DeliveriesAdminClient } from "./DeliveriesAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DeliveriesAdminPage() {
  const user = await requireAnyRole(["ADMIN", "ORDER_HANDLER", "DELIVERY_AGENT"]);
  if (!user) redirect("/admin/login");

  const isAgentOnly = user.role === "DELIVERY_AGENT";

  const deliveries = await prisma.delivery.findMany({
    where: isAgentOnly ? { agentId: user.id } : {},
    orderBy: { assignedAt: "desc" },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      order: {
        include: {
          items: true,
        },
      },
    },
  });

  const formattedDeliveries = deliveries.map((d) => ({
    id: d.id,
    orderId: d.orderId,
    address: d.address,
    city: d.city,
    region: d.region,
    latitude: d.latitude ? Number(d.latitude) : null,
    longitude: d.longitude ? Number(d.longitude) : null,
    status: d.status,
    assignedAt: d.assignedAt ? d.assignedAt.toISOString() : null,
    deliveredAt: d.deliveredAt ? d.deliveredAt.toISOString() : null,
    agent: d.agent,
    order: {
      id: d.order.id,
      orderNumber: d.order.orderNumber,
      customerName: d.order.customerName,
      customerPhone: d.order.customerPhone,
      customerEmail: d.order.customerEmail,
      total: Number(d.order.total),
      status: d.order.status,
      notes: d.order.notes,
      items: d.order.items.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
      })),
    },
  }));

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-emerald-600 uppercase">
            Field Dispatch Portal
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">
            {isAgentOnly ? "My Assigned Deliveries" : "Delivery Dispatch Control"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAgentOnly
              ? "View orders assigned to you, call customers, and update delivery status in real-time."
              : "Monitor delivery dispatches and track rider progress across active orders."}
          </p>
        </div>
      </div>

      <DeliveriesAdminClient
        initialDeliveries={formattedDeliveries}
        userRole={user.role}
      />
    </main>
  );
}
