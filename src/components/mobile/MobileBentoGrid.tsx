'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame, Sparkles, Building2, PartyPopper, Plus, Check } from "lucide-react";
import type { PublicMenuItem } from "@/lib/menu";
import type { PublicHeroPromo } from "@/lib/promo";
import { ComboCustomizerModal } from "@/components/ComboCustomizerModal";
import { useCart } from "@/components/cart/CartProvider";

interface MobileBentoGridProps {
  categories: {
    id: string;
    name: string;
    slug: string;
    items: PublicMenuItem[];
  }[];
  featuredItem?: PublicMenuItem | null;
  weeklyMenuItems?: PublicMenuItem[] | null;
  heroPromo?: PublicHeroPromo | null;
}

export default function MobileBentoGrid({
  categories,
  featuredItem,
  weeklyMenuItems,
  heroPromo,
}: MobileBentoGridProps) {
  const { add } = useCart();
  const [modalItem, setModalItem] = useState<PublicMenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);

  // Fallbacks if database is sparse
  const allDishes = categories.flatMap((c) => c.items);
  const weeklyList = weeklyMenuItems || [];
  
  const heroFeatured: PublicMenuItem = featuredItem || allDishes[0] || {
    id: "def-featured",
    name: "Smoky Party Jollof Rice",
    slug: "smoky-party-jollof",
    description: "Slow-simmered firewood-perfumed jasmine rice with spicy tomato gravy and grilled chicken.",
    imageUrl: "/coming-soon/jolof.avif",
    price: 65,
    isAvailable: true,
    isFeatured: true,
    category: { name: "Rice Classics", slug: "rice" },
  };

  const todaySpecial: PublicMenuItem = weeklyList[0] || allDishes[1] || {
    id: "def-special",
    name: "Accra Special Waakye Bowl",
    slug: "accra-special-waakye",
    description: "Authentic waakye with rich black shito, boiled egg, spaghetti, and tender wele.",
    imageUrl: "/coming-soon/waakye.jpg",
    price: 60,
    isAvailable: true,
    isFeatured: false,
    category: { name: "House Specials", slug: "specials" },
  };

  const handleOpenCustomizer = (item: PublicMenuItem) => {
    setModalItem(item);
    setIsModalOpen(true);
  };

  const handleQuickAdd = (e: React.MouseEvent, item: PublicMenuItem) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      id: item.id,
      name: item.name,
      basePrice: item.price,
      price: item.price,
      imageUrl: item.imageUrl,
      selectedExtras: [],
      quantity: 1,
    });
    setQuickAddedId(item.id);
    setTimeout(() => setQuickAddedId(null), 1200);
  };

  return (
    <section id="curated-picks" className="mobile-bento-section md:hidden px-4 py-6" aria-label="Rich-Dons Curated Mobile Menu">
      {/* 70% Minimalism Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/50">
            Curated For You
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1.5">
            Today’s Kitchen Picks
          </h2>
        </div>
        <Link
          href="/menu"
          className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 active:scale-95 transition"
        >
          <span>Full Menu</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* 20% Bento Grid Organisation System */}
      <div className="grid grid-cols-2 gap-3">
        {/* ─── TILE 1: FEATURED MEAL (Full-width Bento Hero) ─── */}
        <div className="col-span-2 relative bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm transition hover:shadow-md">
          {/* Large Appetising Food Photography (70% Minimalism) */}
          <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
            {heroFeatured.imageUrl ? (
              <img
                src={heroFeatured.imageUrl}
                alt={heroFeatured.name}
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : (
              <Image
                src="/coming-soon/jolof.avif"
                alt={heroFeatured.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

            {/* Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[11px] font-extrabold shadow-sm">
              <Sparkles size={12} className="text-amber-400" />
              <span>Chef’s Signature</span>
            </div>

            {/* Price Tag Overlay */}
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500/95 backdrop-blur-md text-slate-950 text-xs font-black shadow-sm">
              GH₵ {heroFeatured.price.toFixed(2)}
            </div>

            {/* Overlay Info */}
            <div className="absolute bottom-3 inset-x-3 text-white">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-0.5">
                {heroFeatured.category?.name || "Customer Favorite"}
              </span>
              <h3 className="text-lg font-black leading-tight drop-shadow-sm">
                {heroFeatured.name}
              </h3>
              <p className="text-xs text-slate-200/90 line-clamp-1 mt-0.5">
                {heroFeatured.description || "Prepared hot and fresh from authentic local spices."}
              </p>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="p-3 bg-white flex items-center justify-between gap-2 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium pl-1">
              Customise with sides & drinks
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenCustomizer(heroFeatured)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 active:scale-95 transition shadow-xs"
              >
                Customise Combo
              </button>
              <button
                type="button"
                onClick={(e) => handleQuickAdd(e, heroFeatured)}
                disabled={quickAddedId === heroFeatured.id}
                className={`p-2 rounded-xl border transition active:scale-95 ${
                  quickAddedId === heroFeatured.id
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                }`}
                aria-label={`Quick add ${heroFeatured.name} to bag`}
              >
                {quickAddedId === heroFeatured.id ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <Plus size={16} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ─── TILE 2: TODAY'S SPECIALS (Simmering Fresh) ─── */}
        <div className="col-span-2 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 rounded-3xl p-3.5 border border-amber-200/70 flex items-center gap-3 shadow-xs">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-amber-200 border border-amber-300/60">
            {todaySpecial.imageUrl ? (
              <img
                src={todaySpecial.imageUrl}
                alt={todaySpecial.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src="/coming-soon/waakye.jpg"
                alt={todaySpecial.name}
                fill
                className="object-cover"
              />
            )}
            <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-xs text-[9px] font-bold text-amber-300 px-1.5 py-0.5 rounded-md">
              Special
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                Simmering Now
              </span>
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 truncate">
              {todaySpecial.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-black text-amber-700 font-mono">
                GH₵ {todaySpecial.price.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">· Ready to pack</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => handleQuickAdd(e, todaySpecial)}
            disabled={quickAddedId === todaySpecial.id}
            className={`p-2.5 rounded-2xl shadow-xs transition active:scale-90 shrink-0 ${
              quickAddedId === todaySpecial.id
                ? "bg-emerald-600 text-white"
                : "bg-amber-600 text-white hover:bg-amber-700"
            }`}
            aria-label={`Add today's special ${todaySpecial.name}`}
          >
            {quickAddedId === todaySpecial.id ? (
              <Check size={18} strokeWidth={3} />
            ) : (
              <Plus size={18} strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* ─── TILE 3: MEAL CATEGORIES (Bento 4-Quadrant Visual Pills) ─── */}
        <div className="col-span-2 bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-black text-slate-900 tracking-tight">
              Browse Meal Categories
            </span>
            <span className="text-[10px] text-slate-600 font-semibold">Tap to view</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/menu#rice"
              className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/70 transition flex items-center gap-2.5 group active:scale-98"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform">
                🍚
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-slate-900 truncate group-hover:text-amber-800">
                  Rice Dishes
                </span>
                <span className="block text-[10px] text-slate-500">Jollof, Fried & Waakye</span>
              </div>
            </Link>

            <Link
              href="/menu#swallows"
              className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/70 transition flex items-center gap-2.5 group active:scale-98"
            >
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform">
                🍲
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-slate-900 truncate group-hover:text-amber-800">
                  Swallows & Soups
                </span>
                <span className="block text-[10px] text-slate-500">Banku, Fufu & Light Soup</span>
              </div>
            </Link>

            <Link
              href="/menu#grill"
              className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/70 transition flex items-center gap-2.5 group active:scale-98"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform">
                🥩
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-slate-900 truncate group-hover:text-amber-800">
                  Charcoal Grill
                </span>
                <span className="block text-[10px] text-slate-500">Tilapia, Pork & Chicken</span>
              </div>
            </Link>

            <Link
              href="/menu#drinks"
              className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/70 transition flex items-center gap-2.5 group active:scale-98"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform">
                🍹
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-slate-900 truncate group-hover:text-amber-800">
                  Pastries & Drinks
                </span>
                <span className="block text-[10px] text-slate-500">Sobolo, Pies & Sides</span>
              </div>
            </Link>
          </div>
        </div>

        {/* ─── TILE 4: PROMOTIONS & COMBOS ─── */}
        <div className="col-span-2 relative bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white rounded-3xl p-4 overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                <Flame size={12} className="text-amber-400" />
                <span>{heroPromo?.badgeText || "Hot Combo Deal"}</span>
              </div>
              <h4 className="text-base font-black leading-tight">
                {heroPromo?.title || "Complete Lunch Box Combo"}
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-[220px]">
                {heroPromo?.subtitle || "Add your choice of extra protein, fried plantain, and chilled drink."}
              </p>
              {heroPromo?.price && (
                <div className="mt-2 text-sm font-black text-amber-400 font-mono">
                  From GH₵ {heroPromo.price.toFixed(2)}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleOpenCustomizer(heroFeatured)}
              className="mt-2 px-3.5 py-2.5 rounded-2xl bg-amber-500 text-slate-950 text-xs font-extrabold hover:bg-amber-400 active:scale-95 transition shadow-sm shrink-0"
            >
              Build Combo
            </button>
          </div>
        </div>

        {/* ─── TILE 5: CATERING PACKAGES (Split Bento Cells) ─── */}
        <div className="col-span-1 bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-2.5">
              <Building2 size={17} />
            </div>
            <h4 className="text-xs font-black text-slate-900 leading-snug">
              Office Lunch Portals
            </h4>
            <p className="text-[10px] text-slate-500 mt-1">
              Company meal plans, monthly billing & free scheduled drop-offs.
            </p>
          </div>
          <Link
            href="/corporate"
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 active:translate-x-0.5 transition"
          >
            <span>Learn more</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="col-span-1 bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center mb-2.5">
              <PartyPopper size={17} />
            </div>
            <h4 className="text-xs font-black text-slate-900 leading-snug">
              Event Feasts & Parties
            </h4>
            <p className="text-[10px] text-slate-500 mt-1">
              Buffets, packaging & live cooking for weddings, birthdays & parties.
            </p>
          </div>
          <Link
            href="/events"
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-800 active:translate-x-0.5 transition"
          >
            <span>Book event</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Liquid Glass Combo Modal */}
      {modalItem && (
        <ComboCustomizerModal
          item={modalItem}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setModalItem(null);
          }}
        />
      )}
    </section>
  );
}
