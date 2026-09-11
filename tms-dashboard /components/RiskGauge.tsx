"use client";

interface RiskGaugeProps {
  probability: number;
  riskLevel: string;
  label: string;
  triggered: boolean;
}

const RISK_COLORS: Record<string, string> = {
  NORMAL: "#10B981",
  LOW: "#84CC16",
  MEDIUM: "#F59E0B",
  HIGH: "#EF4444",
  CRITICAL: "#DC2626",
};

const RISK_BG: Record<string, string> = {
  NORMAL: "rgba(16,185,129,0.08)",
  LOW: "rgba(132,204,22,0.08)",
  MEDIUM: "rgba(245,158,11,0.08)",
  HIGH: "rgba(239,68,68,0.1)",
  CRITICAL: "rgba(220,38,38,0.14)",
};

export default function RiskGauge({ probability, riskLevel, label, triggered }: RiskGaugeProps) {
  const color = RISK_COLORS[riskLevel] || "#10B981";
  const bg = RISK_BG[riskLevel] || "rgba(16,185,129,0.08)";
  const pct = Math.min(probability * 100, 100);

  // Arc math: half-circle from 180° to 0°
  const R = 54;
  const cx = 70;
  const cy = 70;
  const startAngle = Math.PI;
  const endAngle = Math.PI - (pct / 100) * Math.PI;
  const x1 = cx + R * Math.cos(startAngle);
  const y1 = cy - R * Math.sin(startAngle);
  const x2 = cx + R * Math.cos(endAngle);
  const y2 = cy - R * Math.sin(endAngle);
  const largeArc = pct > 50 ? 1 : 0;

  return (
    <div
      className="relative flex flex-col items-center p-5 rounded-2xl border transition-all duration-500"
      style={{
        background: bg,
        borderColor: triggered ? color : "rgba(var(--ink-rgb),0.07)",
        boxShadow: triggered ? `0 0 24px ${color}33` : "none",
      }}
    >
      {/* Pulse ring for triggered */}
      {triggered && (
        <span
          className="absolute inset-0 rounded-2xl animate-ping"
          style={{ border: `2px solid ${color}`, opacity: 0.3 }}
        />
      )}

      {/* SVG Gauge */}
      <svg width="140" height="92" viewBox="0 0 140 92">
        {/* Track */}
        <path
          d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
          fill="none"
          stroke="rgba(var(--ink-rgb),0.07)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Fill */}
        {pct > 0 && (
          <path
            d={`M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        )}
        {/* Center text */}
        <text x={cx} y={cy - 4} textAnchor="middle" fill={color} fontSize="18" fontWeight="700" fontFamily="Space Grotesk, sans-serif">
          {(probability * 100).toFixed(1)}%
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(var(--ink-rgb),0.4)" fontSize="9" fontFamily="Space Grotesk, sans-serif">
          PROBABILITY
        </text>
      </svg>

      {/* Label */}
      <p className="mt-1 text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(var(--ink-rgb),0.5)" }}>
        {label}
      </p>

      {/* Risk badge */}
      <span
        className="mt-2 px-3 py-0.5 rounded-full text-xs font-bold tracking-wider"
        style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
      >
        {riskLevel}
      </span>
    </div>
  );
}
