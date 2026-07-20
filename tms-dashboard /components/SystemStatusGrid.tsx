"use client";

import { Prediction } from "@/lib/types";

interface SystemStatusGridProps {
  latest: Prediction;
}

const RISK_COLORS: Record<string, string> = {
  NORMAL: "#10B981",
  LOW: "#84CC16",
  MEDIUM: "#F59E0B",
  HIGH: "#EF4444",
  CRITICAL: "#DC2626",
};

const RISK_ICONS: Record<string, string> = {
  NORMAL: "✅",
  LOW: "🟡",
  MEDIUM: "⚠️",
  HIGH: "🔴",
  CRITICAL: "🚨",
};

const SYSTEMS = [
  { key: "compressor_failure" as const, label: "Compressor", icon: "⚙️", sub: "Discharge · Suction · Speed" },
  { key: "pump_failure" as const, label: "Pump", icon: "🔧", sub: "Current · Voltage · Load" },
  { key: "cooling_degradation" as const, label: "Cooling System", icon: "❄️", sub: "Water Δ · Fan · Pressure" },
];

export default function SystemStatusGrid({ latest }: SystemStatusGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {SYSTEMS.map(({ key, label, icon, sub }) => {
        const pred = latest.predictions[key];
        const color = RISK_COLORS[pred.risk_level] || "#10B981";
        const riskIcon = RISK_ICONS[pred.risk_level] || "✅";

        return (
          <div
            key={key}
            className="p-4 rounded-2xl border transition-all duration-500"
            style={{
              background: pred.triggered ? `${color}0A` : "rgba(255,255,255,0.02)",
              borderColor: pred.triggered ? `${color}44` : "rgba(255,255,255,0.07)",
              boxShadow: pred.triggered ? `0 4px 24px ${color}18` : "none",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{label}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</p>
                </div>
              </div>
              <span className="text-base">{riskIcon}</span>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: "rgba(255,255,255,0.35)" }}>Failure Probability</span>
                <span className="font-mono font-bold" style={{ color }}>{(pred.probability * 100).toFixed(1)}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(pred.probability * 100, 100)}%`,
                    background: `linear-gradient(90deg, ${color}88, ${color})`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>Anomaly Score</p>
                <p className="text-sm font-mono font-bold" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {pred.anomaly_score.toFixed(4)}
                </p>
              </div>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{ background: `${color}20`, color, border: `1px solid ${color}44` }}
              >
                {pred.risk_level}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
