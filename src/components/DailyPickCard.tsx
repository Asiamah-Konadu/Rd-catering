'use client';

import { useState } from "react";
import Link from "next/link";
import { Plus, Check, ArrowRight } from "lucide-react";
import { useCart } from "./cart/CartProvider";
import type { PublicMenuItem } from "@/lib/menu";

export default function DailyPickCard({ item }: { item: PublicMenuItem | null }) {
  const { add } = useCart();
  const [imageFailed, setImageFailed] = useState(false);
  const [added, setAdded] = useState(false);

  if (!item) {
    return (
      <div className="hero-card">
        <div className="food-mosaic" aria-hidden="true">
          <span>Jollof</span>
          <span>Grill</span>
          <span>Stew</span>
          <span>Tray</span>
        </div>
        <span className="daily-pick-badge">Today’s kitchen pick</span>
        <strong>Jollof Rice &amp; Chicken</strong>
        <small>From GH₵ 65.00 • prepared fresh</small>
        <div className="daily-pick-actions">
          <Link href="/menu" className="button ghost daily-pick-view-btn">
            Explore Menu <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    add({
      id: item.id,
      name: item.name,
      price: item.price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="hero-card daily-pick-card">
      <Link href={`/menu/${item.slug}`} className="daily-pick-image-wrap" aria-label={`View ${item.name}`}>
        {item.imageUrl && !imageFailed ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="daily-pick-image"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="food-mosaic" aria-hidden="true">
            <span>{item.category?.name || "Special"}</span>
            <span>Grill</span>
            <span>Stew</span>
            <span>Fresh</span>
          </div>
        )}
        <span className="daily-pick-floating-pill">Today&apos;s pick</span>
      </Link>

      <div className="daily-pick-content">
        <span className="daily-pick-category">{item.category?.name || "Kitchen Special"}</span>
        <strong className="daily-pick-title">
          <Link href={`/menu/${item.slug}`}>{item.name}</Link>
        </strong>
        <small className="daily-pick-price">
          GH₵ {item.price.toFixed(2)} • prepared fresh
        </small>

        <div className="daily-pick-actions">
          <button
            type="button"
            className="button primary daily-pick-btn"
            disabled={!item.isAvailable}
            onClick={handleAddToCart}
          >
            {added ? (
              <>
                <Check size={16} /> Added to bag
              </>
            ) : (
              <>
                <Plus size={16} /> Add to bag
              </>
            )}
          </button>
          <Link href={`/menu/${item.slug}`} className="button ghost daily-pick-view-btn">
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
