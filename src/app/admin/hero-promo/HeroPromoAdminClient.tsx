"use client";

import { useState } from "react";
import {
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  CalendarHeart,
  TreePine,
  Egg,
  Flag,
  Flame,
  ExternalLink,
  Layers,
} from "lucide-react";

export type HeroPromoData = {
  id?: string;
  title: string;
  subtitle: string;
  badgeText: string;
  imageUrl: string;
  description?: string | null;
  price?: number | null;
  linkUrl?: string | null;
  isActive: boolean;
};

export type MenuItemOption = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
};

interface HeroPromoAdminClientProps {
  initialPromo: HeroPromoData | null;
  menuItems: MenuItemOption[];
}

const PRESETS = [
  {
    name: "Valentine's Day",
    icon: CalendarHeart,
    themeColor: "from-rose-500 to-red-600",
    data: {
      title: "Valentine's Sweetheart Combo",
      subtitle: "Valentine's Special",
      badgeText: "VALENTINE / GH",
      description: "Treat your special someone to rich smoky Jollof, charcoal grilled chicken, golden kelewele, and salad.",
      linkUrl: "/menu",
    },
  },
  {
    name: "Christmas & New Year",
    icon: TreePine,
    themeColor: "from-emerald-600 to-green-700",
    data: {
      title: "Christmas Yuletide Feast Combo",
      subtitle: "Holiday Special",
      badgeText: "CHRISTMAS / GH",
      description: "Celebrate the holidays with our grand family feast pack made fresh with rich Ghanaian heart.",
      linkUrl: "/menu",
    },
  },
  {
    name: "Easter Celebration",
    icon: Egg,
    themeColor: "from-amber-500 to-yellow-600",
    data: {
      title: "Easter Sunday Family Combo",
      subtitle: "Easter Special",
      badgeText: "EASTER / GH",
      description: "Freshly prepared holiday spread for joyful family gatherings this Easter season.",
      linkUrl: "/menu",
    },
  },
  {
    name: "Independence Day (6th March)",
    icon: Flag,
    themeColor: "from-red-600 to-amber-600",
    data: {
      title: "Ghana Heritage Combo",
      subtitle: "Independence Special",
      badgeText: "06 MAR / GH",
      description: "Authentic Ghanaian culinary excellence celebrating our rich heritage.",
      linkUrl: "/menu",
    },
  },
  {
    name: "Weekend Super Combo",
    icon: Flame,
    themeColor: "from-orange-500 to-rose-600",
    data: {
      title: "Rich-Dons Weekend Feast",
      subtitle: "Weekend Special",
      badgeText: "WEEKEND / GH",
      description: "Kick back and enjoy the weekend with our crowd-favourite loaded meal combo.",
      linkUrl: "/menu",
    },
  },
];

