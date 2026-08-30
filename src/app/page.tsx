import Link from "next/link";
import { ArrowRight, Clock3, MapPin, ShieldCheck } from "lucide-react";
import MenuCard from "@/components/MenuCard";
import DailyPickCard from "@/components/DailyPickCard";
import { getFeaturedMenu, getDailyPick } from "@/lib/menu";

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
  const [featuredMenu, dailyPick] = await Promise.all([
    withRetry(() => getFeaturedMenu()),
    withRetry(() => getDailyPick()),
  ]);
  return <>
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Freshly prepared • Ghana</span>
          <h1>Catering that feels <em>ready for the moment.</em></h1>
          <p>Order generous Ghanaian favourites for lunch, office meetings, family gatherings and everyday cravings. Rich-Dons Catering keeps the food fresh, clear and on time.</p>
          <div className="hero-highlights" aria-label="Service highlights">
            <span>Same-day favourites</span>
            <span>Office & family trays</span>
            <span>Accra delivery</span>
          </div>
          <div className="actions">
            <Link className="button primary" href="/menu">Explore the menu <ArrowRight size={18}/></Link>
            <Link className="button ghost" href="/#featured">See favourites</Link>
          </div>
        </div>
        <DailyPickCard item={dailyPick} />
      </section>

      <section className="trust-strip">
        <div><Clock3/> Reliable preparation</div>
        <div><MapPin/> Delivery-ready in Accra</div>
        <div><ShieldCheck/> Secure ordering</div>
      </section>

      <section className="section" id="featured">
        <div className="section-heading"><div><span className="eyebrow">Popular today</span><h2>Customer favourites</h2></div><Link href="/menu">View full menu <ArrowRight size={17}/></Link></div>
        <div className="menu-grid">{featuredMenu.length ? featuredMenu.map(x => <MenuCard key={x.id} item={x}/>) : <div className="empty"><h3>New favourites are on the way</h3><p>Browse the full menu for today&apos;s availability.</p></div>}</div>
      </section>

      <section className="how section" id="how-it-works">
        <span className="eyebrow">Simple by design</span><h2>From craving to doorstep.</h2>
        <div className="steps">
          <div><b>01</b><h3>Choose</h3><p>Pick your meal, combo or extras from the live menu.</p></div>
          <div><b>02</b><h3>Checkout</h3><p>Share delivery details and review the order before it goes in.</p></div>
          <div><b>03</b><h3>Enjoy</h3><p>Rich-Dons Catering prepares it fresh and gets it moving.</p></div>
        </div>
      </section>
    </main>
    <footer><strong>Rich-Dons Catering</strong><span>Fresh food. Thoughtfully delivered.</span></footer>
  </>;
}
