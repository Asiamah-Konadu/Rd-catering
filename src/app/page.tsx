import Link from "next/link";
import { ArrowRight, Clock3, MapPin, ShieldCheck } from "lucide-react";
import MenuCard from "@/components/MenuCard";
import { getFeaturedMenu } from "@/lib/menu";

export const dynamic = "force-dynamic";

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 1000,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return withRetry(fn, retries - 1, delayMs);
  }
}

export default async function Home() {
  const featuredMenu = await withRetry(() => getFeaturedMenu());
  return <>
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Freshly prepared • Ghana</span>
          <h1>Good food.<br/><em>Right on time.</em></h1>
          <p>Order delicious meals from RD Catering for lunch, meetings, family moments and everyday cravings.</p>
          <div className="actions"><Link className="button primary" href="/menu">Explore the menu <ArrowRight size={18}/></Link><Link className="button ghost" href="/#how-it-works">How it works</Link></div>
        </div>
        <div className="hero-card"><div className="plate">RD</div><span>Today’s kitchen pick</span><strong>Jollof Rice & Chicken</strong><small>From GH₵ 65</small></div>
      </section>

      <section className="trust-strip"><div><Clock3/> Reliable preparation</div><div><MapPin/> Delivery-ready</div><div><ShieldCheck/> Secure ordering</div></section>

      <section className="section" id="featured">
        <div className="section-heading"><div><span className="eyebrow">Popular today</span><h2>Customer favourites</h2></div><Link href="/menu">View full menu <ArrowRight size={17}/></Link></div>
        <div className="menu-grid">{featuredMenu.length ? featuredMenu.map(x => <MenuCard key={x.id} item={x}/>) : <div className="empty"><h3>New favourites are on the way</h3><p>Browse the full menu for today&apos;s availability.</p></div>}</div>
      </section>

      <section className="how section" id="how-it-works">
        <span className="eyebrow">Simple by design</span><h2>From craving to doorstep.</h2>
        <div className="steps"><div><b>01</b><h3>Choose</h3><p>Pick your meal, combo or extras.</p></div><div><b>02</b><h3>Checkout</h3><p>Tell us where and when to deliver.</p></div><div><b>03</b><h3>Enjoy</h3><p>We prepare it and get it moving.</p></div></div>
      </section>
    </main>
    <footer><strong>RD Catering</strong><span>Fresh food. Thoughtfully delivered.</span></footer>
  </>;
}
