'use client';

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CartLine = { id: string; name: string; price: number; quantity: number };
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
  useEffect(() => {
    const saved = localStorage.getItem("rd-cart");
    if (saved) setItems(JSON.parse(saved));
  }, []);
  useEffect(() => localStorage.setItem("rd-cart", JSON.stringify(items)), [items]);

  const value = useMemo(() => ({
    items,
    count: items.reduce((n, x) => n + x.quantity, 0),
    subtotal: items.reduce((n, x) => n + x.price * x.quantity, 0),
    add: (item: Omit<CartLine, "quantity">) => setItems(xs => {
      const found = xs.find(x => x.id === item.id);
      return found ? xs.map(x => x.id === item.id ? {...x, quantity: x.quantity + 1} : x) : [...xs, {...item, quantity: 1}];
    }),
    remove: (id: string) => setItems(xs => xs.filter(x => x.id !== id)),
    setQuantity: (id: string, quantity: number) => setItems(xs => quantity < 1 ? xs.filter(x => x.id !== id) : xs.map(x => x.id === id ? {...x, quantity} : x)),
    clear: () => setItems([])
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
