'use client';

import { useState } from "react";
import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import {
  Gift,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  Flame,
  ChevronDown,
} from "lucide-react";

interface TeaserItem {
  id: string;
  name: string;
  imageSrc: string;
  emoji: string;
  tagline: string;
  description: string;
  highlight: string;
}

const TEASER_MENU: TeaserItem[] = [
  {
    id: "jollof",
    name: "Smoky Ghanaian Jollof",
    imageSrc: "/coming-soon/jolof.avif",
    emoji: "🍚",
    tagline: "The one you argue about. Ours settles it.",
    description: "Smoky, rich, perfectly spiced firewood-style Jollof rice served with seasoned chicken and authentic homemade shito.",
    highlight: "Customer Favourite",
  },
  {
    id: "waffles",
    name: "Golden Sweet Waffles",
    imageSrc: "/coming-soon/Waffle.jpg",
    emoji: "🧇",
    tagline: "Sweet, golden, made to order.",
    description: "Crispy-edged, fluffy Belgian-style waffles made fresh for breakfast meetings, sweet cravings, or afternoon treats.",
    highlight: "Freshly Made",
  },
  {
    id: "banku",
    name: "Banku & Grilled Tilapia",
    imageSrc: "/coming-soon/banku-and-tilapia.jpg",
    emoji: "🐟",
    tagline: "Grilled fresh. Served hot. No shortcuts.",
    description: "Steaming hot, soft banku paired with fresh charcoal-grilled tilapia, freshly ground red and green pepper, and sliced onions.",
    highlight: "Local Classic",
  },
  {
    id: "fried-rice",
    name: "Fried Rice & Crispy Chicken",
    imageSrc: "/coming-soon/fried-rice.png",
    emoji: "🍗",
    tagline: "Office lunch, solved.",
    description: "Generous portions of aromatic Ghanaian stir-fried rice with mixed vegetables and crispy golden chicken.",
    highlight: "Workday Fuel",
  },
  {
    id: "waakye",
    name: "Special Waakye Platter",
    imageSrc: "/coming-soon/waakye.jpg",
    emoji: "🥘",
    tagline: "A little bit of everything, done right.",
    description: "The full Ghanaian waakye feast — tender rice & beans, spaghetti (talia), boiled egg, seasoned wele, and rich black shito.",
    highlight: "Accra Essential",
  },
  {
    id: "smoothies",
    name: "Chilled Smoothies & Fresh Juices",
    imageSrc: "/coming-soon/smoothies.jpg",
    emoji: "🥤",
    tagline: "Something cold to go with something good.",
    description: "100% natural tropical fruit smoothies and cold-pressed juices to keep you refreshed throughout the day.",
    highlight: "Pure Refreshment",
  },
];

