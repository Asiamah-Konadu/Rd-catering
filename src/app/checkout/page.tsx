'use client';

import { useCart } from "@/components/cart/CartProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [loading,setLoading] = useState(false);
  const router = useRouter();
  const [form,setForm] = useState({name:"",phone:"",email:"",address:"",city:"Accra",notes:""});
  const delivery = items.length ? 20 : 0;
  const total = subtotal + delivery;

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,items,subtotal,deliveryFee:delivery,total})});
      if(!res.ok) throw new Error();
      const data = await res.json(); clear(); router.push(`/order/${data.orderNumber}`);
    } finally { setLoading(false); }
  }
  if(!items.length) return <main className="page narrow"><div className="empty"><h2>Your bag is empty</h2><p>Add items before checking out.</p></div></main>;
  return <main className="page narrow"><div className="page-heading"><span className="eyebrow">Checkout</span><h1>Delivery details</h1><p>We’ll use these details to prepare and deliver your order.</p></div>
    <form className="checkout" onSubmit={submit}><label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Phone<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Address<textarea required value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label><label>City<input value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></label><label>Order notes<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label><div className="checkout-total"><span>Total</span><strong>GH₵ {total.toFixed(2)}</strong></div><button className="button primary full" disabled={loading}>{loading ? "Placing order…" : "Place order"}</button></form>
  </main>;
}
