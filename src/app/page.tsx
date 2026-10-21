import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Clock3, MapPin, MessageCircle } from "lucide-react";
import MenuCard from "@/components/MenuCard";
import { getPublicMenu } from "@/lib/menu";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fresh Ghanaian Food Delivered in Accra",
  description:
    "Order fresh Ghanaian favourites from Rich-Dons Catering. Browse the menu and place your order for delivery in Accra.",
};

export default async function Home() {
  const categories = await getPublicMenu();

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-kicker"><span /> Fresh from our kitchen · Accra</span>
          <h1>Ghanaian food<br />with <em>heart.</em></h1>
          <p>Slow down for the food you love. Order a Ghanaian favourite, made fresh and delivered to your door.</p>
          <div className="home-actions">
            <a className="home-primary" href="#today-menu">
              Explore the menu <ArrowDown size={17} aria-hidden="true" />
            </a>
            <Link className="home-secondary" href="/corporate">
              Office catering <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="home-open-note">
            <span className="home-open-dot" />
            <span>Taking orders now</span>
            <span className="home-note-divider" />
            <span>Confirm and pay in WhatsApp</span>
          </div>
        </div>

        <div className="home-hero-photo">
          <Image
            src="/coming-soon/banku-and-tilapia.jpg"
            alt="Charcoal-grilled tilapia served with banku, pepper, onions, and fresh vegetables"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 52vw"
          />
          <div className="home-photo-label">
            <span>From our kitchen</span>
            <strong>Banku &amp; grilled tilapia</strong>
          </div>
          <div className="home-photo-index" aria-hidden="true">01 / GH</div>
        </div>
      </section>

      <section className="home-trust" aria-label="Ordering details">
        <div><MapPin size={17} aria-hidden="true" /><span>Accra delivery</span></div>
        <div><Clock3 size={17} aria-hidden="true" /><span>Made fresh to order</span></div>
        <div><MessageCircle size={17} aria-hidden="true" /><span>WhatsApp order confirmation</span></div>
      </section>

      <section className="home-menu" id="today-menu">
        <div className="home-menu-intro">
          <div>
            <span className="home-kicker">Good food, no fuss</span>
            <h2>What sounds good?</h2>
          </div>
          {categories.length > 1 && (
            <nav className="home-category-nav" aria-label="Jump to a menu category">
              {categories.map((category) => (
                <a key={category.id} href={`#category-${category.slug}`}>
                  {category.name}
                </a>
              ))}
            </nav>
          )}
        </div>

        {categories.length ? categories.map((category) => (
          <section className="home-category" id={`category-${category.slug}`} key={category.id}>
            <div className="home-category-heading">
              <h3>{category.name}</h3>
              <span>{String(category.items.length).padStart(2, "0")} dishes</span>
            </div>
            <div className="menu-grid">
              {category.items.map((item) => <MenuCard key={item.id} item={item} />)}
            </div>
          </section>
        )) : (
          <div className="home-menu-empty">
            <h3>Today&apos;s menu is being refreshed</h3>
            <p>Check back shortly for the dishes available from our kitchen.</p>
          </div>
        )}
      </section>
    </main>
  );
}
