'use client';

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

interface MobileFloatingCheckoutProps {
  type: 'cart' | 'checkout';
  total: number;
  itemCount?: number;
  loading?: boolean;
  onAction?: () => void;
  formId?: string;
  actionText?: string;
}

export default function MobileFloatingCheckout({
  type,
  total,
  itemCount = 0,
  loading = false,
  onAction,
  formId = "checkout-form",
  actionText,
}: MobileFloatingCheckoutProps) {
  const isCart = type === 'cart';

  const handleAction = () => {
    if (loading) return;
    if (onAction) {
      onAction();
      return;
    }
    if (formId) {
      const form = document.getElementById(formId) as HTMLFormElement | null;
      if (form) {
        if (form.requestSubmit) {
          form.requestSubmit();
        } else {
          form.submit();
        }
      }
    }
  };

  return (
    <div
      className="mobile-floating-checkout-wrapper fixed bottom-3 inset-x-3 z-40 md:hidden pointer-events-none"
      aria-label="Mobile Checkout Bar"
    >
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="mobile-liquid-checkout flex items-center justify-between p-2.5 sm:p-3 rounded-[26px] shadow-2xl">
          {/* Left summary info */}
          <div className="pl-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              {isCart ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'}` : "Total to Pay"}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-slate-900 font-mono tracking-tight">
                GH₵ {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Right action button (Liquid Gloss Pill) */}
          {isCart ? (
            <Link
              href="/checkout"
              className="mobile-liquid-action-btn flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-black shadow-lg transition"
            >
              <span>{actionText || "Proceed to Checkout"}</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAction}
              disabled={loading}
              className="mobile-liquid-action-btn flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white text-xs font-black shadow-lg transition"
            >
              {loading ? (
                <span>Preparing Order...</span>
              ) : (
                <>
                  <MessageCircle size={15} className="shrink-0" />
                  <span>{actionText || "Continue to WhatsApp"}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
