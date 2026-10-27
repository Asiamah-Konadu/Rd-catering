import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDown, ArrowRight, Clock3, MapPin } from "lucide-react";
import MenuCard from "@/components/MenuCard";
import MenuSideNav from "@/components/MenuSideNav";
import { getPublicMenu, getPublicExtras } from "@/lib/menu";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Kitchen Menu | Fresh Ghanaian Food & Office Lunch in Accra",
  description:
    "Browse Rich-Dons Catering's complete kitchen menu. Smoky Ghanaian jollof rice, waakye, swallows, light soups, chicken, beef & custom combos delivered across Accra.",
  alternates: { canonical: "/menu" },
  keywords: [
    "Ghanaian food menu",
    "jollof rice Accra",
    "food delivery menu Accra",
    "lunch menu Accra",
    "waakye Accra",
    "Ghana dishes price list",
    "Rich-Dons menu",
  ],
  openGraph: {
    title: "Our Kitchen Menu | Rich-Dons Catering Accra",
    description:
      "Browse fresh Ghanaian favourites and custom combos. Delivery available across Accra.",
    url: "/menu",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Kitchen Menu | Rich-Dons Catering Accra",
    description:
      "Browse fresh Ghanaian favourites and custom combos. Delivery available across Accra.",
  },
};

export default async function MenuPage() {
  const [categories, extras] = await Promise.all([
    getPublicMenu(),
    getPublicExtras(),
  ]);
  const dishCount = categories.reduce((total, category) => total + category.items.length, 0);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rd-catering.vercel.app";

  const menuSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Our Menu",
            item: `${siteUrl}/menu`,
          },
        ],
      },
      {
        "@type": "Menu",
        "@id": `${siteUrl}/menu#full-menu`,
        name: "Rich-Dons Catering Kitchen Menu",
        url: `${siteUrl}/menu`,
        inLanguage: "en-GH",
        hasMenuSection: categories.map((cat) => ({
          "@type": "MenuSection",
          name: cat.name,
          hasMenuItem: cat.items.map((item) => ({
            "@type": "MenuItem",
            name: item.name,
            description: item.description ?? undefined,
            offers: {
              "@type": "Offer",
              price: item.price.toFixed(2),
              priceCurrency: "GHS",
              availability: item.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            },
          })),
        })),
      },
    ],
  };

  return (
    <main className="page menu-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema) }}
      />
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
          <div className="menu-results-heading" id="menu-categories">
            <div>
              <span className="menu-eyebrow">Fresh from our kitchen</span>
              <h2>What sounds good?</h2>
            </div>
            <span className="menu-dish-count">{String(dishCount).padStart(2, "0")} dishes to choose from</span>
          </div>

          <div className="menu-body-layout">
            {/* Sticky left side nav */}
            <MenuSideNav categories={categories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))} />

            {/* Main scrollable content */}
            <div className="menu-content-area">
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
            </div>
          </div>
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
