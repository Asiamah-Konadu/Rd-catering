'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Clock3,
  MessageCircle,
  ArrowUp,
  ShieldCheck,
  UtensilsCrossed,
  Sparkles,
  FileText,
  Building2,
  CalendarDays,
  ShoppingBag,
} from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer completely on admin pages
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const whatsappMessage = encodeURIComponent(
    "Hello Rich-Dons Catering! I have an inquiry about your food and catering services."
  );
  const whatsappUrl = `https://wa.me/233540000000?text=${whatsappMessage}`;

  return (
    <footer className="site-footer" aria-label="Site footer">
      {/* ─── TOP SAFETY & DIRECT ASSISTANCE BANNER ────────────────────── */}
      <div className="site-footer-banner">
        <div className="site-footer-banner-inner">
          <div className="site-footer-banner-copy">
            <span className="site-footer-banner-badge">
              <Sparkles size={14} aria-hidden="true" />
              <span>Direct Kitchen Access · Accra</span>
            </span>
            <h3>Need bespoke catering for your office or private event?</h3>
            <p>
              Speak directly with our chefs and catering coordinators on WhatsApp for quick menus, dietary adjustments, and group pricing.
            </p>
          </div>
          <div className="site-footer-banner-actions">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer-cta-whatsapp"
              aria-label="Chat with our kitchen on WhatsApp"
            >
              <MessageCircle size={18} aria-hidden="true" />
              <span>Chat with our kitchen</span>
            </a>
            <Link href="/events" className="site-footer-cta-secondary">
              <CalendarDays size={17} aria-hidden="true" />
              <span>Plan an event</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── MAIN FOOTER CONTENT GRID (THE 5 ESSENTIALS) ─────────────── */}
      <div className="site-footer-main">
        <div className="site-footer-grid">
          {/* 1. BRAND IDENTITY & VALUE PROPOSITION */}
          <div className="site-footer-col site-footer-brand-col">
            <Link href="/" className="site-footer-brand-link" aria-label="Rich-Dons Catering Home">
              <Image
                src="/logo.svg"
                alt="Rich-Dons Catering Logo"
                className="site-footer-logo"
                width={40}
                height={40}
              />
              <div className="site-footer-brand-text">
                <span className="site-footer-brand-name">Rich-Dons</span>
                <span className="site-footer-brand-sub">Catering · Accra</span>
              </div>
            </Link>

            <p className="site-footer-bio">
              Authentic Ghanaian cuisine, freshly prepared with heart, vibrant local spices, and the finest ingredients. Delivering memorable meals to homes, offices, and celebrations across Accra.
            </p>

            <div className="site-footer-badges">
              <span className="site-footer-pill">
                <span className="site-footer-pill-dot" /> Freshly Cooked to Order
              </span>
              <span className="site-footer-pill">
                <ShieldCheck size={13} aria-hidden="true" /> Food Hygiene Certified
              </span>
              <span className="site-footer-pill">
                🇬🇭 Proudly Ghanaian
              </span>
            </div>
          </div>

          {/* 2. KEY NAVIGATION: MENU & DINING */}
          <div className="site-footer-col">
            <h4 className="site-footer-col-title">
              <UtensilsCrossed size={16} aria-hidden="true" />
              <span>Menu & Dining</span>
            </h4>
            <nav aria-label="Menu navigation" className="site-footer-nav-list">
              <Link href="/menu">Full Kitchen Menu</Link>
              <Link href="/#today-menu">Today&apos;s Specials</Link>
              <Link href="/menu">Ghanaian Jollof Rice</Link>
              <Link href="/menu">Swallows & Soups</Link>
              <Link href="/menu">Sides & Extras</Link>
              <Link href="/#how-to-order">How Ordering Works</Link>
            </nav>
          </div>

          {/* 2. KEY NAVIGATION: CATERING SERVICES */}
          <div className="site-footer-col">
            <h4 className="site-footer-col-title">
              <Building2 size={16} aria-hidden="true" />
              <span>Catering Services</span>
            </h4>
            <nav aria-label="Catering services navigation" className="site-footer-nav-list">
              <Link href="/corporate">Corporate Lunch Portals</Link>
              <Link href="/events">Event & Wedding Catering</Link>
              <Link href="/corporate">Office Batch Delivery</Link>
              <Link href="/events">Book Catering Consultation</Link>
              <Link href="/cart">
                <span className="inline-flex items-center gap-1.5">
                  <ShoppingBag size={14} aria-hidden="true" />
                  <span>Review Your Bag</span>
                </span>
              </Link>
              <Link href="/checkout">Checkout & Confirmation</Link>
            </nav>
          </div>

          {/* 3. LEGAL & COMPLIANCE (TRUST & SAFETY NET) */}
          <div className="site-footer-col">
            <h4 className="site-footer-col-title">
              <FileText size={16} aria-hidden="true" />
              <span>Legal & Safety</span>
            </h4>
            <nav aria-label="Legal and compliance navigation" className="site-footer-nav-list">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/terms#cancellation-refunds">Refund & Cancellation</Link>
              <Link href="/terms#food-safety">Food Hygiene & Allergens</Link>
              <Link href="/terms#delivery-policy">Delivery & Coverage Terms</Link>
              <Link href="/terms#payment-terms">Secure Payment Methods</Link>
            </nav>
          </div>

          {/* 4. CONTACT INFORMATION & OPERATING HOURS */}
          <div className="site-footer-col site-footer-contact-col">
            <h4 className="site-footer-col-title">
              <Clock3 size={16} aria-hidden="true" />
              <span>Contact & Hours</span>
            </h4>
            <ul className="site-footer-contact-list">
              <li>
                <MapPin size={17} className="site-footer-icon" aria-hidden="true" />
                <div>
                  <strong>Location & Delivery</strong>
                  <span>Accra, Greater Accra Region, Ghana</span>
                  <small className="site-footer-subtext">Delivering to East Legon, Cantonments, Airport, Osu, Ridge, Dzorwulu & Greater Accra</small>
                </div>
              </li>
              <li>
                <Phone size={17} className="site-footer-icon" aria-hidden="true" />
                <div>
                  <strong>Order Hotline & WhatsApp</strong>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="site-footer-phone-link">
                    +233 (0) 54 000 0000
                  </a>
                  <span className="site-footer-live-status">
                    <span className="site-footer-live-dot" /> Kitchen open now
                  </span>
                </div>
              </li>
              <li>
                <Mail size={17} className="site-footer-icon" aria-hidden="true" />
                <div>
                  <strong>Email Inquiries</strong>
                  <a href="mailto:orders@richdonscatering.com" className="site-footer-email-link">
                    orders@richdonscatering.com
                  </a>
                </div>
              </li>
              <li>
                <Clock3 size={17} className="site-footer-icon" aria-hidden="true" />
                <div>
                  <strong>Kitchen Hours</strong>
                  <span>Mon – Sat: 8:00 AM – 10:00 PM</span>
                  <span>Sunday: 11:00 AM – 8:00 PM</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ─── 5. COPYRIGHT NOTICE, LEGAL DISCLAIMER & SAFETY NET ─────────── */}
      <div className="site-footer-bottom">
        <div className="site-footer-bottom-inner">
          <div className="site-footer-bottom-legal">
            <p className="site-footer-copyright">
              © {currentYear} Rich-Dons Catering. All rights reserved.
            </p>
            <p className="site-footer-disclaimer">
              Registered catering and food service operator in Accra, Ghana. Complying with Ghana Food and Drugs Authority (FDA) hygiene practices and the Data Protection Act (Act 843).
            </p>
          </div>

          <div className="site-footer-bottom-actions">
            <div className="site-footer-payment-badges" aria-label="Accepted order payments">
              <span>Mobile Money</span>
              <span>Hubtel</span>
              <span>Card</span>
              <span>WhatsApp Direct</span>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="site-footer-back-to-top"
              aria-label="Scroll back to top of page"
            >
              <span>Back to top</span>
              <ArrowUp size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
