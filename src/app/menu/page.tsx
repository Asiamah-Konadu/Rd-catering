import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDown, ArrowRight, Clock3, MapPin } from "lucide-react";
import MenuCard from "@/components/MenuCard";
import { getPublicMenu, getPublicExtras } from "@/lib/menu";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Menu",
  description:
    "Browse Rich-Dons Catering's full menu of fresh Ghanaian dishes. From jollof rice to soups, order your favourites for delivery in Accra.",
  alternates: { canonical: "/menu" },
  openGraph: {
    title: "Our Menu | Rich-Dons Catering",
    description:
      "Browse fresh Ghanaian dishes and add your favourites to your bag. Delivery available in Accra.",
    url: "/menu",
  },
};

export default async function MenuPage() {
  const [categories, extras] = await Promise.all([
    getPublicMenu(),
    getPublicExtras(),
  ]);
  const dishCount = categories.reduce((total, category) => total + category.items.length, 0);

  return (
    <main className="page menu-page">
      <section className="menu-hero">
        <div className="menu-hero-copy">
          <span className="menu-eyebrow"><span /> Rich-Dons Catering · Accra</span>
          <h1>Made for<br /><em>your kind</em> of hungry.</h1>
          <p>Ghanaian favourites, freshly prepared and ready for your table.</p>
          <a className="menu-hero-cta" href="#menu-categories">
            Find your next favourite <ArrowDown size={17} aria-hidden="true" />
          </a>
          <div className="menu-service-details">
            <span><Clock3 size={16} aria-hidden="true" /> Orders 9am–10pm</span>
            <span><MapPin size={16} aria-hidden="true" /> Delivered around Accra</span>
          </div>
        </div>
        <div className="menu-hero-image">
          <Image
            src="/coming-soon/jolof.avif"
            alt="A freshly prepared plate of Ghanaian Jollof rice"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 48vw"
          />
          <span className="menu-image-caption">A little taste of home <ArrowRight size={15} aria-hidden="true" /></span>
        </div>
      </section>

      {categories.length ? (
        <>
          <nav className="menu-category-nav" id="menu-categories" aria-label="Menu categories">
            <span className="menu-nav-label">Jump to</span>
            {categories.map((category, index) => (
              <a key={category.id} href={`#menu-${category.slug}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {category.name}
                <ArrowDown size={14} aria-hidden="true" />
              </a>
            ))}
          </nav>

          <div className="menu-results-heading">
            <div>
              <span className="menu-eyebrow">Fresh from our kitchen</span>
              <h2>What sounds good?</h2>
            </div>
            <span className="menu-dish-count">{String(dishCount).padStart(2, "0")} dishes to choose from</span>
          </div>

          {categories.map((category, index) => (
            <section className="menu-category-section" id={`menu-${category.slug}`} key={category.id}>
              <div className="menu-category-heading">
                <span>{String(index + 1).padStart(2, "0")} / MENU CATEGORY</span>
                <h2>{category.name}</h2>
                <span>{String(category.items.length).padStart(2, "0")} dishes</span>
              </div>
              <div className="menu-grid">
                {category.items.map(item => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    availableExtras={extras}
                  />
                ))}
              </div>
            </section>
          ))}
        </>
      ) : (
        <div className="menu-empty-state">
          <span className="menu-eyebrow">A little kitchen magic in progress</span>
          <h2>Today&apos;s menu is being prepared.</h2>
          <p>Check back soon to see what&apos;s fresh from our kitchen.</p>
        </div>
      )}
    </main>
  );
}
