'use client';

import { useCart } from "@/components/cart/CartProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [loading,setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [form,setForm] = useState({name:"",phone:"",email:"",address:"",city:"Accra",region:"",notes:""});
  const delivery = items.length ? 20 : 0;
  const total = subtotal + delivery;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...form,items:items.map(item => ({ id: item.id, quantity: item.quantity }))})
      });
      const data: unknown = await res.json();
      if (!res.ok) {
        const message = data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error
          : "Unable to place your order. Please try again.";
        throw new Error(message);
      }
      if (!data || typeof data !== "object" || !("orderNumber" in data) || typeof data.orderNumber !== "string") {
        throw new Error("The order was created, but its confirmation could not be opened.");
      }
      clear();
      router.push(`/order/${data.orderNumber}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to place your order. Please try again.");
      setLoading(false);
    }
  }
  if(!items.length) return <main className="page narrow"><div className="empty"><h2>Your bag is empty</h2><p>Add items before checking out.</p></div></main>;
  return <main className="page narrow"><div className="page-heading"><span className="eyebrow">Checkout</span><h1>Delivery details</h1><p>We’ll use these details to prepare and deliver your order.</p></div>
    <form className="checkout" onSubmit={submit} aria-busy={loading}>
      <label>Name<input required maxLength={100} autoComplete="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
      <label>Phone<input required maxLength={30} autoComplete="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
      <label>Email <span className="field-hint">(optional)</span><input type="email" maxLength={150} autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label>Address<textarea required maxLength={300} autoComplete="street-address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label>
      <label>City<input required maxLength={100} autoComplete="address-level2" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></label>
      <label>Region <span className="field-hint">(optional)</span><input maxLength={100} autoComplete="address-level1" value={form.region} onChange={e=>setForm({...form,region:e.target.value})}/></label>
      <label>Order notes <span className="field-hint">(optional)</span><textarea maxLength={500} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="checkout-total"><span>Total</span><strong>GH₵ {total.toFixed(2)}</strong></div>
      <button className="button primary full" disabled={loading}>{loading ? "Placing order..." : "Place order"}</button>
    </form>
  </main>;
}
