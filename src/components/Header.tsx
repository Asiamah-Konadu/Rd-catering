'use client';

import Link from "next/link";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";

const navItems = [
  { href: "/menu", label: "Our Menu" },
  { href: "/corporate", label: "Office Portals" },
];

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();
  const { count } = useCart();

  function closeNav() {
    setNavOpen(false);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }

  return (
    <header className="site-header">
      <Link href="/" className="brand" onClick={closeNav}>
        <img className="brand-logo" src="/logo.svg" alt="Rich-Dons Catering" />
        <span className="brand-wordmark" aria-label="Rich-Dons Catering">
          <span className="brand-name">Rich-Dons</span>
          <span className="brand-service">Catering</span>
        </span>
      </Link>

      <button
        type="button"
        className="nav-toggle"
        aria-label={navOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={navOpen}
        aria-controls="site-navigation"
        onClick={() => setNavOpen((open) => !open)}
      >
        {navOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <nav id="site-navigation" className={navOpen ? "open" : ""}>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={closeNav}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/cart"
          onClick={closeNav}
          className="cart-link inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-sm transition"
          aria-label={`Your bag, ${count} item${count === 1 ? "" : "s"}`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Your Bag</span>
          <b aria-hidden="true">{count}</b>
        </Link>
      </div>
    </header>
  );
}
