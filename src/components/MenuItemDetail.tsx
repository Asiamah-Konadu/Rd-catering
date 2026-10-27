'use client';

import Link from "next/link";
import { Plus, Minus, Check, Sparkles, Utensils } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useCart, type CartExtra } from "@/components/cart/CartProvider";
import type { PublicMenuItem, PublicExtra } from "@/lib/menu";

interface MenuItemDetailProps {
  item: PublicMenuItem;
  availableExtras?: PublicExtra[];
}

export default function MenuItemDetail({
  item,
  availableExtras: initialExtras,
}: MenuItemDetailProps) {
  const { add } = useCart();
  const [extras, setExtras] = useState<PublicExtra[]>(initialExtras || []);
  const [selectedExtraIds, setSelectedExtraIds] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (initialExtras && initialExtras.length > 0) {
      setExtras(initialExtras);
      return;
    }

    fetch("/api/extras")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: PublicExtra[]) => {
        if (Array.isArray(data)) {
          setExtras(data.filter((e) => e.isActive));
        }
      })
      .catch((err) => console.error("Error loading extras:", err));
  }, [initialExtras]);

  const toggleExtra = (id: string) => {
    setSelectedExtraIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedExtrasList: CartExtra[] = useMemo(() => {
    return extras
      .filter((e) => selectedExtraIds.has(e.id))
      .map((e) => ({ id: e.id, name: e.name, price: e.price }));
  }, [extras, selectedExtraIds]);

  const extrasSum = useMemo(() => {
    return selectedExtrasList.reduce((sum, e) => sum + e.price, 0);
  }, [selectedExtrasList]);

  const unitPrice = item.price + extrasSum;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    add({
      id: item.id,
      name: item.name,
      basePrice: item.price,
      price: unitPrice,
      imageUrl: item.imageUrl,
      selectedExtras: selectedExtrasList,
      quantity,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <main className="page narrow detail-page">
      <Link href="/menu" className="back-link">
        ← Back to menu
      </Link>
      <div className="detail-layout">
        <div className="food-placeholder detail-image">
          {item.imageUrl && !imageFailed ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span>
              <Utensils size={48} aria-hidden="true" />
            </span>
          )}
        </div>
        <div className="detail-copy">
          <span className="eyebrow">{item.category.name}</span>
          <h1>{item.name}</h1>
          <p>{item.description || "Prepared fresh by Rich-Dons Catering."}</p>
          <strong className="detail-price">GH₵ {item.price.toFixed(2)}</strong>
          <p className={item.isAvailable ? "availability available" : "availability"}>
            {item.isAvailable ? "Available today" : "Currently unavailable"}
          </p>

          {/* Quick actions for items without extras */}
          {(!item.isAvailable || extras.length === 0) && (
            <div className="detail-actions mt-5 flex flex-wrap items-center gap-3">
              <div className="qty-picker flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden h-12">
                <button
                  type="button"
                  className="px-3.5 h-full text-slate-600 hover:bg-slate-100 transition disabled:opacity-30 cursor-pointer"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || !item.isAvailable}
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className="px-3 font-bold text-slate-900 min-w-8 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="px-3.5 h-full text-slate-600 hover:bg-slate-100 transition disabled:opacity-30 cursor-pointer"
                  onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                  disabled={!item.isAvailable}
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>

              <button
                className={`button primary flex-1 h-12 flex items-center justify-center gap-2 font-black transition cursor-pointer ${
                  justAdded ? "bg-emerald-600 hover:bg-emerald-700" : ""
                }`}
                type="button"
                disabled={!item.isAvailable}
                onClick={handleAddToCart}
              >
                {justAdded ? (
                  <>
                    <Check size={18} /> Added to bag!
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Add to Bag</span>
                    <span className="opacity-90 font-extrabold ml-1">
                      • GH₵ {totalPrice.toFixed(2)}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ─── COMBO BUILDER SECTION (STRETCHED FULL WIDTH ACROSS DESKTOP) ─── */}
        {item.isAvailable && extras.length > 0 && (
          <div className="combo-builder-card col-span-full w-full mt-4 p-5 sm:p-7 rounded-3xl bg-linear-to-br from-amber-50/90 via-amber-50/50 to-orange-50/60 border-2 border-amber-200/90 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/70 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                  </div>
                  <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">
                    Make It a Combo
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Enhance your meal with freshly prepared proteins, sides, and extras:
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedExtrasList.length > 0 ? (
                  <span className="text-xs font-black text-amber-950 bg-amber-200/80 border border-amber-300 px-3 py-1 rounded-full shadow-xs">
                    {selectedExtrasList.length} addition{selectedExtrasList.length > 1 ? "s" : ""} selected (+GH₵ {extrasSum.toFixed(2)})
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-900 bg-amber-100/90 border border-amber-200/80 px-3 py-1 rounded-full">
                    Popular Additions
                  </span>
                )}
              </div>
            </div>

            {/* Extras Grid - Full space for all text to display without truncation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {extras.map((extra) => {
                const isChecked = selectedExtraIds.has(extra.id);
                return (
                  <button
                    key={extra.id}
                    type="button"
                    onClick={() => toggleExtra(extra.id)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer group ${
                      isChecked
                        ? "border-amber-500 bg-white shadow-sm ring-2 ring-amber-400/20"
                        : "border-slate-200/90 hover:border-amber-300 bg-white/80 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? "border-amber-600 bg-amber-600 text-white"
                            : "border-slate-300 bg-white group-hover:border-amber-400"
                        }`}
                      >
                        {isChecked && <Check size={13} strokeWidth={3} />}
                      </div>
                      <span className="text-sm font-bold text-slate-900 leading-snug break-words">
                        {extra.name}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-full shrink-0 transition-colors ${
                        isChecked
                          ? "bg-amber-600 text-white"
                          : "bg-amber-100/80 text-amber-900 group-hover:bg-amber-200"
                      }`}
                    >
                      +GH₵ {extra.price.toFixed(0)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions Bar inside the Combo Card */}
            <div className="pt-4 border-t border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Combo Total:
                </span>
                <span className="text-2xl font-black text-slate-950">
                  GH₵ {totalPrice.toFixed(2)}
                </span>
                {quantity > 1 && (
                  <span className="text-xs text-slate-500 font-semibold">
                    (GH₵ {unitPrice.toFixed(2)} each)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Quantity Picker */}
                <div className="qty-picker flex items-center border-2 border-slate-200 rounded-2xl bg-white overflow-hidden h-12 shadow-xs">
                  <button
                    type="button"
                    className="px-4 h-full text-slate-700 hover:bg-slate-100 transition disabled:opacity-30 cursor-pointer"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || !item.isAvailable}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="px-3 font-black text-slate-900 min-w-8 text-center text-sm">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="px-4 h-full text-slate-700 hover:bg-slate-100 transition disabled:opacity-30 cursor-pointer"
                    onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                    disabled={!item.isAvailable}
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                {/* Add Button */}
                <button
                  className={`button primary flex-1 sm:flex-initial sm:min-w-[220px] h-12 flex items-center justify-center gap-2 font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer ${
                    justAdded ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                  }`}
                  type="button"
                  disabled={!item.isAvailable}
                  onClick={handleAddToCart}
                >
                  {justAdded ? (
                    <>
                      <Check size={18} strokeWidth={2.5} /> Added to bag!
                    </>
                  ) : (
                    <>
                      <Plus size={18} strokeWidth={2.5} />
                      <span>
                        {selectedExtrasList.length > 0 ? "Add Combo to Bag" : "Add to Bag"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
