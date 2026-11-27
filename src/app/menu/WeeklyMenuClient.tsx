"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  CalendarDays,
  Layers,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  Utensils,
} from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import type { PublicCombo, PublicExtra, PublicMenuItem } from "@/lib/menu";
import AdSlot from "@/components/ads/AdSlot";
import "./weekly-menu.css";

export type MenuCategoryGroup = {
  id: string;
  name: string;
  slug: string;
  items: PublicMenuItem[];
};

interface WeeklyMenuClientProps {
  categories: MenuCategoryGroup[];
  extras: PublicExtra[];
  combos: PublicCombo[];
}

function formatGHS(value: number) {
  return `GHS ${value.toFixed(2)}`;
}

function classifyCategory(slug: string, name: string): "rice" | "combo" | "addons" | "locals" | "other" {
  const s = `${slug} ${name}`.toLowerCase();
  if (s.includes("combo")) return "combo";
  if (s.includes("salad") || s.includes("add-on") || s.includes("addon") || s.includes("extra")) return "addons";
  if (s.includes("soup") || s.includes("swallow") || s.includes("local") || s.includes("sunday")) return "locals";
  if (s.includes("rice")) return "rice";
  return "other";
}

const CATEGORY_ORDER: Record<ReturnType<typeof classifyCategory>, number> = {
  rice: 0,
  combo: 1,
  addons: 2,
  locals: 3,
  other: 4,
};

function getChipEmoji(kind: string, name: string) {
  if (kind === "rice") return "🍚";
  if (kind === "combo") return "★";
  if (kind === "addons") return "＋";
  if (kind === "locals") return "♛";
  if (name.toLowerCase().includes("sunday")) return "☀";
  return "🍽";
}

