'use client';

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Sparkles, Utensils, SlidersHorizontal, MessageCircle, ChevronRight } from "lucide-react";

interface OrderStep {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  alt: string;
  badge: string;
  icon: React.ReactNode;
}

const ORDER_STEPS: OrderStep[] = [
  {
    id: "step-1",
    step: "01",
    title: "Choose Your Dishes",
    subtitle: "Explore the Menu",
    description:
      "Browse authentic Ghanaian favourites — smoky Jollof, Accra Waakye, Banku & Tilapia, or our daily chef special pots cooked fresh every morning.",
    imageUrl: "/how-to-order-1.jpg",
    alt: "Step 1: Choose dishes from the Rich-Dons menu",
    badge: "Step 01 · Select",
    icon: <Utensils size={16} aria-hidden="true" />,
  },
  {
    id: "step-2",
    step: "02",
    title: "Tailor Your Meal",
    subtitle: "Customise Your Order",
    description:
      "Select your choice of proteins (grilled tilapia, crispy chicken, goat meat), spice level, sides, extra plantain, and chilled tropical drinks.",
    imageUrl: "/how-to-order-2.jpg",
    alt: "Step 2: Customise meal with sides and extra toppings",
    badge: "Step 02 · Customise",
    icon: <SlidersHorizontal size={16} aria-hidden="true" />,
  },
  {
    id: "step-3",
    step: "03",
    title: "Confirm on WhatsApp",
    subtitle: "Instant Kitchen Dispatch",
    description:
      "Review your bag and tap to send a pre-formatted WhatsApp message directly to our Accra kitchen for instant confirmation and live delivery tracking.",
    imageUrl: "/how-to-order-3.jpg",
    alt: "Step 3: Confirm order directly with our kitchen over WhatsApp",
    badge: "Step 03 · Dispatch",
    icon: <MessageCircle size={16} aria-hidden="true" />,
  },
];

