'use client';

import { Plus } from "lucide-react";
import { useCart } from "./cart/CartProvider";
import Link from "next/link";
import { useState } from "react";
import type { PublicMenuItem } from "@/lib/menu";

export default function MenuCard({ item }: { item: PublicMenuItem }) {
  const { add } = useCart();
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <article className="menu-card">
      <Link href={`/menu/${item.slug}`} className="food-placeholder" aria-label={`View ${item.name}`}>
        {item.imageUrl && !imageFailed ? <img src={item.imageUrl} alt="" onError={() => setImageFailed(true)} /> : item.name.slice(0, 1)}
      </Link>
      <div className="menu-card-body">
        <span className="eyebrow">{item.category.name}</span>
        <h3><Link href={`/menu/${item.slug}`}>{item.name}</Link></h3>
        <p>{item.description || "Prepared fresh by RD Catering."}</p>
        <div className="menu-card-footer">
          <strong>GH₵ {item.price.toFixed(2)}</strong>
          <button type="button" onClick={() => add({ id: item.id, name: item.name, price: item.price })}><Plus size={17}/> Add</button>
        </div>
      </div>
    </article>
  );
}
