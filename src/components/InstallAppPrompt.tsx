"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISSED_KEY = "rd-install-prompt-dismissed-until";
const SHOWN_KEY = "rd-install-prompt-shown";
const DISMISS_FOR_DAYS = 30;

export default function InstallAppPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone)) return;

    const dismissedUntil = Number(window.localStorage.getItem(DISMISSED_KEY) || 0);
    if (dismissedUntil > Date.now() || window.sessionStorage.getItem(SHOWN_KEY)) return;

    let eligible = false;
    let dismissed = false;
    const showTimer = window.setTimeout(() => {
      if (eligible && !dismissed) {
        setVisible(true);
        window.sessionStorage.setItem(SHOWN_KEY, "1");
      }
    }, 45_000);

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      eligible = true;
    };
    const onInstalled = () => {
      setVisible(false);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    window.localStorage.setItem(
      DISMISSED_KEY,
      String(Date.now() + DISMISS_FOR_DAYS * 24 * 60 * 60 * 1000),
    );
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstallEvent(null);
    if (choice.outcome === "accepted") setVisible(false);
    else dismiss();
  };

  if (!visible) return null;

  return (
    <aside className="install-app-prompt" role="region" aria-label="Install Rich-Dons Catering">
      <div className="install-app-prompt-icon" aria-hidden="true"><Download size={18} /></div>
      <div className="install-app-prompt-copy">
        <strong>Order with one tap</strong>
        <span>Add Rich-Dons to your home screen.</span>
      </div>
      <button className="install-app-prompt-action" onClick={install}>Install</button>
      <button className="install-app-prompt-close" onClick={dismiss} aria-label="Dismiss install prompt">
        <X size={17} />
      </button>
    </aside>
  );
}
