'use client';

import { useCart } from "@/components/cart/CartProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocationPicker, type LocationData } from "@/components/LocationPicker";
import { MapPin, Navigation, Crosshair } from "lucide-react";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const router = useRouter();

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
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
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
        <h1>Delivery details</h1>
        <p>We’ll use these details to prepare and deliver your order.</p>
      </div>

      <div className="checkout-layout">
        <form className="checkout" onSubmit={submit} aria-busy={loading}>
          <label>
            Name
            <input
              required
              maxLength={100}
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label>
            Phone
            <input
              required
              maxLength={30}
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>

          <label>
            Email <span className="field-hint">(optional)</span>
            <input
              type="email"
              maxLength={150}
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>

          {/* Location Picker Trigger Card */}
          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Google Maps Location</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className="flex items-center gap-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl shadow-xs transition"
              >
                <Crosshair className="w-3.5 h-3.5" />
                {form.latitude ? "Change Pin" : "Pick on Map / GPS"}
              </button>
            </div>
            {form.latitude && form.longitude ? (
              <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
                <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  GPS coordinates pinned: <strong>{form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}</strong>
                </span>
              </div>
            ) : (
              <p className="text-xs text-amber-800/80">
                Pin your exact location on Google Maps or use GPS to help the rider find your doorstep accurately.
              </p>
            )}
          </div>

          <label>
            Address
            <textarea
              required
              maxLength={300}
              autoComplete="street-address"
              placeholder="House #, Street name, prominent landmark, or digitized address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </label>

          <label>
            City
            <input
              required
              maxLength={100}
              autoComplete="address-level2"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </label>

          <label>
            Region <span className="field-hint">(optional)</span>
            <input
              maxLength={100}
              autoComplete="address-level1"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
            />
          </label>

          <label>
            Order notes <span className="field-hint">(optional)</span>
            <textarea
              maxLength={500}
              placeholder="e.g. gate code, leave at reception, or specific directions"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button className="button primary full" disabled={loading}>
            {loading ? "Placing order..." : "Place order"}
          </button>
        </form>

        <aside className="summary checkout-summary" aria-label="Order summary">
          <h2>Review order</h2>
          <div className="summary-lines">
            {items.map((item) => (
              <p key={item.id}>
                <span>
                  {item.quantity} × {item.name}
                </span>
                <b>GH₵ {(item.price * item.quantity).toFixed(2)}</b>
              </p>
            ))}
          </div>
          <p>
            <span>Subtotal</span>
            <b>GH₵ {subtotal.toFixed(2)}</b>
          </p>
          <p>
            <span>Delivery</span>
            <b>GH₵ {delivery.toFixed(2)}</b>
          </p>
          <hr />
          <p className="total">
            <span>Total</span>
            <b>GH₵ {total.toFixed(2)}</b>
          </p>
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
