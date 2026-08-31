"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
};

type Delivery = {
  address: string;
  city: string;
  region?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  status: string;
};

type Review = {
  rating: number;
  comment?: string | null;
  createdAt: string;
};

type OrderData = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  subtotal: number | string;
  deliveryFee: number | string;
  discount: number | string;
  total: number | string;
  status: string;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
  delivery?: Delivery | null;
  review?: Review | null;
};

const STEPS = [
  { key: "PENDING", label: "Order Received", desc: "We received your order" },
  { key: "CONFIRMED", label: "Confirmed", desc: "Kitchen acknowledged order" },
  { key: "PREPARING", label: "Preparing", desc: "Chefs are cooking your meal" },
  { key: "READY", label: "Ready", desc: "Packed & waiting for driver" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "On the way to you" },
  { key: "DELIVERED", label: "Delivered", desc: "Enjoy your meal!" },
];

// ─── Star Rating Picker ──────────────────────────────────────────────────────
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            id={`star-${star}`}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="text-4xl transition-transform duration-100 hover:scale-125 focus:outline-none"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <span
              className={`transition-colors duration-150 ${
                star <= active ? "text-amber-400" : "text-slate-200"
              }`}
            >
              ★
            </span>
          </button>
        ))}
      </div>
      <span
        className={`text-sm font-semibold transition-opacity duration-200 ${
          active > 0 ? "opacity-100 text-amber-700" : "opacity-0"
        }`}
      >
        {labels[active]}
      </span>
    </div>
  );
}

// ─── Static star display ─────────────────────────────────────────────────────
function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-2xl ${star <= rating ? "text-amber-400" : "text-slate-200"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ─── Rating Card (form) ──────────────────────────────────────────────────────
function RatingCard({
  orderNumber,
  onSubmitted,
}: {
  orderNumber: string;
  onSubmitted: (review: Review) => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderNumber}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || null }),
      });
      const data: unknown = await res.json();
      if (!res.ok) {
        const msg =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "Something went wrong. Please try again.";
        setError(msg);
      } else {
        onSubmitted(data as Review);
      }
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      id="rating-card"
      className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm animate-fade-in"
    >
      <div className="text-center mb-5">
        <span className="text-3xl">🛵</span>
        <h3 className="text-lg font-bold text-slate-900 mt-1">
          How was your delivery?
        </h3>
        <p className="text-sm text-slate-500 mt-0.5">
          Rate your experience — it helps us improve!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex justify-center">
          <StarPicker value={rating} onChange={setRating} />
        </div>

        <div>
          <label
            htmlFor="review-comment"
            className="block text-xs font-semibold text-slate-600 uppercase mb-1.5"
          >
            Comments <span className="text-slate-400 font-normal normal-case">(optional)</span>
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Tell us what you loved or what we can do better…"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none bg-white"
          />
          <p className="text-right text-[11px] text-slate-400 mt-0.5">
            {comment.length}/500
          </p>
        </div>

        {error && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          id="submit-rating-btn"
          type="submit"
          disabled={submitting || rating === 0}
          className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {submitting ? "Submitting…" : "Submit Rating"}
        </button>
      </form>
    </div>
  );
}

