"use client";

import { useState, type FormEvent } from "react";

export function EventInquiryClient({ whatsappUrl }: { whatsappUrl: string | null }) {
  const [error, setError] = useState("");

  function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!whatsappUrl) {
      setError("WhatsApp booking is unavailable right now. Please call Rich-Dons Catering.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const fields = [
      ["Name", formData.get("name")],
      ["Phone", formData.get("phone")],
      ["Event", formData.get("eventType")],
      ["Date", formData.get("eventDate")],
      ["Guests", formData.get("guests")],
      ["Venue", formData.get("location")],
      ["Budget", formData.get("budget")],
      ["Details", formData.get("details")],
    ].filter(([, value]) => String(value ?? "").trim());
    const message = [
      "Hello Rich-Dons Catering! I'd like to enquire about event catering.",
      "",
      ...fields.map(([label, value]) => `${label}: ${String(value).trim()}`),
      "",
      "Please confirm availability and discuss menu options.",
    ].join("\n");
    const destination = new URL(whatsappUrl);
    destination.searchParams.set("text", message);
    window.location.assign(destination.toString());
  }

  return (
    <form
      onSubmit={submitInquiry}
      className="mx-auto grid max-w-3xl gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"
    >
      <label className="grid gap-1 text-sm font-semibold text-slate-800">
        Your name
        <input name="name" autoComplete="name" required className="rounded-lg border border-slate-300 p-2.5" />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-800">
        Phone number
        <input name="phone" type="tel" autoComplete="tel" required className="rounded-lg border border-slate-300 p-2.5" />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-800">
        Type of event
        <select name="eventType" defaultValue="" required className="rounded-lg border border-slate-300 p-2.5">
          <option value="" disabled>Select an event</option>
          <option>Wedding or ceremony</option>
          <option>Corporate function</option>
          <option>Birthday or reunion</option>
          <option>Private dining</option>
          <option>Other celebration</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-800">
        Event date
        <input name="eventDate" type="date" required className="rounded-lg border border-slate-300 p-2.5" />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-800">
        Estimated guest count
        <input name="guests" type="number" min="1" required className="rounded-lg border border-slate-300 p-2.5" />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-800">
        Venue or area
        <input name="location" required className="rounded-lg border border-slate-300 p-2.5" />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-800 sm:col-span-2">
        Dietary needs or other details (optional)
        <textarea name="details" rows={3} className="rounded-lg border border-slate-300 p-2.5" />
      </label>
      <label className="grid gap-1 text-sm font-semibold text-slate-800">
        Estimated budget (optional)
        <input name="budget" inputMode="decimal" className="rounded-lg border border-slate-300 p-2.5" />
      </label>
      <div className="flex flex-col justify-end gap-2">
        <button
          type="submit"
          className="rounded-lg bg-amber-500 px-5 py-3 font-bold text-slate-950 hover:bg-amber-400"
        >
          Request event availability on WhatsApp
        </button>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </div>
    </form>
  );
}
