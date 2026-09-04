'use client';

import { useCart } from "@/components/cart/CartProvider";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LocationPicker, type LocationData } from "@/components/LocationPicker";
import {
  MapPin,
  Navigation,
  Crosshair,
  Calendar,
  Clock,
  Zap,
  CreditCard,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

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

const MOMO_NETWORKS = [
  { id: "MTN", name: "MTN MoMo", color: "bg-amber-400 text-slate-950 border-amber-500" },
  { id: "Telecel", name: "Telecel Cash", color: "bg-red-600 text-white border-red-700" },
  { id: "AT", name: "AT Money", color: "bg-blue-600 text-white border-blue-700" },
];

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const router = useRouter();

  // Timing state
  const [timing, setTiming] = useState<DeliveryTiming>("ASAP");
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[1].id);

  // Payment state - All orders require digital payment upfront
  const [paymentMethod, setPaymentMethod] = useState<"MOBILE_MONEY" | "CARD">("MOBILE_MONEY");
  const [momoNetwork, setMomoNetwork] = useState<string>("MTN");
  const [momoPhone, setMomoPhone] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvv, setCardCvv] = useState<string>("");

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

  const delivery = items.length ? 20 : 0;
  const total = subtotal + delivery;

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
      const isScheduled = timing === "SCHEDULED";
      const payloadMomoPhone = (momoPhone || form.phone).trim();

      if (paymentMethod === "MOBILE_MONEY" && !payloadMomoPhone) {
        throw new Error("Please enter your Mobile Money phone number.");
      }

      if (paymentMethod === "CARD" && (!cardNumber || cardNumber.length < 12)) {
        throw new Error("Please enter a valid card number.");
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          isScheduled,
          scheduledFor: isScheduled ? tomorrowISO : null,
          scheduledSlot: isScheduled ? selectedSlot : null,
          paymentMethod,
          momoNetwork,
          momoPhone: payloadMomoPhone,
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
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
        typeof data.orderNumber !== "string"
      ) {
        throw new Error("The order was created, but its confirmation could not be opened.");
      }
      clear();
      router.push(`/order/${data.orderNumber}`);
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTiming("ASAP")}
                className={`p-3.5 rounded-xl border-2 text-left transition flex items-start gap-3 ${
                  timing === "ASAP"
                    ? "border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                    timing === "ASAP" ? "border-amber-600 bg-amber-600 text-white" : "border-slate-300"
                  }`}
                >
                  {timing === "ASAP" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-slate-900 text-sm">Deliver Today (ASAP)</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Freshly prepared now & dispatched in ~30–45 mins.
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
                    if (!momoPhone) setMomoPhone(newPhone);
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
                  <span>Pin Map / GPS Coordinates</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="flex items-center gap-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg shadow-xs transition"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  {form.latitude ? "Change Pin" : "Pick on Map"}
                </button>
              </div>
              {form.latitude && form.longitude ? (
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

          {/* ─── 3. MANDATORY DIGITAL PAYMENT SECTION ─────────────────── */}
          <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Payment Method</h3>
              </div>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                Step 3 of 3 • Paid First
              </span>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>100% Pre-paid Assurance:</strong> All orders are freshly prepared in the kitchen upon immediate payment confirmation.
              </span>
            </div>

            {/* Payment Method Switcher */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("MOBILE_MONEY")}
                className={`p-3.5 rounded-xl border-2 text-left transition flex items-center gap-3 ${
                  paymentMethod === "MOBILE_MONEY"
                    ? "border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <Smartphone className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">Mobile Money</div>
                  <div className="text-[10px] text-slate-500">MTN, Telecel, AT</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("CARD")}
                className={`p-3.5 rounded-xl border-2 text-left transition flex items-center gap-3 ${
                  paymentMethod === "CARD"
                    ? "border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <CreditCard className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">Debit / Credit Card</div>
                  <div className="text-[10px] text-slate-500">Visa & Mastercard</div>
                </div>
              </button>
            </div>

            {/* Mobile Money Details */}
            {paymentMethod === "MOBILE_MONEY" && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 animate-fadeIn">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Mobile Network
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MOMO_NETWORKS.map((net) => (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => setMomoNetwork(net.id)}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        momoNetwork === net.id
                          ? `${net.color} shadow-xs`
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {net.name}
                    </button>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Mobile Money Wallet Number *
                    </label>
                    {form.phone && (
                      <button
                        type="button"
                        onClick={() => setMomoPhone(form.phone)}
                        className="text-[11px] text-amber-700 hover:underline font-medium"
                      >
                        Use recipient phone
                      </button>
                    )}
                  </div>
                  <input
                    required
                    type="tel"
                    placeholder="e.g. 0244123456"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white font-mono"
                    value={momoPhone || form.phone}
                    onChange={(e) => setMomoPhone(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    📲 A prompt will be triggered on this phone to enter your MoMo PIN and authorize <strong>GH₵ {total.toFixed(2)}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Card Payment Details */}
            {paymentMethod === "CARD" && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 animate-fadeIn">
                <label className="block text-xs font-semibold text-slate-700">
                  Card Number *
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="4123 •••• •••• 1234"
                    className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white font-mono"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    Expiry Date *
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white font-mono"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </label>

                  <label className="block text-xs font-semibold text-slate-700">
                    CVV Security Code *
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="123"
                      className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white font-mono"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}
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
            {loading ? (
              "Processing Payment..."
            ) : paymentMethod === "MOBILE_MONEY" ? (
              `Pay GH₵ ${total.toFixed(2)} with ${momoNetwork} MoMo`
            ) : (
              `Pay GH₵ ${total.toFixed(2)} with Card`
            )}
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
              <div key={item.id} className="py-2 flex justify-between items-center text-sm">
                <span className="text-slate-700">
                  {item.quantity} × {item.name}
                </span>
                <b className="text-slate-900 font-semibold">
                  GH₵ {(item.price * item.quantity).toFixed(2)}
                </b>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
            <p className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <b>GH₵ {subtotal.toFixed(2)}</b>
            </p>
            <p className="flex justify-between text-slate-600">
              <span>Delivery Fee</span>
              <b>GH₵ {delivery.toFixed(2)}</b>
            </p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
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

