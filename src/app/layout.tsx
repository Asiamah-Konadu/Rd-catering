import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import { CartProvider } from "@/components/cart/CartProvider";
import SplashScreen from "@/components/SplashScreen";
import Footer from "@/components/Footer";
import InstallAppPrompt from "@/components/InstallAppPrompt";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-K9K46SSV4D";

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
    default: "Rich-Dons Catering — Fresh Ghanaian Food Delivered in Accra",
  },
  description:
    "Order fresh Ghanaian catering for lunch, office meetings, family gatherings and everyday cravings in Accra.",
  keywords: [
    "catering Accra",
    "Ghanaian food delivery",
    "office lunch catering Accra",
    "jollof rice delivery Accra",
    "waakye delivery Ghana",
    "event catering Accra",
    "corporate lunch Accra",
    "food delivery East Legon",
    "catering services Airport Residential",
    "Rich-Dons Catering",
    "Ghanaian cuisine",
    "Accra food ordering",
    "wedding catering Accra",
    "best catering in Accra",
  ],
  authors: [{ name: "Rich-Dons Catering", url: SITE_URL }],
  creator: "Rich-Dons Catering",
  publisher: "Rich-Dons Catering",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: SITE_URL,
    siteName: "Rich-Dons Catering",
    title: "Rich-Dons Catering — Fresh Ghanaian Food Delivered in Accra",
    description: "Order fresh Ghanaian catering, authentic jollof rice, and office lunch portals in Accra. Fast doorstep delivery.",
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
    title: "Rich-Dons Catering — Fresh Ghanaian Food Delivered in Accra",
    description: "Order fresh Ghanaian catering, authentic jollof rice, and office lunch portals in Accra. Fast doorstep delivery.",
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
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      process.env.GOOGLE_SITE_VERIFICATION,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["CateringService", "Restaurant", "FoodEstablishment"],
      "@id": `${SITE_URL}/#restaurant`,
      name: "Rich-Dons Catering",
      url: SITE_URL,
      telephone: "+233248179348",
      email: "rdadmin@richdonscatering.com",
      sameAs: [
        "https://www.instagram.com/richdonsofficial",
        "https://www.tiktok.com/@richdonsofficial",
      ],
      description:
        "Fresh Ghanaian catering for daily lunch, office meeting portals, family gatherings, and weddings in Accra.",
      servesCuisine: ["Ghanaian", "West African", "African"],
      priceRange: "GH₵₵",
      currenciesAccepted: "GHS",
      paymentAccepted: ["Cash", "Mobile Money", "Credit Card", "Hubtel"],
      image: `${SITE_URL}/og-image.jpg`,
      hasMenu: `${SITE_URL}/menu`,
      acceptsReservations: "True",
      areaServed: [
        { "@type": "City", name: "Accra", addressCountry: "GH" },
        { "@type": "AdministrativeArea", name: "Greater Accra Region", addressCountry: "GH" },
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Accra",
        addressRegion: "Greater Accra",
        addressCountry: "GH",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 5.6037,
        longitude: -0.187,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "08:00",
          closes: "22:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Sunday"],
          opens: "11:00",
          closes: "20:00",
        },
      ],
      potentialAction: {
        "@type": "OrderAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/menu`,
          actionPlatform: [
            "http://schema.org/DesktopWebPlatform",
            "http://schema.org/MobileWebPlatform",
          ],
        },
        deliveryMethod: "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Rich-Dons Catering",
      description: "Authentic Ghanaian food delivery and event catering in Accra.",
      publisher: {
        "@id": `${SITE_URL}/#restaurant`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/menu?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/animated-logo.svg" as="image" type="image/svg+xml" />
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        {/* Google Analytics tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `,
          }}
        />
        <SplashScreen />
        <CartProvider>
          <Header />
          {children}
          <Footer />
        </CartProvider>
        <InstallAppPrompt />
      </body>
    </html>
  );
}

