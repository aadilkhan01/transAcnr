"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  icon?: string;
}

export default function StatCard({ label, value, sub, accent = "var(--accent)", icon }: StatCardProps) {
  return (
    <div
      className="flex flex-col gap-1 p-4 rounded-2xl"
      style={{
        background: "rgba(var(--ink-rgb),0.03)",
        border: "1px solid rgba(var(--ink-rgb),0.06)",
      }}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(var(--ink-rgb),0.35)" }}>
          {label}
        </span>
      </div>
      <span className="text-2xl font-bold font-mono" style={{ color: accent }}>
        {value}
      </span>
      {sub && <span className="text-xs" style={{ color: "rgba(var(--ink-rgb),0.3)" }}>{sub}</span>}
    </div>
  );
}
