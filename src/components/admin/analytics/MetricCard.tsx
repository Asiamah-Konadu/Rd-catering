import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  badge?: {
    text: string;
    type: "positive" | "negative" | "neutral" | "warning";
  };
  accentColor?: "amber" | "blue" | "emerald" | "purple" | "rose" | "indigo";
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  badge,
  accentColor = "amber",
}: MetricCardProps) {
  const accentBorders = {
    amber: "hover:border-amber-400/80",
    blue: "hover:border-blue-400/80",
    emerald: "hover:border-emerald-400/80",
    purple: "hover:border-purple-400/80",
    rose: "hover:border-rose-400/80",
    indigo: "hover:border-indigo-400/80",
  };

  const badgeStyles = {
    positive: "bg-emerald-50 text-emerald-700 border-emerald-200",
    negative: "bg-rose-50 text-rose-700 border-rose-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    neutral: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${accentBorders[accentColor]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {icon && (
          <span className="text-xl select-none p-1.5 rounded-xl bg-slate-50 border border-slate-100">
            {icon}
          </span>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-slate-900">
            {value}
          </span>
          {badge && (
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeStyles[badge.type]}`}
            >
              {badge.text}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
