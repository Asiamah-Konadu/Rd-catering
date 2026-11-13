'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function SplashScreen() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const [mounted, setMounted] = useState(!isAdmin);
  const [fading, setFading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setMounted(false);
      return;
    }

    try {
      if (window.sessionStorage.getItem('rd-splash-shown') === '1') {
        setMounted(false);
        return;
      }
    } catch {
      // The splash can run when storage is unavailable.
    }

    let pageReady = document.readyState === 'complete';
    let logoZoomComplete = false;
    let removed = false;
    const zoomTimer = setTimeout(() => {
      logoZoomComplete = true;
      if (pageReady) revealSite();
      else setShowSkeleton(true);
    }, 1300);
    let removeTimer: ReturnType<typeof setTimeout> | undefined;

    const revealSite = () => {
      if (removed) return;
      removed = true;
      try {
        window.sessionStorage.setItem('rd-splash-shown', '1');
      } catch {
        // Revealing the site does not depend on storage.
      }
      setFading(true);
      removeTimer = setTimeout(() => setMounted(false), 600);
    };

    const onLoad = () => {
      pageReady = true;
      if (logoZoomComplete) revealSite();
    };

    if (!pageReady) window.addEventListener('load', onLoad, { once: true });
    return () => {
      window.removeEventListener('load', onLoad);
      if (zoomTimer) clearTimeout(zoomTimer);
      if (removeTimer) clearTimeout(removeTimer);
    };
  }, [isAdmin]);

  if (!mounted || isAdmin) return null;

  const dismiss = () => {
    try {
      window.sessionStorage.setItem('rd-splash-shown', '1');
    } catch {
      // The user can still dismiss the splash when storage is unavailable.
    }
    setFading(true);
    setTimeout(() => setMounted(false), 600);
  };

  return (
    <div
      id="rd-splash-screen"
      className={`splash-overlay ${showSkeleton ? 'splash-skeleton-active' : ''} ${fading ? 'splash-fading' : ''}`}
      onClick={dismiss}
      role="status"
      aria-label={showSkeleton ? 'Loading Rich-Dons Catering website' : 'Rich-Dons Catering'}
    >
      <div className="splash-ambient-glow" />
      <div className="splash-card">
        <div className="splash-logo-container">
          <img src="/logo.svg" alt="Rich-Dons Catering" className="splash-logo-img" width={220} height={220} />
        </div>
        {showSkeleton && (
          <div className="splash-content-skeleton" aria-hidden="true">
            <span className="skeleton-nav" />
            <span className="skeleton-hero" />
            <span className="skeleton-row"><i /><i /><i /></span>
          </div>
        )}
      </div>
    </div>
  );
}
