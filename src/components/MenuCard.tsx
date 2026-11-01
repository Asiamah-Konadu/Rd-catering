'use client';

import { ArrowRight, Check, Plus, Sparkles, Utensils } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { PublicMenuItem, PublicExtra } from "@/lib/menu";
import { ComboCustomizerModal } from "./ComboCustomizerModal";
import { useCart } from "./cart/CartProvider";

export default function MenuCard({
  item,
  showAddToBag = true,
  availableExtras,
}: {
  item: PublicMenuItem;
  showAddToBag?: boolean;
  availableExtras?: PublicExtra[];
}) {
  const { add } = useCart();
  const [imageFailed, setImageFailed] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  return (
    <>
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
          <h3>
            <Link href={`/menu/${item.slug}`}>{item.name}</Link>
          </h3>
          <p>{item.description || "Prepared fresh by Rich-Dons Catering."}</p>
          <div className="menu-card-footer">
            <div className="menu-card-price">
              <span>Price</span>
              <strong>GH₵ {item.price.toFixed(2)}</strong>
            </div>
            <button
              type="button"
              disabled={!item.isAvailable}
              className="combo-trigger-btn flex items-center gap-1.5"
              onClick={() => setCustomizerOpen(true)}
            >
              <Sparkles size={16} aria-hidden="true" className="text-amber-500" />
              <span>{item.isAvailable ? "Add / Combo" : "Unavailable"}</span>
            </button>
          </div>
          {showAddToBag ? (
            <button
              type="button"
              disabled={!item.isAvailable}
              className={justAdded ? "just-added" : ""}
              onClick={() => {
                add({ id: item.id, name: item.name, price: item.price });
                setJustAdded(true);
              }}
            >
              {justAdded ? <Check size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
              {item.isAvailable ? (justAdded ? "Added" : "Add to bag") : "Unavailable"}
            </button>
          ) : (
            <Link className="menu-card-view-link" href={`/menu/${item.slug}`}>
              View dish <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
      </article>

      <ComboCustomizerModal
        item={item}
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        availableExtras={availableExtras}
      />
    </>
  );
}
