'use client';

import { Sparkles, Utensils } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { PublicMenuItem, PublicExtra } from "@/lib/menu";
import { ComboCustomizerModal } from "./ComboCustomizerModal";

interface MenuCardProps {
  item: PublicMenuItem;
  availableExtras?: PublicExtra[];
}

export default function MenuCard({ item, availableExtras }: MenuCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);

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
