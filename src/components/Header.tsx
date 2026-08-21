'use client';

import Link from "next/link";
import { ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useCart } from "./cart/CartProvider";

export default function Header() {
  const { count } = useCart();
  return (
    <header className="site-header">
      <Link href="/" className="brand"><span className="brand-mark"><UtensilsCrossed size={19}/></span> RD Catering</Link>
      <nav>
        <Link href="/menu">Menu</Link>
        <Link href="/#how-it-works">How it works</Link>
        <Link href="/admin">Admin</Link>
        <Link href="/cart" className="cart-link"><ShoppingBag size={18}/> Cart {count > 0 && <b>{count}</b>}</Link>
      </nav>
    </header>
  );
}
