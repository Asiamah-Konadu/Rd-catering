'use client';

import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "./cart/CartProvider";

const navItems = [
  { href: "/menu", label: "Menu" },
  { href: "/#how-it-works", label: "How it works" },
];

export default function Header() {
  const { count } = useCart();
  const [navOpen, setNavOpen] = useState(false);

  function closeNav() {
    setNavOpen(false);
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
          <Link key={item.href} href={item.href} onClick={closeNav}>{item.label}</Link>
        ))}
        <Link href="/cart" className="cart-link" onClick={closeNav}>
          <ShoppingBag size={18} />
          <span>Cart</span>
          {count > 0 && <b>{count}</b>}
        </Link>
      </nav>
    </header>
  );
}
