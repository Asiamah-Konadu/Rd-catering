import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MenuItemDetail from "@/components/MenuItemDetail";
import { getPublicMenuItem } from "@/lib/menu";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublicMenuItem(slug);
  if (!item) return { title: "Menu Item Not Found" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://richdonscatering.com";

  return {
    title: item.name,
    description:
      item.description ||
      `Order ${item.name} from Rich-Dons Catering. Fresh, delicious, delivered in Accra.`,
    alternates: { canonical: `/menu/${item.slug}` },
    openGraph: {
      title: `${item.name} | Rich-Dons Catering`,
      description:
        item.description ||
        `Order ${item.name} from Rich-Dons Catering. Fresh Ghanaian food delivered in Accra.`,
      url: `/menu/${item.slug}`,
      ...(item.imageUrl && {
        images: [{ url: item.imageUrl, alt: item.name }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.name} | Rich-Dons Catering`,
      description:
        item.description ||
        `Order ${item.name} from Rich-Dons Catering. Fresh Ghanaian food delivered in Accra.`,
      ...(item.imageUrl && { images: [item.imageUrl] }),
    },
  };
}

export default async function MenuItemPage({ params }: Props) {
  const { slug } = await params;
  const item = await getPublicMenuItem(slug);

  if (!item) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://richdonscatering.com";

  const menuItemJsonLd = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: item.name,
    description: item.description ?? undefined,
    url: `${siteUrl}/menu/${item.slug}`,
    ...(item.imageUrl && { image: item.imageUrl }),
    offers: {
      "@type": "Offer",
      price: item.price.toFixed(2),
      priceCurrency: "GHS",
      availability: item.isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Restaurant",
        name: "Rich-Dons Catering",
      },
    },
    suitableForDiet: "https://schema.org/HalalDiet",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuItemJsonLd) }}
      />
      <MenuItemDetail item={item} />
    </>
  );
}