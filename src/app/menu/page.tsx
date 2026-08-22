import MenuCard from "@/components/MenuCard";
import { getPublicMenu } from "@/lib/menu";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const categories = await getPublicMenu();
  return <main className="page"><div className="page-heading"><span className="eyebrow">RD Catering</span><h1>Our menu</h1><p>Fresh favourites and simple choices. Add what you want to your bag.</p></div>
    {categories.length ? categories.map(category => <section className="section compact" key={category.id}><div className="section-heading"><h2>{category.name}</h2></div><div className="menu-grid">{category.items.map(item => <MenuCard key={item.id} item={item}/>)}</div></section>) : <div className="empty"><h2>Our menu is being prepared</h2><p>Please check back soon for today&apos;s available dishes.</p></div>}
  </main>;
}
