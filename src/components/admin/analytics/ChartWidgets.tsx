import React from "react";

interface DailyTrendItem {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

interface TrendBarChartProps {
  data: DailyTrendItem[];
  metricType?: "revenue" | "orders";
  currencySymbol?: string;
}

export function TrendBarChart({
  data,
  metricType = "revenue",
  currencySymbol = "GH₵",
}: TrendBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-slate-400 text-sm italic">
        No transaction activity recorded for this period.
      </div>
    );
  }

  const values = data.map((d) => (metricType === "revenue" ? d.revenue : d.orders));
  const maxValue = Math.max(...values, 1);

  return (
    <div className="space-y-4">
      <div className="h-48 flex items-end gap-2 pt-6 pb-2 px-1">
        {data.map((item, idx) => {
          const val = metricType === "revenue" ? item.revenue : item.orders;
          const heightPercent = Math.max(Math.round((val / maxValue) * 100), 6);

          return (
            <div
              key={item.date || idx}
              className="flex-1 flex flex-col items-center h-full justify-end group relative"
            >
              {/* Tooltip on hover */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg pointer-events-none whitespace-nowrap shadow-lg z-20">
                {metricType === "revenue"
                  ? `${currencySymbol} ${val.toLocaleString()}`
                  : `${val} Orders`}
                <span className="block text-[9px] text-slate-400 font-normal">
                  {item.label}
                </span>
              </div>

              {/* Bar */}
              <div
                className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                  val > 0
                    ? "bg-gradient-to-t from-amber-600 to-amber-400 group-hover:from-amber-500 group-hover:to-amber-300 shadow-sm"
                    : "bg-slate-100 group-hover:bg-slate-200"
                }`}
                style={{ height: `${heightPercent}%` }}
              />

              {/* Label */}
              <span className="text-[10px] text-slate-400 font-medium mt-2 truncate w-full text-center group-hover:text-slate-700">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  total: number;
  color?: "amber" | "emerald" | "blue" | "purple" | "rose";
  valueLabel?: string;
}

export function ProgressBar({
  label,
  value,
  total,
  color = "amber",
  valueLabel,
}: ProgressBarProps) {
  const percent = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0;

  const colorClasses = {
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    rose: "bg-rose-500",
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-500 font-mono">
          {valueLabel || `${value} (${percent}%)`}
        </span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
