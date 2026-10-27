"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Truck, MessageCircle, Save, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import type { SiteSettingsData } from "@/lib/settings";

interface Props {
  initialSettings: SiteSettingsData;
  userRole: string;
}

export function SettingsAdminClient({ initialSettings, userRole }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<SiteSettingsData>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

      setStatusMessage({ type: "success", text: "Storefront settings updated successfully!" });
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
              Storefront Content & Notice Settings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Control the live customer-facing business hours, delivery policies, and operational notes shown on the homepage.
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
            {/* Business Hours */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Hero Business Hours Text
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Appears in the hero pill tag on the homepage next to the green status dot.
              </p>
              <input
                type="text"
                value={formData.businessHoursText}
                onChange={(e) => setFormData({ ...formData, businessHoursText: e.target.value })}
                required
                placeholder="e.g. Orders open 9am · close 10pm"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-medium"
              />
            </div>

            {/* Delivery Fee Text */}
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

            {/* Delivery Note Text */}
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

            {/* WhatsApp Phone */}
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
                placeholder="e.g. +233241234567"
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
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
              Live Homepage Preview
            </h3>

            {/* Hero Open Note Preview */}
            <div className="mb-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                Hero Status Pill:
              </span>
              <div className="inline-flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-full text-xs text-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium">{formData.businessHoursText || "Orders open 9am · close 10pm"}</span>
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
              💡 Storefront Control Tip
            </h4>
            <p>
              Changes made here take effect immediately on the homepage without needing a deployment or server restart.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