export default function WaitlistSection() {
  const [contactMode, setContactMode] = useState<"PHONE" | "EMAIL">("PHONE");
  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [signupResult, setSignupResult] = useState<{
    promoCode: string;
    alreadyRegistered: boolean;
    perk: string;
    message: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: contact.trim(),
          name: name.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to join the waitlist. Please check your details.");
      }

      setSignupResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopyCode() {
    if (!signupResult?.promoCode) return;
    navigator.clipboard.writeText(signupResult.promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hey! I just claimed my Early-Bird Free Delivery promo code for Rich-Dons Catering in Accra: *${signupResult?.promoCode}*. Claim yours before launch: https://rd-catering.vercel.app`
  )}`;

  return (
    <div className="w-full space-y-16">
      {/* ─── HERO WAITLIST & COUNTDOWN CARD ──────────────────────── */}
      <section
        id="waitlist"
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-amber-950 via-slate-900 to-stone-950 text-white p-6 sm:p-12 shadow-2xl border border-amber-500/25"
      >
        {/* Glow ambient background lights */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pre-Launch VIP Early Access • Accra, Ghana</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Fresh Ghanaian Food,{" "}
            <span className="bg-linear-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              Coming to Your Doorstep.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Accra&apos;s newest destination for real home-cooked Ghanaian flavours. Jollof, banku, waakye, waffles, and more — delivered hot & fast to your office or home.
          </p>

          {/* Live Countdown Timer */}
          <div className="py-2">
            <CountdownTimer />
          </div>

          {/* Perk Callout Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-200 text-xs sm:text-sm font-semibold text-left max-w-xl mx-auto">
            <Gift className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>Early-Bird Perk:</strong> Join today and receive a unique single-use code for <strong>FREE DELIVERY</strong> on your 1st order when we launch!
            </span>
          </div>

          {/* Sign-up Form or Confirmation Voucher */}
          {!signupResult ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4 max-w-lg mx-auto text-left">
              {/* Toggle switch for Phone vs Email */}
              <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700/60 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => setContactMode("PHONE")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    contactMode === "PHONE"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  WhatsApp Phone
                </button>
                <button
                  type="button"
                  onClick={() => setContactMode("EMAIL")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    contactMode === "EMAIL"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Email Address
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-hidden focus:border-amber-400 transition"
                />

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type={contactMode === "EMAIL" ? "email" : "tel"}
                    required
                    placeholder={
                      contactMode === "PHONE"
                        ? "e.g. 054 123 4567 or +233..."
                        : "e.g. yourname@example.com"
                    }
                    value={contact}
                    onChange={(e) => {
                      setContact(e.target.value);
                      setError("");
                    }}
                    className="flex-1 px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-hidden focus:border-amber-400 transition"
                  />
                  <button
                    type="submit"
                    disabled={loading || !contact.trim()}
                    className="px-6 py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    {loading ? (
                      "Generating Code..."
                    ) : (
                      <>
                        <span>Get Free Delivery Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-rose-400 bg-rose-950/50 border border-rose-800 p-3 rounded-xl">
                  {error}
                </p>
              )}

              <p className="text-[11px] text-slate-400 text-center">
                🔒 No spam — just a reminder with your voucher code on launch day.
              </p>
            </form>
          ) : (
            /* ─── ON-SCREEN VOUCHER CONFIRMATION ───────────────────── */
            <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-slate-900/95 border border-amber-500/50 text-left space-y-6 animate-fadeIn shadow-xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-white text-lg sm:text-xl">
                    {signupResult.alreadyRegistered
                      ? "Welcome Back! Here is Your Unique Voucher Code"
                      : "You're On The VIP Launch List!"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                    {signupResult.message}
                  </p>
                </div>
              </div>

              {/* Promo Code Voucher Card */}
              <div className="p-5 rounded-2xl bg-linear-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-2 border-dashed border-amber-400/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-300">
                    Your One-Time Free Delivery Code
                  </span>
                  <div className="font-mono text-3xl font-extrabold text-white tracking-wider">
                    {signupResult.promoCode}
                  </div>
                  <p className="text-xs text-amber-200/90 font-medium">
                    🎁 Free Delivery (GH₵ 20.00 off) on your first order when we launch on Nov 6.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md shrink-0 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-950" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Promo Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 text-center shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Share with Friends on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSignupResult(null)}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer"
                >
                  Register Another Contact
                </button>
              </div>
            </div>
          )}

          {/* Quick jump to menu teasers */}
          <div className="pt-4">
            <a
              href="#sneak-peek"
              className="inline-flex items-center gap-1.5 text-xs text-amber-300/80 hover:text-amber-200 transition font-medium"
            >
              <span>Explore the Sneak Peek Menu</span>
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── MENU SNEAK PEEK GRID WITH REAL FOOD IMAGES ──────────── */}
      <section id="sneak-peek" className="space-y-8 scroll-mt-24">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3.5 py-1 rounded-full">
            Sneak Peek Menu
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            What&apos;s Cooking for Launch
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Authentic recipes, generous portions, and premium Ghanaian ingredients. Here is a preview of what you can order on launch day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEASER_MENU.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card Image Header */}
              <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
                <Image
                  src={item.imageSrc}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Coming Soon Badge Overlay */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider shadow-lg">
                  <span>Coming Soon</span>
                </div>

                {/* Emoji / Food Pill */}
                <div className="absolute bottom-3 left-3 text-2xl drop-shadow-md">
                  {item.emoji}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-amber-700 transition">
                    {item.name}
                  </h3>
                  <p className="text-xs font-semibold text-amber-800 italic">
                    &ldquo;{item.tagline}&rdquo;
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg">
                    {item.highlight}
                  </span>
                  <a
                    href="#waitlist"
                    className="text-amber-700 font-bold hover:text-amber-900 transition flex items-center gap-1 text-[11px]"
                  >
                    <span>Get Launch Code</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── ABOUT ACCRA LAUNCH & VALUE PROPOSITIONS ─────────────── */}
      <section
        id="about-launch"
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 bg-amber-50/70 border border-amber-200/60 rounded-3xl"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white text-amber-700 rounded-2xl shadow-xs shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              Real Home-Cooked Taste
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              No shortcuts, no compromise. Fresh ingredients and traditional Ghanaian recipes.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-white text-amber-700 rounded-2xl shadow-xs shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              On-Time Accra Dispatch
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dispatched swiftly across Accra for office lunch hours, meetings, and family dinners.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-white text-amber-700 rounded-2xl shadow-xs shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              Locked Early Perk
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Single-use free delivery promo code securely stored to your phone or email.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
