"use client";

import { AppNotification } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface NotificationPanelProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  onClose: () => void;
}

const TARGET_ICONS: Record<string, string> = {
  compressor_failure: "⚙️",
  pump_failure: "🔧",
  cooling_degradation: "❄️",
};

const RISK_COLORS: Record<string, string> = {
  NORMAL: "#10B981",
  LOW: "#84CC16",
  MEDIUM: "#F59E0B",
  HIGH: "#EF4444",
  CRITICAL: "#DC2626",
};

export default function NotificationPanel({
  notifications,
  onDismiss,
  onDismissAll,
  onClose,
}: NotificationPanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col notification-panel"
        style={{
          width: 380,
          background: "#0D1424",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "-24px 0 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div>
            <h2 className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>
              Notifications
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              {notifications.length > 0
                ? `${notifications.length} unread alert${notifications.length !== 1 ? "s" : ""}`
                : "All clear"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onDismissAll}
                className="text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/10"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.4)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
              >
                ✅
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  No active alerts
                </p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                  System is operating normally
                </p>
              </div>
            </div>
          ) : (
            notifications.map((n) => {
              const color = RISK_COLORS[n.risk_level] || "#F59E0B";
              const icon = TARGET_ICONS[n.target] || "⚠️";
              const label = n.target
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
              return (
                <div
                  key={n._id}
                  className="p-4 rounded-xl transition-all"
                  style={{
                    background: `${color}0D`,
                    border: `1px solid ${color}33`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-lg"
                      style={{ background: `${color}18` }}
                    >
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold" style={{ color }}>
                          {label}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded font-bold"
                          style={{ background: `${color}22`, color, fontSize: 9 }}
                        >
                          {n.risk_level}
                        </span>
                      </div>
                      <p
                        className="text-xs leading-relaxed mb-2.5"
                        style={{ color: "rgba(255,255,255,0.55)" }}
                      >
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>
                          {format(parseISO(n.created_at), "MMM dd, HH:mm")}
                        </span>
                        <button
                          onClick={() => onDismiss(n._id)}
                          className="text-xs px-2.5 py-1 rounded-lg transition-all hover:bg-white/10"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            color: "rgba(255,255,255,0.4)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.18)" }}>
            Auto-synced · Updates every 30s with prediction engine
          </p>
        </div>
      </div>
    </>
  );
}
