'use client';

import Link from "next/link";
import { Menu, X, Gift } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/corporate", label: "Office Portals" },
  { href: "/#waitlist", label: "Join Waitlist" },
  { href: "/#sneak-peek", label: "Sneak Peek Menu" },
  { href: "/#about-launch", label: "Accra Launch" },
];

export default function Header() {
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
          <Link key={item.href} href={item.href} onClick={closeNav}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/#waitlist"
          onClick={closeNav}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-sm transition"
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Free Delivery Code</span>
        </Link>
      </div>
    </header>
  );
}
