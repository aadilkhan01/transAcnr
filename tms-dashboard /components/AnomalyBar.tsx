"use client";

interface AnomalyBarProps {
  score: number;
  label: string;
  color: string;
}

const NEGATIVE_COLOR = "#EF4444";
const MAX_MAGNITUDE = 0.5;

export default function AnomalyBar({ score, label, color }: AnomalyBarProps) {
  const isNegative = score < 0;
  const magnitudePct = Math.min(Math.abs(score) / MAX_MAGNITUDE, 1) * 50;
  const fillColor = isNegative ? NEGATIVE_COLOR : color;

  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-xs text-right" style={{ color: "rgba(var(--ink-rgb),0.45)" }}>
        {label}
      </span>
      <div className="relative flex-1 h-2 rounded-full" style={{ background: "rgba(var(--ink-rgb),0.06)" }}>
        <div
          className="absolute inset-y-0 left-1/2 w-px"
          style={{ background: "rgba(var(--ink-rgb),0.18)" }}
        />
        <div
          className="absolute inset-y-0 h-2 rounded-full transition-all duration-700"
          style={
            isNegative
              ? {
                  right: "50%",
                  width: `${magnitudePct}%`,
                  background: `linear-gradient(270deg, color-mix(in srgb, ${fillColor} 53%, transparent), ${fillColor})`,
                  boxShadow: `0 0 8px color-mix(in srgb, ${fillColor} 40%, transparent)`,
                }
              : {
                  left: "50%",
                  width: `${magnitudePct}%`,
                  background: `linear-gradient(90deg, color-mix(in srgb, ${fillColor} 53%, transparent), ${fillColor})`,
                  boxShadow: `0 0 8px color-mix(in srgb, ${fillColor} 40%, transparent)`,
                }
          }
        />
      </div>
      <span className="w-12 text-xs font-mono" style={{ color: fillColor }}>
        {score.toFixed(4)}
      </span>
    </div>
  );
}
