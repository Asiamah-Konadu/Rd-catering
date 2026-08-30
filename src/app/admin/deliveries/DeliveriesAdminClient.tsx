"use client";

import { useState } from "react";
import type { UserRole } from "@prisma/client";

export type DeliveryRecord = {
  id: string;
  orderId: string;
  address: string;
  city: string;
  region: string | null;
  status: string;
  assignedAt: string | null;
  deliveredAt: string | null;
  agent?: {
    id: string;
    name: string;
    phone: string | null;
  } | null;
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string | null;
    total: number;
    status: string;
    notes: string | null;
    items: {
      id: string;
      name: string;
      quantity: number;
    }[];
  };
};

const DELIVERY_STATUSES = [
  "PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
] as const;

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700 border-slate-300",
  ASSIGNED: "bg-blue-100 text-blue-800 border-blue-300",
  PICKED_UP: "bg-purple-100 text-purple-800 border-purple-300",
  IN_TRANSIT: "bg-amber-100 text-amber-800 border-amber-300",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  FAILED: "bg-rose-100 text-rose-800 border-rose-300",
};

export function DeliveriesAdminClient({
  initialDeliveries,
  userRole,
}: {
  initialDeliveries: DeliveryRecord[];
  userRole: UserRole;
}) {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>(initialDeliveries);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateStatus = async (deliveryId: string, newStatus: string) => {
    setUpdatingId(deliveryId);
    try {
      const res = await fetch("/api/admin/deliveries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId, status: newStatus }),
      });

      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || "Failed to update delivery status");

      setDeliveries((prev) =>
        prev.map((d) => (d.id === deliveryId ? { ...d, status: updated.status } : d))
      );

      showToast(`Delivery status updated to ${newStatus.replaceAll("_", " ")}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update delivery status";
      alert(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredDeliveries = deliveries.filter((d) =>
    selectedFilter === "ALL" ? true : d.status === selectedFilter
  );

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl border border-emerald-800 font-medium text-sm">
          ✓ {toast}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setSelectedFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
            selectedFilter === "ALL"
              ? "bg-emerald-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          All Dispatches ({deliveries.length})
        </button>
        {DELIVERY_STATUSES.map((st) => {
          const count = deliveries.filter((d) => d.status === st).length;
          return (
            <button
              key={st}
              onClick={() => setSelectedFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedFilter === st
                  ? "bg-emerald-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {st.replaceAll("_", " ")} ({count})
            </button>
          );
        })}
      </div>

      {/* Delivery Cards Grid */}
      {filteredDeliveries.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
          <p className="font-medium">No delivery dispatches found for this status.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeliveries.map((delivery) => {
            const isUpdating = updatingId === delivery.id;
            return (
              <div
                key={delivery.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar: Order # & Status Badge */}
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                        Order Number
                      </span>
                      <strong className="text-lg font-mono text-amber-700 font-extrabold">
                        #{delivery.order.orderNumber}
                      </strong>
                    </div>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${
                        STATUS_BADGE[delivery.status] || "bg-slate-100"
                      }`}
                    >
                      {delivery.status.replaceAll("_", " ")}
                    </span>
                  </div>

                  {/* Customer Info & Direct Call Button */}
                  <div className="py-3 border-b border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">
                      Customer Contact
                    </span>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {delivery.order.customerName}
                        </h4>
                        <p className="text-xs text-slate-600 font-mono">
                          {delivery.order.customerPhone}
                        </p>
                      </div>
                      <a
                        href={`tel:${delivery.order.customerPhone}`}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-xs"
                      >
                        📞 Call
                      </a>
                    </div>
                  </div>

                  {/* Delivery Location */}
                  <div className="py-3 border-b border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">
                      Destination Address
                    </span>
                    <p className="text-sm font-medium text-slate-800">
                      📍 {delivery.address}
                    </p>
                    <p className="text-xs text-slate-500">
                      {delivery.city}
                      {delivery.region ? `, ${delivery.region}` : ""}
                    </p>
                  </div>

                  {/* Order Items Preview */}
                  <div className="pt-3 space-y-1 text-xs">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">
                      Package Contents ({delivery.order.items.length} items)
                    </span>
                    <div className="bg-slate-50 p-2.5 rounded-xl space-y-1 text-slate-700 font-medium">
                      {delivery.order.items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <span>
                            {item.quantity} × {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assigned Agent display if viewing as Admin/Handler */}
                  {userRole !== "DELIVERY_AGENT" && (
                    <div className="mt-3 text-xs text-slate-500">
                      Assigned Agent:{" "}
                      <strong className="text-slate-800">
                        {delivery.agent?.name || "Unassigned"}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Dispatch Status Controls */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">
                    Update Dispatch Progress
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={isUpdating || delivery.status === "PICKED_UP"}
                      onClick={() => handleUpdateStatus(delivery.id, "PICKED_UP")}
                      className={`px-3 py-2 text-xs font-bold rounded-lg border transition ${
                        delivery.status === "PICKED_UP"
                          ? "bg-purple-700 text-white border-purple-700"
                          : "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100"
                      }`}
                    >
                      Picked Up
                    </button>

                    <button
                      disabled={isUpdating || delivery.status === "IN_TRANSIT"}
                      onClick={() => handleUpdateStatus(delivery.id, "IN_TRANSIT")}
                      className={`px-3 py-2 text-xs font-bold rounded-lg border transition ${
                        delivery.status === "IN_TRANSIT"
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                      }`}
                    >
                      En Route
                    </button>

                    <button
                      disabled={isUpdating || delivery.status === "DELIVERED"}
                      onClick={() => handleUpdateStatus(delivery.id, "DELIVERED")}
                      className={`px-3 py-2 text-xs font-bold rounded-lg border transition col-span-2 ${
                        delivery.status === "DELIVERED"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      ✓ Mark Delivered
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
