import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { CartProvider } from "@/components/cart/CartProvider";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://richdonscatering.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | Rich-Dons Catering",
    default: "Rich-Dons Catering — Fresh Ghanaian Food, Delivered in Accra",
  },
  description:
    "Order generous Ghanaian favourites for lunch, office meetings, family gatherings and everyday cravings. Rich-Dons Catering keeps the food fresh, clear and on time.",
  keywords: [
    "catering Accra",
    "Ghanaian food delivery",
    "office catering Ghana",
    "Rich-Dons Catering",
    "food delivery Accra",
    "Ghanaian cuisine",
    "family catering Ghana",
  ],
  authors: [{ name: "Rich-Dons Catering" }],
  creator: "Rich-Dons Catering",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: SITE_URL,
    siteName: "Rich-Dons Catering",
    title: "Rich-Dons Catering — Fresh Ghanaian Food, Delivered in Accra",
    description:
      "Order generous Ghanaian favourites for lunch, office meetings, family gatherings and everyday cravings. Fresh, clear, on time.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Rich-Dons Catering — Fresh Ghanaian Food",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rich-Dons Catering — Fresh Ghanaian Food, Delivered in Accra",
    description:
      "Order generous Ghanaian favourites for lunch, office meetings, and everyday cravings. Delivered in Accra.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/logo.svg", type: "image/svg+xml" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Restaurant", "LocalBusiness"],
  name: "Rich-Dons Catering",
  url: SITE_URL,
  description:
    "Fresh Ghanaian catering for lunch, office meetings, family gatherings and everyday cravings. Delivery available in Accra.",
  servesCuisine: ["Ghanaian", "African"],
  areaServed: {
    "@type": "City",
    name: "Accra",
    addressCountry: "GH",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Accra",
    addressCountry: "GH",
  },
  priceRange: "GH₵",
  hasMenu: `${SITE_URL}/menu`,
  sameAs: [],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
        />
      </head>
      <body>
        <CartProvider>
          <Header />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
