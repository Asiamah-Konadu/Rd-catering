'use client';

import { useCart } from "@/components/cart/CartProvider";
import { useState, useMemo, useEffect } from "react";
import { LocationPicker, type LocationData } from "@/components/LocationPicker";
import {
  MapPin,
  Navigation,
  Crosshair,
  Calendar,
  Clock,
  Zap,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Tag,
  Gift,
  X,
  Building2,
} from "lucide-react";

import { checkIsKitchenOpen, type KitchenStatus } from "@/lib/kitchen-hours";

type DeliveryTiming = "ASAP" | "SCHEDULED";

const TIME_SLOTS = [
  {
    id: "Morning (9:00 AM - 11:30 AM)",
    title: "Morning",
    time: "9:00 AM – 11:30 AM",
    icon: "☀️",
    description: "Fresh morning batch & breakfast",
  },
  {
    id: "Lunch (12:00 PM - 2:30 PM)",
    title: "Lunch",
    time: "12:00 PM – 2:30 PM",
    icon: "🍲",
    description: "Peak afternoon lunch delivery",
  },
  {
    id: "Afternoon (3:00 PM - 5:30 PM)",
    title: "Afternoon",
    time: "3:00 PM – 5:30 PM",
    icon: "☕",
    description: "Afternoon snack & meal box",
  },
  {
    id: "Dinner (6:00 PM - 8:30 PM)",
    title: "Dinner",
    time: "6:00 PM – 8:30 PM",
    icon: "🌙",
    description: "Freshly cooked evening dinner",
  },
];

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Timing state
  const [kitchenStatus, setKitchenStatus] = useState<KitchenStatus>(() =>
    checkIsKitchenOpen("08:00", "22:00")
  );
  const [timing, setTiming] = useState<DeliveryTiming>(() =>
    checkIsKitchenOpen("08:00", "22:00").isOpen ? "ASAP" : "SCHEDULED"
  );
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[1].id);

  const [form, setForm] = useState<{
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    region: string;
    notes: string;
    latitude: number | null;
    longitude: number | null;
  }>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "Accra",
    region: "Greater Accra",
    notes: "",
    latitude: null,
    longitude: null,
  });

  const tomorrowDateString = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString("en-GH", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

  const tomorrowISO = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    return tomorrow.toISOString();
  }, []);

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
    description: string;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  // Corporate office order state
  type CompanyOption = {
    id: string;
    name: string;
    slug: string;
    address: string;
    city: string;
    region: string | null;
    dropoffLocation: string | null;
    cutoffTime: string;
    batchDeliveryTime: string;
    discountPercent: number;
    freeDelivery: boolean;
    customPackaging: boolean;
  };

  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [isCorporateOrder, setIsCorporateOrder] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [staffDepartment, setStaffDepartment] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.kitchenStatus) {
          setKitchenStatus(data.kitchenStatus);
          if (!data.kitchenStatus.isOpen) {
            setTiming("SCHEDULED");
          }
        }
      })
      .catch((err) => console.error("Failed to load settings", err));

    fetch("/api/companies")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCompanies(data);
        }
      })
      .catch((err) => console.error("Failed to load companies", err));
  }, []);

  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === selectedCompanyId),
    [companies, selectedCompanyId]
  );

  const delivery = items.length
    ? isCorporateOrder && selectedCompany?.freeDelivery
      ? 0
      : 20
    : 0;

  const corporateDiscount =
    isCorporateOrder && selectedCompany && selectedCompany.discountPercent > 0
      ? (subtotal * selectedCompany.discountPercent) / 100
      : 0;

  const promoDiscount = appliedPromo ? Math.min(delivery, appliedPromo.discount) : 0;
  const total = Math.max(0, subtotal + delivery - promoDiscount - corporateDiscount);

  function handleSelectCompany(compId: string) {
    setSelectedCompanyId(compId);
    const comp = companies.find((c) => c.id === compId);
    if (comp) {
      setForm((prev) => ({
        ...prev,
        address: comp.dropoffLocation
          ? `${comp.address} [${comp.dropoffLocation}]`
          : comp.address,
        city: comp.city,
        region: comp.region || "Greater Accra",
      }));
    }
  }

  async function handleApplyPromo() {
    if (!promoCodeInput.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    setPromoSuccess("");
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCodeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid promo code.");
      }
      setAppliedPromo({
        code: data.code,
        discount: Number(data.discountAmount) || 20,
        description: data.description || "Free Delivery Applied",
      });
      setPromoSuccess(`🎉 Free delivery applied with ${data.code}!`);
      setPromoCodeInput("");
    } catch (err: unknown) {
      setPromoError(err instanceof Error ? err.message : "Failed to apply promo code");
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoSuccess("");
    setPromoError("");
  }

  const handleLocationSelect = (loc: LocationData) => {
    setForm((prev) => ({
      ...prev,
      address: loc.address,
      city: loc.city,
      region: loc.region,
      latitude: loc.latitude,
      longitude: loc.longitude,
    }));
    setShowLocationPicker(false);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const isScheduled = timing === "SCHEDULED" || isCorporateOrder;

      if (!isScheduled && !kitchenStatus.isOpen) {
        throw new Error(
          `Our kitchen is currently closed (${kitchenStatus.openingTimeDisplay} – ${kitchenStatus.closingTimeDisplay}). ASAP delivery is unavailable right now. Please choose a scheduled delivery slot for tomorrow.`
        );
      }
      if (isCorporateOrder && !selectedCompanyId) {
        throw new Error("Please select your company for the corporate batch order.");
      }

      if (isCorporateOrder && !staffDepartment.trim()) {
        throw new Error("Please specify your department or desk location for labeled delivery.");
      }

      if (form.latitude === null || form.longitude === null) {
        throw new Error("Please pin your delivery location on the map before placing your order.");
      }

      const scheduledSlotVal = isCorporateOrder && selectedCompany
        ? `Corporate Lunch Batch (${selectedCompany.batchDeliveryTime})`
        : isScheduled
        ? selectedSlot
        : null;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          isScheduled,
          scheduledFor: isScheduled ? tomorrowISO : null,
          scheduledSlot: scheduledSlotVal,
          companyId: isCorporateOrder && selectedCompany ? selectedCompany.id : null,
          staffDepartment: isCorporateOrder ? staffDepartment.trim() : null,
          promoCode: appliedPromo?.code || null,
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            extras: (item.selectedExtras || []).map((e) => ({ id: e.id })),
          })),
        }),
      });

      const data: unknown = await res.json();
      if (!res.ok) {
        const message =
          data && typeof data === "object" && "error" in data && typeof data.error === "string"
            ? data.error
            : "Unable to place your order. Please try again.";
        throw new Error(message);
      }
      if (
        !data ||
        typeof data !== "object" ||
        !("orderNumber" in data) ||
        typeof data.orderNumber !== "string" ||
        !("whatsappUrl" in data) ||
        typeof data.whatsappUrl !== "string"
      ) {
        throw new Error("The order was created, but WhatsApp checkout could not be opened.");
      }
      clear();
      window.location.assign(data.whatsappUrl);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to place your order. Please try again."
      );
      setLoading(false);
    }
  }

  if (!items.length) {
    return (
      <main className="page narrow">
        <div className="empty">
          <h2>Your bag is empty</h2>
          <p>Add items before checking out.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page narrow">
      <div className="page-heading">
        <span className="eyebrow">Checkout</span>
        <h1>Complete Your Order</h1>
        <p>Schedule your delivery slot and complete secure payment.</p>
      </div>

      <div className="checkout-layout">
        <form className="checkout space-y-6" onSubmit={submit} aria-busy={loading}>
          {/* ─── 1. ORDER TIMING SECTION ───────────────────────────────── */}
          <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Delivery Schedule</h3>
              </div>
              <span className="text-[11px] font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                Step 1 of 3
              </span>
            </div>

            {/* Closed kitchen banner */}
            {!kitchenStatus.isOpen && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-rose-600" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wide">
                      🔴 Kitchen Closed
                    </span>
                    <span className="font-bold text-slate-900 text-xs">
                      {kitchenStatus.openingTimeDisplay} – {kitchenStatus.closingTimeDisplay}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    &quot;Deliver Today (ASAP)&quot; is unavailable while the kitchen is closed. Pre-order for tomorrow below.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* ASAP option — disabled when kitchen is closed */}
              <button
                type="button"
                onClick={() => { if (kitchenStatus.isOpen) setTiming("ASAP"); }}
                disabled={!kitchenStatus.isOpen}
                className={`p-3.5 rounded-xl border-2 text-left transition flex items-start gap-3 ${
                  !kitchenStatus.isOpen
                    ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200"
                    : timing === "ASAP"
                    ? "border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                    !kitchenStatus.isOpen
                      ? "border-slate-300 bg-slate-100"
                      : timing === "ASAP"
                      ? "border-amber-600 bg-amber-600 text-white"
                      : "border-slate-300"
                  }`}
                >
                  {timing === "ASAP" && kitchenStatus.isOpen && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <Zap className={`w-4 h-4 ${kitchenStatus.isOpen ? "text-amber-600" : "text-slate-400"}`} />
                      <span className={`font-bold text-sm ${kitchenStatus.isOpen ? "text-slate-900" : "text-slate-400 line-through"}`}>
                        Deliver Today (ASAP)
                      </span>
                    </div>
                    {!kitchenStatus.isOpen && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                        Closed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {kitchenStatus.isOpen
                      ? "Freshly prepared now & dispatched in ~30–45 mins."
                      : `Opens at ${kitchenStatus.openingTimeDisplay} · ASAP orders locked`}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTiming("SCHEDULED")}
                className={`p-3.5 rounded-xl border-2 text-left transition flex items-start gap-3 ${
                  timing === "SCHEDULED"
                    ? "border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                    timing === "SCHEDULED" ? "border-amber-600 bg-amber-600 text-white" : "border-slate-300"
                  }`}
                >
                  {timing === "SCHEDULED" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-slate-900 text-sm">Schedule for Tomorrow</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {tomorrowDateString} • Choose time slot below.
                  </p>
                </div>
              </button>
            </div>

            {/* Time slot picker for tomorrow */}
            {timing === "SCHEDULED" && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Select Delivery Slot for {tomorrowDateString}
                  </span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = selectedSlot === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot.id)}
                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                          isSelected
                            ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{slot.icon}</span>
                          <div>
                            <div className="font-bold text-xs">{slot.title}</div>
                            <div className={`text-[11px] ${isSelected ? "text-amber-100" : "text-slate-500"}`}>
                              {slot.time}
                            </div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* ─── 2. CONTACT & DELIVERY LOCATION ───────────────────────── */}
          <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Recipient & Address</h3>
              </div>
              <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                Step 2 of 3
              </span>
            </div>

            {/* Corporate Batch Delivery Switch */}
            {companies.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/90 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-700 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-blue-950">Delivering to a Corporate Office?</div>
                      <div className="text-[11px] text-blue-700">Unlock free delivery & group perks for registered offices</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCorporateOrder}
                      onChange={(e) => {
                        setIsCorporateOrder(e.target.checked);
                        if (!e.target.checked) {
                          setSelectedCompanyId("");
                          setStaffDepartment("");
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {isCorporateOrder && (
                  <div className="pt-2 border-t border-blue-200/70 space-y-3 animate-in fade-in">
                    <div>
                      <label className="block text-xs font-bold text-blue-900 mb-1">
                        Select Your Company *
                      </label>
                      <select
                        required={isCorporateOrder}
                        value={selectedCompanyId}
                        onChange={(e) => handleSelectCompany(e.target.value)}
                        className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">-- Choose your registered office --</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.city}) — Dropoff: {c.batchDeliveryTime}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedCompany && (
                      <div className="p-3 bg-white/90 rounded-lg border border-blue-200 space-y-1.5 text-xs text-blue-900">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold">{selectedCompany.name}</span>
                          {selectedCompany.freeDelivery && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              ✓ Free Delivery
                            </span>
                          )}
                          {selectedCompany.discountPercent > 0 && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {selectedCompany.discountPercent}% Off Group Perk
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600">
                          📍 {selectedCompany.address}{selectedCompany.dropoffLocation ? ` [${selectedCompany.dropoffLocation}]` : ""}
                        </p>
                        <p className="text-[11px] text-blue-800">
                          🕒 Synchronized Batch Delivery: <strong>{selectedCompany.batchDeliveryTime}</strong> (Cutoff: {selectedCompany.cutoffTime})
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-blue-900 mb-1">
                        Your Department / Desk / Floor *
                      </label>
                      <input
                        required={isCorporateOrder}
                        type="text"
                        placeholder="e.g. Marketing Dept, 3rd Floor, Desk #14"
                        value={staffDepartment}
                        onChange={(e) => setStaffDepartment(e.target.value)}
                        className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-[10px] text-blue-700 mt-0.5">
                        This is printed on your meal box so your office receptionist knows who it belongs to.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block text-xs font-semibold text-slate-700">
                Full Name *
                <input
                  required
                  maxLength={100}
                  autoComplete="name"
                  placeholder="e.g. Ama Mensah"
                  className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>

              <label className="block text-xs font-semibold text-slate-700">
                Phone Number *
                <input
                  required
                  maxLength={30}
                  autoComplete="tel"
                  placeholder="e.g. 0244123456"
                  className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                  value={form.phone}
                  onChange={(e) => {
                    const newPhone = e.target.value;
                    setForm({ ...form, phone: newPhone });
                  }}
                />
              </label>
            </div>

            <label className="block text-xs font-semibold text-slate-700">
              Email <span className="text-slate-400 font-normal">(optional for receipt)</span>
              <input
                type="email"
                maxLength={150}
                autoComplete="email"
                placeholder="ama@example.com"
                className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>

            {/* Location Picker Trigger Card */}
            <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>Pin Map / GPS Coordinates *</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="flex items-center gap-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg shadow-xs transition"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  {form.latitude !== null && form.longitude !== null ? "Change Pin" : "Pick on Map"}
                </button>
              </div>
              {form.latitude !== null && form.longitude !== null ? (
                <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    GPS pinned: <strong>{form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}</strong>
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-amber-800/80">
                  Pin your location on Google Maps so the rider can navigate straight to your gate.
                </p>
              )}
            </div>

            <label className="block text-xs font-semibold text-slate-700">
              Delivery Address *
              <textarea
                required
                maxLength={300}
                autoComplete="street-address"
                rows={2}
                placeholder="House #, Street name, prominent landmark, or digitized GhanaPost GPS"
                className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block text-xs font-semibold text-slate-700">
                City / Area *
                <input
                  required
                  maxLength={100}
                  autoComplete="address-level2"
                  className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </label>

              <label className="block text-xs font-semibold text-slate-700">
                Region
                <input
                  maxLength={100}
                  autoComplete="address-level1"
                  className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                />
              </label>
            </div>

            <label className="block text-xs font-semibold text-slate-700">
              Special Instructions <span className="text-slate-400 font-normal">(optional)</span>
              <textarea
                maxLength={500}
                rows={2}
                placeholder="e.g. gate bell is broken, leave at reception, extra pepper"
                className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
          </section>

          {/* ─── 3. WHATSAPP ORDER CONFIRMATION ────────────────────────── */}
          <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Confirm on WhatsApp</h3>
              </div>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                Step 3 of 3
              </span>
            </div>

            <p className="text-sm text-slate-600">
              We&apos;ll save your order and open WhatsApp with the items, delivery details, and total ready to send. The restaurant will confirm availability and payment with you in chat.
            </p>
            <div className="text-xs text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
              <span>Checkout WhatsApp: <strong className="text-slate-900 font-bold">024 817 9348</strong></span>
              <span>Customer Service Call Line: <a href="tel:+233248179348" className="text-amber-700 font-bold hover:underline">024 817 9348</a></span>
            </div>
          </section>

          {error && (
            <p className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-2xl text-base shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? "Preparing WhatsApp order..." : "Continue to WhatsApp"}
          </button>
        </form>

        {/* ─── ORDER SUMMARY SIDEBAR ─────────────────────────────────── */}
        <aside className="summary checkout-summary space-y-4" aria-label="Order summary">
          <h2 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">
            Review Order
          </h2>

          {/* Delivery & Schedule Badge in Summary */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {timing === "SCHEDULED" ? "Scheduled for Tomorrow" : "Deliver Today (ASAP)"}
              </span>
            </div>
            <p className="text-amber-800 text-[11px]">
              {timing === "SCHEDULED" ? (
                <>
                  <strong>{tomorrowDateString}</strong> • {selectedSlot}
                </>
              ) : (
                "Dispatched as soon as cooked (~30-45 mins)"
              )}
            </p>
          </div>

          <div className="summary-lines divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item.lineId} className="py-2.5 flex justify-between items-start text-sm">
                <div>
                  <div className="text-slate-800 font-medium">
                    {item.quantity} × {item.name}
                  </div>
                  {item.selectedExtras && item.selectedExtras.length > 0 && (
                    <div className="text-[11px] text-amber-800 mt-0.5 font-normal">
                      Extras: {item.selectedExtras.map((e) => e.name).join(", ")}
                    </div>
                  )}
                </div>
                <b className="text-slate-900 font-semibold whitespace-nowrap ml-3">
                  GH₵ {(item.price * item.quantity).toFixed(2)}
                </b>
              </div>
            ))}
          </div>

          {/* ─── PROMO CODE VOUCHER SECTION ──────────────────────── */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>Have a Launch Promo Code?</span>
            </div>

            {appliedPromo ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-900">{appliedPromo.code}</div>
                    <div className="text-[10px] text-emerald-700">Free delivery applied (-GH₵ 20.00)</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="p-1 hover:bg-emerald-100 rounded text-emerald-800 transition"
                  title="Remove promo code"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. RDFREE-ABC123"
                  value={promoCodeInput}
                  onChange={(e) => {
                    setPromoCodeInput(e.target.value.toUpperCase());
                    setPromoError("");
                  }}
                  className="flex-1 px-3 py-1.5 text-xs uppercase font-mono tracking-wider border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={promoLoading || !promoCodeInput.trim()}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition shrink-0"
                >
                  {promoLoading ? "..." : "Apply"}
                </button>
              </div>
            )}

            {promoError && (
              <p className="text-[11px] text-rose-600 font-medium">{promoError}</p>
            )}
            {promoSuccess && !promoError && (
              <p className="text-[11px] text-emerald-700 font-medium">{promoSuccess}</p>
            )}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
            <p className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <b>GH₵ {subtotal.toFixed(2)}</b>
            </p>
            <p className="flex justify-between text-slate-600">
              <span>Delivery Fee</span>
              <b>
                {isCorporateOrder && selectedCompany?.freeDelivery ? (
                  <span className="text-emerald-700 font-bold">FREE (Corporate)</span>
                ) : (
                  `GH₵ ${delivery.toFixed(2)}`
                )}
              </b>
            </p>
            {corporateDiscount > 0 && (
              <p className="flex justify-between text-blue-700 font-medium">
                <span>Corporate Perk ({selectedCompany?.name})</span>
                <b>- GH₵ {corporateDiscount.toFixed(2)}</b>
              </p>
            )}
            {promoDiscount > 0 && (
              <p className="flex justify-between text-emerald-700 font-medium">
                <span>Free Delivery Promo</span>
                <b>- GH₵ {promoDiscount.toFixed(2)}</b>
              </p>
            )}
            <hr className="border-slate-200" />
            <p className="total flex justify-between items-center text-lg font-extrabold text-slate-900 pt-1">
              <span>Total to Pay</span>
              <span className="text-amber-700">GH₵ {total.toFixed(2)}</span>
            </p>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted 256-bit secure checkout</span>
          </div>
        </aside>
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <LocationPicker
            initialAddress={form.address}
            initialCity={form.city}
            initialRegion={form.region}
            initialLat={form.latitude}
            initialLng={form.longitude}
            onSelect={handleLocationSelect}
            onClose={() => setShowLocationPicker(false)}
          />
        </div>
      )}
    </main>
  );
}
