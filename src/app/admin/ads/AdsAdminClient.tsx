"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Monitor,
  Smartphone,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Info,
} from "lucide-react";
import {
  AD_SLOT_DEFINITIONS,
  type AdFormat,
  type AdSenseConfigData,
  type AdSlotKey,
} from "@/lib/ads";

interface Props {
  initialConfig: AdSenseConfigData;
}

export function AdsAdminClient({ initialConfig }: Props) {
  const router = useRouter();
  const [config, setConfig] = useState<AdSenseConfigData>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const activeSlotsCount = config.slots.filter(
    (s) => s.enabled && s.slotId.trim().length > 0
  ).length;

  const updateSlot = (
    key: AdSlotKey,
    patch: Partial<AdSenseConfigData["slots"][number]>
  ) => {
    setConfig((prev) => ({
      ...prev,
      slots: prev.slots.map((slot) =>
        slot.key === key ? { ...slot, ...patch } : slot
      ),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save AdSense settings");
      }

      if (data.config) {
        setConfig(data.config);
      }

      setStatusMessage({
        type: "success",
        text: "AdSense configuration and container toggles saved!",
      });
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-amber-600" />
            <span>AdSense &amp; Custom Ad Containers</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manual, UX-safe AdSense placements for Desktop and Mobile. Auto Ads
            are disabled so ads never disrupt ordering or checkout.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
              config.enabled
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                config.enabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            {config.enabled
              ? `Ads Active (${activeSlotsCount}/${config.slots.length} slots)`
              : "Ads Paused Sitewide"}
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Global AdSense Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Global AdSense Switch &amp; Publisher ID
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Turn off the master switch to hide all ad containers and skip
                loading the AdSense script.
              </p>
            </div>

            <label className="inline-flex items-center gap-3 cursor-pointer select-none">
              <span className="text-xs font-bold text-slate-700">
                {config.enabled ? "Master Switch: ON" : "Master Switch: OFF"}
              </span>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, enabled: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-600 relative transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Google AdSense Publisher ID
              </label>
              <input
                type="text"
                value={config.publisherId}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    publisherId: e.target.value,
                  }))
                }
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Found in AdSense → Account → Settings → Account information.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 space-y-1">
                <p className="font-bold">AdSense Policy &amp; UX Safeguards</p>
                <p className="text-amber-900/80 leading-relaxed">
                  Cart, Checkout, Payment, Corporate Order Portals, and Admin
                  pages are permanently excluded. All containers reserve space
                  to prevent layout shift (CLS) and display an &ldquo;Advertisement&rdquo;
                  label.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Per-Container Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Ad Placement Containers ({config.slots.length})
            </h2>
            <span className="text-xs text-slate-500">
              Containers stay completely hidden until enabled AND given a Slot ID.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AD_SLOT_DEFINITIONS.map((def) => {
              const slot = config.slots.find((s) => s.key === def.key) || {
                key: def.key,
                enabled: false,
                slotId: "",
                showOnDesktop: def.supportsDesktop,
                showOnMobile: def.supportsMobile,
                format: def.defaultFormat,
              };

              const isLive =
                config.enabled && slot.enabled && slot.slotId.trim().length > 0;

              return (
                <div
                  key={def.key}
                  className={`rounded-2xl border p-5 transition-all space-y-4 ${
                    slot.enabled
                      ? "bg-white border-amber-300 shadow-sm"
                      : "bg-slate-50/70 border-slate-200"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {def.page}
                        </span>
                        {isLive && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            Live
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900 mt-1.5">
                        {def.label}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {def.locationDescription}
                      </p>
                    </div>

                    <label className="inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={slot.enabled}
                        onChange={(e) =>
                          updateSlot(def.key, { enabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-300 rounded-full peer peer-checked:bg-amber-600 relative transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>

                  {/* UX & Size Recommendation */}
                  <div className="text-[11px] text-slate-500 bg-slate-100/80 rounded-xl p-2.5 space-y-1">
                    <div className="font-semibold text-slate-700">
                      {def.recommendedSize}
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{def.uxNote}</span>
                    </div>
                  </div>

                  {/* Slot ID + Format */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        AdSense Slot ID
                      </label>
                      <input
                        type="text"
                        value={slot.slotId}
                        onChange={(e) =>
                          updateSlot(def.key, { slotId: e.target.value })
                        }
                        placeholder="e.g. 1234567890"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Ad Format
                      </label>
                      <select
                        value={slot.format}
                        onChange={(e) =>
                          updateSlot(def.key, {
                            format: e.target.value as AdFormat,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="horizontal">Horizontal Banner</option>
                        <option value="rectangle">Rectangle (300×250)</option>
                        <option value="auto">Auto Responsive</option>
                        <option value="fluid">In-Feed Fluid</option>
                      </select>
                    </div>
                  </div>

                  {/* Device Visibility Toggles */}
                  <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Show on:
                    </span>

                    <button
                      type="button"
                      disabled={!def.supportsDesktop}
                      onClick={() =>
                        updateSlot(def.key, {
                          showOnDesktop: !slot.showOnDesktop,
                        })
                      }
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                        !def.supportsDesktop
                          ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200"
                          : slot.showOnDesktop
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Desktop</span>
                    </button>

                    <button
                      type="button"
                      disabled={!def.supportsMobile}
                      onClick={() =>
                        updateSlot(def.key, {
                          showOnMobile: !slot.showOnMobile,
                        })
                      }
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                        !def.supportsMobile
                          ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200"
                          : slot.showOnMobile
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sticky Save Footer */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save AdSense Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
