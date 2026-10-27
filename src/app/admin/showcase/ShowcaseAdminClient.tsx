"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  Flame,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Utensils,
} from "lucide-react";
import type { ShowcaseConfig, ShowcaseDishItem } from "@/lib/showcase";

interface MenuItemOption {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  imageUrl: string;
  price: number;
}

interface Props {
  initialConfig: ShowcaseConfig;
  menuItems: MenuItemOption[];
}

export function ShowcaseAdminClient({ initialConfig, menuItems }: Props) {
  const [config, setConfig] = useState<ShowcaseConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string>("");

  const handleTextChange = (field: keyof Omit<ShowcaseConfig, "items">, val: string) => {
    setConfig((prev) => ({ ...prev, [field]: val }));
  };

  const handleDishChange = (index: number, field: keyof ShowcaseDishItem, val: any) => {
    setConfig((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: val };
      return { ...prev, items };
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= config.items.length) return;

    setConfig((prev) => {
      const items = [...prev.items];
      const temp = items[index];
      items[index] = items[target];
      items[target] = temp;
      return { ...prev, items };
    });
  };

  const handleRemove = (index: number) => {
    if (config.items.length <= 1) {
      alert("You need at least 1 dish in the showcase.");
      return;
    }
    setConfig((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleAddFromMenu = () => {
    if (!selectedMenuItemId) return;
    const found = menuItems.find((m) => m.id === selectedMenuItemId);
    if (!found) return;

    const newItem: ShowcaseDishItem = {
      id: `sc-${Date.now()}`,
      name: found.name,
      slug: found.slug,
      tagline: found.description || "Freshly cooked Ghanaian classic",
      description: found.description || "Prepared fresh to order in our Accra kitchen.",
      category: found.category || "Kitchen Special",
      origin: "Accra Kitchen",
      price: found.price,
      imageUrl: found.imageUrl || "/coming-soon/jolof.avif",
      flavorNotes: ["Slow-Simmered", "Authentic"],
      badge: "Featured",
      isActive: true,
    };

    setConfig((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    setSelectedMenuItemId("");
    setFeedback({ type: "success", message: `Added "${found.name}" to showcase!` });
  };

  const handleAddCustom = () => {
    const newItem: ShowcaseDishItem = {
      id: `sc-${Date.now()}`,
      name: "New Signature Dish",
      slug: "new-dish",
      tagline: "Fire-Roasted Spices & Fresh Herbs",
      description: "Slow-simmered Ghanaian specialty cooked fresh to order.",
      category: "Specialty",
      origin: "Accra Kitchen",
      price: 65,
      imageUrl: "/coming-soon/jolof.avif",
      flavorNotes: ["Rich Spices", "Fresh"],
      badge: "Signature",
      isActive: true,
    };

    setConfig((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/showcase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save showcase configuration.");
      }

      setFeedback({ type: "success", message: "Showcase section saved successfully! Check homepage to view." });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Something went wrong saving." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-sm border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          }`}
        >
          <span className="font-semibold text-sm">{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs uppercase font-bold opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Showcase Overview</h2>
            <p className="text-xs text-slate-500">
              {config.items.filter((i) => i.isActive).length} active dishes in 3D carousel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#today-menu"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <span>Live Storefront Preview</span>
            <ExternalLink size={14} />
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 disabled:opacity-60 transition"
          >
            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{isSaving ? "Saving..." : "Save Showcase"}</span>
          </button>
        </div>
      </div>

      {/* Section Typography & Headings */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
          <Utensils size={18} className="text-amber-600" />
          <span>Section Headings & Banner</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Eyebrow / Kicker Badge
            </label>
            <input
              type="text"
              value={config.kicker}
              onChange={(e) => handleTextChange("kicker", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. Accra Kitchen Showcase · Handcrafted Favourites"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Main Section Title
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => handleTextChange("title", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. What sounds good?"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Section Subtitle / Narrative
            </label>
            <textarea
              rows={2}
              value={config.subtitle}
              onChange={(e) => handleTextChange("subtitle", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Tell the story of fire-roasted spices, slow cooking, and culinary pride..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              CTA Button Label
            </label>
            <input
              type="text"
              value={config.ctaText}
              onChange={(e) => handleTextChange("ctaText", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              CTA Link URL
            </label>
            <input
              type="text"
              value={config.ctaUrl}
              onChange={(e) => handleTextChange("ctaUrl", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Add New Dishes Card */}
      <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-amber-950 text-sm">Add Dishes to Showcase</h4>
          <p className="text-xs text-amber-800">
            Pick from your active kitchen menu or add a custom signature exhibition plate.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedMenuItemId}
            onChange={(e) => setSelectedMenuItemId(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-amber-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">-- Pick from Menu Catalog --</option>
            {menuItems.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.category}) - GH₵ {m.price.toFixed(2)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleAddFromMenu}
            disabled={!selectedMenuItemId}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-40 transition"
          >
            <Plus size={14} />
            <span>Add Selected</span>
          </button>

          <button
            type="button"
            onClick={handleAddCustom}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 transition"
          >
            <Plus size={14} />
            <span>Add Custom Item</span>
          </button>
        </div>
      </div>

      {/* Showcase Dishes List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg">
            Showcase Dishes ({config.items.length})
          </h3>
          <span className="text-xs text-slate-500">
            Drag/order dishes using the arrow buttons. Click save when done.
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {config.items.map((dish, index) => (
            <div
              key={dish.id}
              className={`p-5 rounded-2xl border transition bg-white shadow-sm flex flex-col md:flex-row gap-5 items-start ${
                dish.isActive ? "border-slate-200" : "border-slate-200 opacity-60 bg-slate-50"
              }`}
            >
              {/* Order Controls & Thumbnail */}
              <div className="flex md:flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMove(index, "up")}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                  aria-label="Move dish up"
                >
                  <ArrowUp size={15} />
                </button>
                <span className="font-mono font-bold text-xs text-slate-500">
                  0{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleMove(index, "down")}
                  disabled={index === config.items.length - 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                  aria-label="Move dish down"
                >
                  <ArrowDown size={15} />
                </button>

                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 mt-1">
                  {dish.imageUrl ? (
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Utensils size={20} />
                    </div>
                  )}
                </div>
              </div>

              {/* Dish Fields */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">
                    Dish Name
                  </label>
                  <input
                    type="text"
                    value={dish.name}
                    onChange={(e) => handleDishChange(index, "name", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">
                    Badge / Tag
                  </label>
                  <input
                    type="text"
                    value={dish.badge}
                    onChange={(e) => handleDishChange(index, "badge", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm focus:ring-1 focus:ring-amber-500"
                    placeholder="e.g. Signature Classic"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">
                    Price (GH₵)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={dish.price}
                    onChange={(e) => handleDishChange(index, "price", parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={dish.tagline}
                    onChange={(e) => handleDishChange(index, "tagline", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={dish.category}
                    onChange={(e) => handleDishChange(index, "category", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={dish.imageUrl}
                    onChange={(e) => handleDishChange(index, "imageUrl", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">
                    Dish Link Slug
                  </label>
                  <input
                    type="text"
                    value={dish.slug}
                    onChange={(e) => handleDishChange(index, "slug", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono focus:ring-1 focus:ring-amber-500"
                    placeholder="e.g. jollof-rice"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">
                    Culinary Description
                  </label>
                  <textarea
                    rows={2}
                    value={dish.description}
                    onChange={(e) => handleDishChange(index, "description", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Status & Delete */}
              <div className="flex md:flex-col items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleDishChange(index, "isActive", !dish.isActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    dish.isActive
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                >
                  {dish.isActive ? "Active" : "Hidden"}
                </button>

                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                  aria-label="Remove dish from showcase"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
        <span className="text-sm text-slate-500">
          Remember to save your changes when finished editing.
        </span>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 disabled:opacity-60 transition"
        >
          {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{isSaving ? "Saving..." : "Save Showcase Changes"}</span>
        </button>
      </div>
    </div>
  );
}
