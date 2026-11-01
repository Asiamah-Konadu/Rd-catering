import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Rich-Dons Catering",
  description:
    "Privacy Policy for Rich-Dons Catering in Accra, Ghana. Learn how we collect, use, and protect your personal information when placing catering orders.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 2026";

  return (
    <main className="page legal-page max-w-4xl mx-auto px-5 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 mb-8 transition">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="border-b border-stone-200 pb-8 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-200">
          <ShieldCheck size={14} className="text-amber-600" />
          <span>Legal & Compliance · Act 843</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight mb-3">
          Privacy Policy
        </h1>
        <p className="text-stone-600 text-sm md:text-base leading-relaxed">
          At Rich-Dons Catering, we respect your privacy and are committed to protecting the personal data you share with us. This policy details how we handle your information in accordance with the Ghana Data Protection Act, 2012 (Act 843).
        </p>
        <p className="text-xs text-stone-400 mt-2">
          Effective Date & Last Updated: <strong>{lastUpdated}</strong>
        </p>
      </div>

      <div className="space-y-10 text-stone-700 leading-relaxed text-sm md:text-base">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-800 inline-flex items-center justify-center text-xs font-bold">1</span>
            Information We Collect
          </h2>
          <p>
            When you browse our menu, place a meal order, schedule event catering, or join an office lunch portal, we may collect:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-stone-600">
            <li><strong>Contact details:</strong> Your full name, telephone number, WhatsApp number, and email address.</li>
            <li><strong>Delivery coordinates:</strong> Your street address, office building, floor, room number, or Google Maps pinned location in Accra.</li>
            <li><strong>Order specifics:</strong> Chosen dishes, portion preferences, dietary requests, allergy warnings, and special packaging instructions.</li>
            <li><strong>Payment metadata:</strong> Payment method preference (e.g. Mobile Money, Hubtel, Card, or Cash on confirmation). We do not store your private Mobile Money PINs or credit card security codes.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-800 inline-flex items-center justify-center text-xs font-bold">2</span>
            How We Use Your Information
          </h2>
          <p>We use your personal data strictly for operational catering purposes, including:</p>
          <ul className="list-disc pl-6 space-y-2 text-stone-600">
            <li>Preparing and packaging your culinary orders accurately according to your specifications.</li>
            <li>Coordinating delivery riders to navigate directly to your location across Accra.</li>
            <li>Sending instant WhatsApp order summaries, confirmations, and real-time delivery status updates.</li>
            <li>Managing corporate lunch portals and collective batch drops for enrolled companies.</li>
            <li>Improving our kitchen operations, menu items, and customer support responsiveness.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-800 inline-flex items-center justify-center text-xs font-bold">3</span>
            Third-Party Processors & Integrations
          </h2>
          <p>
            To deliver an optimal dining experience, we collaborate with reputable service providers under strict data confidentiality terms:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <h3 className="font-bold text-stone-900 text-sm mb-1">WhatsApp by Meta</h3>
              <p className="text-xs text-stone-600">Used for conversational order confirmation, payment receipt exchange, and instant customer service.</p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <h3 className="font-bold text-stone-900 text-sm mb-1">Google Maps Platform</h3>
              <p className="text-xs text-stone-600">Enables high-precision geolocation and landmark pinning for riders across Greater Accra.</p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <h3 className="font-bold text-stone-900 text-sm mb-1">Hubtel Payment Gateway</h3>
              <p className="text-xs text-stone-600">Processes mobile money (MTN, Telecel, AT) and card transactions with bank-grade encryption.</p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <h3 className="font-bold text-stone-900 text-sm mb-1">Delivery Logistics Partners</h3>
              <p className="text-xs text-stone-600">Dispatches vetted riders who receive only the necessary contact and address details to complete your dropoff.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-800 inline-flex items-center justify-center text-xs font-bold">4</span>
            Data Protection & Security
          </h2>
          <p>
            We implement industry-standard administrative, physical, and technical precautions to safeguard your personal data from unauthorized access, accidental alteration, or disclosure. All database transmissions are secured over TLS/SSL encryption.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-800 inline-flex items-center justify-center text-xs font-bold">5</span>
            Your Rights Under Act 843
          </h2>
          <p>
            Under Ghana’s Data Protection Act, 2012, you have the right to request access to the personal data we hold about you, request corrections to inaccurate records, or ask for deletion of your profile data.
          </p>
          <p>
            To exercise these rights, please contact our team via email at{" "}
            <a href="mailto:rdadmin@richdonscatering.com" className="text-amber-700 font-bold underline">
              rdadmin@richdonscatering.com
            </a>{" "}
            or message our team on WhatsApp.
          </p>
        </section>
      </div>
    </main>
  );
}
