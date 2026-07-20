"use client";

interface AnomalyBarProps {
  score: number;
  label: string;
  color: string;
}

export default function AnomalyBar({ score, label, color }: AnomalyBarProps) {
  const pct = Math.min(score * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-xs text-right" style={{ color: "rgba(255,255,255,0.45)" }}>
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
      <span className="w-12 text-xs font-mono" style={{ color }}>
        {score.toFixed(4)}
      </span>
    </div>
  );
}