export function HeroPromoAdminClient({
  initialPromo,
  menuItems,
}: HeroPromoAdminClientProps) {
  const [formData, setFormData] = useState<HeroPromoData>(
    initialPromo || {
      title: "Valentine's Sweetheart Combo",
      subtitle: "Valentine's Special",
      badgeText: "VALENTINE / GH",
      imageUrl: menuItems[0]?.imageUrl || "/coming-soon/jolof.avif",
      description: "Special holiday combo with loaded extras.",
      price: 95,
      linkUrl: "/menu",
      isActive: false,
    }
  );

  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Quick toggle active state
  async function handleToggleStatus() {
    setToggling(true);
    setStatusMessage(null);
    try {
      const nextState = !formData.isActive;
      // If no promo has been saved to DB yet, save the full form first
      if (!initialPromo?.id) {
        await handleSave({ ...formData, isActive: nextState });
        return;
      }

      const res = await fetch("/api/admin/hero-promo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setFormData((prev) => ({ ...prev, isActive: nextState }));
      setStatusMessage({
        type: "success",
        text: nextState
          ? "Advertising is now ACTIVE on the homepage!"
          : "Advertising is now OFF. Homepage returned to default photo.",
      });
    } catch (err: unknown) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to toggle status",
      });
    } finally {
      setToggling(false);
    }
  }

  // Save or update promo
  async function handleSave(dataToSave = formData) {
    setSaving(true);
    setStatusMessage(null);
    try {
      if (!dataToSave.title.trim()) {
        throw new Error("Please enter a title for the combo special.");
      }
      if (!dataToSave.imageUrl.trim()) {
        throw new Error("Please provide an image URL for the advertisement.");
      }

      const res = await fetch("/api/admin/hero-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save");

      setFormData(result.promo);
      setStatusMessage({
        type: "success",
        text: "Combo special advertisement saved successfully!",
      });
    } catch (err: unknown) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save advertisement",
      });
    } finally {
      setSaving(false);
    }
  }

  // Apply a holiday preset
  function applyPreset(preset: typeof PRESETS[0]) {
    setFormData((prev) => ({
      ...prev,
      title: preset.data.title,
      subtitle: preset.data.subtitle,
      badgeText: preset.data.badgeText,
      description: preset.data.description,
      linkUrl: preset.data.linkUrl,
    }));
    setStatusMessage({
      type: "success",
      text: `Applied "${preset.name}" preset! Adjust details as desired and save.`,
    });
  }

  return (
    <div className="space-y-8">
      {/* Status Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Master Activation Banner */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          formData.isActive
            ? "bg-gradient-to-r from-rose-900 via-red-900 to-amber-950 text-white border-rose-700 shadow-xl"
            : "bg-slate-50 border-slate-200 text-slate-800"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  formData.isActive
                    ? "bg-rose-500/30 text-rose-200 border border-rose-400/40"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    formData.isActive ? "bg-rose-400 animate-ping" : "bg-slate-400"
                  }`}
                />
                {formData.isActive ? "Advertising Active" : "Advertising Inactive"}
              </span>
              <span className="text-xs opacity-75">
                • Controls the homepage hero image
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold">
              {formData.isActive
                ? "Active: Showing Combo Special on Homepage"
                : "Inactive: Showing Original Kitchen Photo"}
            </h2>
            <p className="text-sm opacity-80 max-w-2xl">
              {formData.isActive
                ? `The homepage hero section is currently showcasing: "${formData.title}". Visitors see your holiday combo special immediately upon arrival.`
                : "No active advertisement. The homepage hero photo displays the default Ghanaian Jollof rice photo (/coming-soon/jolof.avif)."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={toggling}
            className={`inline-flex items-center gap-3 px-6 py-3.5 rounded-xl font-bold text-base transition-all shrink-0 cursor-pointer shadow-md ${
              formData.isActive
                ? "bg-white text-rose-900 hover:bg-rose-50"
                : "bg-rose-600 text-white hover:bg-rose-700"
            }`}
          >
            {formData.isActive ? (
              <>
                <ToggleRight size={24} className="text-rose-600" />
                <span>Turn OFF Advertising</span>
              </>
            ) : (
              <>
                <ToggleLeft size={24} className="text-white/80" />
                <span>Turn ON Advertising</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Holiday Themes */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
          <Sparkles size={20} className="text-amber-500" />
          <h3>One-Click Holiday Presets</h3>
        </div>
        <p className="text-sm text-slate-500">
          Click any holiday button below to instantly populate festive titles, subtitles, and badges:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 transition-all text-left group cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${preset.themeColor} flex items-center justify-center text-white shrink-0 shadow-sm`}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs text-slate-900 group-hover:text-rose-600 truncate">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {preset.data.badgeText}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuration Grid & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Editor (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Layers size={18} className="text-slate-600" />
            Advertisement Details
          </h3>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Combo Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Valentine's Sweetheart Combo"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 font-medium"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Primary large text displayed on the hero photo.
              </span>
            </div>

            {/* Subtitle & Badge in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Subtitle / Kicker
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  placeholder="e.g., Valentine's Special"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Badge / Corner Index
                </label>
                <input
                  type="text"
                  value={formData.badgeText}
                  onChange={(e) =>
                    setFormData({ ...formData, badgeText: e.target.value })
                  }
                  placeholder="e.g., VALENTINE / GH"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 text-sm"
                />
              </div>
            </div>

            {/* Image URL with quick picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Combo Image URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://... or /coming-soon/jolof.avif"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 text-sm font-mono"
              />

              {/* Quick Select from existing menu item images */}
              {menuItems.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs font-semibold text-slate-500 block mb-2">
                    Or select an image from your menu catalog:
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {menuItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            imageUrl: item.imageUrl,
                            price: formData.price || item.price,
                          })
                        }
                        className={`flex items-center gap-2 p-1.5 rounded-lg border shrink-0 text-left transition-all cursor-pointer ${
                          formData.imageUrl === item.imageUrl
                            ? "border-rose-500 bg-rose-50 ring-1 ring-rose-500"
                            : "border-slate-200 hover:border-slate-300 bg-slate-50"
                        }`}
                      >
                        <div className="w-9 h-9 rounded overflow-hidden relative shrink-0 bg-slate-200">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span className="text-xs font-medium text-slate-800 max-w-[100px] truncate">
                          {item.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price & Destination Link in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Price (GH₵, optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: e.target.value === "" ? null : parseFloat(e.target.value),
                    })
                  }
                  placeholder="e.g., 95.00"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Destination Link
                </label>
                <input
                  type="text"
                  value={formData.linkUrl ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, linkUrl: e.target.value })
                  }
                  placeholder="e.g., /menu or /menu/jollof-rice"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 text-sm font-mono"
                />
              </div>
            </div>

            {/* Campaign Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Description / Internal Campaign Notes
              </label>
              <textarea
                rows={2}
                value={formData.description ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Internal notes about dates, target customers, bundle details..."
                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-sm text-sm"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Advertisement"}
            </button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              <span>View Live Homepage</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Live Preview Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Eye size={16} className="text-slate-500" />
              Live Homepage Preview
            </h3>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                formData.isActive
                  ? "bg-rose-100 text-rose-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {formData.isActive ? "Will Show on Site" : "Currently Hidden"}
            </span>
          </div>

          {/* Hero Photo Simulated Component */}
          <div className="relative aspect-[4/5] sm:aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-slate-300 bg-slate-900 group">
            {formData.isActive ? (
              // Advertised Combo Photo
              <>
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt={formData.title}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                    No image specified
                  </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                {/* Corner Badge */}
                <div className="absolute top-5 right-5 z-10 px-3 py-1 rounded-full bg-rose-600/90 text-white font-black text-[11px] tracking-wider border border-white/30 shadow-lg">
                  {formData.badgeText || "SPECIAL / GH"}
                </div>

                {/* Bottom Label */}
                <div className="absolute bottom-6 left-6 right-6 z-10 text-white space-y-1">
                  <span className="text-amber-300 text-xs font-extrabold uppercase tracking-widest block">
                    {formData.subtitle || "From our kitchen"}
                  </span>
                  <strong className="font-serif text-2xl md:text-3xl font-normal leading-tight block drop-shadow-md">
                    {formData.title || "Combo Special"}
                  </strong>
                  {formData.price !== null && formData.price !== undefined && (
                    <div className="pt-1 flex items-center gap-2">
                      <span className="inline-block bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-black text-amber-200 border border-white/20">
                        GH₵ {formData.price.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-white/70">
                        Tap to order combo
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Default Fallback Photo
              <>
                <img
                  src="/coming-soon/jolof.avif"
                  alt="Default Kitchen Jollof"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Default Corner Index */}
                <div className="absolute top-5 right-5 z-10 text-white font-extrabold text-xs tracking-wider">
                  01 / GH
                </div>

                {/* Default Bottom Label */}
                <div className="absolute bottom-6 left-6 right-6 z-10 text-white space-y-1">
                  <span className="text-amber-200 text-xs font-extrabold uppercase tracking-widest block">
                    From our kitchen
                  </span>
                  <strong className="font-serif text-2xl md:text-3xl font-normal leading-tight block">
                    Ghanaian Jollof rice
                  </strong>
                </div>

                {/* Fallback Notice Overlay */}
                <div className="absolute top-4 left-4 z-20 bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-semibold px-2.5 py-1 rounded-md border border-white/20">
                  Default View (Ad Inactive)
                </div>
              </>
            )}
          </div>

          <p className="text-xs text-slate-500 text-center">
            {formData.isActive
              ? "Live hero photo is currently showing this combo special."
              : "When advertising is toggled OFF, visitors see the default kitchen jollof photo."}
          </p>
        </div>
      </div>
    </div>
  );
}
