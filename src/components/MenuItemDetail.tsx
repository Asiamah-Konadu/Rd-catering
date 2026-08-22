'use client';

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import type { PublicMenuItem } from "@/lib/menu";

export default function MenuItemDetail({ item }: { item: PublicMenuItem }) {
  const { add } = useCart();
  const [imageFailed, setImageFailed] = useState(false);

  return <main className="page narrow">
    <Link href="/menu" className="back-link">Back to menu</Link>
    <div className="detail-layout">
      <div className="food-placeholder detail-image">
        {item.imageUrl && !imageFailed ? <img src={item.imageUrl} alt={item.name} onError={() => setImageFailed(true)} /> : item.name.slice(0, 1)}
      </div>
      <div className="detail-copy">
        <span className="eyebrow">{item.category.name}</span>
        <h1>{item.name}</h1>
        <p>{item.description || "Prepared fresh by RD Catering."}</p>
        <strong className="detail-price">GH₵ {item.price.toFixed(2)}</strong>
        <p className={item.isAvailable ? "availability available" : "availability"}>
          {item.isAvailable ? "Available today" : "Currently unavailable"}
        </p>
        <button className="button primary" type="button" disabled={!item.isAvailable} onClick={() => add({ id: item.id, name: item.name, price: item.price })}>
          <Plus size={17} /> {item.isAvailable ? "Add to cart" : "Unavailable"}
        </button>
      </div>
    </div>
  </main>;
}