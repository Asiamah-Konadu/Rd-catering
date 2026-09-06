import { Metadata } from "next";
import WaitlistSection from "@/components/WaitlistSection";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Coming Soon — Rich-Dons Catering Accra | Early Access Waitlist",
  description:
    "Join the Rich-Dons Catering early list in Accra, Ghana. Claim your exclusive Free Delivery promo code for launch day on fresh Jollof, Banku, Waffles, Waakye and more.",
};

export default function ComingSoonPage() {
  return (
    <main className="page max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <span className="text-xs font-medium text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full">
          Accra Launching Soon 🇬🇭
        </span>
      </div>

      <WaitlistSection />
    </main>
  );
}
