import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrdersAdminPage() {
  const orders = await prisma.order.findMany({orderBy:{createdAt:"desc"},take:50,include:{items:true}});
  return <main className="page"><div className="page-heading"><span className="eyebrow">Operations</span><h1>Order queue</h1></div><div className="order-table">{orders.length ? orders.map(o=><div className="admin-order" key={o.id}><div><strong>{o.orderNumber}</strong><span>{o.customerName} • {o.customerPhone}</span></div><b>{o.status}</b><strong>GH₵ {Number(o.total).toFixed(2)}</strong></div>) : <div className="empty"><h2>No orders yet</h2><p>New orders will appear here.</p></div>}</div></main>;
}
