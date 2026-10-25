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
      <section className="events-hero">
        <div className="events-hero-copy">
          <span className="events-kicker"><span /> Event catering in Accra</span>
          <h1>Make your gathering <em>worth gathering for.</em></h1>
          <p>
            From intimate dinners to milestone celebrations, we plan a menu that feels
            generous, considered, and unmistakably Ghanaian.
          </p>
          <a className="events-primary" href="#appointment">
            Plan your event <CalendarDays size={18} aria-hidden="true" />
          </a>
        </div>
        <div className="events-hero-image" aria-hidden="true">
          <div className="events-image-mark">Rich-Dons<br />Catering</div>
        </div>
      </section>

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

      <section className="events-planning">
        <div className="events-planning-copy">
          <span className="events-kicker">Your event, thoughtfully done</span>
          <h2>One conversation.<br />One memorable table.</h2>
          <p>
            Tell us the occasion, guest count, date and location. We will shape the menu,
            serving format and timing around what you need.
          </p>
          <ol>
            <li><span>01</span><div><strong>Share the essentials</strong><p>Your date, place, guests and occasion.</p></div></li>
            <li><span>02</span><div><strong>Meet with our team</strong><p>We confirm availability and refine the menu.</p></div></li>
            <li><span>03</span><div><strong>Be a guest at your event</strong><p>We coordinate the food while you enjoy the moment.</p></div></li>
          </ol>
        </div>

        <div className="events-form-wrap" id="appointment">
          <div className="events-form-heading">
            <span>Appointment request</span>
            <h2>Tell us what you&apos;re planning</h2>
            <p>We&apos;ll prepare your details as a WhatsApp message.</p>
          </div>

          {submitted && (
            <div className="events-success" role="status">
              <Check size={18} aria-hidden="true" />
              <span>Your message is ready in WhatsApp. Send it to complete your request.</span>
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
              <input id="event-guests" name="guests" type="number" min="1" required placeholder="Number of guests" />
            </div>
            <div className="events-field">
              <label htmlFor="event-budget">Estimated budget</label>
              <select id="event-budget" name="budget" required defaultValue="">
                <option value="" disabled>Select a range</option>
                <option>Under GH₵ 5,000</option>
                <option>GH₵ 5,000 - 10,000</option>
                <option>GH₵ 10,000 - 20,000</option>
                <option>GH₵ 20,000 - 50,000</option>
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
                rows={4}
                placeholder="Preferred dishes, dietary needs, serving style, or anything else we should know"
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
      </section>

      <footer className="events-footer">
        <p>Thoughtful Ghanaian catering, from the first plate to the last guest.</p>
        {whatsappUrl ? (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={17} aria-hidden="true" /> Discuss your event
          </a>
        ) : (
          <span>Event appointments via WhatsApp</span>
        )}
      </footer>
    </main>
  );
}
