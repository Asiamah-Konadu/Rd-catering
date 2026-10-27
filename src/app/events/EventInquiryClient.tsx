'use client';

import { FormEvent, useState } from "react";
import {
  CalendarDays,
  Check,
  ChefHat,
  MessageCircle,
  PartyPopper,
  UsersRound,
  UtensilsCrossed,
} from "lucide-react";
import SandTypographyHero from "@/components/events/SandTypography";

type EventInquiryProps = {
  whatsappUrl: string | null;
};

export function EventInquiryClient({ whatsappUrl }: EventInquiryProps) {
  const [submitted, setSubmitted] = useState(false);

  function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!whatsappUrl) {
      alert("WhatsApp is not configured yet. Please try again later.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const fields = [
      ["Name", form.get("name")],
      ["Phone", form.get("phone")],
      ["Event", form.get("eventType")],
      ["Date", form.get("eventDate")],
      ["Time", form.get("eventTime")],
      ["Guests", form.get("guests")],
      ["Location", form.get("location")],
      ["Budget", form.get("budget")],
      ["Details", form.get("details")],
    ] as const;

    const message = [
      "Hello Rich-Dons Catering! I would like to discuss event catering.",
      "",
      ...fields
        .filter(([, value]) => String(value || "").trim())
        .map(([label, value]) => `${label}: ${String(value).trim()}`),
      "",
      "Please help me schedule an appointment to plan this event.",
    ].join("\n");

    window.open(
      `${whatsappUrl.split("?text=")[0]}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
    setSubmitted(true);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <main className="events-page">
      <SandTypographyHero
        heading="Make your gathering worth gathering for."
        subheading="From intimate dinners to milestone celebrations in Accra, we plan a menu that feels generous, considered, and unmistakably Ghanaian."
        ctaLabel="Plan your event ↓"
        onCTAClick="#appointment"
      />

      {/* ── Types strip ── */}
      <section className="events-types" aria-label="Event catering types">
        {[
          { icon: PartyPopper, label: "Weddings & ceremonies" },
          { icon: UtensilsCrossed, label: "Corporate functions" },
          { icon: UsersRound, label: "Birthdays & reunions" },
          { icon: ChefHat, label: "Private dining" },
        ].map(({ icon: Icon, label }) => (
          <div key={label}><Icon size={20} aria-hidden="true" /><span>{label}</span></div>
        ))}
      </section>

      {/* ── Landscape scene section ── */}
      <section className="events-landscape" aria-label="Event planning and appointment">
        {/* sky + horizon gradient lives in CSS; SVG landscape silhouette */}
        <svg
          className="events-landscape-svg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Far hills */}
          <path
            d="M0,220 C120,180 200,200 320,195 C440,190 500,210 600,205 C700,200 780,185 900,192 C1020,199 1100,215 1200,205 C1300,195 1380,210 1440,208 L1440,320 L0,320 Z"
            fill="#2d4a22"
            opacity="0.55"
          />
          {/* Mid hills – tree silhouettes */}
          <path
            d="M0,255 C60,240 90,242 130,238 C160,234 170,228 200,235 C230,242 250,250 290,244 C330,238 360,232 400,238 C440,244 460,252 510,248 C560,244 590,236 640,240 C690,244 720,252 780,248 C840,244 880,234 940,238 C1000,242 1040,254 1100,250 C1160,246 1200,238 1260,242 C1320,246 1380,255 1440,252 L1440,320 L0,320 Z"
            fill="#1e3a14"
            opacity="0.75"
          />
          {/* Tree tops row */}
          <path
            d="M0,275 C20,262 38,258 55,264 C72,270 80,276 100,268 C120,260 135,252 158,258 C181,264 195,272 220,266 C245,260 262,250 290,256 C318,262 335,272 365,266 C395,260 415,250 445,255 C475,260 495,268 525,263 C555,258 572,248 600,254 C628,260 645,270 675,265 C705,260 725,250 755,255 C785,260 800,270 830,265 C860,260 880,250 912,255 C944,260 960,270 992,265 C1024,260 1044,248 1076,254 C1108,260 1125,272 1155,266 C1185,260 1205,250 1235,256 C1265,262 1285,272 1315,267 C1345,262 1400,254 1440,260 L1440,320 L0,320 Z"
            fill="#142a0d"
          />
          {/* Foreground ground */}
          <path
            d="M0,300 C200,290 400,296 600,292 C800,288 1000,295 1200,291 C1350,288 1400,296 1440,294 L1440,320 L0,320 Z"
            fill="#0d1e08"
          />
        </svg>

        {/* content grid */}
        <div className="events-landscape-inner">
          {/* LEFT – open sky copy */}
          <div className="events-landscape-copy">
            <span className="events-landscape-kicker">
              <CalendarDays size={14} aria-hidden="true" /> Your event, thoughtfully planned
            </span>
            <h2 className="events-landscape-h2">
              One conversation.<br />One memorable table.
            </h2>
            <p className="events-landscape-lead">
              Tell us the occasion, guest count, date and location.
              We&apos;ll shape the menu, serving format and timing around
              what you need — from first bite to final course.
            </p>

            <ol className="events-landscape-steps">
              <li>
                <span aria-hidden="true">01</span>
                <div>
                  <strong>Share the essentials</strong>
                  <p>Your date, place, guests and occasion.</p>
                </div>
              </li>
              <li>
                <span aria-hidden="true">02</span>
                <div>
                  <strong>Meet with our team</strong>
                  <p>We confirm availability and refine the menu.</p>
                </div>
              </li>
              <li>
                <span aria-hidden="true">03</span>
                <div>
                  <strong>Be a guest at your event</strong>
                  <p>We handle the food while you enjoy the moment.</p>
                </div>
              </li>
            </ol>
          </div>

          {/* RIGHT – floating glass appointment card */}
          <div className="events-glass-card" id="appointment">
            <div className="events-glass-heading">
              <span>Appointment request</span>
              <h3>Tell us what you&apos;re planning</h3>
              <p>We&apos;ll prepare your details as a WhatsApp message.</p>
            </div>

            {submitted && (
              <div className="events-success" role="status">
                <Check size={18} aria-hidden="true" />
                <span>Message ready in WhatsApp — send it to confirm your request.</span>
              </div>
            )}

            <form className="events-form" onSubmit={submitInquiry}>
              <div className="events-field events-field-wide">
                <label htmlFor="event-name">Your name</label>
                <input id="event-name" name="name" autoComplete="name" required placeholder="Full name" />
              </div>
              <div className="events-field">
                <label htmlFor="event-phone">Phone number</label>
                <input id="event-phone" name="phone" type="tel" autoComplete="tel" required placeholder="e.g. 024 000 0000" />
              </div>
              <div className="events-field">
                <label htmlFor="event-type">Type of event</label>
                <select id="event-type" name="eventType" required defaultValue="">
                  <option value="" disabled>Select event</option>
                  <option>Wedding</option>
                  <option>Corporate event</option>
                  <option>Birthday</option>
                  <option>Anniversary</option>
                  <option>Private dinner</option>
                  <option>Other celebration</option>
                </select>
              </div>
              <div className="events-field">
                <label htmlFor="event-date">Event date</label>
                <input id="event-date" name="eventDate" type="date" min={today} required />
              </div>
              <div className="events-field">
                <label htmlFor="event-time">Start time</label>
                <input id="event-time" name="eventTime" type="time" required />
              </div>
              <div className="events-field">
                <label htmlFor="event-guests">Estimated guests</label>
                <input id="event-guests" name="guests" type="number" min="1" required placeholder="No. of guests" />
              </div>
              <div className="events-field">
                <label htmlFor="event-budget">Estimated budget</label>
                <select id="event-budget" name="budget" required defaultValue="">
                  <option value="" disabled>Select a range</option>
                  <option>Under GH₵ 5,000</option>
                  <option>GH₵ 5,000 – 10,000</option>
                  <option>GH₵ 10,000 – 20,000</option>
                  <option>GH₵ 20,000 – 50,000</option>
                  <option>Over GH₵ 50,000</option>
                </select>
              </div>
              <div className="events-field events-field-wide">
                <label htmlFor="event-location">Venue or location</label>
                <input id="event-location" name="location" required placeholder="Venue name and area" />
              </div>
              <div className="events-field events-field-wide">
                <label htmlFor="event-details">What would make the meal special?</label>
                <textarea
                  id="event-details"
                  name="details"
                  rows={3}
                  placeholder="Preferred dishes, dietary needs, serving style, or anything else"
                />
              </div>
              <button className="events-submit events-field-wide" type="submit" disabled={!whatsappUrl}>
                <MessageCircle size={19} aria-hidden="true" />
                Request appointment on WhatsApp
              </button>
            </form>
            {!whatsappUrl && (
              <p className="events-config-note">WhatsApp booking is temporarily unavailable.</p>
            )}
          </div>
        </div>
      </section>

      <div className="events-footer events-callout-banner">
        <p>Thoughtful Ghanaian catering, from the first plate to the last guest.</p>
        {whatsappUrl ? (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={17} aria-hidden="true" /> Discuss your event
          </a>
        ) : (
          <span>Event appointments via WhatsApp</span>
        )}
      </div>
    </main>
  );
}
