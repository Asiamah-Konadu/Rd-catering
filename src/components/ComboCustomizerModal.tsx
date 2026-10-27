'use client';

import { useEffect, useState, useMemo } from "react";
import { X, Sparkles, Check, Plus, Minus, Utensils } from "lucide-react";
import { useCart, type CartExtra } from "@/components/cart/CartProvider";
import type { PublicMenuItem, PublicExtra } from "@/lib/menu";

interface ComboCustomizerModalProps {
  item: PublicMenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  availableExtras?: PublicExtra[];
}

export function ComboCustomizerModal({
  item,
  isOpen,
  onClose,
  availableExtras: initialExtras,
}: ComboCustomizerModalProps) {
  const { add } = useCart();
  const [extras, setExtras] = useState<PublicExtra[]>(initialExtras || []);
  const [selectedExtraIds, setSelectedExtraIds] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  // Fetch extras if not provided via props
  useEffect(() => {
    if (initialExtras && initialExtras.length > 0) {
      setExtras(initialExtras);
      return;
    }

    let isMounted = true;
    fetch("/api/extras")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: PublicExtra[]) => {
        if (isMounted && Array.isArray(data)) {
          setExtras(data.filter((e) => e.isActive));
        }
      })
      .catch((err) => console.error("Error fetching combo extras:", err));

    return () => {
      isMounted = false;
    };
  }, [initialExtras]);

  // Reset selection when a new item is opened
  useEffect(() => {
    if (isOpen) {
      setSelectedExtraIds(new Set());
      setQuantity(1);
      setAddedAnimation(false);
      setImageFailed(false);
    }
  }, [isOpen, item]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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

  if (!isOpen || !item) return null;

  const basePrice = item.price;
  const comboUnitPrice = basePrice + extrasSum;
  const comboTotalPrice = comboUnitPrice * quantity;

  const handleAddCombo = () => {
    add({
      id: item.id,
      name: item.name,
      basePrice,
      price: comboUnitPrice,
      imageUrl: item.imageUrl,
      selectedExtras: selectedExtrasList,
      quantity,
    });

    setAddedAnimation(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleQuickAddPlain = () => {
    add({
      id: item.id,
      name: item.name,
      basePrice,
      price: basePrice,
      imageUrl: item.imageUrl,
      selectedExtras: [],
      quantity: 1,
    });
    setAddedAnimation(true);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="combo-modal-title"
    >
      <div
        className="bg-white rounded-3xl max-w-lg md:max-w-2xl lg:max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-amber-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Dish Banner */}
        <div className="relative bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white p-5 sm:p-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
            aria-label="Close customizer"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
              {item.imageUrl && !imageFailed ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <Utensils className="w-8 h-8 text-amber-200" />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-200 bg-black/15 px-2.5 py-0.5 rounded-full">
                {item.category.name}
              </span>
              <h2
                id="combo-modal-title"
                className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1"
              >
                {item.name}
              </h2>
              <p className="text-amber-100 text-xs sm:text-sm mt-1 leading-relaxed">
                {item.description || "Prepared fresh by Rich-Dons Catering."}
              </p>
              <div className="mt-2 text-white font-black text-base">
                Base price: GH₵ {basePrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content: Extras List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Make It a Combo
              </h3>
            </div>
            <span className="text-xs text-slate-700 font-medium">
              Optional additions
            </span>
          </div>

          <p className="text-xs text-slate-700">
            Pick your favorite proteins, sides, or salads to complete your meal:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {extras.map((extra) => {
              const isSelected = selectedExtraIds.has(extra.id);
              return (
                <button
                  key={extra.id}
                  type="button"
                  onClick={() => toggleExtra(extra.id)}
                  className={`w-full p-3 sm:p-3.5 rounded-2xl border-2 text-left transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/80 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition ${
                        isSelected
                          ? "border-amber-600 bg-amber-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </div>
                    <span className="font-bold text-slate-900 text-sm">
                      {extra.name}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-full ${
                      isSelected
                        ? "bg-amber-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    +GH₵ {extra.price.toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>

          {extras.length === 0 && (
            <p className="text-xs text-slate-700 text-center py-4">
              Loading fresh combo extras...
            </p>
          )}

          {/* Quantity Selector */}
          <div className="pt-2 flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <span className="text-xs font-bold text-slate-700">
              Quantity of this meal combo:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition disabled:opacity-40"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-black text-slate-900 text-sm">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                className="w-8 h-8 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 space-y-2.5">
          <button
            type="button"
            onClick={handleAddCombo}
            disabled={addedAnimation}
            className={`w-full py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition ${
              addedAnimation
                ? "bg-emerald-600 text-white"
                : "bg-amber-500 hover:bg-amber-600 text-slate-950 active:scale-[0.99]"
            }`}
          >
            {addedAnimation ? (
              <>
                <Check size={18} /> Added to your bag!
              </>
            ) : (
              <>
                <span>
                  {selectedExtrasList.length > 0
                    ? `Add Combo to Bag`
                    : `Add Meal to Bag`}
                </span>
                <span className="font-extrabold opacity-90">
                  • GH₵ {comboTotalPrice.toFixed(2)}
                </span>
              </>
            )}
          </button>

          {selectedExtrasList.length > 0 && (
            <button
              type="button"
              onClick={handleQuickAddPlain}
              className="w-full text-center text-xs text-slate-700 hover:text-slate-900 font-semibold py-1 transition"
            >
              Skip extras & add plain dish only (GH₵ {basePrice.toFixed(2)})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
