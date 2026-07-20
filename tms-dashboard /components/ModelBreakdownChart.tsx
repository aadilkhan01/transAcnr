"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Prediction } from "@/lib/types";

interface ModelBreakdownChartProps {
  latest: Prediction;
}

const TARGET_LABELS: Record<string, string> = {
  compressor_failure: "Compressor",
  pump_failure: "Pump",
  cooling_degradation: "Cooling",
};

const MODEL_COLORS = ["var(--accent)", "#A78BFA", "#F59E0B", "#10B981"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="p-3 rounded-xl text-xs"
      style={{ background: "var(--panel-strong)", border: "1px solid rgba(var(--ink-rgb),0.1)", minWidth: 160 }}
    >
      <p className="mb-2 font-semibold" style={{ color: "rgba(var(--ink-rgb),0.5)" }}>{label}</p>
      {payload.map((entry: { color: string; name: string; value: number }, i: number) => (
        <div key={i} className="flex gap-2 items-center mb-1">
          <span style={{ color: entry.color }}>●</span>
          <span style={{ color: "rgba(var(--ink-rgb),0.6)" }}>{entry.name}:</span>
          <span className="font-mono font-bold" style={{ color: entry.color }}>
            {(entry.value * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
};

export default function ModelBreakdownChart({ latest }: ModelBreakdownChartProps) {
  const targets = ["compressor_failure", "pump_failure", "cooling_degradation"] as const;

  const modelNames = new Set<string>();
  targets.forEach((t) => {
    Object.keys(latest.predictions[t].model_probs || {}).forEach((m) => modelNames.add(m));
  });

  if (modelNames.size === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-3">
        <span className="text-2xl">📊</span>
        <p className="text-xs" style={{ color: "rgba(var(--ink-rgb),0.25)" }}>No per-model breakdown available</p>
        <p className="text-xs" style={{ color: "rgba(var(--ink-rgb),0.15)" }}>model_probs field not present in data</p>
      </div>
    );
  }

  const modelsArr = Array.from(modelNames);
  const data = targets.map((t) => {
    const probs = latest.predictions[t].model_probs || {};
    const row: Record<string, string | number> = { name: TARGET_LABELS[t] };
    modelsArr.forEach((m) => { row[m] = probs[m] ?? 0; });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={3}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--ink-rgb),0.04)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: "rgba(var(--ink-rgb),0.35)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
          tick={{ fill: "rgba(var(--ink-rgb),0.3)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          domain={[0, 1]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(var(--ink-rgb),0.03)" }} />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={(v) => <span style={{ color: "rgba(var(--ink-rgb),0.45)" }}>{v}</span>}
        />
        {modelsArr.map((m, i) => (
          <Bar key={m} dataKey={m} name={m} fill={MODEL_COLORS[i % MODEL_COLORS.length]} radius={[3, 3, 0, 0]} maxBarSize={32} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
