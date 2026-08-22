import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const [orders,menuItems,categories] = await Promise.all([
    prisma.order.count(), prisma.menuItem.count(), prisma.category.count()
  ]);
  return <main className="page"><div className="page-heading"><span className="eyebrow">Operations</span><h1>RD Catering Admin</h1><p>Manage the kitchen, menu and incoming orders from one place.</p></div><div className="stats"><div><span>Orders</span><strong>{orders}</strong></div><div><span>Menu items</span><strong>{menuItems}</strong></div><div><span>Categories</span><strong>{categories}</strong></div></div><div className="admin-grid"><Link href="/admin/orders"><strong>Order queue</strong><span>Track and update customer orders.</span></Link><Link href="/menu"><strong>Menu</strong><span>Preview the customer-facing menu.</span></Link></div></main>;
}
