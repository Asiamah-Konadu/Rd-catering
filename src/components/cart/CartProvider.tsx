'use client';

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const MAX_CART_QUANTITY = 50;
export type CartLine = { id: string; name: string; price: number; quantity: number };
type CartContextValue = {
  items: CartLine[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartLine, "quantity">) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rd-cart");
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((item): item is CartLine => {
            if (!item || typeof item !== "object") return false;
            const candidate = item as Partial<CartLine>;
            return typeof candidate.id === "string" && typeof candidate.name === "string" &&
              typeof candidate.price === "number" && Number.isFinite(candidate.price) &&
              typeof candidate.quantity === "number" && Number.isInteger(candidate.quantity) && candidate.quantity > 0;
          }).map(item => ({ ...item, quantity: Math.min(item.quantity, MAX_CART_QUANTITY) })));
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

  const value = useMemo(() => ({
    items,
    count: items.reduce((n, x) => n + x.quantity, 0),
    subtotal: items.reduce((n, x) => n + x.price * x.quantity, 0),
    add: (item: Omit<CartLine, "quantity">) => setItems(xs => {
      const found = xs.find(x => x.id === item.id);
      return found ? xs.map(x => x.id === item.id ? {...x, quantity: Math.min(x.quantity + 1, MAX_CART_QUANTITY)} : x) : [...xs, {...item, quantity: 1}];
    }),
    remove: (id: string) => setItems(xs => xs.filter(x => x.id !== id)),
    setQuantity: (id: string, quantity: number) => setItems(xs => quantity < 1 ? xs.filter(x => x.id !== id) : xs.map(x => x.id === id ? {...x, quantity: Math.min(Math.floor(quantity), MAX_CART_QUANTITY)} : x)),
    clear: () => setItems([])
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
