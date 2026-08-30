"use client";

import { useState } from "react";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  extras?: {
    id: string;
    extra: {
      name: string;
      price: number | string;
    };
  }[];
};

type DeliveryAgentInfo = {
  id: string;
  name: string;
  phone: string | null;
};

type Delivery = {
  id: string;
  address: string;
  city: string;
  region: string | null;
  status: string;
  agentId?: string | null;
  agent?: DeliveryAgentInfo | null;
};

type Payment = {
  id: string;
  method: string;
  status: string;
  amount: number | string;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  subtotal: number | string;
  deliveryFee: number | string;
  discount: number | string;
  total: number | string;
  status: string;
  notes: string | null;
  createdAt: string | Date;
  items: OrderItem[];
  payment?: Payment | null;
  delivery?: Delivery | null;
};

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

const STATUS_BADGE_CLASSES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-300",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-300",
  PREPARING: "bg-purple-100 text-purple-800 border-purple-300",
  READY: "bg-indigo-100 text-indigo-800 border-indigo-300",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800 border-orange-300",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  CANCELLED: "bg-rose-100 text-rose-800 border-rose-300",
};

export function OrdersAdminClient({
  initialOrders,
  deliveryAgents,
}: {
  initialOrders: AdminOrder[];
  deliveryAgents: DeliveryAgentInfo[];
}) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeModalOrder, setActiveModalOrder] = useState<AdminOrder | null>(
    null
  );
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update order status");
      }

      const updated = await res.json();
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o))
      );

      if (activeModalOrder && activeModalOrder.id === orderId) {
        setActiveModalOrder((prev) =>
          prev ? { ...prev, status: updated.status } : null
        );
      }

      showToast(`Order #${updated.orderNumber || orderId} status updated to ${newStatus}`);
    } catch {
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignAgent = async (orderId: string, agentId: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agentId || null }),
      });

      if (!res.ok) throw new Error("Failed to assign delivery agent");

      const updated = await res.json();
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, delivery: updated.delivery } : o))
      );

      if (activeModalOrder && activeModalOrder.id === orderId) {
        setActiveModalOrder((prev) =>
          prev ? { ...prev, delivery: updated.delivery } : null
        );
      }

      const agentName = deliveryAgents.find((a) => a.id === agentId)?.name || "Unassigned";
      showToast(`Delivery agent set to "${agentName}"`);
    } catch {
      alert("Failed to assign delivery agent. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      selectedStatus === "ALL" ? true : o.status === selectedStatus;
    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-amber-950 text-amber-200 px-4 py-3 rounded-xl shadow-2xl border border-amber-800 transition-all font-medium text-sm">
          ✓ {notification}
        </div>
      )}

      {/* Header Actions & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedStatus("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedStatus === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All ({orders.length})
          </button>
          {ORDER_STATUSES.map((status) => {
            const count = orders.filter((o) => o.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedStatus === status
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {status.replaceAll("_", " ")} ({count})
              </button>
            );
          })}
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search order #, name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <h3 className="text-lg font-semibold text-slate-700">No orders found</h3>
            <p className="text-sm mt-1">Try clearing filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs">
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items & Total</th>
                  <th className="p-4">Kitchen Status</th>
                  <th className="p-4">Assigned Delivery Agent</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-amber-700">
                      {order.orderNumber}
                      <div className="text-[11px] font-sans font-normal text-slate-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleTimeString("en-GH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-slate-900">
                        {order.customerName}
                      </div>
                      <div className="text-xs text-slate-500">{order.customerPhone}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900">
                        GH₵ {Number(order.total).toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {order.items?.reduce((acc, i) => acc + i.quantity, 0) || 0} items
                      </div>
                    </td>

                    <td className="p-4">
                      <select
                        disabled={updatingId === order.id}
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                          STATUS_BADGE_CLASSES[order.status] ||
                          "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-4">
                      <select
                        disabled={updatingId === order.id}
                        value={order.delivery?.agentId || ""}
                        onChange={(e) => handleAssignAgent(order.id, e.target.value)}
                        className="text-xs border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="">-- Unassigned --</option>
                        {deliveryAgents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            🛵 {agent.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setActiveModalOrder(order)}
                        className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {activeModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-wider">
                  Order Details
                </span>
                <h2 className="text-2xl font-bold text-slate-900">
                  #{activeModalOrder.orderNumber}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Placed on{" "}
                  {new Date(activeModalOrder.createdAt).toLocaleString("en-GH", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <button
                onClick={() => setActiveModalOrder(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Customer & Delivery Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-sm">
              <div>
                <h4 className="font-semibold text-slate-700 text-xs uppercase mb-1">
                  Customer Info
                </h4>
                <p className="font-medium text-slate-900">
                  {activeModalOrder.customerName}
                </p>
                <p className="text-slate-600">{activeModalOrder.customerPhone}</p>
                {activeModalOrder.customerEmail && (
                  <p className="text-slate-600 text-xs">
                    {activeModalOrder.customerEmail}
                  </p>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 text-xs uppercase mb-1">
                  Delivery Destination & Agent
                </h4>
                {activeModalOrder.delivery ? (
                  <>
                    <p className="text-slate-900 font-medium">
                      {activeModalOrder.delivery.address}
                    </p>
                    <p className="text-slate-600 text-xs">
                      {activeModalOrder.delivery.city}
                      {activeModalOrder.delivery.region
                        ? `, ${activeModalOrder.delivery.region}`
                        : ""}
                    </p>
                    <div className="mt-2 text-xs font-bold text-emerald-800">
                      Agent: {activeModalOrder.delivery.agent?.name || "Unassigned"}
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500 italic">No delivery detail attached</p>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div>
              <h4 className="font-semibold text-slate-800 mb-3 text-sm">
                Ordered Items ({activeModalOrder.items.length})
              </h4>
              <div className="space-y-2">
                {activeModalOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-white border border-slate-100 p-3 rounded-lg text-sm"
                  >
                    <div>
                      <div className="font-medium text-slate-900">
                        {item.quantity} × {item.name}
                      </div>
                      {item.extras && item.extras.length > 0 && (
                        <div className="text-xs text-slate-500 pl-4">
                          Extras:{" "}
                          {item.extras
                            .map(
                              (ex) =>
                                `${ex.extra.name} (+GH₵ ${Number(
                                  ex.extra.price
                                ).toFixed(2)})`
                            )
                            .join(", ")}
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-slate-800">
                      GH₵ {Number(item.totalPrice).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="border-t border-slate-200 pt-4 space-y-1 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>GH₵ {Number(activeModalOrder.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span>GH₵ {Number(activeModalOrder.deliveryFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-base pt-2 border-t border-slate-100">
                <span>Total Amount</span>
                <span>GH₵ {Number(activeModalOrder.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveModalOrder(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
