'use client';

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import type { PublicMenuItem } from "@/lib/menu";
import { ComboCustomizerModal } from "./ComboCustomizerModal";

export default function DailyPickCard({ item }: { item: PublicMenuItem | null }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);

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

  return (
    <>
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
              className="button primary daily-pick-btn flex items-center justify-center gap-1.5"
              disabled={!item.isAvailable}
              onClick={() => setCustomizerOpen(true)}
            >
              <Sparkles size={16} />
              <span>{item.isAvailable ? "Add / Combo" : "Unavailable"}</span>
            </button>
            <Link href={`/menu/${item.slug}`} className="button ghost daily-pick-view-btn">
              Details
            </Link>
          </div>
        </div>
      </div>

      <ComboCustomizerModal
        item={item}
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
      />
    </>
  );
}
