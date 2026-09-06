'use client';

import { useState } from "react";
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
} from "lucide-react";

interface TeaserItem {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  highlight: string;
}

const TEASER_MENU: TeaserItem[] = [
  {
    id: "jollof",
    name: "Smoky Ghanaian Jollof",
    emoji: "🍚",
    tagline: "The one you argue about. Ours settles it.",
    description: "Smoky, rich, perfectly spiced firewood-style Jollof rice served with succulent protein and spicy shito.",
    highlight: "Customer Favourite",
  },
  {
    id: "waffles",
    name: "Golden Sweet Waffles",
    emoji: "🧇",
    tagline: "Sweet, golden, made to order.",
    description: "Fluffy Belgian-style waffles made fresh for breakfast, sweet cravings, or dessert.",
    highlight: "Freshly Made",
  },
  {
    id: "banku",
    name: "Banku & Grilled Tilapia",
    emoji: "🐟",
    tagline: "Grilled fresh. Served hot. No shortcuts.",
    description: "Hot, soft banku paired with seasoned charcoal-grilled tilapia, freshly ground pepper and diced onions.",
    highlight: "Local Classic",
  },
  {
    id: "fried-rice",
    name: "Fried Rice & Crispy Chicken",
    emoji: "🍗",
    tagline: "Office lunch, solved.",
    description: "Generous portions of stir-fried rice loaded with veggies, seasoned spices, and tender golden chicken.",
    highlight: "Workday Fuel",
  },
  {
    id: "waakye",
    name: "Special Waakye Platter",
    emoji: "🥘",
    tagline: "A little bit of everything, done right.",
    description: "The full waakye experience — slow-cooked rice & beans, spaghetti/talia, boiled egg, wele, and black shito.",
    highlight: "Accra Essential",
  },
  {
    id: "smoothies",
    name: "Chilled Smoothies & Fresh Juices",
    emoji: "🥤",
    tagline: "Something cold to go with something good.",
    description: "100% natural tropical smoothies and cold-pressed juices to refresh your day.",
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
    `Hey! I just claimed my Early-Bird Free Delivery promo code for Rich-Dons Catering in Accra: *${signupResult?.promoCode}*. Get yours before launch at https://rd-catering.vercel.app/coming-soon`
  )}`;

  return (
    <div className="w-full space-y-12">
      {/* ─── HERO WAITLIST CARD ──────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-amber-950 via-slate-900 to-stone-950 text-white p-6 sm:p-10 shadow-2xl border border-amber-500/20">
        {/* Glow ambient effects */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VIP Launch Early Access • Accra, Ghana</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Fresh Ghanaian Food,{" "}
            <span className="bg-linear-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              Coming to Your Doorstep.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            Jollof, waffles, banku and more — freshly prepared and delivered fast to your office or home in Accra. Join the waitlist to claim your exclusive early-bird perk.
          </p>

          {/* Perk Callout Card */}
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-200 text-xs sm:text-sm font-semibold text-left">
            <Gift className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>Early-Bird Perk:</strong> Get a unique single-use code for <strong>FREE DELIVERY</strong> on your 1st order!
            </span>
          </div>

          {/* Form or Result View */}
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
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-hidden focus:border-amber-400 transition"
                />

                <div className="flex gap-2">
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
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-hidden focus:border-amber-400 transition"
                  />
                  <button
                    type="submit"
                    disabled={loading || !contact.trim()}
                    className="px-5 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-amber-600/30 flex items-center gap-2 shrink-0"
                  >
                    {loading ? (
                      "Generating..."
                    ) : (
                      <>
                        <span>Get Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-rose-400 bg-rose-950/50 border border-rose-800 p-2.5 rounded-xl">
                  {error}
                </p>
              )}

              <p className="text-[11px] text-slate-400 text-center">
                🔒 No spam — just a heads up with your voucher code the day we launch.
              </p>
            </form>
          ) : (
            /* ─── ON-SCREEN VOUCHER CONFIRMATION ───────────────────── */
            <div className="mt-8 p-6 rounded-2xl bg-slate-900/90 border border-amber-500/40 text-left space-y-5 animate-fadeIn">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-white text-lg">
                    {signupResult.alreadyRegistered
                      ? "Welcome Back! Here is Your Code"
                      : "You're On The VIP Launch List!"}
                  </h3>
                  <p className="text-xs text-slate-300">{signupResult.message}</p>
                </div>
              </div>

              {/* Promo Code Voucher Box */}
              <div className="p-4 rounded-xl bg-linear-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-2 border-dashed border-amber-400/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300">
                    Your One-Time Free Delivery Voucher Code
                  </span>
                  <div className="font-mono text-2xl font-extrabold text-white tracking-wider">
                    {signupResult.promoCode}
                  </div>
                  <p className="text-xs text-amber-200/90">
                    🎁 Free Delivery (GH₵ 20.00 off) on your first order
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shrink-0"
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
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 text-center shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Share on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSignupResult(null)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Register Another Contact
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── MENU TEASERS GRID ───────────────────────────────────── */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            Sneak Peek
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            What&apos;s Cooking for Launch
          </h2>
          <p className="text-slate-600 text-sm">
            Generous portions, authentic spices, and made-to-order Ghanaian favourites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TEASER_MENU.map((item) => (
            <div
              key={item.id}
              className="relative p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-4xl" role="img" aria-label={item.name}>
                    {item.emoji}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full shadow-xs">
                    Coming Soon
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-700 transition">
                    {item.name}
                  </h3>
                  <p className="text-xs font-semibold text-amber-800 italic mt-0.5">
                    &ldquo;{item.tagline}&rdquo;
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-amber-900">{item.highlight}</span>
                <span className="text-slate-400">Accra Fast Delivery</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TRUST & VALUE BADGES ────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-amber-50/70 border border-amber-200/60 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white text-amber-700 rounded-xl shadow-xs shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Real Home-Cooked Taste</h4>
            <p className="text-xs text-slate-600">Fresh ingredients, traditional Ghanaian recipes.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white text-amber-700 rounded-xl shadow-xs shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">On-Time Accra Dispatch</h4>
            <p className="text-xs text-slate-600">Office lunch or home dinner delivered hot.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white text-amber-700 rounded-xl shadow-xs shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Guaranteed Early Perk</h4>
            <p className="text-xs text-slate-600">Free delivery voucher stored to your contact.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
