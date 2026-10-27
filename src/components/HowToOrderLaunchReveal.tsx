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

  // 3D Card Transform computation for each position (Left, Center, Right)
  const getCardTransform = (index: number) => {
    const tiltX = isHovered ? pointer.y * -8 : 0;
    const tiltY = isHovered ? pointer.x * 12 : 0;

    const isCenter = index === 1;
    const isLeft = index === 0;
    const isRight = index === 2;

    const isSelected = activeStep === index;

    if (isSelected) {
      // Highlighted / focused card
      if (isLeft) {
        return `rotateX(${tiltX}deg) rotateY(${tiltY + 8}deg) rotateZ(-3deg) translateX(-140px) translateY(-14px) translateZ(80px) scale(1.04)`;
      }
      if (isRight) {
        return `rotateX(${tiltX}deg) rotateY(${tiltY - 8}deg) rotateZ(3deg) translateX(140px) translateY(-14px) translateZ(80px) scale(1.04)`;
      }
      // Center focused
      return `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(90px) scale(1.06)`;
    }

    // Default resting fan configuration
    if (isLeft) {
      return `rotateX(${tiltX}deg) rotateY(${tiltY + 22}deg) rotateZ(-8.5deg) translateX(-210px) translateY(24px) translateZ(10px) scale(0.88)`;
    }
    if (isRight) {
      return `rotateX(${tiltX}deg) rotateY(${tiltY - 22}deg) rotateZ(8.5deg) translateX(210px) translateY(24px) translateZ(10px) scale(0.88)`;
    }
    // Center resting
    return `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(40px) scale(0.98)`;
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
                  zIndex: isSelected ? 40 : index === 1 ? 30 : 20,
                }}
                onClick={() => setActiveStep(index)}
                onMouseEnter={() => setActiveStep(index)}
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
