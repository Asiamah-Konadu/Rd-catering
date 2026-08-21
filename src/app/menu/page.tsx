import { demoMenu } from "@/lib/catalog";
import MenuCard from "@/components/MenuCard";

export default function MenuPage() {
  const categories = [...new Set(demoMenu.map(x => x.category))];
  return <main className="page"><div className="page-heading"><span className="eyebrow">RD Catering</span><h1>Our menu</h1><p>Fresh favourites and simple choices. Add what you want to your bag.</p></div>
    {categories.map(category => <section className="section compact" key={category}><div className="section-heading"><h2>{category}</h2></div><div className="menu-grid">{demoMenu.filter(x => x.category === category).map(x => <MenuCard key={x.id} item={x}/>)}</div></section>)}
  </main>;
}
