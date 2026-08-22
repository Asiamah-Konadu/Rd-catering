import { notFound } from "next/navigation";
import MenuItemDetail from "@/components/MenuItemDetail";
import { getPublicMenuItem } from "@/lib/menu";

export const dynamic = "force-dynamic";

export default async function MenuItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getPublicMenuItem(slug);

  if (!item) notFound();

  return <MenuItemDetail item={item} />;
}