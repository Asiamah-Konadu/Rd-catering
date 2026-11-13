'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function SplashScreen() {
  const pathname = usePathname();
  // Don't show splash screen on admin routes
  const isAdmin = pathname?.startsWith('/admin');

  const [mounted, setMounted] = useState(!isAdmin);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setMounted(false);
      return;
    }

    // Show the brand intro once per browser tab session. Client-side route
    // changes and hard navigations inside the site should go straight to content.
    try {
      if (window.sessionStorage.getItem('rd-splash-shown') === '1') {
        setMounted(false);
        return;
      }
    } catch {
      // Keep the splash functional when storage is unavailable.
    }

    // Display time calibrated to 3.3s for the self-drawing animation and full reveal
    const minDisplayMs = 3300;
    const startTime = Date.now();
    let dismissScheduled = false;
    let dismissTimer: ReturnType<typeof setTimeout> | undefined;
    let removeTimer: ReturnType<typeof setTimeout> | undefined;

    const handleDismiss = () => {
      if (dismissScheduled) return;
      dismissScheduled = true;
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayMs - elapsed);

      dismissTimer = setTimeout(() => {
        try {
          window.sessionStorage.setItem('rd-splash-shown', '1');
        } catch {
          // Dismissing the splash must not depend on storage availability.
        }
        setFading(true);
        removeTimer = setTimeout(() => {
          setMounted(false);
        }, 600); // matches fade-out transition duration
      }, remaining);
    };

    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    if (document.readyState === 'complete') {
      handleDismiss();
    } else {
      window.addEventListener('load', handleDismiss, { once: true });
      // Fallback timeout in case load event fires late
      fallbackTimer = setTimeout(handleDismiss, 3900);
    }

    return () => {
      window.removeEventListener('load', handleDismiss);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (dismissTimer) clearTimeout(dismissTimer);
      if (removeTimer) clearTimeout(removeTimer);
    };
  }, [isAdmin]);

  if (!mounted || isAdmin) {
    return null;
  }

  return (
    <div
      id="rd-splash-screen"
      className={`splash-overlay ${fading ? 'splash-fading' : ''}`}
      onClick={() => {
        // Allow user to click to dismiss immediately
        try {
          window.sessionStorage.setItem('rd-splash-shown', '1');
        } catch {
          // The user can still dismiss the splash when storage is unavailable.
        }
        setFading(true);
        setTimeout(() => setMounted(false), 500);
      }}
      role="status"
      aria-label="Loading Rich-Dons Catering"
    >
      <div className="splash-ambient-glow" />

      <div className="splash-card">
        {/* Animated Brand Logo */}
        <div className="splash-logo-container">
          <img
            src="/animated-logo.svg"
            alt="Rich-Dons Catering Logo"
            className="splash-logo-img"
            width={220}
            height={220}
          />
        </div>

        {/* Brand Identity Wordmark */}
        <div className="splash-text-group">
          <h1 className="splash-title">
            <span className="splash-brand-rich">RICH-DONS</span>
            <span className="splash-brand-catering">CATERING</span>
          </h1>
          <p className="splash-tagline">
            Fresh Ghanaian Flavours • Delivered in Accra
          </p>
        </div>

        <div className="splash-skeleton" aria-hidden="true">
          <span className="splash-skeleton-line splash-skeleton-line-wide" />
          <span className="splash-skeleton-line splash-skeleton-line-short" />
          <span className="splash-skeleton-block" />
        </div>

        {/* Elegant Animated Loader Bar */}
        <div className="splash-progress-track">
          <div className="splash-progress-bar" />
        </div>

        <span className="splash-hint">Tap to skip</span>
      </div>
    </div>
  );
}
