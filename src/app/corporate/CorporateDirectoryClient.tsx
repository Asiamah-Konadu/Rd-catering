'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Clock,
  Truck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Percent,
  Package,
  Users,
  MessageCircle,
} from "lucide-react";

export type PublicCompanyInfo = {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  region: string | null;
  dropoffLocation: string | null;
  cutoffTime: string;
  batchDeliveryTime: string;
  discountPercent: number;
  freeDelivery: boolean;
  customPackaging: boolean;
  orderCount?: number;
};

export function CorporateDirectoryClient({
  companies,
}: {
  companies: PublicCompanyInfo[];
}) {
  const [search, setSearch] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string>("");

  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return companies;
    const q = search.toLowerCase();
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        (c.address && c.address.toLowerCase().includes(q))
    );
  }, [companies, search]);

  const selectedCompany = useMemo(() => {
    return companies.find((c) => c.slug === selectedSlug);
  }, [companies, selectedSlug]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-16 px-4 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide uppercase">
            <Building2 className="w-3.5 h-3.5" />
            <span>Hybrid Office & Corporate Ordering</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Fresh Hot Meals Delivered to Your Desk.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              Zero Office Lunch Admin.
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Staff pick and pay for their own individual lunches. All meals arrive in one
            synchronized, labeled batch delivery at your company reception—unlocking group
            perks like free delivery and corporate discounts.
          </p>

          {/* Quick Stats / Perks Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto text-left">
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
              <Truck className="w-5 h-5 text-amber-400 mb-1.5" />
              <div className="font-bold text-white text-xs sm:text-sm">Batch Delivery</div>
              <div className="text-[11px] text-slate-400">One delivery for whole office</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
              <Package className="w-5 h-5 text-amber-400 mb-1.5" />
              <div className="font-bold text-white text-xs sm:text-sm">Labeled Boxes</div>
              <div className="text-[11px] text-slate-400">Staff name & department printed</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
              <Users className="w-5 h-5 text-amber-400 mb-1.5" />
              <div className="font-bold text-white text-xs sm:text-sm">No Group Debt</div>
              <div className="text-[11px] text-slate-400">Individual Mobile Money/Card</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-400 mb-1.5" />
              <div className="font-bold text-white text-xs sm:text-sm">Corporate Perks</div>
              <div className="text-[11px] text-slate-400">Free delivery & discounts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 space-y-12">
        {/* Quick Company Chooser Box */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>Select Your Company to Order</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose your office portal to view today&apos;s menu with company discounts and delivery timing.
              </p>
            </div>

            {/* Quick dropdown jump */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                aria-label="Choose your registered company"
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="w-full sm:w-64 bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Choose your company --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>

              {selectedSlug && (
                <Link
                  href={`/corporate/${selectedSlug}`}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition shadow-sm"
                >
                  <span>Enter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Selected company preview card */}
          {selectedCompany && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-base">
                    {selectedCompany.name}
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    Active Portal
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  📍 {selectedCompany.address}
                  {selectedCompany.dropoffLocation ? ` · Dropoff: ${selectedCompany.dropoffLocation}` : ""}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-amber-200/90 pt-1">
                  <span>⏰ Order Cutoff: <strong>{selectedCompany.cutoffTime}</strong></span>
                  <span>🛵 Delivery: <strong>{selectedCompany.batchDeliveryTime}</strong></span>
                  {selectedCompany.freeDelivery && (
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      ✓ Free Delivery
                    </span>
                  )}
                  {selectedCompany.discountPercent > 0 && (
                    <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      {selectedCompany.discountPercent}% Group Discount
                    </span>
                  )}
                </div>
              </div>
              <Link
                href={`/corporate/${selectedCompany.slug}`}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md shrink-0"
              >
                <span>Go to Ordering Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Directory Search & Company Cards Grid */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Registered Companies Directory</h3>
              <p className="text-xs text-slate-400">
                Browse our active partner offices in Accra & Greater Accra
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search company or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {filteredCompanies.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
              <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm font-medium">
                No matching company portal found.
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Don&apos;t see your office? Contact us below to register your company.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCompanies.map((comp) => (
                <div
                  key={comp.id}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-extrabold text-white group-hover:text-amber-400 transition">
                          {comp.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          📍 {comp.address}, {comp.city}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {comp.city}
                      </span>
                    </div>

                    {comp.dropoffLocation && (
                      <p className="text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
                        <strong className="text-slate-300">Dropoff Desk:</strong> {comp.dropoffLocation}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs py-1">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cutoff: <strong>{comp.cutoffTime}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Truck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Drop: <strong>{comp.batchDeliveryTime}</strong></span>
                      </div>
                    </div>

                    {/* Perks tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {comp.freeDelivery && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Free Delivery
                        </span>
                      )}
                      {comp.discountPercent > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Percent className="w-3 h-3" />
                          {comp.discountPercent}% Off
                        </span>
                      )}
                      {comp.customPackaging && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Package className="w-3 h-3" />
                          Labeled Packaging
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-800/80">
                    <Link
                      href={`/corporate/${comp.slug}`}
                      className="w-full py-2.5 px-4 bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                    >
                      <span>Order for {comp.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* HR / Office Manager Onboarding Banner */}
        <section className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-md border border-amber-500/30">
              For HR Leaders & Office Administrators
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Want Rich-Dons Office Portals at Your Workplace?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We set up your custom company portal within 24 hours. No cost, no minimum contract, and no paperwork.
              Your employees get discounted hot catering, and your front desk gets clean, labeled batch delivery on time every single day.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://wa.me/233240000000?text=Hello%20Rich-Dons%20Catering!%20I'd%20like%20to%20register%20my%20company%20for%20the%20Corporate%20Lunch%20Portal."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Register via WhatsApp</span>
            </a>
            <Link
              href="/#about-launch"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition border border-slate-700"
            >
              <span>Learn More About Us</span>
            </Link>
          </div>
        </section>

        {/* How It Works for Staff */}
        <section className="space-y-4 pt-4">
          <h3 className="text-lg font-bold text-white text-center">How the Hybrid Office Portal Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-sm">
                1
              </div>
              <h4 className="font-bold text-white text-sm">Choose Your Own Meal</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Open your dedicated company link. Pick your favorite dish, custom sides, and drinks from our fresh daily menu.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-sm">
                2
              </div>
              <h4 className="font-bold text-white text-sm">Pay Individually</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Check out directly using MTN MoMo, Telecel Cash, or Card. No office spreadsheets, no chasing colleagues for cash.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-sm">
                3
              </div>
              <h4 className="font-bold text-white text-sm">Synchronized Delivery</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                All office meals arrive in one warm batch delivery to your front desk with personal names and departments clearly labeled.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