export default function HowToOrderLaunchReveal() {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [isInView, setIsInView] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1); // 0 = Left, 1 = Center (default lead), 2 = Right
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Staggered reveal upon scroll into viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Pointer tracking for smooth 3D parallax tilt (CrazyGL signature effect)
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Normalized from -1 to 1
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    setPointer({
      x: Math.max(-1, Math.min(1, normX)),
      y: Math.max(-1, Math.min(1, normY)),
    });
  }, []);

  const handlePointerEnter = () => setIsHovered(true);
  const handlePointerLeave = () => {
    setIsHovered(false);
    setPointer({ x: 0, y: 0 });
  };

  const [isMobile, setIsMobile] = useState(false);
  const [spreadDistance, setSpreadDistance] = useState(260);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    const updateSpread = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      if (w < 640) setSpreadDistance(120);
      else if (w < 860) setSpreadDistance(180);
      else if (w < 1140) setSpreadDistance(230);
      else setSpreadDistance(260);
    };
    updateSpread();
    window.addEventListener("resize", updateSpread, { passive: true });
    return () => window.removeEventListener("resize", updateSpread);
  }, []);

  // Touch swipe handlers for fluid mobile gestures
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
    const diffY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        // Swiped left -> advance to next step
        setActiveStep((prev) => Math.min(2, prev + 1));
      } else {
        // Swiped right -> retreat to previous step
        setActiveStep((prev) => Math.max(0, prev - 1));
      }
    }
  };

  // 3D Card Transform computation:
  // On mobile: centers whichever card is "up", with clean 3D peeking to sides
  // On desktop: maintains the signature wide 3-phone stage arrangement
  const getCardTransform = (index: number) => {
    if (isMobile) {
      const isSelected = activeStep === index;
      if (isSelected) {
        return "translateX(0px) translateY(-8px) translateZ(60px) rotateY(0deg) rotateZ(0deg) scale(1.04)";
      }

      if (activeStep === 0) {
        // Step 1 is UP: Step 2 peeks to the right, Step 3 peeks further right
        if (index === 1) {
          return "translateX(68px) translateY(8px) translateZ(-25px) rotateY(-12deg) rotateZ(2deg) scale(0.91)";
        }
        if (index === 2) {
          return "translateX(118px) translateY(18px) translateZ(-55px) rotateY(-18deg) rotateZ(4deg) scale(0.84)";
        }
      } else if (activeStep === 1) {
        // Step 2 is UP: Step 1 peeks left, Step 3 peeks right
        if (index === 0) {
          return "translateX(-68px) translateY(8px) translateZ(-25px) rotateY(12deg) rotateZ(-2deg) scale(0.91)";
        }
        if (index === 2) {
          return "translateX(68px) translateY(8px) translateZ(-25px) rotateY(-12deg) rotateZ(2deg) scale(0.91)";
        }
      } else if (activeStep === 2) {
        // Step 3 is UP: Step 2 peeks left, Step 1 peeks further left
        if (index === 1) {
          return "translateX(-68px) translateY(8px) translateZ(-25px) rotateY(12deg) rotateZ(-2deg) scale(0.91)";
        }
        if (index === 0) {
          return "translateX(-118px) translateY(18px) translateZ(-55px) rotateY(18deg) rotateZ(-4deg) scale(0.84)";
        }
      }

      return "translateX(0px) translateZ(0px) scale(0.9)";
    }

    // ── Desktop (Preserved exactly as is) ──
    const tiltX = isHovered ? pointer.y * -6 : 0;
    const tiltY = isHovered ? pointer.x * 8 : 0;

    const isLeft = index === 0;
    const isRight = index === 2;

    const isSelected = activeStep === index;
    const spread = spreadDistance;

    if (isSelected) {
      if (isLeft) {
        return `rotateX(${tiltX}deg) rotateY(${tiltY + 12}deg) rotateZ(-1.5deg) translateX(-${spread}px) translateY(-10px) translateZ(80px) scale(1.05)`;
      }
      if (isRight) {
        return `rotateX(${tiltX}deg) rotateY(${tiltY - 12}deg) rotateZ(1.5deg) translateX(${spread}px) translateY(-10px) translateZ(80px) scale(1.05)`;
      }
      return `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(90px) scale(1.06)`;
    }

    if (isLeft) {
      return `rotateX(${tiltX}deg) rotateY(${tiltY + 16}deg) rotateZ(-3deg) translateX(-${spread}px) translateY(12px) translateZ(10px) scale(0.95)`;
    }
    if (isRight) {
      return `rotateX(${tiltX}deg) rotateY(${tiltY - 16}deg) rotateZ(3deg) translateX(${spread}px) translateY(12px) translateZ(10px) scale(0.95)`;
    }
    return `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(30px) scale(0.98)`;
  };

  const getCardZIndex = (index: number) => {
    if (isMobile) {
      if (activeStep === index) return 40;
      const dist = Math.abs(index - activeStep);
      return dist === 1 ? 30 : 20;
    }
    return activeStep === index ? 40 : index === 1 ? 30 : 20;
  };

  const getCardOpacity = (index: number) => {
    if (isMobile) {
      if (activeStep === index) return 1;
      const dist = Math.abs(index - activeStep);
      return dist === 1 ? 0.8 : 0.55;
    }
    return 1;
  };

  return (
    <section
      ref={containerRef}
      className={`launch-reveal-section ${isInView ? "is-revealed" : ""}`}
      id="how-to-order"
      aria-label="How To Order Step-by-Step Guide"
    >
      {/* ─── EDITORIAL HEADER ────────────────────────────────────────── */}
      <div className="launch-reveal-header">
        <div className="launch-reveal-badge" aria-hidden="true">
          <Sparkles size={14} className="launch-reveal-spark" />
          <span>Simple 3-Step Ordering</span>
        </div>

        <h2 className="launch-reveal-title">
          Your order, cooked fresh<br />
          and delivered in <em>three steps.</em>
        </h2>

        <p className="launch-reveal-subtitle">
          Browse our authentic Ghanaian dishes, customise to your exact taste, and confirm directly with our kitchen over WhatsApp.
        </p>

        <div className="launch-reveal-actions">
          <a href="#today-menu" className="launch-reveal-cta-primary">
            <span>Explore Today&apos;s Menu</span>
            <ArrowDown size={16} aria-hidden="true" />
          </a>
          <Link href="/corporate" className="launch-reveal-cta-secondary">
            <span>Office Lunch Portals</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* ─── 3D FANNED MOCKUP STAGE (CRAZYGL SIGNATURE) ─────────────── */}
      <div
        ref={stageRef}
        className="launch-reveal-stage"
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Interactive 3D Phone Mockup Showcase"
      >
        <div className="launch-reveal-fan-wrapper">
          {ORDER_STEPS.map((stepItem, index) => {
            const isSelected = activeStep === index;
            const staggerDelay = index === 1 ? 0.08 : index === 0 ? 0.18 : 0.28;

            return (
              <div
                key={stepItem.id}
                className={`launch-reveal-mockup ${isSelected ? "is-selected" : ""} ${
                  index === 1 ? "is-center" : index === 0 ? "is-left" : "is-right"
                }`}
                style={{
                  transform: getCardTransform(index),
                  transitionDelay: !isInView ? `${staggerDelay}s` : undefined,
                  zIndex: getCardZIndex(index),
                  opacity: getCardOpacity(index),
                }}
                onClick={() => setActiveStep(index)}
                onMouseEnter={() => {
                  if (!isMobile) setActiveStep(index);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setActiveStep(index);
                  }
                }}
                aria-label={`Step ${stepItem.step}: ${stepItem.title}`}
              >
                {/* Phone Mockup Frame */}
                <div className="launch-phone-device">
                  {/* Dynamic Island / Speaker Notch */}
                  <div className="launch-phone-notch" aria-hidden="true">
                    <span className="launch-phone-speaker" />
                    <span className="launch-phone-camera" />
                  </div>

                  {/* Device Screen with Screenshot */}
                  <div className="launch-phone-screen">
                    <Image
                      src={stepItem.imageUrl}
                      alt={stepItem.alt}
                      width={1080}
                      height={2340}
                      className="launch-phone-img"
                      priority={index === 1}
                      sizes="(max-width: 640px) 260px, (max-width: 1024px) 300px, 340px"
                    />

                    {/* Glassmorphic Shine / Reflection Overlay */}
                    <div className="launch-phone-glare" aria-hidden="true" />

                    {/* Floating Step Badge inside screen */}
                    <div className="launch-phone-badge" aria-hidden="true">
                      {stepItem.icon}
                      <span>{stepItem.badge}</span>
                    </div>
                  </div>
                </div>

                {/* Subtle Ground Shadow */}
                <div className="launch-phone-shadow" aria-hidden="true" />
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── MOBILE STEP INDICATOR PILLS ─────────────────────────── */}
      <div className="launch-reveal-mobile-dots" aria-label="Step navigation">
        {ORDER_STEPS.map((stepItem, idx) => (
          <button
            key={stepItem.id}
            type="button"
            className={`launch-mobile-dot ${activeStep === idx ? "is-active" : ""}`}
            onClick={() => setActiveStep(idx)}
            aria-label={`Jump to Step 0${idx + 1}`}
          />
        ))}
      </div>

      {/* ─── INTERACTIVE STEP CONTROLLERS / CARDS ────────────────────── */}
      <div className="launch-reveal-steps-grid">
        {ORDER_STEPS.map((stepItem, index) => {
          const isActive = activeStep === index;
          return (
            <article
              key={stepItem.id}
              className={`launch-reveal-step-card ${isActive ? "is-active" : ""}`}
              onClick={() => setActiveStep(index)}
              onMouseEnter={() => setActiveStep(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setActiveStep(index);
                }
              }}
              aria-current={isActive ? "step" : undefined}
            >
              <div className="launch-step-card-header">
                <span className="launch-step-num">{stepItem.step}</span>
                <span className="launch-step-tag">{stepItem.subtitle}</span>
              </div>
              <h3 className="launch-step-title">{stepItem.title}</h3>
              <p className="launch-step-desc">{stepItem.description}</p>
              <div className="launch-step-action" aria-hidden="true">
                <span>View Screen</span>
                <ChevronRight size={14} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
