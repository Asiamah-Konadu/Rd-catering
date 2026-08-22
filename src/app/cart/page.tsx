'use client';

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

export default function CartPage() {
  const { items, subtotal, setQuantity, remove, clear } = useCart();
  const delivery = items.length ? 20 : 0;
  const total = subtotal + delivery;
  return <main className="page narrow"><div className="page-heading"><span className="eyebrow">Your order</span><h1>Shopping bag</h1></div>
    {!items.length ? <div className="empty"><h2>Your bag is empty</h2><p>Add something delicious from the menu.</p><Link className="button primary" href="/menu">Browse menu</Link></div> :
    <div className="cart-layout"><div className="cart-list">{items.map(x => <div className="cart-row" key={x.id}><div><strong>{x.name}</strong><span>GH₵ {x.price.toFixed(2)} each</span></div><div className="qty"><button type="button" aria-label={`Decrease ${x.name} quantity`} onClick={() => setQuantity(x.id,x.quantity-1)}><Minus size={15}/></button><b aria-label={`${x.quantity} ${x.name}`}>{x.quantity}</b><button type="button" aria-label={`Increase ${x.name} quantity`} onClick={() => setQuantity(x.id,x.quantity+1)}><Plus size={15}/></button></div><strong>GH₵ {(x.price*x.quantity).toFixed(2)}</strong><button type="button" className="icon-btn" aria-label={`Remove ${x.name}`} onClick={() => remove(x.id)}><Trash2 size={17}/></button></div>)}<button type="button" className="button ghost clear-cart" onClick={clear}>Clear bag</button></div>
      <aside className="summary"><h2>Summary</h2><p><span>Subtotal</span><b>GH₵ {subtotal.toFixed(2)}</b></p><p><span>Delivery</span><b>GH₵ {delivery.toFixed(2)}</b></p><hr/><p className="total"><span>Total</span><b>GH₵ {total.toFixed(2)}</b></p><Link className="button primary full" href="/checkout">Checkout</Link></aside>
    </div>}
  </main>;
}
