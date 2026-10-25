'use client';

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const MAX_CART_QUANTITY = 50;

export type CartExtra = {
  id: string;
  name: string;
  price: number;
};

export type CartLine = {
  lineId: string;
  id: string;
  name: string;
  basePrice: number;
  price: number; // Unit price including extras
  quantity: number;
  imageUrl?: string | null;
  selectedExtras?: CartExtra[];
};

export type AddToCartInput = {
  id: string;
  name: string;
  price: number;
  basePrice?: number;
  imageUrl?: string | null;
  selectedExtras?: CartExtra[];
  lineId?: string;
  quantity?: number;
};

type CartContextValue = {
  items: CartLine[];
  count: number;
  subtotal: number;
  add: (item: AddToCartInput, quantity?: number) => void;
  remove: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function buildLineId(id: string, extras?: CartExtra[]): string {
  if (!extras || extras.length === 0) return id;
  const extraSuffix = [...extras]
    .map((e) => e.id)
    .sort()
    .join("-");
  return `${id}__${extraSuffix}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("rd-cart");
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(
            parsed
              .filter((item): item is Partial<CartLine> => {
                if (!item || typeof item !== "object") return false;
                const candidate = item as Partial<CartLine>;
                return (
                  typeof candidate.id === "string" &&
                  typeof candidate.name === "string" &&
                  typeof candidate.price === "number" &&
                  Number.isFinite(candidate.price) &&
                  typeof candidate.quantity === "number" &&
                  Number.isInteger(candidate.quantity) &&
                  candidate.quantity > 0
                );
              })
              .map((item) => {
                const selectedExtras: CartExtra[] = Array.isArray(item.selectedExtras)
                  ? item.selectedExtras.filter(
                      (e): e is CartExtra =>
                        Boolean(e) &&
                        typeof e.id === "string" &&
                        typeof e.name === "string" &&
                        typeof e.price === "number"
                    )
                  : [];
                const lineId =
                  typeof item.lineId === "string" && item.lineId
                    ? item.lineId
                    : buildLineId(item.id!, selectedExtras);
                const basePrice =
                  typeof item.basePrice === "number" ? item.basePrice : item.price!;

                return {
                  lineId,
                  id: item.id!,
                  name: item.name!,
                  basePrice,
                  price: item.price!,
                  quantity: Math.min(item.quantity!, MAX_CART_QUANTITY),
                  imageUrl: item.imageUrl ?? null,
                  selectedExtras,
                };
              })
          );
        }
      }
    } catch {
      localStorage.removeItem("rd-cart");
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("rd-cart", JSON.stringify(items));
  }, [hydrated, items]);

  const value = useMemo(() => {
    return {
      items,
      count: items.reduce((n, x) => n + x.quantity, 0),
      subtotal: items.reduce((sum, x) => sum + x.price * x.quantity, 0),
      add: (input: AddToCartInput, explicitQty?: number) => {
        const extras = input.selectedExtras || [];
        const lineId = input.lineId || buildLineId(input.id, extras);
        const basePrice = input.basePrice !== undefined ? input.basePrice : input.price;
        const extrasTotal = extras.reduce((sum, e) => sum + e.price, 0);
        // If basePrice is supplied, total unit price is basePrice + extras.
        // If input.price was already the total (e.g. from modal), use it.
        const unitPrice =
          input.basePrice !== undefined ? basePrice + extrasTotal : input.price;
        const qtyToAdd = explicitQty ?? input.quantity ?? 1;

        setItems((currentItems) => {
          const index = currentItems.findIndex((x) => x.lineId === lineId);
          if (index >= 0) {
            return currentItems.map((x, idx) =>
              idx === index
                ? {
                    ...x,
                    quantity: Math.min(x.quantity + qtyToAdd, MAX_CART_QUANTITY),
                  }
                : x
            );
          }

          const newLine: CartLine = {
            lineId,
            id: input.id,
            name: input.name,
            basePrice,
            price: unitPrice,
            quantity: Math.min(qtyToAdd, MAX_CART_QUANTITY),
            imageUrl: input.imageUrl ?? null,
            selectedExtras: extras,
          };
          return [...currentItems, newLine];
        });
      },
      remove: (targetId: string) =>
        setItems((xs) => xs.filter((x) => x.lineId !== targetId && x.id !== targetId)),
      setQuantity: (targetId: string, quantity: number) =>
        setItems((xs) =>
          quantity < 1
            ? xs.filter((x) => x.lineId !== targetId && x.id !== targetId)
            : xs.map((x) =>
                x.lineId === targetId || x.id === targetId
                  ? {
                      ...x,
                      quantity: Math.min(Math.floor(quantity), MAX_CART_QUANTITY),
                    }
                  : x
              )
        ),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
