import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Clock3, MapPin, MessageCircle } from "lucide-react";
import FoodWebGLShowcase from "@/components/FoodWebGLShowcase";
import HomepageWebGLBackground from "@/components/HomepageWebGLBackground";
import MobileBagBar from "@/components/MobileBagBar";
import ThisWeekDishesCarousel from "@/components/ThisWeekDishesCarousel";
import HowToOrderLaunchReveal from "@/components/HowToOrderLaunchReveal";
import { getPublicMenu, getWeeklyMenuItems } from "@/lib/menu";
import { getActiveHeroPromo } from "@/lib/promo";
import { getSiteSettings } from "@/lib/settings";
import { getShowcaseConfig } from "@/lib/showcase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rich-Dons Catering | Fresh Ghanaian Food & Office Lunch Delivery Accra",
  description:
    "Order authentic Ghanaian food from Rich-Dons Catering. Smoky jollof rice, waakye, swallows & soups freshly prepared and delivered across Accra. Direct WhatsApp ordering & corporate lunch portals.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "Ghanaian food delivery Accra",
    "catering Accra",
    "best jollof rice delivery",
    "office lunch Accra",
    "corporate catering Ghana",
    "Rich-Dons Catering",
    "waakye delivery",
    "Accra food ordering",
    "event catering Accra",
  ],
  openGraph: {
    title: "Rich-Dons Catering | Fresh Ghanaian Food Delivered in Accra",
    description:
      "Authentic Ghanaian cuisine cooked fresh to order. Fast doorstep delivery in Accra. Browse the menu and order on WhatsApp.",
    url: "/",
    siteName: "Rich-Dons Catering",
    locale: "en_GH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rich-Dons Catering | Fresh Ghanaian Food Delivered in Accra",
    description:
      "Authentic Ghanaian cuisine cooked fresh to order. Fast doorstep delivery in Accra.",
  },
};

export default async function Home() {
  const [categories, heroPromo, siteSettings, weeklyMenuItems, showcaseConfig] = await Promise.all([
    getPublicMenu(),
    getActiveHeroPromo(),
    getSiteSettings(),
    getWeeklyMenuItems(),
    getShowcaseConfig(),
  ]);
  const allDishes = categories.flatMap((category) => category.items);
  const featuredItem = allDishes.find((item) => item.isFeatured);
  const carouselDishes = weeklyMenuItems && weeklyMenuItems.length > 0 ? weeklyMenuItems : allDishes;

  return (
    <main className="home-page">
      <HomepageWebGLBackground />
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-kicker"><span /> Fresh from our kitchen · Accra</span>
          <h1>Ghanaian food<br />with <em>heart.</em></h1>
          <p>Slow down for the food you love. Order a Ghanaian favourite, made fresh and delivered to your door.</p>
          <div className="home-actions">
            <Link className="home-primary" href="/menu">
              Explore the menu <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="home-secondary" href="/corporate">
              Office catering <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="home-open-note">
            <span className="home-open-dot" />
            <span>{siteSettings.businessHoursText}</span>
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

      <ThisWeekDishesCarousel items={carouselDishes} />

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
        <p>{siteSettings.deliveryFeeText}. {siteSettings.deliveryNoteText}</p>
        <Link href="/corporate">Explore office ordering <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>

      <FoodWebGLShowcase config={showcaseConfig} />

      <HowToOrderLaunchReveal />

      <MobileBagBar />
    </main>
  );
}
