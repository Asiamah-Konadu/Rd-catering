"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Sparkles, Clock, Star, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import type { ShowcaseConfig } from "@/lib/showcase";
import { DEFAULT_SHOWCASE_CONFIG } from "@/lib/showcase";

interface Props {
  config?: ShowcaseConfig;
}

interface DishMetric {
  heatPercent: number;
  prepTime: string;
  rating: string;
  ordersCount: string;
  accentColor: string;
  stationLine: string;
  badge: string;
}

const DISH_METRICS: Record<string, DishMetric> = {
  "jollof-rice": {
    heatPercent: 96,
    prepTime: "35–45 min",
    rating: "4.99",
    ordersCount: "2,450+ orders",
    accentColor: "#f74326",
    stationLine: "Accra Fire Pots · High Flame",
    badge: "Accra's #1 Pick",
  },
  waakye: {
    heatPercent: 88,
    prepTime: "40–50 min",
    rating: "4.98",
    ordersCount: "1,890+ orders",
    accentColor: "#dc2626",
    stationLine: "Traditional Heritage Hearth",
    badge: "Heritage Favourite",
  },
  "banku-tilapia": {
    heatPercent: 92,
    prepTime: "45–55 min",
    rating: "4.97",
    ordersCount: "1,340+ orders",
    accentColor: "#f59e0b",
    stationLine: "Coastal Volta Embers",
    badge: "Fresh Lake Catch",
  },
  "fried-rice": {
    heatPercent: 84,
    prepTime: "25–35 min",
    rating: "4.95",
    ordersCount: "1,120+ orders",
    accentColor: "#10b981",
    stationLine: "High-Heat Artisan Wok",
    badge: "Wok Specialty",
  },
  waffles: {
    heatPercent: 65,
    prepTime: "20–30 min",
    rating: "4.96",
    ordersCount: "820+ orders",
    accentColor: "#fbbf24",
    stationLine: "Golden Cast-Iron Bakery",
    badge: "Sweet Indulgence",
  },
  smoothies: {
    heatPercent: 15,
    prepTime: "10–15 min",
    rating: "4.99",
    ordersCount: "1,650+ orders",
    accentColor: "#06b6d4",
    stationLine: "Chilled Fruit Bar · Accra",
    badge: "Fresh Pressed",
  },
};

const DEFAULT_METRIC: DishMetric = {
  heatPercent: 90,
  prepTime: "30–40 min",
  rating: "4.98",
  ordersCount: "1,200+ orders",
  accentColor: "#f74326",
  stationLine: "Accra Fire Kitchen",
  badge: "Chef Signature",
};

