'use client';

import Link from "next/link";
import Image from "next/image";
import { Menu, X, ShoppingBag, Utensils, CalendarDays, Building2, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";

interface NavItem {
  href: string;
  label: string;
  badge?: string;
  desc: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/menu",
    label: "Our Menu",
    desc: "Smoky Jollof, Waakye & Daily Chef Pots",
    icon: <Utensils size={16} aria-hidden="true" />,
  },
  {
    href: "/events",
    label: "Event Catering",
    badge: "Popular",
    desc: "Weddings, Celebrations & Large Buffets",
    icon: <CalendarDays size={16} aria-hidden="true" />,
  },
  {
    href: "/corporate",
    label: "Office Portals",
    badge: "B2B",
    desc: "Team Lunches & Scheduled Office Accounts",
    icon: <Building2 size={16} aria-hidden="true" />,
  },
];

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { count } = useCart();

  const navRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pillStyle, setPillStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const closeNav = useCallback(() => {
    setNavOpen(false);
  }, []);

  // Handle scroll state for floating elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && navOpen) {
        closeNav();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navOpen, closeNav]);

  // Determine current active item index based on pathname
  const activeIndex = navItems.findIndex((item) => {
    if (pathname === item.href) return true;
    if (item.href !== "/" && pathname.startsWith(item.href)) return true;
    return false;
  });

  // Calculate sliding pill indicator position
  const updatePill = useCallback(() => {
    const targetIdx = hoveredIndex !== null ? hoveredIndex : activeIndex;
    if (targetIdx >= 0 && itemsRef.current[targetIdx] && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = itemsRef.current[targetIdx]!.getBoundingClientRect();
      setPillStyle({
        left: itemRect.left - navRect.left,
        width: itemRect.width,
        opacity: 1,
      });
    } else {
      setPillStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [hoveredIndex, activeIndex]);

  useEffect(() => {
    updatePill();
    const handleResize = () => updatePill();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updatePill]);

  // CrazyGL dynamic mouse spotlight tracking inside the dock
  const handleNavPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    navRef.current.style.setProperty("--nav-spot-x", `${x}px`);
    navRef.current.style.setProperty("--nav-spot-y", `${y}px`);
  };

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }

  return (
    <div className={`pillflow-nav-shell ${isScrolled ? "is-scrolled" : ""}`}>
      <header className="site-header pillflow-bar">
        {/* Brand & live kitchen indicator */}
        <div className="pillflow-brand-group">
          <Link href="/" className="brand" onClick={closeNav} aria-label="Rich-Dons Catering Homepage">
            <div className="brand-logo-frame">
              <Image className="brand-logo" src="/logo.svg" alt="Rich-Dons logo" width={24} height={24} priority />
            </div>
            <span className="brand-wordmark" aria-label="Rich-Dons Catering">
              <span className="brand-name">Rich-Dons</span>
              <span className="brand-service">Catering</span>
            </span>
          </Link>
          <div className="pillflow-live-status" title="Kitchen dispatching fresh orders now across Accra">
            <span className="live-status-ping" aria-hidden="true" />
            <span className="live-status-text">Accra Kitchen Open</span>
          </div>
        </div>

        {/* CrazyGL Pillflow Sliding Dock (Desktop) */}
        <nav
          id="site-navigation"
          ref={navRef}
          className="pillflow-dock"
          onPointerMove={handleNavPointerMove}
          onPointerLeave={() => setHoveredIndex(null)}
          onMouseLeave={() => setHoveredIndex(null)}
          aria-label="Main Navigation"
        >
          <div
            className="pillflow-indicator"
            style={{
              transform: `translateX(${pillStyle.left}px)`,
              width: `${pillStyle.width}px`,
              opacity: pillStyle.opacity,
            }}
            aria-hidden="true"
          />
          {navItems.map((item, idx) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                ref={(el) => {
                  itemsRef.current[idx] = el;
                }}
                onPointerEnter={() => setHoveredIndex(idx)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onFocus={() => setHoveredIndex(idx)}
                onBlur={() => setHoveredIndex(null)}
                onClick={closeNav}
                className={`pillflow-link ${isActive ? "is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="pillflow-link-label">{item.label}</span>
                {item.badge && <span className="pillflow-item-badge">{item.badge}</span>}
              </Link>
            );
          })}
        </nav>

        <Link href="/menu" className="mobile-nav-title" onClick={closeNav}>
          Our Menu
        </Link>

        {/* Action Area: Magnetic Bag Button & Mobile Nav Toggle */}
        <div className="pillflow-actions">
          <Link
            href="/cart"
            onClick={closeNav}
            className="cart-link pillflow-bag-btn"
            aria-label={`Your bag, ${count} item${count === 1 ? "" : "s"}`}
          >
            <span className="bag-icon-wrap" aria-hidden="true">
              <ShoppingBag className="w-3.5 h-3.5" />
            </span>
            <span className="bag-label">Your Bag</span>
            <b aria-hidden="true" className={count > 0 ? "has-items" : ""}>{count}</b>
          </Link>

          <button
            type="button"
            className="nav-toggle pillflow-toggle"
            aria-label={navOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={navOpen}
            aria-controls="mobile-navigation"
            onClick={() => setNavOpen((open) => !open)}
          >
            {navOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Glass Sheet / Dropdown Drawer */}
      {navOpen && (
        <div className="pillflow-mobile-backdrop" onClick={closeNav} aria-hidden="true" />
      )}
      <div
        id="mobile-navigation"
        className={`pillflow-mobile-drawer ${navOpen ? "is-open" : ""}`}
        aria-hidden={!navOpen}
      >
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-status">
            <span className="live-status-ping" aria-hidden="true" />
            <span>Accra Kitchen · Live Dispatch</span>
          </div>
        </div>

        <div className="mobile-drawer-links">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeNav}
                className={`mobile-nav-card ${isActive ? "is-active" : ""}`}
              >
                <div className="mobile-card-icon">{item.icon}</div>
                <div className="mobile-card-content">
                  <div className="mobile-card-title-row">
                    <span className="mobile-card-title">{item.label}</span>
                    {item.badge && <span className="mobile-card-badge">{item.badge}</span>}
                  </div>
                  {item.desc && <span className="mobile-card-desc">{item.desc}</span>}
                </div>
                <ChevronRight size={16} className="mobile-card-arrow" aria-hidden="true" />
              </Link>
            );
          })}
        </div>

        <div className="mobile-drawer-footer">
          <Link
            href="/cart"
            onClick={closeNav}
            className="mobile-cart-cta"
          >
            <ShoppingBag size={17} />
            <span>View Bag ({count} {count === 1 ? "item" : "items"})</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
