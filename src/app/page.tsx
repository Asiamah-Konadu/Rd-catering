import type { Metadata } from "next";
import MenuCard from "@/components/MenuCard";
import { getPublicMenu } from "@/lib/menu";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fresh Ghanaian Food Delivered in Accra",
  description:
    "Order fresh Ghanaian favourites from Rich-Dons Catering. Browse the menu and place your order for delivery in Accra.",
};

export default async function Home() {
  const categories = await getPublicMenu();

  return (
    <main className="page">
      <div className="page-heading">
        <span className="eyebrow">Rich-Dons Catering · Accra</span>
        <h1>Fresh Ghanaian favourites, made to order</h1>
        <p>Choose your meal, add it to your bag, and confirm your order with us on WhatsApp.</p>
      </div>
      {categories.length ? categories.map((category) => (
        <section className="section compact" key={category.id}>
          <div className="section-heading"><h2>{category.name}</h2></div>
          <div className="menu-grid">
            {category.items.map((item) => <MenuCard key={item.id} item={item} />)}
          </div>
        </section>
      )) : (
        <div className="empty">
          <h2>Today&apos;s menu is being updated</h2>
          <p>Please check back shortly for available dishes.</p>
        </div>
      )}
    </main>
  );
}
