import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { CartProvider } from "@/components/cart/CartProvider";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://rd-catering.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | Rich-Dons Catering",
    default: "Rich-Dons Catering — Fresh Ghanaian Food Delivered in Accra | Launching Nov 6",
  },
  description:
    "Join the VIP waitlist for Rich-Dons Catering launching in Accra, Ghana on November 6, 2026. Claim your exclusive Free Delivery promo code for launch day on Jollof, Banku, Waffles, Waakye and more.",
  keywords: [
    "catering Accra",
    "Ghanaian food delivery",
    "office catering Ghana",
    "Rich-Dons Catering",
    "food delivery Accra",
    "Ghanaian cuisine",
    "family catering Ghana",
    "Accra food waitlist",
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
    title: "Rich-Dons Catering — Fresh Ghanaian Food Delivered in Accra | Launching Nov 6",
    description:
      "Join the VIP waitlist for Rich-Dons Catering launching in Accra, Ghana. Claim your exclusive Free Delivery promo code for launch day on Jollof, Banku, Waffles & Waakye.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 675,
        type: "image/jpeg",
        alt: "Rich-Dons Catering — Fresh Ghanaian Food Delivered in Accra",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rich-Dons Catering — Fresh Ghanaian Food Delivered in Accra | Launching Nov 6",
    description:
      "Join the VIP waitlist for Rich-Dons Catering launching in Accra. Get Free Delivery on your 1st order!",
    images: ["/og-image.jpg"],
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
    "Fresh Ghanaian catering for lunch, office meetings, family gatherings and everyday cravings. Launching soon in Accra.",
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
  image: `${SITE_URL}/og-image.jpg`,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <meta property="og:image:secure_url" content={`${SITE_URL}/og-image.jpg`} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="675" />
        <meta property="og:image:alt" content="Rich-Dons Catering — Fresh Ghanaian Food Delivered in Accra" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.jpg`} />
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
