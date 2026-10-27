'use client';

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Utensils } from "lucide-react";
import type { PublicMenuItem } from "@/lib/menu";

export interface ThisWeekDishesProps {
  items?: PublicMenuItem[];
}

interface DishDisplayItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  categoryName: string;
  imageUrl: string;
  isAvailable: boolean;
}

const FALLBACK_DISHES: DishDisplayItem[] = [
  {
    id: "fb-1",
    name: "Smoky Ghanaian Jollof",
    slug: "jollof-rice",
    price: 65,
    categoryName: "Rice Classics",
    imageUrl: "/coming-soon/jolof.avif",
    isAvailable: true,
  },
  {
    id: "fb-2",
    name: "Authentic Accra Waakye",
    slug: "waakye",
    price: 60,
    categoryName: "House Specialties",
    imageUrl: "/coming-soon/waakye.jpg",
    isAvailable: true,
  },
  {
    id: "fb-3",
    name: "Banku & Grilled Tilapia",
    slug: "banku-tilapia",
    price: 85,
    categoryName: "Local Favourites",
    imageUrl: "/coming-soon/banku-and-tilapia.jpg",
    isAvailable: true,
  },
  {
    id: "fb-4",
    name: "Special Chef's Fried Rice",
    slug: "fried-rice",
    price: 65,
    categoryName: "Rice Classics",
    imageUrl: "/coming-soon/fried-rice.png",
    isAvailable: true,
  },
  {
    id: "fb-5",
    name: "Golden Belgian Waffles",
    slug: "waffles",
    price: 45,
    categoryName: "Breakfast & Brunch",
    imageUrl: "/coming-soon/Waffle.jpg",
    isAvailable: true,
  },
  {
    id: "fb-6",
    name: "Fresh Tropical Smoothies",
    slug: "smoothies",
    price: 35,
    categoryName: "Drinks & Refreshers",
    imageUrl: "/coming-soon/smoothies.jpg",
    isAvailable: true,
  },
];

export default function ThisWeekDishesCarousel({ items = [] }: ThisWeekDishesProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [manualAngle, setManualAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(0);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Combine real menu items with fallbacks if needed to ensure at least 6-8 items for a complete 3D cylinder
  const displayDishes: DishDisplayItem[] = React.useMemo(() => {
    const availableReal = items
      .filter((it) => it.isAvailable)
      .map((it, idx) => ({
        id: it.id,
        name: it.name,
        slug: it.slug,
        price: it.price,
        categoryName: it.category?.name || "Kitchen Special",
        imageUrl: it.imageUrl || FALLBACK_DISHES[idx % FALLBACK_DISHES.length].imageUrl,
        isAvailable: it.isAvailable,
      }));

    if (availableReal.length >= 6) {
      return availableReal.slice(0, 9);
    }

    // Complement with fallbacks
    const existingSlugs = new Set(availableReal.map((d) => d.slug));
    const complement = FALLBACK_DISHES.filter((d) => !existingSlugs.has(d.slug));
    const combined = [...availableReal, ...complement];
    return combined.slice(0, 8);
  }, [items]);

  const count = displayDishes.length;
  const angleStep = count > 0 ? 360 / count : 45;

  // 1. Intersection Observer to completely pause rotation when scrolled out of view (zero lag!)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Handle manual rotation reset back to auto-spin after 6 seconds of inactivity
  const scheduleAutoResume = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsManual(false);
    }, 6000);
  }, []);

  const handlePrev = () => {
    setIsManual(true);
    setManualAngle((prev) => prev + angleStep);
    scheduleAutoResume();
  };

  const handleNext = () => {
    setIsManual(true);
    setManualAngle((prev) => prev - angleStep);
    scheduleAutoResume();
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        handlePrev();
      } else {
        handleNext();
      }
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <section
      ref={containerRef}
      className="dishes-showcase-section"
      aria-label="This Week's Dishes Showcase"
    >
      <div className="dishes-showcase-header">
        <span className="dishes-badge">
          <Sparkles size={14} aria-hidden="true" />
          <span>Curated For You</span>
        </span>
        <h2>This Week&apos;s Dishes</h2>
        <p>Explore today&apos;s freshly cooked Ghanaian favourites · Made to order</p>
      </div>

      <div
        className="dishes-3d-stage"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`dishes-3d-cylinder ${isInView ? "is-active" : "is-paused"} ${isManual ? "is-manual" : ""}`}
          style={isManual ? { transform: `rotateY(${manualAngle}deg)` } : undefined}
        >
          {displayDishes.map((dish, index) => {
            const faceAngle = index * angleStep;
            return (
              <article
                key={dish.id}
                className="dishes-3d-card"
                style={{
                  transform: `rotateY(${faceAngle}deg) translateZ(var(--carousel-radius))`,
                }}
              >
                <Link
                  href={`/menu/${dish.slug}`}
                  className="dishes-3d-card-inner"
                  aria-label={`View details for ${dish.name}`}
                >
                  <div className="dishes-card-img-wrapper">
                    {dish.imageUrl.startsWith("http") ? (
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="dishes-card-img"
                        loading={index < 3 ? "eager" : "lazy"}
                      />
                    ) : (
                      <Image
                        src={dish.imageUrl}
                        alt={dish.name}
                        fill
                        sizes="(max-width: 600px) 180px, (max-width: 900px) 220px, 260px"
                        className="dishes-card-img"
                        priority={index < 2}
                      />
                    )}
                    <div className="dishes-card-gradient" />
                    <span className="dishes-card-cat">{dish.categoryName}</span>
                  </div>

                  <div className="dishes-card-content">
                    <h3 className="dishes-card-title">{dish.name}</h3>
                    <div className="dishes-card-bottom">
                      <span className="dishes-card-price">GH₵ {dish.price.toFixed(2)}</span>
                      <span className="dishes-card-cta">
                        View <ArrowRight size={13} aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div className="dishes-controls" aria-label="Carousel navigation">
          <button
            type="button"
            className="dishes-control-btn"
            onClick={handlePrev}
            aria-label="Previous dish"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <div className="dishes-control-hint">
            <span>Hover to pause · Swipe to spin</span>
          </div>
          <button
            type="button"
            className="dishes-control-btn"
            onClick={handleNext}
            aria-label="Next dish"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
