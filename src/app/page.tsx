import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Clock3, MapPin, MessageCircle } from "lucide-react";
import MenuCard from "@/components/MenuCard";
import MobileBagBar from "@/components/MobileBagBar";
import { getPublicMenu } from "@/lib/menu";
import { getActiveHeroPromo } from "@/lib/promo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fresh Ghanaian Food Delivered in Accra",
  description:
    "Order fresh Ghanaian favourites from Rich-Dons Catering. Browse the menu and place your order for delivery in Accra.",
};

export default async function Home() {
  const [categories, heroPromo] = await Promise.all([
    getPublicMenu(),
    getActiveHeroPromo(),
  ]);
  const featuredItem = categories.flatMap((category) => category.items).find((item) => item.isFeatured);

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
            <span>Orders open 9am · close 10pm</span>
            <span className="home-note-divider" />
            <span>Confirm and pay in WhatsApp</span>
          </div>
        </div>

        <div className="home-hero-photo">
          {heroPromo ? (
            <>
              {heroPromo.imageUrl.startsWith("http") ? (
                <img
                  src={heroPromo.imageUrl}
                  alt={heroPromo.title}
                  className="home-hero-promo-img"
                />
              ) : (
                <Image
                  src={heroPromo.imageUrl}
                  alt={heroPromo.title}
                  fill
                  priority
                  sizes="(max-width: 760px) 100vw, 52vw"
                />
              )}
              {heroPromo.linkUrl ? (
                <Link
                  href={heroPromo.linkUrl}
                  className="home-hero-promo-overlay-link"
                  aria-label={`Order ${heroPromo.title}`}
                >
                  <div className="home-photo-label home-photo-label-promo">
                    <span>{heroPromo.subtitle}</span>
                    <strong>{heroPromo.title}</strong>
                    {heroPromo.price ? (
                      <span className="home-promo-price-tag">
                        GH₵ {heroPromo.price.toFixed(2)}
                      </span>
                    ) : null}
                  </div>
                  <div className="home-photo-index home-photo-index-promo" aria-hidden="true">
                    {heroPromo.badgeText}
                  </div>
                </Link>
              ) : (
                <>
                  <div className="home-photo-label home-photo-label-promo">
                    <span>{heroPromo.subtitle}</span>
                    <strong>{heroPromo.title}</strong>
                    {heroPromo.price ? (
                      <span className="home-promo-price-tag">
                        GH₵ {heroPromo.price.toFixed(2)}
                      </span>
                    ) : null}
                  </div>
                  <div className="home-photo-index home-photo-index-promo" aria-hidden="true">
                    {heroPromo.badgeText}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <Image
                src="/coming-soon/jolof.avif"
                alt="Fresh Ghanaian Jollof rice from Rich-Dons Catering"
                fill
                priority
                sizes="(max-width: 760px) 100vw, 52vw"
              />
              <div className="home-photo-label">
                <span>From our kitchen</span>
                <strong>Ghanaian Jollof rice</strong>
              </div>
              <div className="home-photo-index" aria-hidden="true">01 / GH</div>
            </>
          )}
        </div>
      </section>

      <section className="home-trust" aria-label="Ordering details">
        <div><MapPin size={17} aria-hidden="true" /><span>Accra delivery</span></div>
        <div><Clock3 size={17} aria-hidden="true" /><span>Made fresh to order</span></div>
        <div><MessageCircle size={17} aria-hidden="true" /><span>WhatsApp order confirmation</span></div>
      </section>

      {featuredItem && (
        <section className="home-pick" aria-label="Featured dish">
          <div className="home-pick-image">
            {featuredItem.imageUrl ? (
              <img src={featuredItem.imageUrl} alt={featuredItem.name} />
            ) : (
              <Image
                src="/coming-soon/jolof.avif"
                alt="A Rich-Dons Catering Ghanaian dish"
                fill
                sizes="112px"
              />
            )}
          </div>
          <div className="home-pick-copy">
            <span className="home-kicker">From the kitchen · Featured</span>
            <h2>{featuredItem.name}</h2>
            <p>{featuredItem.description || "A Rich-Dons favourite, prepared fresh to order."}</p>
          </div>
          <strong className="home-pick-price">GH₵ {featuredItem.price.toFixed(2)}</strong>
          <Link href={`/menu/${featuredItem.slug}`} aria-label={`View ${featuredItem.name}`}>
            View dish <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      )}

      <section className="home-delivery-note" aria-label="Delivery information">
        <div>
          <span className="home-kicker">Good to know</span>
          <h2>Fresh food, delivered around Accra.</h2>
        </div>
        <p>Standard delivery is GH₵ 20. Registered office orders may qualify for free delivery and group discounts.</p>
        <Link href="/corporate">Explore office ordering <ArrowRight size={16} aria-hidden="true" /></Link>
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

      <section className="home-how" id="how-to-order">
        <div className="home-how-heading">
          <span className="home-kicker">Simple from start to finish</span>
          <h2>Your order, in three steps.</h2>
        </div>
        <div className="home-how-steps">
          <article><span>01</span><h3>Choose your dishes</h3><p>Browse the menu and add your favourites to the bag.</p></article>
          <article><span>02</span><h3>Review your order</h3><p>Check quantities, delivery details, and the total.</p></article>
          <article><span>03</span><h3>Confirm in WhatsApp</h3><p>Send the prepared order message and confirm availability and payment with us.</p></article>
        </div>
      </section>

      <footer className="home-footer">
        <Link href="/" className="home-footer-brand">Rich-Dons <span>Catering</span></Link>
        <p>Fresh Ghanaian favourites, made to order in Accra.</p>
        <nav aria-label="Footer navigation">
          <Link href="#today-menu">Menu</Link>
          <Link href="/events">Event catering</Link>
          <Link href="/corporate">Office catering</Link>
          <Link href="/cart">Your bag</Link>
        </nav>
        <small>© {new Date().getFullYear()} Rich-Dons Catering</small>
      </footer>
      <MobileBagBar />
    </main>
  );
}
