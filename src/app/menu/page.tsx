import type { Metadata } from "next";
import { getPublicCombos, getPublicExtras, getPublicMenu } from "@/lib/menu";
import { SITE_URL } from "@/lib/site-url";
import { WeeklyMenuClient } from "./WeeklyMenuClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "This Week's Menu | Fresh Ghanaian Food & Office Lunch in Accra",
  description:
    "Browse Rich-Dons Catering's fixed weekly kitchen menu. Smoky Ghanaian jollof rice, waakye, swallows, light soups, chicken, beef & custom combos delivered across Accra.",
  alternates: { canonical: "/menu" },
  keywords: [
    "Ghanaian food menu",
    "weekly menu Accra",
    "jollof rice Accra",
    "food delivery menu Accra",
    "lunch menu Accra",
    "waakye Accra",
    "Ghana dishes price list",
    "Rich-Dons menu",
  ],
  openGraph: {
    title: "This Week's Menu in Accra | Rich-Dons Catering",
    description:
      "Browse fresh Ghanaian favourites and custom combos. Delivery available across Accra.",
    url: "/menu",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "This Week's Menu | Rich-Dons Catering Accra",
    description:
      "Browse fresh Ghanaian favourites and custom combos. Delivery available across Accra.",
  },
};

export default async function MenuPage() {
  const [categories, extras, combos] = await Promise.all([
    getPublicMenu(),
    getPublicExtras(),
    getPublicCombos(),
  ]);

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
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "This Week's Menu",
            item: `${SITE_URL}/menu`,
          },
        ],
      },
      {
        "@type": "Menu",
        "@id": `${SITE_URL}/menu#full-menu`,
        name: "Rich-Dons Catering Weekly Menu",
        url: `${SITE_URL}/menu`,
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
              availability: item.isAvailable
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
          })),
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema) }}
      />
      {categories.length ? (
        <WeeklyMenuClient categories={categories} extras={extras} combos={combos} />
      ) : (
        <main className="weekly-dark-menu">
          <div className="weekly-shell">
            <div className="weekly-empty" style={{ marginTop: 48 }}>
              <div className="weekly-eyebrow" style={{ marginBottom: 8 }}>
                A little kitchen magic in progress
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 850, margin: "0 0 8px", color: "#fff" }}>
                This week&apos;s menu is being prepared.
              </h1>
              <p style={{ margin: 0 }}>Check back soon to see what&apos;s fresh from our kitchen.</p>
            </div>
          </div>
        </main>
      )}
    </>
  );
}
