"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserRole } from "@prisma/client";
import {
  Navigation,
  ExternalLink,
  MapPin,
  Route,
  Phone,
  ListOrdered,
  RefreshCw,
} from "lucide-react";

export type DeliveryRecord = {
  id: string;
  orderId: string;
  address: string;
  city: string;
  region: string | null;
  latitude?: number | null;
  longitude?: number | null;
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
  IN_TRANSIT: "bg-amber-100 text-amber-800 border-amber-300 animate-pulse",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  FAILED: "bg-rose-100 text-rose-800 border-rose-300",
};

/**
 * Format a single delivery stop location for Google Maps (lat,lng or full address)
 */
function getStopLocationString(delivery: DeliveryRecord): string {
  if (delivery.latitude && delivery.longitude) {
    return `${delivery.latitude},${delivery.longitude}`;
  }
  const parts = [delivery.address, delivery.city, delivery.region].filter(Boolean);
  return parts.join(", ");
}

/**
 * Generate Google Maps directions URL with multiple stops:
 * - Waypoints: Stops 1 to N-1
 * - Destination: Stop N (the final stop)
 */
function getMultiStopGoogleMapsUrl(deliveries: DeliveryRecord[]): string {
  if (deliveries.length === 0) return "";

  const stops = deliveries.map(getStopLocationString);

  if (stops.length === 1) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      stops[0]
    )}&travelmode=driving`;
  }

  const destination = stops[stops.length - 1];
  const waypoints = stops.slice(0, stops.length - 1);

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination
  )}&waypoints=${encodeURIComponent(waypoints.join("|"))}&travelmode=driving`;
}

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
  const [showRouteModal, setShowRouteModal] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchLatest = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/deliveries");
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data);
        setLastSync(new Date());
      }
    } catch (err) {
      console.error("Failed to sync deliveries:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLatest();
    }, 10000); // Auto-poll every 10s

    return () => clearInterval(interval);
  }, [fetchLatest]);

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

  // Orders currently marked En Route (IN_TRANSIT)
  const enRouteDeliveries = deliveries.filter((d) => d.status === "IN_TRANSIT");
  const multiStopMapsUrl = getMultiStopGoogleMapsUrl(enRouteDeliveries);

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

      {/* Live Status Control & Sync Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Live Dispatch Stream
          </span>
          <span className="text-xs text-slate-400">
            • Updated {lastSync.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>

        <button
          onClick={fetchLatest}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-600" : ""}`} />
          {isRefreshing ? "Syncing..." : "Refresh Feed"}
        </button>
      </div>

      {/* START RIDE MULTI-STOP HERO BANNER */}
      {enRouteDeliveries.length > 0 && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white p-6 rounded-2xl shadow-xl border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-amber-950 uppercase tracking-wide animate-pulse">
                <Route className="w-3.5 h-3.5" /> En Route Active
              </span>
              <span className="text-amber-200 text-xs font-semibold">
                {enRouteDeliveries.length} {enRouteDeliveries.length === 1 ? "Stop" : "Stops"} Pending Delivery
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              Ready for Dispatch Navigation
            </h2>
            <p className="text-amber-100 text-xs md:text-sm max-w-xl">
              All {enRouteDeliveries.length} orders marked &quot;En Route&quot; are grouped into a multi-stop itinerary. Click &quot;Start Ride&quot; to open real-time turn-by-turn directions in Google Maps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowRouteModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-xs border border-white/20 transition"
            >
              <ListOrdered className="w-4 h-4" />
              View {enRouteDeliveries.length} Stops
            </button>

            <a
              href={multiStopMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-amber-50 text-amber-900 font-extrabold text-sm rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
            >
              <Navigation className="w-4 h-4 text-amber-600 fill-amber-600" />
              Start Ride in Google Maps
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
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
            const singleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              getStopLocationString(delivery)
            )}&travelmode=driving`;

            const isEnRoute = delivery.status === "IN_TRANSIT";

            return (
              <div
                key={delivery.id}
                className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 ${
                  isEnRoute ? "border-amber-400 ring-2 ring-amber-300/40" : "border-slate-200"
                }`}
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
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                    </div>
                  </div>

                  {/* Delivery Location & Direct Navigation */}
                  <div className="py-3 border-b border-slate-100 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">
                        Destination Address
                      </span>
                      {delivery.latitude && delivery.longitude && (
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" /> GPS Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-800">
                      📍 {delivery.address}
                    </p>
                    <p className="text-xs text-slate-500">
                      {delivery.city}
                      {delivery.region ? `, ${delivery.region}` : ""}
                    </p>

                    <div className="pt-1">
                      <a
                        href={singleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline"
                      >
                        <Navigation className="w-3 h-3" /> Navigate to this stop
                      </a>
                    </div>
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
                          ? "bg-amber-600 text-white border-amber-600 shadow-xs"
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

      {/* MULTI-STOP ROUTE MODAL */}
      {showRouteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Route className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-lg text-slate-900">
                  En Route Ride Itinerary ({enRouteDeliveries.length} Stops)
                </h3>
              </div>
              <button
                onClick={() => setShowRouteModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Deliveries will be navigated in sequence. The last delivery stop is set as the final destination on Google Maps, with prior stops routed as intermediate waypoints.
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {enRouteDeliveries.map((del, idx) => {
                const isLast = idx === enRouteDeliveries.length - 1;
                return (
                  <div
                    key={del.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white shrink-0 mt-0.5 ${
                          isLast ? "bg-amber-600" : "bg-slate-700"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 font-bold">
                            {del.order.customerName}
                          </strong>
                          <span className="font-mono text-amber-700 text-[11px]">
                            #{del.order.orderNumber}
                          </span>
                          {isLast && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                              Final Stop
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 mt-0.5">
                          📍 {del.address}, {del.city}
                        </p>
                        <p className="text-slate-500 font-mono text-[11px]">
                          📞 {del.order.customerPhone}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowRouteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
              <a
                href={multiStopMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                <Navigation className="w-3.5 h-3.5" />
                Launch in Google Maps
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
