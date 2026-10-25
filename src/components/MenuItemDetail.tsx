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
    <main className="page narrow">
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

          {/* ─── COMBO BUILDER SECTION ─────────────────────────────────── */}
          {item.isAvailable && extras.length > 0 && (
            <div className="combo-builder-card mt-6 p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Make It a Combo
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
                  Popular Additions
                </span>
              </div>
              <p className="text-xs text-slate-700">
                Enhance your meal with freshly prepared proteins, sides, and extras:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {extras.map((extra) => {
                  const isChecked = selectedExtraIds.has(extra.id);
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra.id)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                        isChecked
                          ? "border-amber-500 bg-white shadow-xs font-semibold"
                          : "border-slate-200 hover:border-slate-300 bg-white/70"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isChecked
                              ? "border-amber-600 bg-amber-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </div>
                        <span className="text-xs text-slate-900 truncate">
                          {extra.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-900 shrink-0">
                        +GH₵ {extra.price.toFixed(0)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── QUANTITY & ADD TO BAG ─────────────────────────────────── */}
          <div className="detail-actions mt-5 flex flex-wrap items-center gap-3">
            <div className="qty-picker flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden h-12">
              <button
                type="button"
                className="px-3.5 h-full text-slate-600 hover:bg-slate-100 transition disabled:opacity-30"
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
                className="px-3.5 h-full text-slate-600 hover:bg-slate-100 transition disabled:opacity-30"
                onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                disabled={!item.isAvailable}
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>

            <button
              className={`button primary flex-1 h-12 flex items-center justify-center gap-2 font-black transition ${
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
                  <span>
                    {selectedExtrasList.length > 0 ? "Add Combo to Bag" : "Add to Bag"}
                  </span>
                  <span className="opacity-90 font-extrabold ml-1">
                    • GH₵ {totalPrice.toFixed(2)}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
