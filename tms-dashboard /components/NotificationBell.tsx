"use client";

interface NotificationBellProps {
  count: number;
  onClick: () => void;
}

export default function NotificationBell({ count, onClick }: NotificationBellProps) {
  const hasAlerts = count > 0;
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:scale-105"
      style={{
        background: hasAlerts ? "rgba(239,68,68,0.15)" : "rgba(var(--ink-rgb),0.05)",
        border: `1px solid ${hasAlerts ? "rgba(239,68,68,0.4)" : "rgba(var(--ink-rgb),0.1)"}`,
      }}
      title="Notifications"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={hasAlerts ? "#EF4444" : "rgba(var(--ink-rgb),0.5)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {hasAlerts && (
        <span
          className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full font-bold animate-pulse"
          style={{ background: "#EF4444", color: "white", fontSize: 9 }}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
