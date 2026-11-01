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

    // Display time calibrated to 3.3s for the self-drawing animation and full reveal
    const minDisplayMs = 3300;
    const startTime = Date.now();

    const handleDismiss = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayMs - elapsed);

      setTimeout(() => {
        setFading(true);
        setTimeout(() => {
          setMounted(false);
        }, 600); // matches fade-out transition duration
      }, remaining);
    };

    if (document.readyState === 'complete') {
      handleDismiss();
    } else {
      window.addEventListener('load', handleDismiss, { once: true });
      // Fallback timeout in case load event fires late
      const fallbackTimer = setTimeout(handleDismiss, 3900);
      return () => {
        window.removeEventListener('load', handleDismiss);
        clearTimeout(fallbackTimer);
      };
    }
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

        {/* Elegant Animated Loader Bar */}
        <div className="splash-progress-track">
          <div className="splash-progress-bar" />
        </div>

        <span className="splash-hint">Tap to skip</span>
      </div>
    </div>
  );
}
