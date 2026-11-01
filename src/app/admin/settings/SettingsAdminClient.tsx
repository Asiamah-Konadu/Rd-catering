"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Truck, MessageCircle, Save, CheckCircle2, AlertCircle, RefreshCw, Zap } from "lucide-react";
import type { SiteSettingsData } from "@/lib/settings";
import { checkIsKitchenOpen, formatTime12Hour } from "@/lib/kitchen-hours";

interface Props {
  initialSettings: SiteSettingsData;
  userRole: string;
}

export function SettingsAdminClient({ initialSettings }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<SiteSettingsData>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const liveKitchenStatus = checkIsKitchenOpen(formData.openingTime || "08:00", formData.closingTime || "22:00");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      setStatusMessage({ type: "success", text: "Storefront and kitchen hours updated successfully!" });
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Storefront Content & Kitchen Hours
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Control the opening &amp; closing hours, ASAP checkout availability, delivery policies, and operational notices.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-red-50 text-red-900 border-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            
            {/* 1. Kitchen Hours & ASAP Delivery Control */}
            <div className="p-5 bg-gradient-to-br from-amber-50/80 to-stone-50 rounded-2xl border border-amber-200/80 space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <label className="block text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Kitchen Operating Hours (ASAP vs Scheduled)
                  </label>
                  <p className="text-xs text-slate-600 mt-1">
                    Outside these hours, customers cannot choose <strong>Deliver Today (ASAP)</strong> and can only place advance scheduled orders.
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 ${
                    liveKitchenStatus.isOpen
                      ? "bg-emerald-100 text-emerald-900 border-emerald-300 shadow-xs"
                      : "bg-rose-100 text-rose-900 border-rose-300 shadow-xs"
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      liveKitchenStatus.isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                    }`}
                  />
                  {liveKitchenStatus.isOpen ? "Kitchen OPEN Now" : "Kitchen CLOSED Now"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Opening Time (24h)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={formData.openingTime || "08:00"}
                      onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-bold bg-white shadow-xs"
                    />
                    <span className="text-xs text-slate-600 font-semibold whitespace-nowrap">
                      ({formatTime12Hour(formData.openingTime || "08:00")})
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Closing Time (24h)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={formData.closingTime || "22:00"}
                      onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-bold bg-white shadow-xs"
                    />
                    <span className="text-xs text-slate-600 font-semibold whitespace-nowrap">
                      ({formatTime12Hour(formData.closingTime || "22:00")})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-700 bg-white p-3 rounded-xl border border-amber-200/60 flex-wrap gap-2">
                <span>
                  Accra Time (GMT): <strong className="text-slate-900 font-bold">{liveKitchenStatus.currentAccraDisplay}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const openText = formatTime12Hour(formData.openingTime || "08:00").toLowerCase();
                    const closeText = formatTime12Hour(formData.closingTime || "22:00").toLowerCase();
                    setFormData({
                      ...formData,
                      businessHoursText: `Orders open ${openText} · close ${closeText}`,
                    });
                  }}
                  className="text-amber-800 hover:text-amber-900 font-bold hover:underline"
                >
                  ⚡ Auto-sync with Hero Text
                </button>
              </div>
            </div>

            {/* 2. Hero Business Hours Text */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Hero Business Hours Text
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Appears in the hero pill tag on the homepage next to the live status dot.
              </p>
              <input
                type="text"
                value={formData.businessHoursText}
                onChange={(e) => setFormData({ ...formData, businessHoursText: e.target.value })}
                required
                placeholder="e.g. Orders open 8am · close 10pm"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium"
              />
            </div>

            {/* 3. Delivery Fee Text */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-500" />
                Delivery Fee Headline
              </label>
              <p className="text-xs text-slate-500 mb-2">
                The primary delivery headline text in the &quot;Good to know&quot; homepage section.
              </p>
              <input
                type="text"
                value={formData.deliveryFeeText}
                onChange={(e) => setFormData({ ...formData, deliveryFeeText: e.target.value })}
                required
                placeholder="e.g. Standard delivery is GH₵ 20"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium"
              />
            </div>

            {/* 4. Delivery Note Text */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                Delivery Details & Corporate Note
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Additional operational note displayed directly alongside the delivery fee.
              </p>
              <textarea
                value={formData.deliveryNoteText}
                onChange={(e) => setFormData({ ...formData, deliveryNoteText: e.target.value })}
                rows={3}
                required
                placeholder="e.g. Registered office orders may qualify for free delivery and group discounts."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium resize-none"
              />
            </div>

            {/* 5. WhatsApp Phone */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                Storefront WhatsApp Contact Number
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Customer support / ordering WhatsApp line. Include international dialing code.
              </p>
              <input
                type="text"
                value={formData.whatsappPhone}
                onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value })}
                placeholder="e.g. +233248179348"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setFormData(initialSettings)}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-semibold transition"
              >
                Reset Changes
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-sm shadow-md transition disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Updating Storefront...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save & Update Storefront
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Storefront Preview */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Live Checkout & Homepage Preview
            </h3>

            {/* Live Kitchen Status Card */}
            <div className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Current Kitchen Status
              </span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100">
                  {liveKitchenStatus.isOpen ? "🟢 Accepting Orders" : "🔴 Closed (Pre-orders Only)"}
                </span>
                <span className="text-xs text-amber-300 font-mono">
                  {formatTime12Hour(formData.openingTime || "08:00")} – {formatTime12Hour(formData.closingTime || "22:00")}
                </span>
              </div>
              <div className="text-xs text-slate-300 pt-1 border-t border-slate-700 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  ASAP Delivery:{" "}
                  <strong className={liveKitchenStatus.isOpen ? "text-emerald-400" : "text-rose-400"}>
                    {liveKitchenStatus.isOpen ? "Enabled for customers" : "Locked / Disabled"}
                  </strong>
                </span>
              </div>
            </div>

            {/* Hero Open Note Preview */}
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                Hero Status Pill:
              </span>
              <div className="inline-flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-full text-xs text-slate-200">
                <span
                  className={`w-2 h-2 rounded-full ${
                    liveKitchenStatus.isOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                  }`}
                />
                <span className="font-medium">{formData.businessHoursText || "Orders open 8am · close 10pm"}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">Confirm and pay in WhatsApp</span>
              </div>
            </div>

            {/* Delivery Note Preview */}
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                Delivery Note Section:
              </span>
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5 text-xs">
                <span className="text-amber-400 font-bold text-[10px] uppercase tracking-wider block">
                  Good to know
                </span>
                <h4 className="font-bold text-sm text-slate-100">
                  Fresh food, delivered around Accra.
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {formData.deliveryFeeText || "Standard delivery is GH₵ 20"}.{" "}
                  {formData.deliveryNoteText || "Registered office orders may qualify for free delivery and group discounts."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 text-xs text-amber-900 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5 text-amber-950">
              💡 Immediate Checkout Enforcement
            </h4>
            <p>
              When the kitchen is outside the opening and closing hours, customers reaching checkout are automatically prevented from choosing <strong>&quot;Deliver Today (ASAP)&quot;</strong> and must choose a scheduled delivery slot for tomorrow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
