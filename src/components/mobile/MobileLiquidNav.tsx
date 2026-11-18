'use client';

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UtensilsCrossed,
  ShoppingBag,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  Sparkles,
  MessageCircle,
  Calendar,
  ArrowLeft,
  X,
} from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

interface CategoryNavItem {
  id: string;
  slug: string;
  name: string;
  count: string;
}

export default function MobileLiquidNav() {
  const pathname = usePathname();
  const { count, subtotal } = useCart();

  // Menu category collapsible state
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryNavItem[]>([]);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("");

  // Route matches
  const isMenuPage = pathname === "/menu";
  const isDishDetailPage = pathname.startsWith("/menu/") && pathname !== "/menu";
  const isHome = pathname === "/";
  const isCorporate = pathname === "/corporate" || pathname.startsWith("/corporate/");
  const isEvents = pathname === "/events";

  // Discover categories from window cache or DOM
  const discoverCategories = useCallback(() => {
    if (typeof window === "undefined") return false;

    // 1. Check window cache if already populated by MenuPage/MenuSideNav
    const cached = (window as unknown as { __RD_MENU_CATEGORIES__?: CategoryNavItem[] })
      .__RD_MENU_CATEGORIES__;
    if (Array.isArray(cached) && cached.length > 0) {
      setCategories(cached);
      setActiveCategorySlug((current) => current || cached[0].slug);
      return true;
    }

    // 2. Query DOM for .menu-category-section
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(".menu-category-section")
    );
    if (sections.length > 0) {
      const found: CategoryNavItem[] = sections.map((sec) => {
        const h2 = sec.querySelector("h2");
        const countSpan = sec.querySelector(".menu-category-heading span:last-child");
        const slug = sec.id.replace("menu-", "");
        return {
          id: sec.id,
          slug,
          name: h2?.textContent?.trim() || slug,
          count: countSpan?.textContent?.trim() || "",
        };
      });

      setCategories(found);
      setActiveCategorySlug((current) => current || found[0].slug);
      (window as unknown as { __RD_MENU_CATEGORIES__?: CategoryNavItem[] }).__RD_MENU_CATEGORIES__ = found;
      return true;
    }

    return false;
  }, []);

  // Category discovery lifecycle: handles initial load, client-side navigation, and late DOM mounting
  useEffect(() => {
    if (!isMenuPage) {
      setIsCategoryDrawerOpen(false);
      return;
    }

    // Attempt immediate discovery (e.g. from SSR or window cache)
    discoverCategories();

    // Listen to custom event dispatched when MenuSideNav mounts on the menu page
    const handleCategoriesReady = (e: Event) => {
      const customEvent = e as CustomEvent<CategoryNavItem[]>;
      if (Array.isArray(customEvent.detail) && customEvent.detail.length > 0) {
        setCategories(customEvent.detail);
        setActiveCategorySlug((current) => current || customEvent.detail[0].slug);
      } else {
        discoverCategories();
      }
    };
    window.addEventListener("rd:menu-categories", handleCategoriesReady);

    // Watch DOM mutations so categories are populated as soon as the menu page finishes rendering
    let mutationObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== "undefined") {
      mutationObserver = new MutationObserver(() => {
        const found = discoverCategories();
        if (found && mutationObserver) {
          mutationObserver.disconnect();
          mutationObserver = null;
        }
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Polling retry fallback for client transitions across varying network/render speeds
    const pollDelays = [50, 150, 300, 600, 1200, 2500];
    const timers = pollDelays.map((delay) =>
      setTimeout(() => {
        discoverCategories();
      }, delay)
    );

    return () => {
      window.removeEventListener("rd:menu-categories", handleCategoriesReady);
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
      timers.forEach(clearTimeout);
    };
  }, [isMenuPage, discoverCategories]);

  // Track active category on scroll when categories are loaded
  useEffect(() => {
    if (!isMenuPage || categories.length === 0) return;

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

        let highestSlug = "";
        let highestRatio = -1;
        ratioMap.forEach((ratio, slug) => {
          if (ratio > highestRatio) {
            highestRatio = ratio;
            highestSlug = slug;
          }
        });

        if (highestSlug) {
          setActiveCategorySlug(highestSlug);
        }
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );

    categories.forEach((cat) => {
      const el = document.getElementById(cat.id) || document.getElementById(`menu-${cat.slug}`);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [isMenuPage, categories]);

  // Toggle category drawer and trigger immediate check if categories not yet loaded
  const handleToggleCategoryDrawer = () => {
    setIsCategoryDrawerOpen((prev) => {
      const next = !prev;
      if (next && categories.length === 0) {
        discoverCategories();
      }
      return next;
    });
  };

  // Jump to category and close collapsible
  const handleJumpToCategory = (slug: string) => {
    setIsCategoryDrawerOpen(false);
    setActiveCategorySlug(slug);
    const target = document.getElementById(`menu-${slug}`);
    if (target) {
      const yOffset = -85;
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);
  const activeCategoryLabel = activeCategory
    ? activeCategory.name
    : categories.length > 0
    ? categories[0].name
    : "Categories";

  // Hide on admin routes, or on checkout/cart (where MobileFloatingCheckout handles 1-tap actions)
  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/checkout" ||
    pathname === "/cart"
  ) {
    return null;
  }

  return (
    <aside
      className="mobile-liquid-nav-wrapper fixed bottom-3 inset-x-3 z-40 md:hidden pointer-events-none"
      aria-label="Mobile Navigation Dock"
    >
      <div className="max-w-md mx-auto pointer-events-auto flex flex-col gap-2">
        {/* ─── MENU PAGE COLLAPSIBLE CATEGORY DRAWER ─────────────────── */}
        {isMenuPage && isCategoryDrawerOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsCategoryDrawerOpen(false)}
              aria-hidden="true"
            />
            <div
              className="relative z-40 mb-1 p-4 rounded-[28px] mobile-liquid-dock shadow-2xl animate-in slide-in-from-bottom-3 duration-200 max-h-[60vh] overflow-y-auto"
              role="dialog"
              aria-label="Jump to menu category"
            >
              <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-slate-200/70">
                <div className="flex items-center gap-2">
                  <Layers size={17} className="text-amber-600" />
                  <span className="text-xs font-black text-slate-900 tracking-tight">
                    Jump to Menu Category
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCategoryDrawerOpen(false)}
                  className="p-1 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                  aria-label="Close categories"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {categories.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 font-medium">
                    Loading menu categories...
                  </div>
                ) : (
                  categories.map((cat, idx) => {
                    const isActive = activeCategorySlug === cat.slug;
                    return (
                      <button
                        key={cat.id || cat.slug}
                        type="button"
                        onClick={() => handleJumpToCategory(cat.slug)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition active:scale-[0.98] ${
                          isActive
                            ? "bg-amber-600 text-white font-black shadow-xs"
                            : "bg-white/70 hover:bg-white text-slate-800 font-bold border border-slate-200/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                              isActive
                                ? "bg-black/20 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="text-xs text-left">{cat.name}</span>
                        </div>
                        {cat.count && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${
                              isActive
                                ? "bg-amber-700/80 text-amber-100"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {cat.count}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        {/* ─── CONTEXTUAL DOCK BASED ON CURRENT PAGE ─────────────────── */}
        {isMenuPage ? (
          /* 1. MENU PAGE LIQUID DOCK */
          <nav
            className="mobile-liquid-dock flex items-center justify-between p-2 rounded-[28px] shadow-xl"
            aria-label="Menu controls"
          >
            {/* Collapsible Jump to Category Button */}
            <button
              type="button"
              onClick={handleToggleCategoryDrawer}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-[22px] transition active:scale-95 ${
                isCategoryDrawerOpen
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white/80 text-slate-900 border border-slate-200/70"
              }`}
              aria-expanded={isCategoryDrawerOpen}
              aria-label="Toggle category jump menu"
            >
              <Layers
                size={16}
                className={isCategoryDrawerOpen ? "text-white" : "text-amber-600"}
              />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500">
                  Jump to
                </span>
                <span className="text-xs font-black truncate max-w-[120px]">
                  {activeCategoryLabel}
                </span>
              </div>
              {isCategoryDrawerOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>

            <div className="flex items-center gap-1.5">
              {/* Scroll to Top */}
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="p-2.5 rounded-full bg-white/70 hover:bg-white text-slate-600 border border-slate-200/60 active:scale-90 transition"
                aria-label="Scroll to top of menu"
              >
                <ArrowUp size={16} />
              </button>

              {/* Bag Button */}
              <Link
                href="/cart"
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-[22px] transition active:scale-95 ${
                  count > 0
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white/70 text-slate-700 border border-slate-200/60"
                }`}
                aria-label={`Shopping bag with ${count} items`}
              >
                <ShoppingBag
                  size={16}
                  className={count > 0 ? "text-amber-400" : "text-slate-500"}
                />
                <span className="text-xs font-black">
                  {count > 0 ? `GH₵ ${subtotal.toFixed(2)}` : "Bag (0)"}
                </span>
                {count > 0 && (
                  <span className="min-w-4 h-4 px-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        ) : isDishDetailPage ? (
          /* 2. DISH DETAIL PAGE LIQUID DOCK */
          <nav
            className="mobile-liquid-dock flex items-center justify-between p-2 rounded-[28px] shadow-xl"
            aria-label="Dish navigation"
          >
            <Link
              href="/menu"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[22px] bg-white/80 text-slate-900 text-xs font-extrabold border border-slate-200/60 active:scale-95 transition"
            >
              <ArrowLeft size={15} />
              <span>Back to Menu</span>
            </Link>

            <Link
              href="/cart"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[22px] transition active:scale-95 ${
                count > 0 ? "bg-amber-600 text-white shadow-xs" : "bg-slate-900 text-white"
              }`}
            >
              <ShoppingBag size={16} />
              <span className="text-xs font-black">
                {count > 0 ? `Bag (${count}) · GH₵ ${subtotal.toFixed(2)}` : "View Bag"}
              </span>
            </Link>
          </nav>
        ) : isHome ? (
          /* 3. HOMEPAGE LIQUID DOCK */
          <nav
            className="mobile-liquid-dock flex items-center justify-between p-2 rounded-[28px] shadow-xl"
            aria-label="Home page quick actions"
          >
            <Link
              href="/menu"
              className="flex items-center gap-2 px-4 py-2.5 rounded-[22px] bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition active:scale-95 shadow-xs"
            >
              <UtensilsCrossed size={16} />
              <span>Explore Menu</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                const el =
                  document.getElementById("curated-picks") ||
                  document.querySelector(".mobile-bento-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-[22px] bg-white/70 hover:bg-white text-slate-800 text-xs font-bold border border-slate-200/50 transition active:scale-95"
            >
              <Sparkles size={15} className="text-amber-600" />
              <span>Today’s Picks</span>
            </button>

            <Link
              href="/cart"
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-[22px] transition active:scale-95 ${
                count > 0
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white/70 text-slate-600 border border-slate-200/50"
              }`}
            >
              <ShoppingBag
                size={16}
                className={count > 0 ? "text-amber-400" : "text-slate-500"}
              />
              <span className="text-xs font-black">{count}</span>
            </Link>
          </nav>
        ) : isCorporate ? (
          /* 4. CORPORATE PAGE LIQUID DOCK */
          <nav
            className="mobile-liquid-dock flex items-center justify-between p-2 rounded-[28px] shadow-xl"
            aria-label="Corporate lunch actions"
          >
            <Link
              href="/menu"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[22px] bg-white/80 text-slate-900 text-xs font-extrabold border border-slate-200/60 active:scale-95 transition"
            >
              <UtensilsCrossed size={15} className="text-amber-600" />
              <span>View Menu</span>
            </Link>

            <a
              href="https://wa.me/233591754764?text=Hello%20Rich-Dons%20Catering%2C%20I%20would%20like%20to%20inquire%20about%20office%20lunch%20catering."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[22px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black active:scale-95 transition shadow-xs"
            >
              <MessageCircle size={15} />
              <span>Office WhatsApp</span>
            </a>

            <Link
              href="/cart"
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-[22px] transition active:scale-95 ${
                count > 0
                  ? "bg-slate-900 text-white"
                  : "bg-white/70 text-slate-600 border border-slate-200/50"
              }`}
            >
              <ShoppingBag size={16} />
              <span className="text-xs font-black">{count}</span>
            </Link>
          </nav>
        ) : isEvents ? (
          /* 5. EVENTS PAGE LIQUID DOCK */
          <nav
            className="mobile-liquid-dock flex items-center justify-between p-2 rounded-[28px] shadow-xl"
            aria-label="Event catering actions"
          >
            <button
              type="button"
              onClick={() => {
                const el =
                  document.getElementById("events-form") ||
                  document.querySelector(".events-form") ||
                  document.querySelector("form");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[22px] bg-amber-600 hover:bg-amber-700 text-white text-xs font-black active:scale-95 transition shadow-xs"
            >
              <Calendar size={15} />
              <span>Plan Event Now</span>
            </button>

            <a
              href="https://wa.me/233591754764?text=Hello%20Rich-Dons%20Catering%2C%20I%20would%20like%20to%20inquire%20about%20event%20catering."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-[22px] bg-emerald-600 text-white text-xs font-black active:scale-95 transition shadow-xs"
            >
              <MessageCircle size={15} />
              <span>WhatsApp</span>
            </a>

            <Link
              href="/cart"
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-[22px] transition active:scale-95 ${
                count > 0
                  ? "bg-slate-900 text-white"
                  : "bg-white/70 text-slate-600 border border-slate-200/50"
              }`}
            >
              <ShoppingBag size={16} />
              <span className="text-xs font-black">{count}</span>
            </Link>
          </nav>
        ) : (
          /* 6. GENERAL FALLBACK DOCK */
          <nav
            className="mobile-liquid-dock flex items-center justify-between p-2 rounded-[28px] shadow-xl"
            aria-label="Quick actions"
          >
            <Link
              href="/menu"
              className="flex items-center gap-2 px-4 py-2.5 rounded-[22px] bg-amber-600 text-white text-xs font-black active:scale-95 transition"
            >
              <UtensilsCrossed size={16} />
              <span>Kitchen Menu</span>
            </Link>

            <Link
              href="/cart"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[22px] transition active:scale-95 ${
                count > 0 ? "bg-slate-900 text-white" : "bg-white/80 text-slate-700"
              }`}
            >
              <ShoppingBag size={16} />
              <span className="text-xs font-black">
                {count > 0 ? `Bag (${count})` : "View Bag"}
              </span>
            </Link>
          </nav>
        )}
      </div>
    </aside>
  );
}
