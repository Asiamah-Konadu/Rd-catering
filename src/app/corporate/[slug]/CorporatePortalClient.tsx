"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Clock,
  MapPin,
  Package,
  Tag,
  CheckCircle2,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  Utensils,
  Smartphone,
  ShieldCheck,
  X,
  Users,
  AlertCircle,
  Star,
} from "lucide-react";
import type { PublicMenuItem } from "@/lib/menu";

type Company = {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  region: string | null;
  dropoffLocation: string | null;
  contactPersonName: string | null;
  cutoffTime: string;
  batchDeliveryTime: string;
  discountPercent: number;
  freeDelivery: boolean;
  customPackaging: boolean;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  items: PublicMenuItem[];
};

type CartItem = { id: string; name: string; price: number; quantity: number };

const MOMO_NETWORKS = [
  { id: "MTN", name: "MTN MoMo", color: "bg-amber-400 text-slate-950 border-amber-500" },
  { id: "Telecel", name: "Telecel Cash", color: "bg-red-600 text-white border-red-700" },
  { id: "AT", name: "AT Money", color: "bg-blue-600 text-white border-blue-700" },
];

function PortalBanner({ company }: { company: Company }) {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Company initial avatar */}
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shrink-0 shadow-lg">
              {company.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  Corporate Lunch Portal
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {company.name}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {company.dropoffLocation
                  ? `${company.address} · ${company.dropoffLocation}`
                  : company.address}
                {company.city ? `, ${company.city}` : ""}
              </p>
            </div>
          </div>

          {/* Timing badges */}
          <div className="flex flex-col gap-2 sm:text-right">
            <div className="flex items-center gap-2 bg-rose-900/40 border border-rose-600/40 rounded-xl px-3 py-2">
              <Clock className="w-4 h-4 text-rose-300 shrink-0" />
              <div>
                <p className="text-[10px] text-rose-300 font-bold uppercase tracking-wide">Order Cut-off</p>
                <p className="text-sm font-extrabold text-white">{company.cutoffTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-900/40 border border-emerald-600/40 rounded-xl px-3 py-2">
              <Package className="w-4 h-4 text-emerald-300 shrink-0" />
              <div>
                <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wide">Batch Delivery</p>
                <p className="text-sm font-extrabold text-white">{company.batchDeliveryTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Perks strip */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700/50">
          {company.freeDelivery && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
              <CheckCircle2 className="w-3 h-3" /> Free Delivery for Staff
            </span>
          )}
          {company.discountPercent > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold">
              <Tag className="w-3 h-3" /> {company.discountPercent}% Corporate Discount
            </span>
          )}
          {company.customPackaging && (
            <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold">
              <Package className="w-3 h-3" /> Custom Office Packaging
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold">
            <Users className="w-3 h-3" /> Synchronized Batch Delivery
          </span>
        </div>
      </div>
    </div>
  );
}

function HowItWorksStrip() {
  const steps = [
    { icon: "🍽️", title: "Pick your meal", desc: "Choose from the menu below" },
    { icon: "💳", title: "Pay individually", desc: "Secure mobile money payment" },
    { icon: "🚀", title: "One delivery", desc: "All orders arrive together" },
  ];
  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 sm:divide-x sm:divide-amber-200">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 sm:px-6 first:pl-0 last:pr-0">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-xs font-extrabold text-amber-900">{s.title}</p>
                <p className="text-[10px] text-amber-700">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-amber-400 hidden sm:block ml-3" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MenuGrid({
  categories,
  cart,
  onAdd,
  onRemove,
}: {
  categories: Category[];
  cart: CartItem[];
  onAdd: (item: PublicMenuItem) => void;
  onRemove: (id: string) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState<Record<string, boolean>>({});

  const filteredCategories = activeCategory
    ? categories.filter((c) => c.id === activeCategory)
    : categories;

  const cartMap = useMemo(() => {
    const m = new Map<string, number>();
    cart.forEach((i) => m.set(i.id, i.quantity));
    return m;
  }, [cart]);

  return (
    <div className="space-y-6">
      {/* Category filter tabs */}
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition ${
              !activeCategory
                ? "bg-amber-500 text-slate-950"
                : "bg-white border border-slate-200 text-slate-600 hover:border-amber-300"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition ${
                activeCategory === cat.id
                  ? "bg-amber-500 text-slate-950"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-amber-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {filteredCategories.map((category) => (
        <div key={category.id}>
          <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest mb-3">
            {category.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {category.items.map((item) => {
              const qty = cartMap.get(item.id) || 0;
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                    qty > 0
                      ? "border-amber-300 shadow-md ring-1 ring-amber-200"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  } ${!item.isAvailable ? "opacity-50" : ""}`}
                >
                  {/* Image */}
                  <div className="relative h-32 bg-slate-100 overflow-hidden">
                    {item.imageUrl && !imageFailed[item.id] ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={() => setImageFailed((p) => ({ ...p, [item.id]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Utensils className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                    {item.isFeatured && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                        <Star className="w-2.5 h-2.5" /> Chef&apos;s Pick
                      </span>
                    )}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-500">Sold Out</span>
                      </div>
                    )}
                    {qty > 0 && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-[10px] font-black text-slate-950 shadow">
                        {qty}
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="font-extrabold text-slate-900 text-sm leading-tight">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-extrabold text-amber-600 text-sm">
                        GH₵ {item.price.toFixed(2)}
                      </span>
                      {qty === 0 ? (
                        <button
                          disabled={!item.isAvailable}
                          onClick={() => onAdd(item)}
                          className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-extrabold px-3 py-1.5 rounded-xl transition"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onRemove(item.id)}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 flex items-center justify-center transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-black text-slate-800 min-w-[1rem] text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => onAdd(item)}
                            className="w-6 h-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Utensils className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">No items available right now</p>
        </div>
      )}
    </div>
  );
}

function OrderSummaryPanel({
  cart,
  company,
  onCheckout,
  onRemoveOne,
  onAddOne,
  onClear,
}: {
  cart: CartItem[];
  company: Company;
  onCheckout: () => void;
  onRemoveOne: (id: string) => void;
  onAddOne: (id: string) => void;
  onClear: () => void;
}) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = company.freeDelivery ? 0 : 20;
  const corporateDiscount =
    company.discountPercent > 0 ? (subtotal * company.discountPercent) / 100 : 0;
  const total = Math.max(0, subtotal + deliveryFee - corporateDiscount);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm sticky top-4">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-amber-600" />
          <span className="font-extrabold text-slate-900 text-sm">Your Bag</span>
        </div>
        {cart.length > 0 && (
          <button
            onClick={onClear}
            className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold"
          >
            Clear all
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="p-6 text-center">
          <ShoppingBag className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-semibold">Your bag is empty</p>
          <p className="text-[10px] text-slate-300 mt-0.5">
            Pick a meal from the menu
          </p>
        </div>
      ) : (
        <>
          {/* Items */}
          <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-500">
                    GH₵{item.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onRemoveOne(item.id)}
                    className="w-5 h-5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-xs font-black min-w-[1rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onAddOne(item.id)}
                    className="w-5 h-5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
                <span className="text-xs font-extrabold text-slate-800 shrink-0">
                  GH₵{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="p-4 border-t border-slate-100 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal</span>
              <span>GH₵{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Delivery</span>
              <span className={company.freeDelivery ? "text-emerald-600 font-bold" : ""}>
                {company.freeDelivery ? "Free ✓" : `GH₵${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            {corporateDiscount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-bold">
                <span>Corporate Discount ({company.discountPercent}%)</span>
                <span>- GH₵{corporateDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1 border-t border-slate-100 mt-1">
              <span>Total</span>
              <span className="text-amber-600">GH₵{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-4 pt-0">
            <button
              onClick={onCheckout}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Proceed to Checkout
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Food arrives with the office batch at {company.batchDeliveryTime}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function CheckoutModal({
  cart,
  company,
  onClose,
  onSuccess,
}: {
  cart: CartItem[];
  company: Company;
  onClose: () => void;
  onSuccess: (orderNumber: string) => void;
}) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = company.freeDelivery ? 0 : 20;
  const corporateDiscount =
    company.discountPercent > 0 ? (subtotal * company.discountPercent) / 100 : 0;
  const total = Math.max(0, subtotal + deliveryFee - corporateDiscount);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    department: "",
  });
  const [momoNetwork, setMomoNetwork] = useState("MTN");
  const [momoPhone, setMomoPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const paymentPhone = (momoPhone || form.phone).trim();
      if (!paymentPhone) throw new Error("Enter your Mobile Money phone number for payment.");

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || null,
          companyId: company.id,
          staffDepartment: form.department || null,
          // Address is auto-filled from company on server
          address: company.dropoffLocation
            ? `${company.address} [${company.dropoffLocation}]`
            : company.address,
          city: company.city,
          region: company.region || "Greater Accra",
          paymentMethod: "MOBILE_MONEY",
          momoNetwork,
          momoPhone: paymentPhone,
          items: cart.map((i) => ({ id: i.id, quantity: i.quantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order could not be placed.");
      onSuccess(data.orderNumber);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-extrabold text-slate-900">Complete Your Order</h2>
            <p className="text-xs text-slate-500">
              {company.name} · Batch delivery {company.batchDeliveryTime}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Delivery confirmation */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <Package className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-extrabold text-amber-800">
                Delivery to {company.name}
              </p>
              <p className="text-[10px] text-amber-700 mt-0.5">
                {company.dropoffLocation
                  ? `${company.address} · ${company.dropoffLocation}`
                  : company.address}
              </p>
              <p className="text-[10px] text-amber-700 mt-0.5">
                🕐 Arriving {company.batchDeliveryTime}
              </p>
            </div>
          </div>

          {/* Personal info */}
          <div className="space-y-3">
            <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">
              Your Details
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Kofi Mensah"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="0244000000"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="kofi@company.com"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  Department / Floor
                </label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  placeholder="e.g. Finance, 3rd Floor"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="space-y-3">
            <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" /> Mobile Money Payment
            </p>
            <div className="flex gap-2">
              {MOMO_NETWORKS.map((net) => (
                <button
                  key={net.id}
                  type="button"
                  onClick={() => setMomoNetwork(net.id)}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl border-2 transition ${
                    momoNetwork === net.id ? net.color + " border-current" : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {net.name}
                </button>
              ))}
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">
                MoMo Number (leave blank to use your phone number)
              </label>
              <input
                type="tel"
                value={momoPhone}
                onChange={(e) => setMomoPhone(e.target.value)}
                placeholder={form.phone || "0244000000"}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Order total summary */}
          <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-600">
              <span>
                {cart.reduce((s, i) => s + i.quantity, 0)} item
                {cart.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
              </span>
              <span>GH₵{subtotal.toFixed(2)}</span>
            </div>
            {deliveryFee === 0 ? (
              <div className="flex justify-between text-xs text-emerald-600 font-bold">
                <span>Delivery</span>
                <span>Free ✓</span>
              </div>
            ) : (
              <div className="flex justify-between text-xs text-slate-600">
                <span>Delivery</span>
                <span>GH₵{deliveryFee.toFixed(2)}</span>
              </div>
            )}
            {corporateDiscount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-bold">
                <span>Corporate Discount</span>
                <span>- GH₵{corporateDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-200 pt-1.5 mt-1.5">
              <span>Total to Pay</span>
              <span className="text-amber-600">GH₵{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cart.length === 0}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-extrabold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {loading ? "Placing Order..." : `Pay GH₵${total.toFixed(2)} & Order`}
          </button>

          <p className="text-[10px] text-slate-400 text-center">
            Your order will be batched with your colleagues and delivered together to{" "}
            {company.name}.
          </p>
        </form>
      </div>
    </div>
  );
}

function SuccessScreen({
  orderNumber,
  company,
  onNewOrder,
}: {
  orderNumber: string;
  company: Company;
  onNewOrder: () => void;
}) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Order Confirmed!</h2>
          <p className="text-sm text-slate-500 mt-1">
            Your meal has been added to the {company.name} batch.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-700 uppercase">Order</span>
            <span className="font-mono text-sm font-extrabold text-amber-900">
              #{orderNumber}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-800">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Arrives with batch at <strong>{company.batchDeliveryTime}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-800">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              Delivered to{" "}
              <strong>
                {company.dropoffLocation || company.address}, {company.city}
              </strong>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push(`/order/${orderNumber}`)}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl text-sm transition"
          >
            Track My Order
          </button>
          <button
            onClick={onNewOrder}
            className="w-full border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition"
          >
            Place Another Order
          </button>
        </div>
      </div>
    </div>
  );
}

export function CorporatePortalClient({
  company,
  categories,
}: {
  company: Company;
  categories: Category[];
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState<string | null>(null);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const addToCart = useCallback(
    (item: PublicMenuItem) => {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: Math.min(i.quantity + 1, 50) } : i
          );
        }
        return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
      });
    },
    []
  );

  const removeOne = useCallback((id: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter((i) => i.id !== id);
      return prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i));
    });
  }, []);

  const addOneById = useCallback(
    (id: string) => {
      const item = categories
        .flatMap((c) => c.items)
        .find((i) => i.id === id);
      if (item) addToCart(item);
    },
    [categories, addToCart]
  );

  const clearCart = useCallback(() => setCart([]), []);

  if (successOrderNumber) {
    return (
      <SuccessScreen
        orderNumber={successOrderNumber}
        company={company}
        onNewOrder={() => {
          setSuccessOrderNumber(null);
          setCart([]);
        }}
      />
    );
  }

  return (
    <>
      <PortalBanner company={company} />
      <HowItWorksStrip />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Menu */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4">
              Today&apos;s Menu
            </h2>
            <MenuGrid
              categories={categories}
              cart={cart}
              onAdd={addToCart}
              onRemove={removeOne}
            />
          </div>

          {/* Sidebar cart – desktop */}
          <div className="hidden lg:block w-72 shrink-0">
            <OrderSummaryPanel
              cart={cart}
              company={company}
              onCheckout={() => setShowCheckout(true)}
              onRemoveOne={removeOne}
              onAddOne={addOneById}
              onClear={clearCart}
            />
          </div>
        </div>
      </div>

      {/* Floating cart button – mobile */}
      {cartCount > 0 && !showCheckout && (
        <div className="fixed bottom-0 left-0 right-0 p-4 lg:hidden z-40 bg-gradient-to-t from-white/90 to-transparent backdrop-blur-sm">
          <button
            onClick={() => setShowCheckout(true)}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3.5 rounded-2xl text-sm transition flex items-center justify-between px-5 shadow-xl"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              {cartCount} item{cartCount !== 1 ? "s" : ""} in bag
            </span>
            <span className="flex items-center gap-1">
              Checkout <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      )}

      {/* Checkout modal */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          company={company}
          onClose={() => setShowCheckout(false)}
          onSuccess={(orderNumber) => {
            setShowCheckout(false);
            setSuccessOrderNumber(orderNumber);
          }}
        />
      )}
    </>
  );
}
