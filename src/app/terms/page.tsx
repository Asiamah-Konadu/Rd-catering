import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service & Ordering Policy | Rich-Dons Catering",
  description:
    "Terms of service, refund & cancellation guidelines, food hygiene standards, and delivery terms for Rich-Dons Catering in Accra, Ghana.",
  alternates: { canonical: "/terms" },
};

export default function TermsOfServicePage() {
  const lastUpdated = "October 2026";

  return (
    <main className="page legal-page max-w-4xl mx-auto px-5 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 mb-8 transition">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="border-b border-stone-200 pb-8 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-200">
          <FileText size={14} className="text-amber-600" />
          <span>Customer Agreement & Ordering Policy</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight mb-3">
          Terms of Service & Catering Policy
        </h1>
        <p className="text-stone-600 text-sm md:text-base leading-relaxed">
          Welcome to Rich-Dons Catering. By browsing our menu, submitting orders via our website or WhatsApp, or booking event catering, you agree to the terms outlined below.
        </p>
        <p className="text-xs text-stone-400 mt-2">
          Effective Date & Last Updated: <strong>{lastUpdated}</strong>
        </p>
      </div>

      <div className="space-y-10 text-stone-700 leading-relaxed text-sm md:text-base">
        {/* 1. Order Placement & Confirmation */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-800 inline-flex items-center justify-center text-xs font-bold">1</span>
            Order Placement & WhatsApp Confirmation
          </h2>
          <p>
            To provide personal service and ensure meal availability, all online orders placed through Rich-Dons Catering are confirmed through our dedicated WhatsApp line or automated checkout.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-stone-600">
            <li>Your order is considered accepted once our kitchen confirms dish availability and estimated preparation time.</li>
            <li>Please ensure your delivery phone number is active and reachable during the delivery window.</li>
            <li>Same-day lunch orders are processed between 9:00 AM and 10:00 PM daily.</li>
          </ul>
        </section>

        {/* 2. Pricing & Payment Terms */}
        <section id="payment-terms" className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-800 inline-flex items-center justify-center text-xs font-bold">2</span>
            Pricing & Payment Terms
          </h2>
          <p>
            All prices displayed on our website are denominated in Ghana Cedis (GH₵) and include applicable local taxes unless explicitly noted.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-stone-600">
            <li>Accepted payment channels include Mobile Money (MTN MoMo, Telecel Cash, AT Money), Hubtel secure pay links, and approved corporate invoices.</li>
            <li>Delivery fees are calculated based on your destination within Greater Accra. Corporate batch deliveries may qualify for free delivery subject to office portal agreements.</li>
          </ul>
        </section>

        {/* 3. Cancellation & Refunds */}
        <section id="cancellation-refunds" className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-800 inline-flex items-center justify-center text-xs font-bold">3</span>
            Cancellation & Refund Policy
          </h2>
          <p>
            Because every meal is prepared fresh to order with perishable ingredients, our cancellation terms are as follows:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <h3 className="font-bold text-stone-900 text-sm mb-1">Individual Daily Orders</h3>
              <p className="text-xs text-stone-600 leading-normal">
                Modifications or cancellations must be communicated on WhatsApp within 15 minutes of order placement. Once our chefs commence cooking, cancellations cannot be refunded.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <h3 className="font-bold text-stone-900 text-sm mb-1">Catering & Event Bookings</h3>
              <p className="text-xs text-stone-600 leading-normal">
                Event bookings require a 50% reservation deposit. Cancellations made at least 72 hours prior to the event date receive a full deposit refund. Cancellations within 48 hours incur a 20% ingredient preparation fee.
              </p>
            </div>
          </div>
          <p className="text-xs text-stone-500 italic mt-2">
            If an incorrect dish or damaged container is delivered, please alert us immediately on WhatsApp with a photo so we can either dispatch a prompt replacement or issue an immediate refund.
          </p>
        </section>

        {/* 4. Food Safety & Allergen Information */}
        <section id="food-safety" className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-800 inline-flex items-center justify-center text-xs font-bold">4</span>
            Food Safety & Allergen Advisory
          </h2>
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <ShieldAlert size={16} className="text-amber-700" />
              <span>Allergen Notice</span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed">
              Our Ghanaian kitchen works with authentic regional ingredients including peanuts (groundnut soup/stew), fish, shellfish (shrimp/crayfish powder), dairy, and hot peppers (shito). While we maintain strict sanitization, cross-contact may occur. If you or any of your guests have severe food allergies, kindly notify our team in your order notes or directly via WhatsApp before ordering.
            </p>
          </div>
        </section>

        {/* 5. Delivery Coverage & Liability */}
        <section id="delivery-policy" className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-800 inline-flex items-center justify-center text-xs font-bold">5</span>
            Accra Delivery Coverage & Logistics
          </h2>
          <p>
            We deliver to locations throughout Accra including East Legon, Cantonments, Airport Residential, Ridge, Osu, Labone, Dzorwulu, Roman Ridge, Spintex, and surrounding communities. Delivery timing estimates account for cooking freshness and traffic conditions.
          </p>
        </section>

        {/* 6. Contact for Legal Matters */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-800 inline-flex items-center justify-center text-xs font-bold">6</span>
            Customer Support & Inquiries
          </h2>
          <p>
            Have a question regarding our policies or your order? We are here to help. Reach us at{" "}
            <a href="mailto:orders@richdonscatering.com" className="text-amber-700 font-bold underline">
              orders@richdonscatering.com
            </a>{" "}
            or speak with us directly on WhatsApp at <strong>+233 (0) 54 000 0000</strong>.
          </p>
        </section>
      </div>
    </main>
  );
}
