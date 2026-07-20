"use client";

import { useState } from "react";
import { Acknowledgment } from "@/lib/types";
import { format } from "date-fns";

interface RecommendationCardProps {
  target: string;
  recommendation: string;
  triggered: boolean;
  riskLevel: string;
  runId: string;
  acknowledged?: Acknowledgment | null;
  onAcknowledge: (target: string, notes: string) => Promise<void>;
}

const ICONS: Record<string, string> = {
  compressor_failure: "⚙️",
  pump_failure: "🔧",
  cooling_degradation: "❄️",
};

const LABELS: Record<string, string> = {
  compressor_failure: "Compressor",
  pump_failure: "Pump",
  cooling_degradation: "Cooling System",
};

const RISK_COLORS: Record<string, string> = {
  NORMAL: "#10B981",
  LOW: "#84CC16",
  MEDIUM: "#F59E0B",
  HIGH: "#EF4444",
  CRITICAL: "#DC2626",
};

export default function RecommendationCard({
  target,
  recommendation,
  triggered,
  riskLevel,
  acknowledged,
  onAcknowledge,
}: RecommendationCardProps) {
  const [showInput, setShowInput] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const color = RISK_COLORS[riskLevel] || "#10B981";
  const icon = ICONS[target] || "🔩";
  const label = LABELS[target] || target;
  const isAcked = !!acknowledged;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onAcknowledge(target, notes);
    } finally {
      setLoading(false);
      setShowInput(false);
      setNotes("");
    }
  };

  return (
    <div
      className="p-4 rounded-xl border transition-all duration-300"
      style={{
        background: isAcked
          ? "rgba(16,185,129,0.05)"
          : triggered
          ? `${color}0D`
          : "rgba(var(--ink-rgb),0.02)",
        borderColor: isAcked
          ? "rgba(16,185,129,0.25)"
          : triggered
          ? `${color}44`
          : "rgba(var(--ink-rgb),0.06)",
      }}
    >
      <div className="flex gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: isAcked ? "rgba(16,185,129,0.12)" : `${color}14` }}
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: "rgba(var(--ink-rgb),0.85)" }}>
              {label}
            </span>
            {triggered && !isAcked && (
              <span
                className="px-2 py-0.5 text-xs font-bold rounded-full"
                style={{ background: `${color}22`, color }}
              >
                ⚠ ALERT
              </span>
            )}
            {isAcked && (
              <span
                className="px-2 py-0.5 text-xs font-bold rounded-full flex items-center gap-1"
                style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}
              >
                ✓ ACKNOWLEDGED
              </span>
            )}
            <span
              className="px-2 py-0.5 text-xs font-bold rounded-full ml-auto"
              style={{ background: `${color}14`, color, border: `1px solid ${color}30` }}
            >
              {riskLevel}
            </span>
          </div>

          {/* Recommendation text */}
          <p
            className="text-xs leading-relaxed"
            style={{
              color: triggered ? "rgba(var(--ink-rgb),0.65)" : "rgba(var(--ink-rgb),0.35)",
            }}
          >
            {recommendation}
          </p>

          {/* Acknowledgment details */}
          {isAcked && acknowledged && (
            <div
              className="mt-2 pt-2 text-xs"
              style={{
                borderTop: "1px solid rgba(16,185,129,0.15)",
                color: "rgba(var(--ink-rgb),0.3)",
              }}
            >
              <span>Acknowledged {format(new Date(acknowledged.acknowledged_at), "MMM dd, HH:mm")}</span>
              {acknowledged.notes && (
                <span className="italic ml-1" style={{ color: "rgba(var(--ink-rgb),0.4)" }}>
                  — &quot;{acknowledged.notes}&quot;
                </span>
              )}
            </div>
          )}

          {/* Acknowledge action */}
          {triggered && !isAcked && (
            <div className="mt-3">
              {!showInput ? (
                <button
                  onClick={() => setShowInput(true)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    color: "#10B981",
                    border: "1px solid rgba(16,185,129,0.3)",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Acknowledge
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); if (e.key === "Escape") { setShowInput(false); setNotes(""); }}}
                    placeholder="Add notes (optional)…"
                    autoFocus
                    className="w-full text-xs px-3 py-2 rounded-lg outline-none"
                    style={{
                      background: "rgba(var(--ink-rgb),0.06)",
                      border: "1px solid rgba(var(--ink-rgb),0.12)",
                      color: "rgba(var(--ink-rgb),0.7)",
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleConfirm}
                      disabled={loading}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                      style={{
                        background: loading ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.2)",
                        color: "#10B981",
                        border: "1px solid rgba(16,185,129,0.4)",
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading ? "Saving…" : "Confirm"}
                    </button>
                    <button
                      onClick={() => { setShowInput(false); setNotes(""); }}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{ background: "rgba(var(--ink-rgb),0.04)", color: "rgba(var(--ink-rgb),0.35)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
