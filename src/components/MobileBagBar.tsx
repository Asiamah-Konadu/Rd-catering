"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

export default function MobileBagBar() {
  const { count, subtotal } = useCart();

  if (count === 0) return null;

  return (
    <div className="mobile-bag-bar">
      <Link href="/cart" aria-label={`Review ${count} items in your bag`}>
        <span className="mobile-bag-icon"><ShoppingBag size={18} aria-hidden="true" /></span>
        <span className="mobile-bag-copy">
          <strong>{count} item{count === 1 ? "" : "s"} in your bag</strong>
          <span>GH₵ {subtotal.toFixed(2)} subtotal</span>
        </span>
        <span className="mobile-bag-action">Review bag <ArrowRight size={16} aria-hidden="true" /></span>
      </Link>
    </div>
  );
}