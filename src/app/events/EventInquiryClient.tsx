'use client';

import { useRef, useState, type FormEvent } from "react";
import {
  CalendarDays,
  Check,
  ChefHat,
  MessageCircle,
  PartyPopper,
  UsersRound,
  UtensilsCrossed,
  Sparkles,
  ShieldCheck,
  Flame,
  ArrowRight,
  Phone,
  ChevronDown,
  Layers,
  Award,
} from "lucide-react";
import EventBanquetWebGL from "@/components/events/EventBanquetWebGL";
import { BUSINESS_CONTACT } from "@/lib/business";

export type EventFaq = {
  question: string;
  answer: string;
};

type EventInquiryProps = {
  whatsappUrl: string | null;
  faqs?: EventFaq[];
};

export function EventInquiryClient({ whatsappUrl, faqs = [] }: EventInquiryProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const formRef = useRef<HTMLFormElement>(null);

  function moveStep(direction: number) {
    const form = formRef.current;
    if (!form) return;
    if (direction > 0) {
      const fields = Array.from(
        form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
          `[data-step="${step}"] input, [data-step="${step}"] select, [data-step="${step}"] textarea`
        )
      );
      const invalid = fields.find((field) => !field.checkValidity());
      if (invalid) {
        invalid.reportValidity();
        return;
      }
    }
    setStep((current) => Math.max(0, Math.min(2, current + direction)));
  }

  function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!whatsappUrl) {
      setError("WhatsApp booking is temporarily unavailable. Please call our kitchen directly.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const fields = [
      ["Name", form.get("name")],
      ["Phone", form.get("phone")],
      ["Event", form.get("eventType")],
      ["Date", form.get("eventDate")],
      ["Start Time", form.get("eventTime")],
      ["Estimated Guests", form.get("guests")],
      ["Venue / Area", form.get("location")],
      ["Budget Range", form.get("budget")],
      ["Special Notes & Dishes", form.get("details")],
    ] as const;

    const message = [
      "Hello Rich-Dons Catering! I would like to request an event catering consultation.",
      "",
      ...fields
        .filter(([, value]) => String(value || "").trim())
        .map(([label, value]) => `• ${label}: ${String(value).trim()}`),
      "",
      "Please let me know your availability and discuss tailored menu options.",
    ].join("\n");

    const destination = new URL(whatsappUrl);
    destination.searchParams.set("text", message);
    window.open(destination.toString(), "_blank", "noopener,noreferrer");
    setError("");
    setSubmitted(true);
  }

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return (
    <main className="events-page min-h-screen bg-[#fffaf5] text-[#211a16] selection:bg-amber-600 selection:text-white">
      {/* ─── 1. HERO SECTION (PRESERVED AS REQUESTED) ─────────────────── */}
      <section className="events-photo-hero" aria-label="Event catering in Accra">
        <img
          src="/events-banquet.jpg"
          alt="A beautifully arranged Rich-Dons Catering banquet with golden chafing dishes"
        />
        <div className="events-photo-shade" />
        <div className="events-webgl-desktop">
          <EventBanquetWebGL />
        </div>
        <div className="events-photo-copy">
          <span>Event catering in Accra</span>
          <h1>Make your gathering worth gathering for.</h1>
          <p>
            From intimate dinners to milestone celebrations, we plan a menu
            that feels generous, considered, and unmistakably Ghanaian.
          </p>
          <a href="#appointment">
            Plan your event <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      {/* ─── 2. CELEBRATION PILLARS STRIP ───────────────────────────────── */}
      <section
        className="bg-[#181310] border-y border-[#322720] text-white py-8 px-4 sm:px-6"
        aria-label="Event catering categories"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: PartyPopper,
              title: "Weddings & Engagements",
              desc: "Traditional ceremonies, wedding receptions, and celebratory family banquets.",
            },
            {
              icon: UtensilsCrossed,
              title: "Corporate Galas",
              desc: "Executive dinners, annual galas, client banquets, and product launches.",
            },
            {
              icon: UsersRound,
              title: "Birthdays & Reunions",
              desc: "Milestone birthdays, anniversaries, and joyful family homecomings.",
            },
            {
              icon: ChefHat,
              title: "Bespoke Private Dining",
              desc: "Intimate multi-course meals with dedicated chef preparation.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/30 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <Icon size={22} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-black text-amber-100 tracking-tight">
                  {title}
                </h2>
                <p className="text-xs text-amber-200/60 leading-relaxed mt-1">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. BANQUET EXPERIENCE (WHY HOSTS CHOOSE RICH-DONS) ──────── */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto" aria-labelledby="experience-heading">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles size={13} className="text-amber-700" />
            <span>The Rich-Dons Catering Standard</span>
          </span>
          <h2
            id="experience-heading"
            className="text-3xl sm:text-4xl font-serif font-bold text-[#211a16] tracking-tight leading-tight"
          >
            Authentic Ghanaian Banquets. Elevated Presentation.
          </h2>
          <p className="mt-3 text-base text-[#68645a] leading-relaxed">
            Whether for 30 intimate guests or a reception of 500, we bring generous
            hospitality, rich slow-cooked flavors, and polished event staging to your table.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Flame,
              title: "Firewood & Authentic Flavors",
              body: "Slow-simmered Ghanaian Jollof, spiced waakye, grilled tender chicken, tilapia, beef, and fragrant local sauces prepared from scratch.",
            },
            {
              icon: Award,
              title: "Golden Chafing & Table Setup",
              body: "Gleaming golden and stainless roll-top chafing warmers and elevated presentation stations that harmonize with your event decor.",
            },
            {
              icon: Layers,
              title: "Tailored Multi-Course Menus",
              body: "Customized menus designed around your guest preferences, dietary requirements, course progressions, and budget parameters.",
            },
            {
              icon: ShieldCheck,
              title: "Dedicated Banquet Stewards",
              body: "Punctual kitchen setup, attentive food temperature management, smooth hot replenishment, and hospitable guest care.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-[#eadfd6] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 mb-5">
                  <Icon size={24} />
                </div>
                <h3 className="text-base font-bold text-[#211a16] mb-2">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-[#68645a] leading-relaxed">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. HOW WE PLAN YOUR EVENT (3 SIMPLE STEPS) ───────────────── */}
      <section className="bg-[#f7efe6] border-y border-[#eadfd6] py-18 px-4 sm:px-6" aria-labelledby="steps-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#c74325]">
              Seamless Planning
            </span>
            <h2
              id="steps-heading"
              className="text-2xl sm:text-3xl font-serif font-bold text-[#211a16] mt-1.5"
            >
              From First Discussion to the Final Course
            </h2>
            <p className="text-sm text-[#68645a] mt-2">
              Three straightforward steps to bring delicious Ghanaian food to your celebration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "Share Your Vision",
                text: "Tell us your event date, venue in Accra, estimated guest count, and the culinary atmosphere you envision.",
              },
              {
                num: "02",
                title: "Curate Your Custom Menu",
                text: "We confirm date availability, recommend menu packages with transparent pricing, and fine-tune each dish to your palate.",
              },
              {
                num: "03",
                title: "Be a Guest at Your Event",
                text: "On event day, our kitchen arrives early with hot chafing setups and attentive service so you can relax and celebrate.",
              },
            ].map(({ num, title, text }) => (
              <div
                key={num}
                className="bg-white rounded-3xl p-7 border border-[#e4d6c8] shadow-xs relative overflow-hidden"
              >
                <span className="text-3xl font-serif font-black text-amber-700/20 absolute top-5 right-6">
                  {num}
                </span>
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-600 text-white text-[11px] font-black mb-3">
                  Step {num}
                </span>
                <h3 className="text-lg font-bold text-[#211a16] mb-2">{title}</h3>
                <p className="text-sm text-[#68645a] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. INTERACTIVE APPOINTMENT & QUOTE REQUEST ───────────────── */}
      <section
        id="appointment"
        className="bg-[#191411] text-white py-20 px-4 sm:px-6 relative overflow-hidden scroll-mt-20"
        aria-labelledby="booking-heading"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,210,138,0.1),transparent_70%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative z-10">
          {/* Left Column: Context & Direct Contact */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide uppercase">
              <CalendarDays size={14} />
              <span>Event Consultation</span>
            </div>

            <h2
              id="booking-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight"
            >
              One conversation.<br />
              <span className="text-amber-300">One memorable table.</span>
            </h2>

            <p className="text-amber-100/70 text-sm sm:text-base leading-relaxed">
              Tell us the occasion, guest count, preferred date, and venue. We will prepare
              your details into a ready-to-send WhatsApp message so our catering team can
              immediately check availability and discuss menu options with you.
            </p>

            <div className="space-y-3.5 pt-2 border-t border-white/10">
              <div className="flex items-start gap-3 text-xs sm:text-sm text-amber-100/90">
                <Check size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <span>Personalized consultation with our head of catering</span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-amber-100/90">
                <Check size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <span>Clear, transparent quotes tailored to your budget</span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-amber-100/90">
                <Check size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <span>Full-service delivery & chafing setup across Greater Accra</span>
              </div>
            </div>

            {/* Direct Telephone Cards */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`https://wa.me/${BUSINESS_CONTACT.whatsappInternational.slice(1)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition"
              >
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-amber-200/60 uppercase">WhatsApp Chat</div>
                  <div className="text-xs font-bold text-white">{BUSINESS_CONTACT.whatsapp}</div>
                </div>
              </a>

              <a
                href={`tel:+233${BUSINESS_CONTACT.phones[0].slice(1)}`}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition"
              >
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Phone size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-amber-200/60 uppercase">Direct Kitchen Call</div>
                  <div className="text-xs font-bold text-white">{BUSINESS_CONTACT.phones[0]}</div>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: 3-Step Interactive Form */}
          <div className="lg:col-span-7 bg-[#231d19] border border-[#3e322b] rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-white">
                  Request Event Appointment
                </h3>
                <p className="text-xs text-amber-200/60 mt-0.5">
                  Step {step + 1} of 3: {["Your Occasion & Date", "Scale, Venue & Budget", "Contact & Send"][step]}
                </p>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {step + 1} / 3
              </span>
            </div>

            {/* Step Progress Bar */}
            <div className="mb-6" aria-hidden="true">
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${((step + 1) / 3) * 100}%` }}
                />
              </div>
            </div>

            {submitted && (
              <div
                className="mb-6 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm flex items-center gap-3"
                role="status"
              >
                <Check size={20} className="text-emerald-400 shrink-0" />
                <span>
                  Message ready in WhatsApp! Send the message to complete your appointment request.
                </span>
              </div>
            )}

            <form ref={formRef} onSubmit={submitInquiry} className="space-y-4">
              {/* STEP 0: Occasion & Date */}
              <div data-step="0" hidden={step !== 0} className="space-y-4">
                <div>
                  <label htmlFor="event-type" className="block text-xs font-bold uppercase tracking-wider text-amber-200/80 mb-1.5">
                    Type of Event *
                  </label>
                  <select
                    id="event-type"
                    name="eventType"
                    required
                    defaultValue=""
                    className="w-full bg-[#181310] border border-white/15 rounded-xl px-3.5 py-3 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  >
                    <option value="" disabled className="bg-[#181310] text-slate-400">
                      Select event type...
                    </option>
                    <option value="Wedding & Traditional Engagement" className="bg-[#181310] text-white">Wedding & Traditional Engagement</option>
                    <option value="Corporate Function or Banquet" className="bg-[#181310] text-white">Corporate Function or Banquet</option>
                    <option value="Milestone Birthday Celebration" className="bg-[#181310] text-white">Milestone Birthday Celebration</option>
                    <option value="Anniversary Celebration" className="bg-[#181310] text-white">Anniversary Celebration</option>
                    <option value="Private Dinner / Family Feast" className="bg-[#181310] text-white">Private Dinner / Family Feast</option>
                    <option value="Funeral / Thanksgiving Gathering" className="bg-[#181310] text-white">Funeral / Thanksgiving Gathering</option>
                    <option value="Other Celebration" className="bg-[#181310] text-white">Other Celebration</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event-date" className="block text-xs font-bold uppercase tracking-wider text-amber-200/80 mb-1.5">
                      Event Date *
                    </label>
                    <input
                      id="event-date"
                      name="eventDate"
                      type="date"
                      min={today}
                      required
                      className="w-full bg-[#181310] border border-white/15 rounded-xl px-3.5 py-3 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="event-time" className="block text-xs font-bold uppercase tracking-wider text-amber-200/80 mb-1.5">
                      Preferred Serving Time
                    </label>
                    <input
                      id="event-time"
                      name="eventTime"
                      type="time"
                      className="w-full bg-[#181310] border border-white/15 rounded-xl px-3.5 py-3 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 1: Scale, Venue & Budget */}
              <div data-step="1" hidden={step !== 1} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event-guests" className="block text-xs font-bold uppercase tracking-wider text-amber-200/80 mb-1.5">
                      Estimated Guests *
                    </label>
                    <input
                      id="event-guests"
                      name="guests"
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 50"
                      className="w-full bg-[#181310] border border-white/15 rounded-xl px-3.5 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="event-budget" className="block text-xs font-bold uppercase tracking-wider text-amber-200/80 mb-1.5">
                      Estimated Budget Range
                    </label>
                    <select
                      id="event-budget"
                      name="budget"
                      defaultValue=""
                      className="w-full bg-[#181310] border border-white/15 rounded-xl px-3.5 py-3 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                    >
                      <option value="" disabled className="bg-[#181310] text-slate-400">Select budget range...</option>
                      <option value="Under GH₵ 5,000" className="bg-[#181310] text-white">Under GH₵ 5,000</option>
                      <option value="GH₵ 5,000 – GH₵ 10,000" className="bg-[#181310] text-white">GH₵ 5,000 – GH₵ 10,000</option>
                      <option value="GH₵ 10,000 – GH₵ 20,000" className="bg-[#181310] text-white">GH₵ 10,000 – GH₵ 20,000</option>
                      <option value="GH₵ 20,000 – GH₵ 50,000" className="bg-[#181310] text-white">GH₵ 20,000 – GH₵ 50,000</option>
                      <option value="Over GH₵ 50,000" className="bg-[#181310] text-white">Over GH₵ 50,000</option>
                      <option value="Open to recommendations" className="bg-[#181310] text-white">Open to recommendations</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="event-location" className="block text-xs font-bold uppercase tracking-wider text-amber-200/80 mb-1.5">
                    Venue or Area in Accra *
                  </label>
                  <input
                    id="event-location"
                    name="location"
                    required
                    placeholder="e.g. East Legon, Cantonments, Airport Residential, Tema..."
                    className="w-full bg-[#181310] border border-white/15 rounded-xl px-3.5 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>

                <div>
                  <label htmlFor="event-details" className="block text-xs font-bold uppercase tracking-wider text-amber-200/80 mb-1.5">
                    Special Requests or Preferred Dishes
                  </label>
                  <textarea
                    id="event-details"
                    name="details"
                    rows={3}
                    placeholder="e.g. Smoky Jollof, spicy waakye, grilled fish, goat light soup, vegetarian options, buffet setup..."
                    className="w-full bg-[#181310] border border-white/15 rounded-xl p-3.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition resize-none"
                  />
                </div>
              </div>

              {/* STEP 2: Contact Details & Submit */}
              <div data-step="2" hidden={step !== 2} className="space-y-4">
                <div>
                  <label htmlFor="event-name" className="block text-xs font-bold uppercase tracking-wider text-amber-200/80 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    id="event-name"
                    name="name"
                    autoComplete="name"
                    required
                    placeholder="Full name"
                    className="w-full bg-[#181310] border border-white/15 rounded-xl px-3.5 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>

                <div>
                  <label htmlFor="event-phone" className="block text-xs font-bold uppercase tracking-wider text-amber-200/80 mb-1.5">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    id="event-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    placeholder="e.g. 059 175 4764"
                    className="w-full bg-[#181310] border border-white/15 rounded-xl px-3.5 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed">
                  Clicking below will open WhatsApp with your booking details cleanly organized so our catering team can reply promptly.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-3">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => moveStep(-1)}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition"
                  >
                    Back
                  </button>
                )}

                {step < 2 ? (
                  <button
                    type="button"
                    onClick={() => moveStep(1)}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#c74325] hover:bg-[#a8351c] text-white text-xs sm:text-sm font-black transition active:scale-[0.98] shadow-md"
                  >
                    <span>Continue</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!whatsappUrl}
                    className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black transition active:scale-[0.98] shadow-lg disabled:opacity-50"
                  >
                    <MessageCircle size={18} />
                    <span>Request Appointment on WhatsApp</span>
                  </button>
                )}
              </div>
            </form>

            {error && (
              <p className="mt-3 text-xs text-rose-400 text-center" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ─── 6. FREQUENTLY ASKED QUESTIONS (FAQ) ──────────────────────── */}
      {faqs.length > 0 && (
        <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto" aria-labelledby="faq-heading">
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#c74325]">
              Common Inquiries
            </span>
            <h2
              id="faq-heading"
              className="text-2xl sm:text-3xl font-serif font-bold text-[#211a16] mt-1.5"
            >
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#68645a] mt-2">
              Everything you need to know about planning event catering with Rich-Dons.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.question}
                  className="bg-white rounded-2xl border border-[#eadfd6] shadow-2xs overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left gap-4 font-bold text-sm sm:text-base text-[#211a16] hover:text-[#c74325] transition"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-amber-700 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#68645a] leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── 7. CLOSING BANNER & CONTACT ───────────────────────────────── */}
      <section className="bg-[#181310] border-t border-[#322720] py-16 px-4 sm:px-6 text-center text-white">
        <div className="max-w-2xl mx-auto space-y-6">
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">
            Rich-Dons Catering · Accra
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white leading-tight">
            Ready to plan something memorable?
          </h2>
          <p className="text-sm text-amber-100/70 max-w-lg mx-auto leading-relaxed">
            Speak directly with our team on WhatsApp or call our kitchen to secure your date
            and discuss customized menus for your celebration.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#c74325] hover:bg-[#a8351c] text-white text-xs sm:text-sm font-black transition active:scale-95 shadow-lg"
              >
                <MessageCircle size={17} />
                <span>Discuss Your Event on WhatsApp</span>
              </a>
            )}
            <a
              href={`tel:+233${BUSINESS_CONTACT.phones[0].slice(1)}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-black transition active:scale-95 border border-white/15"
            >
              <Phone size={16} />
              <span>Call Kitchen ({BUSINESS_CONTACT.phones[0]})</span>
            </a>
          </div>

          <div className="pt-6 text-xs text-amber-200/40">
            Delivering across Greater Accra · Monday–Saturday 10am–10pm · Sunday 11am–8pm
          </div>
        </div>
      </section>
    </main>
  );
}
