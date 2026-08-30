'use client';

import { Plus, Utensils } from "lucide-react";
import { useCart } from "./cart/CartProvider";
import Link from "next/link";
import { useState } from "react";
import type { PublicMenuItem } from "@/lib/menu";

export default function MenuCard({ item }: { item: PublicMenuItem }) {
  const { add } = useCart();
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <article className={item.isAvailable ? "menu-card" : "menu-card unavailable"}>
      <Link href={`/menu/${item.slug}`} className="food-placeholder" aria-label={`View ${item.name}`}>
        {item.imageUrl && !imageFailed ? (
          <img src={item.imageUrl} alt="" onError={() => setImageFailed(true)} />
        ) : (
          <span>
            <Utensils size={34} aria-hidden="true" />
          </span>
        )}
        <span className="menu-card-category">{item.category.name}</span>
        <span className={item.isAvailable ? "status-pill available" : "status-pill"}>
          {item.isAvailable ? "Available" : "Sold out"}
        </span>
      </Link>
      <div className="menu-card-body">
        <h3><Link href={`/menu/${item.slug}`}>{item.name}</Link></h3>
        <p>{item.description || "Prepared fresh by Rich-Dons Catering."}</p>
        <div className="menu-card-footer">
          <div className="menu-card-price">
            <span>Price</span>
            <strong>GH₵ {item.price.toFixed(2)}</strong>
          </div>
          <button
            type="button"
            disabled={!item.isAvailable}
            onClick={() => add({ id: item.id, name: item.name, price: item.price })}
          >
            <Plus size={17} aria-hidden="true" /> {item.isAvailable ? "Add to bag" : "Unavailable"}
          </button>
        </div>
      </div>
    </article>
  );
}