// ─── Already rated card ───────────────────────────────────────────────────────
function RatedCard({ review }: { review: Review }) {
  return (
    <div
      id="already-rated-card"
      className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 shadow-sm text-center space-y-3 animate-fade-in"
    >
      <span className="text-3xl">🎉</span>
      <h3 className="text-lg font-bold text-slate-900">
        Thanks for your feedback!
      </h3>
      <StarDisplay rating={review.rating} />
      {review.comment && (
        <p className="text-sm text-slate-600 italic">"{review.comment}"</p>
      )}
      <p className="text-xs text-slate-400">
        Submitted{" "}
        {new Date(review.createdAt).toLocaleString("en-GH", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function OrderTrackerClient({
  initialOrder,
}: {
  initialOrder: OrderData;
}) {
  const [order, setOrder] = useState<OrderData>(initialOrder);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchLatest = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${initialOrder.orderNumber}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setLastSync(new Date());
      }
    } catch (err) {
      console.error("Polling order failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [initialOrder.orderNumber]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLatest();
    }, 10000); // Poll every 10s

    return () => clearInterval(interval);
  }, [fetchLatest]);

  const currentStepIndex = STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "CANCELLED";
  const isDelivered = order.status === "DELIVERED";

  function handleReviewSubmitted(review: Review) {
    setOrder((prev) => ({ ...prev, review }));
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-white p-6 md:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/30 text-amber-100 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                Live Order Tracker
              </span>
              {isRefreshing && (
                <span className="text-[11px] text-amber-200 animate-pulse">
                  Syncing...
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold mt-1">
              Thank you, {order.customerName}!
            </h1>
            <p className="text-amber-100 text-sm mt-1">
              Order Ref: <strong className="font-mono">{order.orderNumber}</strong>
            </p>
          </div>
          <button
            onClick={fetchLatest}
            disabled={isRefreshing}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition"
          >
            {isRefreshing ? "Updating..." : "Refresh Status"}
          </button>
        </div>
      </div>

      {/* Progress Timeline */}
      {isCancelled ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center space-y-2">
          <span className="text-3xl">⚠️</span>
          <h2 className="text-xl font-bold text-rose-800">Order Cancelled</h2>
          <p className="text-sm text-rose-600">
            This order was cancelled. Please contact support if you have questions.
          </p>
        </div>
      ) : (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Live Status</h2>
            <span className="text-xs text-slate-500">
              Auto-updating • Updated {lastSync.toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 relative">
            {STEPS.map((step, idx) => {
              const isDone = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-xl border transition flex flex-col justify-between ${
                    isCurrent
                      ? "bg-amber-50 border-amber-400 ring-2 ring-amber-400/20"
                      : isDone
                      ? "bg-slate-50 border-slate-300"
                      : "bg-white border-slate-100 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isDone
                          ? "bg-amber-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isDone ? "✓" : idx + 1}
                    </span>
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    )}
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        isCurrent
                          ? "text-amber-900"
                          : isDone
                          ? "text-slate-900"
                          : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Delivery Rating ─────────────────────────────────────── */}
      {isDelivered && (
        <div>
          {order.review ? (
            <RatedCard review={order.review} />
          ) : (
            <RatingCard
              orderNumber={order.orderNumber}
              onSubmitted={handleReviewSubmitted}
            />
          )}
        </div>
      )}

      {/* Summary Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">
            Order Summary
          </h3>
          <div className="space-y-3">
            {order.items.map((i) => (
              <div key={i.id} className="flex justify-between items-center text-sm">
                <div className="text-slate-800 font-medium">
                  {i.quantity} × {i.name}
                </div>
                <div className="font-bold text-slate-900">
                  GH₵ {Number(i.totalPrice).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>GH₵ {Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee</span>
              <span>GH₵ {Number(order.deliveryFee).toFixed(2)}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-GH₵ {Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-base text-slate-900 pt-2 border-t border-slate-100">
              <span>Total</span>
              <span className="text-amber-700">
                GH₵ {Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Delivery Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">
            Delivery Details
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-xs text-slate-500 block uppercase font-semibold">
                Customer Phone
              </span>
              <span className="font-medium text-slate-900">
                {order.customerPhone}
              </span>
            </div>

            {order.delivery && (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 block uppercase font-semibold">
                    Address
                  </span>
                  {order.delivery.latitude && order.delivery.longitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${order.delivery.latitude},${order.delivery.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-emerald-700 font-bold hover:underline"
                    >
                      📍 View on Map
                    </a>
                  )}
                </div>
                <p className="text-slate-900 font-medium">
                  {order.delivery.address}, {order.delivery.city}
                  {order.delivery.region ? `, ${order.delivery.region}` : ""}
                </p>
              </div>
            )}

            <div>
              <span className="text-xs text-slate-500 block uppercase font-semibold">
                Order Placed
              </span>
              <span className="text-xs text-slate-700">
                {new Date(order.createdAt).toLocaleString("en-GH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              href="/menu"
              className="block w-full text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition"
            >
              Order More Items
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
