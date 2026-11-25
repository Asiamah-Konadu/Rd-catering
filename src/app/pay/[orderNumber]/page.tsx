"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type PaymentDetails = { status: string; amount?: string; checkoutUrl?: string; error?: string };

export default function PaymentPage() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = decodeURIComponent(params.orderNumber || "").toUpperCase();
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  const startCheckout = useCallback(async () => {
    setStarting(true);
    setError("");
    try {
      const response = await fetch("/api/payments/hubtel/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const result = await response.json() as PaymentDetails;
      if (!response.ok) throw new Error(result.error || "We couldn't start your secure checkout.");
      setPayment(result);
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "We couldn't start your secure checkout.");
    } finally {
      setStarting(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const refresh = async () => {
      try {
        const response = await fetch(`/api/payments/hubtel/checkout?orderNumber=${encodeURIComponent(orderNumber)}`, { cache: "no-store" });
        const result = await response.json() as PaymentDetails;
        if (!active) return;
        if (response.ok) {
          setPayment(result);
          setError("");
          if (result.status === "PAID" || result.status === "FAILED") return;
        } else {
          setError(result.error || "We couldn't load this payment.");
        }
      } catch {
        if (active) setError("Connection issue. Please refresh this page to try again.");
      }
      if (active) timer = setTimeout(refresh, 5000);
    };

    void startCheckout();
    void refresh();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [orderNumber, startCheckout]);

  return (
    <main className="menu-theme-dark min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">Rich-Dons Catering</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Secure payment</h1>
        <p className="mt-2 text-sm text-slate-700">Order {orderNumber}{payment?.amount ? ` · GHS ${payment.amount}` : ""}</p>
      </div>

      {payment?.status === "PAID" ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900" role="status">
          <h2 className="text-xl font-bold">Payment confirmed</h2>
          <p className="mt-2">Your order is paid. Thank you for ordering with Rich-Dons Catering.</p>
        </section>
      ) : payment?.status === "FAILED" ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900" role="status">
          <h2 className="text-xl font-bold">Payment wasn’t completed</h2>
          <p className="mt-2">You can try another payment attempt or contact Rich-Dons Catering for help.</p>
          <button type="button" onClick={() => void startCheckout()} disabled={starting} className="mt-4 rounded-xl bg-amber-600 px-4 py-2 font-semibold text-white disabled:opacity-60">{starting ? "Starting checkout..." : "Try payment again"}</button>
        </section>
      ) : payment?.checkoutUrl ? (
        <>
          <p className="mb-3 text-sm text-slate-600">Choose a payment method in the secure Hubtel checkout below. Keep this page open while your payment is being confirmed.</p>
          <iframe
            title="Hubtel secure payment checkout"
            src={payment.checkoutUrl}
            className="min-h-[680px] w-full rounded-2xl border border-slate-200 bg-white"
            allow="payment *"
          />
          <p className="mt-3 text-center text-sm text-slate-600">
            If the checkout doesn’t load, <a className="font-semibold text-amber-700 underline" href={payment.checkoutUrl} target="_blank" rel="noreferrer">open Hubtel checkout in a new tab</a>.
          </p>
        </>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700" role="status">
          <p>{error || "Loading your secure checkout…"}</p>
          {error && <button type="button" onClick={() => void startCheckout()} disabled={starting} className="mt-4 rounded-xl bg-amber-600 px-4 py-2 font-semibold text-white disabled:opacity-60">{starting ? "Starting checkout…" : "Try again"}</button>}
        </section>
      )}
      </div>
    </main>
  );
}