export function WeeklyMenuClient({ categories, extras, combos }: WeeklyMenuClientProps) {
  const { items: cartItems, count, subtotal, add, setQuantity, remove, clear } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [activeSectionSlug, setActiveSectionSlug] = useState<string>("");
  const [sortLow, setSortLow] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [weekLabel, setWeekLabel] = useState("FIXED WEEKLY MENU");

  const orderedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const rankA = CATEGORY_ORDER[classifyCategory(a.slug, a.name)];
      const rankB = CATEGORY_ORDER[classifyCategory(b.slug, b.name)];
      return rankA - rankB;
    });
  }, [categories]);

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString("en-GH", { day: "numeric", month: "short" }).toUpperCase();
    setWeekLabel(`WEEK OF ${formatted}`);
  }, []);

  // Expose ordered categories to MobileLiquidNav
  useEffect(() => {
    if (typeof window !== "undefined") {
      const payload = orderedCategories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        count: `${c.items.length} dishes`,
      }));
      (window as unknown as { __RD_MENU_CATEGORIES__?: typeof payload }).__RD_MENU_CATEGORIES__ = payload;
      window.dispatchEvent(new CustomEvent("rd:menu-categories", { detail: payload }));
    }
  }, [orderedCategories]);

  useEffect(() => {
    if (!activeSectionSlug && orderedCategories.length > 0) {
      setActiveSectionSlug(orderedCategories[0].slug);
    }
  }, [orderedCategories, activeSectionSlug]);

  // Track active category section on scroll for PC sticky sidebar
  useEffect(() => {
    if (orderedCategories.length === 0 || typeof IntersectionObserver === "undefined") return;

    const ratioMap = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const slug = entry.target.id.replace("menu-", "");
          if (entry.isIntersecting) {
            ratioMap.set(slug, entry.intersectionRatio);
          } else {
            ratioMap.delete(slug);
          }
        });

        let bestSlug = "";
        let bestRatio = -1;
        ratioMap.forEach((ratio, slug) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestSlug = slug;
          }
        });
        if (bestSlug) {
          setActiveSectionSlug(bestSlug);
        }
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );

    orderedCategories.forEach((cat) => {
      const el = document.getElementById(`menu-${cat.slug}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [orderedCategories, activeFilter]);

  const handleSidebarCategoryClick = (slug: string) => {
    setActiveSectionSlug(slug);
    if (activeFilter !== "all") {
      setActiveFilter("all");
      setTimeout(() => {
        const el = document.getElementById(`menu-${slug}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return;
    }
    const el = document.getElementById(`menu-${slug}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 1600);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const getCartQty = (id: string) => {
    return cartItems
      .filter((line) => line.id === id)
      .reduce((sum, line) => sum + line.quantity, 0);
  };

  const handleAddItem = (item: { id: string; name: string; price: number; imageUrl?: string | null }) => {
    add({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl ?? null,
    });
    showToast(`${item.name} added`);
  };

  const handleUpdateQty = (id: string, delta: number) => {
    const existingLine = cartItems.find((line) => line.id === id);
    if (!existingLine) return;
    setQuantity(existingLine.lineId, existingLine.quantity + delta);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Filter & sort items inside each category
  const processedCategories = useMemo(() => {
    return orderedCategories.map((cat) => {
      const kind = classifyCategory(cat.slug, cat.name);
      let filtered = cat.items.filter((item) => {
        if (!normalizedQuery) return true;
        return (
          item.name.toLowerCase().includes(normalizedQuery) ||
          (item.description && item.description.toLowerCase().includes(normalizedQuery))
        );
      });

      if (sortLow) {
        filtered = [...filtered].sort((a, b) => a.price - b.price);
      }

      return {
        ...cat,
        kind,
        items: filtered,
      };
    });
  }, [orderedCategories, normalizedQuery, sortLow]);

  // Filter standalone extras (from Extra table) that match search
  const filteredExtras = useMemo(() => {
    let list = extras.filter((e) => {
      if (!normalizedQuery) return true;
      return e.name.toLowerCase().includes(normalizedQuery);
    });
    if (sortLow) {
      list = [...list].sort((a, b) => a.price - b.price);
    }
    return list;
  }, [extras, normalizedQuery, sortLow]);

  // Deduplicate combos: if combo-package category has items, show them; also include combos from Combo table if not duplicated by slug
  const comboItemsFromCategories = useMemo(
    () => processedCategories.filter((c) => c.kind === "combo").flatMap((c) => c.items),
    [processedCategories]
  );

  const extraStandaloneCombos = useMemo(() => {
    const existingSlugs = new Set(comboItemsFromCategories.map((i) => i.slug));
    return combos.filter((c) => {
      if (existingSlugs.has(c.slug)) return false;
      if (!normalizedQuery) return true;
      return (
        c.name.toLowerCase().includes(normalizedQuery) ||
        (c.description && c.description.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [combos, comboItemsFromCategories, normalizedQuery]);

  const filterChips = useMemo(() => {
    const chips = [{ key: "all", label: "✦ All" }];
    for (const cat of orderedCategories) {
      const kind = classifyCategory(cat.slug, cat.name);
      const emoji = getChipEmoji(kind, cat.name);
      chips.push({
        key: cat.slug,
        label: `${emoji} ${cat.name}`,
      });
    }
    return chips;
  }, [orderedCategories]);

  const renderQtyStepper = (id: string, label: string) => {
    const q = getCartQty(id);
    if (q <= 0) {
      return null;
    }
    return (
      <div className="weekly-qty">
        <button
          type="button"
          aria-label={`Decrease ${label} quantity`}
          onClick={() => handleUpdateQty(id, -1)}
        >
          <Minus size={12} />
        </button>
        <span>{q}</span>
        <button
          type="button"
          aria-label={`Increase ${label} quantity`}
          onClick={() => handleUpdateQty(id, 1)}
        >
          <Plus size={12} />
        </button>
      </div>
    );
  };

  return (
    <main className="weekly-dark-menu">
      <div className="weekly-shell">
        <div className="weekly-layout">
          {/* ── PC LEFT STICKY SIDEBAR: CATEGORIES ── */}
          <aside className="weekly-sidebar weekly-sidebar-left" aria-label="Menu categories">
            <nav className="weekly-side-card weekly-side-categories" aria-label="Menu categories">
              <div className="weekly-side-head">
                <span className="weekly-side-title">
                  <Layers size={15} aria-hidden="true" />
                  Categories
                </span>
                <span className="weekly-side-sub">{orderedCategories.length} sections</span>
              </div>
              <ul className="weekly-side-cat-list">
                {orderedCategories.map((cat) => {
                  const kind = classifyCategory(cat.slug, cat.name);
                  const emoji = getChipEmoji(kind, cat.name);
                  const isActive =
                    activeFilter === cat.slug ||
                    (activeFilter === "all" && activeSectionSlug === cat.slug);
                  return (
                    <li key={cat.id}>
                      <button
                        type="button"
                        className={`weekly-side-cat-btn ${isActive ? "active" : ""}`}
                        onClick={() => handleSidebarCategoryClick(cat.slug)}
                        aria-current={isActive ? "true" : undefined}
                      >
                        <span className="weekly-side-cat-label">
                          <span aria-hidden="true">{emoji}</span>
                          <span>{cat.name}</span>
                        </span>
                        <span className="weekly-side-cat-count">{cat.items.length}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <AdSlot slotKey="menu_sidebar_desktop" tone="dark" className="mt-4" />
          </aside>

          {/* ── MAIN MENU CONTENT ── */}
          <div className="weekly-main">
            {/* ── 1. HERO BANNER ── */}
            <section className="weekly-hero" aria-label="This Week's Menu">
              <img
                src="/coming-soon/jolof.avif"
                alt="Freshly prepared Ghanaian Jollof rice and grilled chicken"
                className="weekly-hero-bg"
              />
              <div className="weekly-hero-shade" />
              <div className="weekly-hero-copy">
                <div className="weekly-eyebrow">Freshly curated for you</div>
                <h1>
                  This Week&apos;s
                  <br />
                  <span>Menu</span>
                </h1>
                <p>Good food, made memorable. Fixed weekly selections cooked fresh daily.</p>
                <div className="weekly-date-pill">
                  <CalendarDays size={13} aria-hidden="true" />
                  <span>{weekLabel}</span>
                </div>
              </div>
            </section>

            {/* ── 2. SEARCH & PRICE SORT ── */}
            <div className="weekly-search-row">
              <label className="weekly-search">
                <Search size={16} aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search this week's menu…"
                  aria-label="Search menu"
                />
              </label>
              <button
                type="button"
                className={`weekly-filter-btn ${sortLow ? "active" : ""}`}
                title={sortLow ? "Sorted by lowest price" : "Sort by lowest price"}
                aria-label="Sort by price"
                onClick={() => {
                  const next = !sortLow;
                  setSortLow(next);
                  showToast(next ? "Sorted by lowest price" : "Default menu order");
                }}
              >
                <ArrowUpDown size={17} aria-hidden="true" />
              </button>
            </div>

            {/* ── 3. CATEGORY CHIPS ── */}
            <div className="weekly-chips" role="tablist" aria-label="Menu categories">
              {filterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === chip.key}
                  className={`weekly-chip ${activeFilter === chip.key ? "active" : ""}`}
                  onClick={() => setActiveFilter(chip.key)}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* ── 4. MENU SECTIONS ── */}
            {processedCategories.map((cat, catIndex) => {
              const isHidden = activeFilter !== "all" && activeFilter !== cat.slug;
              if (isHidden) return null;

              const sectionNode = (() => {

              // Combo Package Section
              if (cat.kind === "combo") {
                const allComboCards = [
                  ...cat.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    slug: item.slug,
                    description: item.description,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    isMenuItem: true,
                  })),
                  ...extraStandaloneCombos.map((c) => ({
                    id: c.id,
                    name: c.name,
                    slug: c.slug,
                    description: c.description,
                    price: c.price,
                    imageUrl: c.imageUrl,
                    isMenuItem: false,
                  })),
                ];

                return (
                  <section
                    key={cat.id}
                    id={`menu-${cat.slug}`}
                    className="weekly-section menu-category-section"
                  >
                    <div className="weekly-section-head">
                      <h2 className="weekly-section-title">{cat.name}</h2>
                      <span className="weekly-section-meta">
                        {allComboCards.length} {allComboCards.length === 1 ? "selection" : "selections"}
                      </span>
                    </div>

                    {allComboCards.length === 0 ? (
                      <div className="weekly-empty">No combo packages match your search.</div>
                    ) : (
                      allComboCards.map((combo) => {
                        const q = getCartQty(combo.id);
                        return (
                          <article key={combo.id} className="weekly-combo">
                            <div className="weekly-combo-copy">
                              <div className="weekly-featured-pill">★ FEATURED COMBO</div>
                              <h3>{combo.name}</h3>
                              <p>{combo.description || "Signature sharing platter crafted for big appetites."}</p>
                              <div className="weekly-combo-price">{formatGHS(combo.price)}</div>
                              <div className="weekly-combo-actions">
                                {q > 0 ? (
                                  renderQtyStepper(combo.id, combo.name)
                                ) : (
                                  <button
                                    type="button"
                                    className="weekly-add-combo-btn"
                                    onClick={() => handleAddItem(combo)}
                                  >
                                    ＋ Add combo
                                  </button>
                                )}
                              </div>
                            </div>
                            {combo.imageUrl && (
                              <img
                                src={combo.imageUrl}
                                alt={combo.name}
                                className="weekly-combo-img"
                                loading="lazy"
                              />
                            )}
                          </article>
                        );
                      })
                    )}
                  </section>
                );
              }

              // Salads & Add-ons Section
              if (cat.kind === "addons") {
                const combinedAddons = [
                  ...cat.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    slug: item.slug,
                  })),
                  ...filteredExtras
                    .filter((ex) => !cat.items.some((i) => i.name.toLowerCase() === ex.name.toLowerCase()))
                    .map((ex) => ({
                      id: ex.id,
                      name: ex.name,
                      price: ex.price,
                      imageUrl: null as string | null,
                      slug: null as string | null,
                    })),
                ];

                return (
                  <section
                    key={cat.id}
                    id={`menu-${cat.slug}`}
                    className="weekly-section menu-category-section"
                  >
                    <div className="weekly-section-head">
                      <h2 className="weekly-section-title">{cat.name}</h2>
                      <span className="weekly-section-meta">Make it yours</span>
                    </div>

                    {combinedAddons.length === 0 ? (
                      <div className="weekly-empty">No add-ons match your search.</div>
                    ) : (
                      <div className="weekly-addon-list">
                        {combinedAddons.map((addon) => {
                          const q = getCartQty(addon.id);
                          return (
                            <div key={addon.id} className="weekly-addon">
                              {addon.imageUrl ? (
                                <img src={addon.imageUrl} alt={addon.name} loading="lazy" />
                              ) : (
                                <div className="weekly-addon-placeholder" aria-hidden="true">
                                  <Sparkles size={18} />
                                </div>
                              )}
                              <div className="weekly-addon-info">
                                <div className="weekly-addon-name">{addon.name}</div>
                                <div className="weekly-addon-price">{formatGHS(addon.price)}</div>
                              </div>
                              {q > 0 ? (
                                renderQtyStepper(addon.id, addon.name)
                              ) : (
                                <button
                                  type="button"
                                  className="weekly-add-btn"
                                  aria-label={`Add ${addon.name}`}
                                  onClick={() => handleAddItem(addon)}
                                >
                                  <Plus size={16} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              }

              // Soups & Swallows / Local Delights Horizontal Rows
              if (cat.kind === "locals") {
                return (
                  <section
                    key={cat.id}
                    id={`menu-${cat.slug}`}
                    className="weekly-section menu-category-section"
                  >
                    <div className="weekly-section-head">
                      <h2 className="weekly-section-title">{cat.name}</h2>
                      <span className="weekly-section-meta">Ghanaian favourites</span>
                    </div>

                    <div className="weekly-sunday-note">
                      ☀ Authentic Ghanaian soups, swallows, and local dishes — freshly prepared daily for your table.
                    </div>

                    {cat.items.length === 0 ? (
                      <div className="weekly-empty">No local dishes match your search.</div>
                    ) : (
                      <div className="weekly-local-list">
                        {cat.items.map((item) => {
                          const q = getCartQty(item.id);
                          return (
                            <article key={item.id} className="weekly-local-row">
                              {item.imageUrl ? (
                                <Link href={`/menu/${item.slug}`}>
                                  <img src={item.imageUrl} alt={item.name} loading="lazy" />
                                </Link>
                              ) : (
                                <div className="weekly-addon-placeholder" style={{ width: 106, height: 94 }}>
                                  <Utensils size={24} />
                                </div>
                              )}
                              <div className="weekly-local-detail">
                                <div>
                                  <Link href={`/menu/${item.slug}`}>{item.name}</Link>
                                  <p>{item.description || "Prepared fresh by Rich-Dons Catering."}</p>
                                </div>
                                <div className="weekly-local-action">
                                  <b className="weekly-price">{formatGHS(item.price)}</b>
                                  {q > 0 ? (
                                    renderQtyStepper(item.id, item.name)
                                  ) : (
                                    <button
                                      type="button"
                                      className="weekly-add-btn"
                                      aria-label={`Add ${item.name}`}
                                      onClick={() => handleAddItem(item)}
                                    >
                                      <Plus size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              }

              // Default / Rice Dishes Grid
              return (
                <section
                  key={cat.id}
                  id={`menu-${cat.slug}`}
                  className="weekly-section menu-category-section"
                >
                  <div className="weekly-section-head">
                    <h2 className="weekly-section-title">{cat.name}</h2>
                    <span className="weekly-section-meta">
                      {cat.items.length} {cat.items.length === 1 ? "selection" : "selections"}
                    </span>
                  </div>

                  {cat.items.length === 0 ? (
                    <div className="weekly-empty">No dishes match your search in {cat.name}.</div>
                  ) : (
                    <div className="weekly-cards">
                      {cat.items.map((item) => {
                        const q = getCartQty(item.id);
                        return (
                          <article key={item.id} className="weekly-food-card">
                            <Link href={`/menu/${item.slug}`} className="weekly-food-img">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} loading="lazy" />
                              ) : (
                                <div className="w-full h-full grid place-items-center text-amber-400">
                                  <Utensils size={28} />
                                </div>
                              )}
                              {item.isFeatured && <span className="weekly-food-badge">POPULAR</span>}
                            </Link>
                            <div className="weekly-food-info">
                              <Link href={`/menu/${item.slug}`} className="weekly-food-name">
                                {item.name}
                              </Link>
                              <div className="weekly-food-desc">
                                {item.description || "Prepared fresh by Rich-Dons Catering."}
                              </div>
                              <div className="weekly-food-bottom">
                                <span className="weekly-price">{formatGHS(item.price)}</span>
                                {q > 0 ? (
                                  renderQtyStepper(item.id, item.name)
                                ) : (
                                  <button
                                    type="button"
                                    className="weekly-add-btn"
                                    aria-label={`Add ${item.name}`}
                                    onClick={() => handleAddItem(item)}
                                  >
                                    <Plus size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
              })();

              return (
                <React.Fragment key={cat.id}>
                  {sectionNode}
                  {activeFilter === "all" && catIndex === 1 && (
                    <AdSlot slotKey="menu_in_feed" tone="dark" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ── PC RIGHT STICKY SIDEBAR: LIVE CART ── */}
          <aside className="weekly-sidebar weekly-sidebar-right" aria-label="Live cart">
            <section className="weekly-side-card weekly-side-cart" aria-label="Live cart">
              <div className="weekly-side-head">
                <span className="weekly-side-title">
                  <ShoppingBag size={15} aria-hidden="true" />
                  Your Order
                </span>
                <div className="weekly-side-cart-badges">
                  <span className="weekly-side-count-pill">
                    {count} {count === 1 ? "item" : "items"}
                  </span>
                  {count > 0 && (
                    <button
                      type="button"
                      className="weekly-side-clear-btn"
                      onClick={clear}
                      aria-label="Clear cart"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {cartItems.length === 0 ? (
                <div className="weekly-side-cart-empty">
                  <ShoppingBag size={24} aria-hidden="true" />
                  <strong>Your cart is empty</strong>
                  <span>Tap + on any dish to add it to your order.</span>
                </div>
              ) : (
                <>
                  <div className="weekly-side-cart-items">
                    {cartItems.map((line) => (
                      <div key={line.lineId} className="weekly-side-cart-line">
                        <div className="weekly-side-cart-line-top">
                          <div className="weekly-side-cart-line-info">
                            <strong>{line.name}</strong>
                            <small>{formatGHS(line.price)} each</small>
                          </div>
                          <button
                            type="button"
                            className="weekly-side-remove-btn"
                            aria-label={`Remove ${line.name}`}
                            onClick={() => remove(line.lineId)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <div className="weekly-side-cart-line-bottom">
                          <div className="weekly-qty">
                            <button
                              type="button"
                              aria-label={`Decrease ${line.name}`}
                              onClick={() => setQuantity(line.lineId, line.quantity - 1)}
                            >
                              <Minus size={11} />
                            </button>
                            <span>{line.quantity}</span>
                            <button
                              type="button"
                              aria-label={`Increase ${line.name}`}
                              onClick={() => setQuantity(line.lineId, line.quantity + 1)}
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                          <b>{formatGHS(line.price * line.quantity)}</b>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="weekly-side-cart-footer">
                    <div className="weekly-side-subtotal">
                      <span>Subtotal</span>
                      <strong>{formatGHS(subtotal)}</strong>
                    </div>
                    <Link href="/checkout" className="weekly-checkout-btn">
                      Continue to checkout
                    </Link>
                    <p className="weekly-side-note">
                      Delivery fee &amp; final total confirmed at checkout.
                    </p>
                  </div>
                </>
              )}
            </section>
          </aside>
        </div>
      </div>

      {/* ── TOAST ── */}
      <div className={`weekly-toast ${toastMessage ? "show" : ""}`} role="status" aria-live="polite">
        {toastMessage || ""}
      </div>
    </main>
  );
}
