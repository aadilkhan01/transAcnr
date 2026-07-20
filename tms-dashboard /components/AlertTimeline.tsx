"use client";

import { Prediction } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface AlertTimelineProps {
  history: Prediction[];
}

const RISK_COLORS: Record<string, string> = {
  NORMAL: "#10B981",
  LOW: "#84CC16",
  MEDIUM: "#F59E0B",
  HIGH: "#EF4444",
  CRITICAL: "#DC2626",
};

const TARGET_ICONS: Record<string, string> = {
  compressor_failure: "⚙️",
  pump_failure: "🔧",
  cooling_degradation: "❄️",
};

export default function AlertTimeline({ history }: AlertTimelineProps) {
  const events = [...history]
    .reverse()
    .filter((p) => (p.summary.targets_triggered ?? []).length > 0)
    .slice(0, 12);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-36 gap-3">
        <span className="text-3xl">✅</span>
        <p className="text-sm" style={{ color: "rgba(var(--ink-rgb),0.3)" }}>No alerts in recent history</p>
        <p className="text-xs" style={{ color: "rgba(var(--ink-rgb),0.15)" }}>System operating normally</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical track */}
      <div
        className="absolute left-3.5 top-2 bottom-2 w-px"
        style={{ background: "rgba(var(--ink-rgb),0.07)" }}
      />
      <div className="space-y-3 pl-10">
        {events.map((p) => {
          const color = RISK_COLORS[p.summary.overall_risk_level] || "#10B981";
          const icons = (p.summary.targets_triggered ?? []).map((t) => TARGET_ICONS[t] || "⚠️").join(" ");
          return (
            <div key={p._id} className="relative">
              {/* Timeline dot */}
              <div
                className="absolute -left-6.5 top-3 w-3 h-3 rounded-full border-2"
                style={{
                  background: color,
                  borderColor: "rgb(var(--bg-rgb))",
                  boxShadow: `0 0 8px ${color}66`,
                  left: "-26px",
                }}
              />
              <div
                className="p-3 rounded-xl"
                style={{
                  background: `${color}08`,
                  border: `1px solid ${color}28`,
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm">{icons}</span>
                    <span className="text-xs font-semibold" style={{ color }}>
                      {(p.summary.targets_triggered ?? [])
                        .map((t) => t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
                        .join(" · ")}
                    </span>
                  </div>
                  <span className="text-xs font-mono shrink-0" style={{ color: "rgba(var(--ink-rgb),0.25)" }}>
                    {format(parseISO(p.inference_timestamp), "MM/dd HH:mm")}
                  </span>
                </div>
                {p.summary.active_recommendations[0] && (
                  <p className="text-xs leading-relaxed mb-2" style={{ color: "rgba(var(--ink-rgb),0.4)" }}>
                    {p.summary.active_recommendations[0]}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: `${color}18`, color }}
                  >
                    {p.summary.overall_risk_level}
                  </span>
                  <span className="text-xs" style={{ color: "rgba(var(--ink-rgb),0.2)" }}>
                    {p.num_samples.toLocaleString()} samples · Run {p.run_id}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
