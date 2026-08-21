'use client';

import { Plus } from "lucide-react";
import { useCart } from "./cart/CartProvider";
import type { MenuItem } from "@/lib/catalog";

export default function MenuCard({ item }: { item: MenuItem }) {
  const { add } = useCart();
  return (
    <article className="menu-card">
      <div className="food-placeholder">{item.name.slice(0,1)}</div>
      <div className="menu-card-body">
        <span className="eyebrow">{item.category}</span>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="menu-card-footer">
          <strong>GH₵ {item.price.toFixed(2)}</strong>
          <button onClick={() => add({ id: item.id, name: item.name, price: item.price })}><Plus size={17}/> Add</button>
        </div>
      </div>
    </article>
  );
}