export default function FoodWebGLShowcase({ config = DEFAULT_SHOWCASE_CONFIG }: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  const activeItems = useMemo(() => {
    const list = config.items?.filter((it) => it.isActive) || [];
    return list.length > 0 ? list : DEFAULT_SHOWCASE_CONFIG.items;
  }, [config.items]);

  const count = activeItems.length;

  // Discrete integer index: exactly one dish in full view at all times!
  const [activeIndex, setActiveIndex] = useState(0);

  // Jump to specific dish by index
  const goToDish = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(count - 1, index));
      setActiveIndex(target);

      const outer = outerRef.current;
      if (!outer) return;
      const totalH = outer.offsetHeight;
      const viewH = window.innerHeight;
      const maxScroll = totalH - viewH;
      if (maxScroll <= 0) return;

      const targetScrollY = outer.offsetTop + (target / (count - 1 || 1)) * maxScroll;
      window.scrollTo({ top: targetScrollY, behavior: "smooth" });
    },
    [count]
  );

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) goToDish(activeIndex - 1);
  }, [activeIndex, goToDish]);

  const handleNext = useCallback(() => {
    if (activeIndex < count - 1) goToDish(activeIndex + 1);
  }, [activeIndex, count, goToDish]);

  // ── Discrete Stepped Scroll Listener (No awkward fractional states) ─
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;
        const outer = outerRef.current;
        if (!outer) return;
        const rect = outer.getBoundingClientRect();
        const totalH = outer.offsetHeight;
        const viewH = window.innerHeight;
        const maxScroll = totalH - viewH;
        if (maxScroll <= 0) return;

        const scrolled = -rect.top;
        if (scrolled <= 0) {
          setActiveIndex((prev) => (prev !== 0 ? 0 : prev));
          return;
        }

        const progress = Math.max(0, Math.min(1, scrolled / maxScroll));
        // Stepped mapping: cleanly advances to next dish when reaching each threshold
        const step = Math.min(count - 1, Math.floor(progress * count));
        setActiveIndex((prev) => (prev !== step ? step : prev));
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [count]);

  // ── Sync Active Dish Color with Shared Master WebGL Background ──────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const activeSlug = activeItems[activeIndex]?.slug || "jollof-rice";
    const metric = DISH_METRICS[activeSlug] || DEFAULT_METRIC;

    window.dispatchEvent(
      new CustomEvent("rd-showcase-dish", {
        detail: {
          color: metric.accentColor,
          slug: activeSlug,
          index: activeIndex,
        },
      })
    );
  }, [activeItems, activeIndex]);

  const activeDish = activeItems[activeIndex] || activeItems[0];
  const activeMetric = DISH_METRICS[activeDish.slug] || DEFAULT_METRIC;

  const whatsappUrl = useMemo(() => {
    const msg = `Hello Rich-Dons Kitchen! I'd like to order:\n\n*${activeDish.name}*\nPrice: GH₵ ${activeDish.price.toFixed(
      2
    )}\nCategory: ${activeDish.category}\n\nPlease confirm availability and estimated delivery time.`;
    return `https://wa.me/233540000000?text=${encodeURIComponent(msg)}`;
  }, [activeDish]);

  return (
    <>
      {/*
        Outer wrapper:
        Proportional scroll height where scrolling steps cleanly through each dish.
      */}
      <div
        ref={outerRef}
        className="wgs-outer"
        id="today-menu"
        aria-label="What sounds good? Food Showcase"
        style={{ height: `${Math.max(3, count) * 85}vh` }}
      >
        {/* ── Sticky Viewport Frame ───────────────────────────────────── */}
        <div ref={stickyRef} className="wgs-sticky">
          {/* Subtle local accent bloom that layers over the master WebGL canvas */}
          <div
            className="wgs-ambient-glow"
            style={{ "--accent": activeMetric.accentColor } as React.CSSProperties}
            aria-hidden="true"
          />

          {/* ── Top Header ───────────────────────────────────────────── */}
          <header className="wgs-header">
            <div className="wgs-header-top-row">
              <div className="wgs-kicker">
                <span className="wgs-live-dot" />
                <Sparkles size={12} aria-hidden="true" />
                <span>{config.kicker || "Accra Kitchen Showcase · Handcrafted Favourites"}</span>
              </div>
              <div className="wgs-step-nav-controls">
                <button
                  type="button"
                  className="wgs-step-btn"
                  onClick={handlePrev}
                  disabled={activeIndex === 0}
                  aria-label="Previous dish"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="wgs-scroll-live-badge">
                  <span>Dish 0{activeIndex + 1} of 0{count}</span>
                </div>
                <button
                  type="button"
                  className="wgs-step-btn"
                  onClick={handleNext}
                  disabled={activeIndex === count - 1}
                  aria-label="Next dish"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="wgs-header-row">
              <div>
                <h2>{config.title || "What sounds good?"}</h2>
                <p className="wgs-subtitle">
                  {config.subtitle ||
                    "Handcrafted Ghanaian favourites cooked to order. Scroll to step through each dish."}
                </p>
              </div>
              <Link href={config.ctaUrl || "/menu"} className="wgs-header-cta">
                <span>{config.ctaText || "Full Kitchen Menu"}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </header>

          {/* ── Stepped 3D Stage (Both Left Story & Right 3D Cards) ────── */}
          <div className="wgs-stage">
            {/* LEFT: Text Story Stack (Discrete Stepping) */}
            <div className="wgs-story-stack">
              {activeItems.map((dish, idx) => {
                const isCurrent = idx === activeIndex;
                const isPast = idx < activeIndex;
                const metric = DISH_METRICS[dish.slug] || DEFAULT_METRIC;

                return (
                  <div
                    key={dish.id}
                    className={`wgs-story-item ${isCurrent ? "is-current" : ""}`}
                    style={{
                      transform: isCurrent
                        ? "translate3d(0, 0, 0) scale(1)"
                        : isPast
                        ? "translate3d(0, -45px, 0) scale(0.95)"
                        : "translate3d(0, 45px, 0) scale(0.95)",
                      opacity: isCurrent ? 1 : 0,
                      pointerEvents: isCurrent ? "auto" : "none",
                      zIndex: isCurrent ? 10 : 1,
                      transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease",
                    }}
                  >
                    <div className="wgs-dish-index">
                      <span className="wgs-index-num">0{idx + 1}</span>
                      <span className="wgs-index-sep">/</span>
                      <span className="wgs-index-total">0{count}</span>
                      <span className="wgs-origin-pill">{dish.origin || "Accra Fire Pots"}</span>
                    </div>

                    <div className="wgs-badges-line">
                      <span className="wgs-category-badge">{dish.category}</span>
                      <span className="wgs-dish-tag">{metric.badge}</span>
                    </div>

                    <h3 className="wgs-dish-name">{dish.name}</h3>
                    <p className="wgs-tagline">{dish.tagline}</p>
                    <p className="wgs-desc">{dish.description}</p>

                    {/* Floating Telemetry & Metrics HUD */}
                    <div className="wgs-metrics-hud">
                      <div className="wgs-hud-card">
                        <div className="wgs-hud-header">
                          <Flame size={13} className="wgs-hud-icon wgs-hud-icon--flame" aria-hidden="true" />
                          <span>Heat Index</span>
                        </div>
                        <div className="wgs-hud-value">
                          <strong>{metric.heatPercent}%</strong>
                          <span className="wgs-hud-sub">Woodfire Flame</span>
                        </div>
                        <div className="wgs-hud-gauge">
                          <div
                            className="wgs-hud-gauge-fill"
                            style={{
                              width: `${metric.heatPercent}%`,
                              background: metric.accentColor,
                            }}
                          />
                        </div>
                      </div>

                      <div className="wgs-hud-card">
                        <div className="wgs-hud-header">
                          <Clock size={13} className="wgs-hud-icon" aria-hidden="true" />
                          <span>Cook Time</span>
                        </div>
                        <div className="wgs-hud-value">
                          <strong>{metric.prepTime}</strong>
                          <span className="wgs-hud-sub">Made to Order</span>
                        </div>
                      </div>

                      <div className="wgs-hud-card">
                        <div className="wgs-hud-header">
                          <Star size={13} className="wgs-hud-icon wgs-hud-icon--gold" aria-hidden="true" />
                          <span>Guest Rating</span>
                        </div>
                        <div className="wgs-hud-value">
                          <strong>{metric.rating} ★</strong>
                          <span className="wgs-hud-sub">{metric.ordersCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="wgs-actions">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wgs-order-btn"
                        aria-label={`Order ${dish.name} on WhatsApp`}
                      >
                        <MessageCircle size={16} aria-hidden="true" />
                        <span>Order on WhatsApp</span>
                      </a>
                      <Link href={`/menu/${dish.slug}`} className="wgs-details-btn">
                        <span>View Dish Details</span>
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    </div>

                    {/* Station Live Line */}
                    <div className="wgs-station-line">
                      <span className="wgs-station-dot" />
                      <span>{metric.stationLine}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT: 3D Stage Cards (Discrete Stepping, No Half-Way Cutoff) */}
            <div className="wgs-cards-stage">
              {activeItems.map((dish, idx) => {
                const isCurrent = idx === activeIndex;
                const isPast = idx < activeIndex;
                const metric = DISH_METRICS[dish.slug] || DEFAULT_METRIC;

                return (
                  <div
                    key={dish.id}
                    className={`wgs-3d-card ${isCurrent ? "is-current" : ""}`}
                    style={{
                      transform: isCurrent
                        ? "perspective(1200px) translate3d(0, 0, 0) rotateX(0deg) scale(1)"
                        : isPast
                        ? "perspective(1200px) translate3d(0, -60px, -140px) rotateX(-12deg) scale(0.9)"
                        : "perspective(1200px) translate3d(0, 60px, -140px) rotateX(12deg) scale(0.9)",
                      opacity: isCurrent ? 1 : 0,
                      pointerEvents: isCurrent ? "auto" : "none",
                      zIndex: isCurrent ? 30 : 1,
                      filter: isCurrent ? "none" : "blur(4px)",
                      transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease, filter 0.4s ease",
                    }}
                  >
                    {/* Glowing aura frame */}
                    <div
                      className="wgs-card-glow-halo"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, color-mix(in srgb, ${metric.accentColor} 45%, transparent) 0%, transparent 70%)`,
                      }}
                    />

                    {/* Card container */}
                    <div className="wgs-card-shell">
                      <div className="wgs-card-img-wrap">
                        <img
                          src={dish.imageUrl}
                          alt={dish.name}
                          className="wgs-card-img"
                          loading="eager"
                        />
                        <div className="wgs-card-gradient-overlay" />
                      </div>

                      {/* Floating Price Tag */}
                      <div className="wgs-price-pill">
                        <span className="wgs-price-curr">GH₵</span>
                        <strong className="wgs-price-val">{dish.price.toFixed(2)}</strong>
                      </div>

                      {/* Live Station Badge */}
                      <div className="wgs-live-badge-card">
                        <span className="wgs-live-dot" />
                        <span>Station Active</span>
                      </div>

                      {/* Card Bottom Meta bar */}
                      <div className="wgs-card-meta">
                        <div className="wgs-card-meta-text">
                          <span className="wgs-card-dish-name">{dish.name}</span>
                          <span className="wgs-card-category">{dish.category}</span>
                        </div>
                        <span
                          className="wgs-card-accent-line"
                          style={{ background: metric.accentColor }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Bottom Stepper & Interactive Dish Pills ──────────────── */}
          <footer className="wgs-footer">
            <div className="wgs-progress-track">
              <div
                className="wgs-progress-scrubber"
                style={{
                  width: `${((activeIndex + 1) / count) * 100}%`,
                  background: activeMetric.accentColor,
                  transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </div>

            <div className="wgs-progress-dots">
              {activeItems.map((dish, idx) => {
                const metric = DISH_METRICS[dish.slug] || DEFAULT_METRIC;
                const isSelected = idx === activeIndex;

                return (
                  <button
                    key={dish.id}
                    type="button"
                    className={`wgs-dot-pill ${isSelected ? "is-selected" : ""}`}
                    onClick={() => goToDish(idx)}
                    aria-label={`Jump to dish 0${idx + 1}: ${dish.name}`}
                  >
                    <span
                      className="wgs-dot-indicator"
                      style={
                        isSelected ? { background: metric.accentColor, boxShadow: `0 0 10px ${metric.accentColor}` } : {}
                      }
                    />
                    <span className="wgs-dot-name">{dish.name}</span>
                  </button>
                );
              })}
            </div>
          </footer>
        </div>
      </div>

      {/* ── Bottom Dispatch Banner (sits below sticky, normal flow) ── */}
      <section className="wgs-bottom-banner">
        <div className="wgs-banner-copy">
          <span className="wgs-banner-badge">Accra Kitchen Dispatch</span>
          <h3>Looking for custom waakye pots or office banquets?</h3>
          <p>
            Our woodfire kitchens deliver daily to East Legon, Cantonments, Airport Residential, Osu, Ridge, and
            Dzorwulu. Custom combos, corporate invoices, and event catering available.
          </p>
        </div>
        <div className="wgs-banner-actions">
          <Link href={config.ctaUrl || "/menu"} className="wgs-banner-primary">
            <span>{config.ctaText || "Explore Full Kitchen Menu"}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/corporate" className="wgs-banner-secondary">
            <span>Corporate Portals</span>
          </Link>
        </div>
      </section>
    </>
  );
}
