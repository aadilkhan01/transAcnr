"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Prediction } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface HistoryChartProps {
  history: Prediction[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="p-3 rounded-xl text-xs"
      style={{
        background: "#0D1424",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.85)",
      }}
    >
      <p className="mb-2 font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
      {payload.map((entry: { color: string; name: string; value: number }, i: number) => (
        <div key={i} className="flex gap-2 items-center">
          <span style={{ color: entry.color }}>●</span>
          <span>{entry.name}:</span>
          <span className="font-mono font-bold" style={{ color: entry.color }}>
            {(entry.value * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
};

export default function HistoryChart({ history }: HistoryChartProps) {
  const data = [...history]
    .reverse()
    .map((p) => ({
      time: format(parseISO(p.inference_timestamp), "MM/dd HH:mm"),
      compressor: p.predictions.compressor_failure.probability,
      pump: p.predictions.pump_failure.probability,
      cooling: p.predictions.cooling_degradation.probability,
    }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gComp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gPump" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gCool" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}
          formatter={(value) => <span style={{ color: "rgba(255,255,255,0.5)" }}>{value}</span>}
        />
        <Area type="monotone" dataKey="compressor" name="Compressor" stroke="#F59E0B" fill="url(#gComp)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="pump" name="Pump" stroke="#00D4FF" fill="url(#gPump)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="cooling" name="Cooling" stroke="#EF4444" fill="url(#gCool)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
