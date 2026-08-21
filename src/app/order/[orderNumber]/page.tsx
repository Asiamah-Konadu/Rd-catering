import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function OrderPage({ params }: { params: Promise<{orderNumber:string}> }) {
  const {orderNumber} = await params;
  const order = await prisma.order.findUnique({where:{orderNumber},include:{items:true}});
  if(!order) return <main className="page narrow"><div className="empty"><h1>Order not found</h1><Link href="/menu">Back to menu</Link></div></main>;
  return <main className="page narrow"><div className="success"><span className="success-mark">✓</span><span className="eyebrow">Order received</span><h1>Thank you, {order.customerName}.</h1><p>Your order <strong>{order.orderNumber}</strong> has been received and is currently <strong>{order.status.replaceAll("_"," ")}</strong>.</p></div><div className="summary"><h2>Order summary</h2>{order.items.map(i=><p key={i.id}><span>{i.quantity} × {i.name}</span><b>GH₵ {Number(i.totalPrice).toFixed(2)}</b></p>)}<hr/><p className="total"><span>Total</span><b>GH₵ {Number(order.total).toFixed(2)}</b></p></div></main>;
}
