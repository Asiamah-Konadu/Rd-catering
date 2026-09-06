'use client';

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

// Target launch date: exactly 2 months from campaign start (November 6, 2026, 09:00 GMT)
const LAUNCH_DATE = new Date("2026-11-06T09:00:00Z").getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeLeft(): TimeLeft {
  const now = new Date().getTime();
  const difference = LAUNCH_DATE - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: false,
  };
}

export default function CountdownTimer() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    // Initial server render placeholder with target time
    const initial = calculateTimeLeft();
    return (
      <div className="flex items-center justify-center gap-2 sm:gap-4 my-6">
        <TimeUnit value={initial.days} label="Days" />
        <TimeUnit value={initial.hours} label="Hours" />
        <TimeUnit value={initial.minutes} label="Mins" />
        <TimeUnit value={initial.seconds} label="Secs" />
      </div>
    );
  }

  if (timeLeft.isExpired) {
    return (
      <div className="my-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold text-center text-sm sm:text-base animate-pulse">
        🚀 Rich-Dons Catering is now LIVE in Accra! Ordering is now open.
      </div>
    );
  }

  return (
    <div className="space-y-3 my-6">
      <div className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest text-amber-300/90 font-bold">
        <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
        <span>Official Launch Countdown • Nov 6, 2026</span>
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <TimeUnit value={timeLeft.days} label="Days" />
        <span className="text-xl sm:text-2xl font-bold text-amber-400/60 pb-5">:</span>
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <span className="text-xl sm:text-2xl font-bold text-amber-400/60 pb-5">:</span>
        <TimeUnit value={timeLeft.minutes} label="Mins" />
        <span className="text-xl sm:text-2xl font-bold text-amber-400/60 pb-5">:</span>
        <TimeUnit value={timeLeft.seconds} label="Secs" isLive />
      </div>
    </div>
  );
}

function TimeUnit({
  value,
  label,
  isLive,
}: {
  value: number;
  label: string;
  isLive?: boolean;
}) {
  const formatted = String(value).padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-14 sm:w-20 h-16 sm:h-20 flex items-center justify-center rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-lg text-white font-mono text-2xl sm:text-3xl font-extrabold tracking-wider relative overflow-hidden backdrop-blur-md ${
          isLive ? "ring-1 ring-amber-400/30" : ""
        }`}
      >
        {/* Subtle glass reflection highlight */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-white/5 pointer-events-none" />
        <span className="bg-linear-to-b from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
          {formatted}
        </span>
      </div>
      <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1.5">
        {label}
      </span>
    </div>
  );
}
