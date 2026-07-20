"use client";

import { useState, useEffect, useCallback } from "react";
import { Prediction, AppNotification, Acknowledgment } from "@/lib/types";
import RiskGauge from "@/components/RiskGauge";
import AnomalyBar from "@/components/AnomalyBar";
import RecommendationCard from "@/components/RecommendationCard";
import StatCard from "@/components/StatCard";
import HistoryChart from "@/components/HistoryChart";
import NotificationBell from "@/components/NotificationBell";
import NotificationPanel from "@/components/NotificationPanel";
import AlertTimeline from "@/components/AlertTimeline";
import { format, parseISO } from "date-fns";

const OVERALL_RISK_COLORS: Record<string, string> = {
  NORMAL: "#10B981",
  LOW: "#84CC16",
  MEDIUM: "#F59E0B",
  HIGH: "#EF4444",
  CRITICAL: "#DC2626",
};

const TARGET_ORDER = ["compressor_failure", "pump_failure", "cooling_degradation"] as const;
type TargetKey = (typeof TARGET_ORDER)[number];

const LABEL_MAP: Record<string, string> = {
  compressor_failure:  "Compressor",
  pump_failure:        "Pump",
  cooling_degradation: "Cooling System",
};

const COLOR_MAP: Record<string, string> = {
  compressor_failure:  "#F59E0B",
  pump_failure:        "#00D4FF",
  cooling_degradation: "#EF4444",
};

export default function DashboardPage() {
  const [latest, setLatest]           = useState<Prediction | null>(null);
  const [history, setHistory]         = useState<Prediction[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showPanel, setShowPanel]         = useState(false);

  const [acknowledgments, setAcknowledgments] = useState<Record<TargetKey, Acknowledgment | null>>({
    compressor_failure:  null,
    pump_failure:        null,
    cooling_degradation: null,
  });

  // ── Fetch ────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [latestRes, historyRes] = await Promise.all([
        fetch("/api/predictions"),
        fetch("/api/predictions/history?limit=30"),
      ]);
      if (!latestRes.ok) throw new Error("Failed to fetch latest prediction");
      const latestData: Prediction = await latestRes.json();
      const historyData            = await historyRes.json();
      setLatest(latestData);
      setHistory(Array.isArray(historyData) ? historyData : []);
      setLastRefresh(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const syncNotifications = useCallback(async () => {
    try {
      await fetch("/api/notifications", { method: "POST" });
      const res  = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch { /* supplementary — fail silently */ }
  }, []);

  // Reload acknowledgments when run changes
  useEffect(() => {
    if (!latest) return;
    fetch(`/api/acknowledge?run_id=${latest.run_id}`)
      .then((r) => r.json())
      .then((data: Acknowledgment[]) => {
        if (!Array.isArray(data)) return;
        setAcknowledgments((prev) => {
          const next = { ...prev };
          data.forEach((a) => { if (a.target in next) next[a.target as TargetKey] = a; });
          return next;
        });
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latest?.run_id]);

  useEffect(() => {
    fetchData().then(() => syncNotifications());
    const id = setInterval(() => { fetchData().then(() => syncNotifications()); }, 30_000);
    return () => clearInterval(id);
  }, [fetchData, syncNotifications]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleAcknowledge = async (target: string, notes: string) => {
    if (!latest) return;
    const res = await fetch("/api/acknowledge", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ run_id: latest.run_id, target, notes }),
    });
    if (res.ok) {
      const ack: Acknowledgment = await res.json();
      setAcknowledgments((prev) => ({ ...prev, [target]: ack }));
    }
  };

  const handleDismiss = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const handleDismissAll = async () => {
    await Promise.all(notifications.map((n) => fetch(`/api/notifications/${n._id}`, { method: "PATCH" })));
    setNotifications([]);
  };

  // ── Derived ──────────────────────────────────────────────────
  const overallColor   = latest ? (OVERALL_RISK_COLORS[latest.summary.overall_risk_level] || "#10B981") : "#10B981";
  const inferenceTime  = latest ? format(parseISO(latest.inference_timestamp), "MMM dd, yyyy HH:mm:ss") : "—";
  const totalTargets     = history.length * 3;
  const triggeredTargets = history?.reduce?.((sum, p) => sum + (p.summary?.targets_triggered?.length ?? 0), 0);
  const healthPct        = totalTargets > 0
    ? Math.round(((totalTargets - triggeredTargets) / totalTargets) * 100)
    : 100;

  return (
    <div className="min-h-screen text-white" style={{ background: "#0A0F1E", fontFamily: "Space Grotesk, sans-serif" }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b"
        style={{ background: "rgba(10,15,30,0.94)", borderColor: "rgba(255,255,255,0.06)", backdropFilter: "blur(14px)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg,#00D4FF22,#00D4FF44)", border: "1px solid rgba(0,212,255,0.25)" }}
          >
            🌡️
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight" style={{ color: "#00D4FF" }}>
              TMS Predictive Maintenance
            </h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              Thermal Management System · Real-time Monitor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs hidden sm:block" style={{ color: "rgba(255,255,255,0.25)" }}>
            {format(lastRefresh, "HH:mm:ss")}
          </span>
          <button
            onClick={() => { fetchData(); syncNotifications(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
            style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.25)", color: "#00D4FF" }}
          >
            ↻ Refresh
          </button>
          <NotificationBell count={notifications.length} onClick={() => setShowPanel(true)} />
          {latest && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: `${overallColor}18`, border: `1px solid ${overallColor}44` }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: overallColor }} />
              <span className="text-xs font-bold" style={{ color: overallColor }}>
                {latest.summary.overall_risk_level}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ── Notification panel ───────────────────────────────── */}
      {showPanel && (
        <NotificationPanel
          notifications={notifications}
          onDismiss={handleDismiss}
          onDismissAll={handleDismissAll}
          onClose={() => setShowPanel(false)}
        />
      )}

      {/* ── Loading ──────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 animate-spin" style={{ borderColor: "#00D4FF", borderTopColor: "transparent" }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Connecting to MongoDB…</p>
          </div>
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────── */}
      {error && !loading && (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="p-8 rounded-2xl max-w-md text-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-sm font-semibold mb-1" style={{ color: "#EF4444" }}>Connection Error</p>
            <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>{error}</p>
            <button
              onClick={() => { fetchData(); syncNotifications(); }}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: "rgba(239,68,68,0.2)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.4)" }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ── Main ─────────────────────────────────────────────── */}
      {!loading && !error && latest && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* Alert banner */}
          {latest.summary?.targets_triggered?.length > 0 && (
            <div
              className="flex items-start gap-3 p-4 rounded-2xl animate-pulse_slow"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.4)" }}
            >
              <span className="text-2xl">🚨</span>
              <div>
                <p className="text-sm font-bold mb-1" style={{ color: "#EF4444" }}>
                  ACTIVE ALERT — {latest.summary.targets_triggered.length} System(s) Triggered
                </p>
                {(latest.summary.active_recommendations ?? []).map((r, i) => (
                  <p key={i} className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{r}</p>
                ))}
              </div>
            </div>
          )}

          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              label="Alerts Triggered"
              value={latest?.summary?.targets_triggered?.length}
              sub="of 3 systems"
              accent={latest?.summary?.targets_triggered?.length > 0 ? "#EF4444" : "#10B981"}
              icon={latest?.summary?.targets_triggered?.length > 0 ? "⚠️" : "✅"}
            />
            <StatCard
              label="System Health"
              value={`${healthPct}%`}
              sub={`${history?.length} runs · ${triggeredTargets}/${totalTargets} targets`}
              accent={healthPct >= 80 ? "#10B981" : healthPct >= 50 ? "#F59E0B" : "#EF4444"}
              icon="🛡️"
            />
            <StatCard
              label="Last Inference"
              value={inferenceTime.split(",")[1]?.trim() ?? "—"}
              sub={inferenceTime.split(",")[0]}
              accent="#A78BFA"
              icon="⏱️"
            />
          </div>

          {/* ── Risk Gauges ─────────────────────────────────── */}
          <section>
            <h2 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
              Failure Probability · Per System
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {TARGET_ORDER.map((key) => (
                <RiskGauge
                  key={key}
                  probability={latest?.predictions?.[key]?.probability}
                  riskLevel={latest?.predictions?.[key]?.risk_level}
                  label={LABEL_MAP[key]}
                  triggered={latest?.predictions?.[key]?.triggered}
                />
              ))}
            </div>
          </section>

          {/* ── Anomaly + Threshold ──────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Anomaly Scores */}
            <div className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                Anomaly Scores
              </h3>
              <div className="space-y-4">
                <AnomalyBar score={latest?.predictions?.compressor_failure?.anomaly_score}  label="Compressor"     color="#F59E0B" />
                <AnomalyBar score={latest?.predictions?.pump_failure?.anomaly_score}         label="Pump"           color="#00D4FF" />
                <AnomalyBar score={latest?.predictions?.cooling_degradation?.anomaly_score}  label="Cooling System" color="#EF4444" />
              </div>
              <p className="mt-4 pt-4 text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.22)" }}>
                Deviation from normal operating range (0 = normal, 1 = highly anomalous).
              </p>
            </div>

            {/* Probability vs Threshold */}
            <div className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                Probability vs Threshold
              </h3>
              <div className="space-y-4">
                {TARGET_ORDER.map((key) => {
                  const pred     = latest?.predictions?.[key];
                  const color    = COLOR_MAP[key];
                  const pct      = Math.min(pred.probability * 100, 100);
                  const threshPct = pred.threshold * 100;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span style={{ color: "rgba(255,255,255,0.45)" }}>{LABEL_MAP[key]}</span>
                        <span className="font-mono" style={{ color }}>
                          {(pred.probability * 100).toFixed(1)}%{" "}
                          <span style={{ color: "rgba(255,255,255,0.22)" }}>/ Threshold {Math.round(pred.threshold * 100)}%</span>
                        </span>
                      </div>
                      <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div
                          className="absolute h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: color, boxShadow: pred.triggered ? `0 0 8px ${color}` : "none" }}
                        />
                        <div className="absolute top-0 bottom-0 w-0.5" style={{ left: `${threshPct}%`, background: "rgba(255,255,255,0.5)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>
                White line = alert threshold. Bar past threshold = triggered.
              </p>
            </div>
          </div>

          {/* ── Recommendations ──────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
                Maintenance Recommendations
              </h2>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                Click &quot;Acknowledge&quot; to confirm action taken
              </span>
            </div>
            <div className="space-y-3">
              {TARGET_ORDER.map((key) => (
                <RecommendationCard
                  key={key}
                  target={key}
                  recommendation={latest?.predictions?.[key]?.recommendation}
                  triggered={latest?.predictions?.[key]?.triggered}
                  riskLevel={latest?.predictions?.[key]?.risk_level}
                  runId={latest.run_id}
                  acknowledged={acknowledgments[key]}
                  onAcknowledge={handleAcknowledge}
                />
              ))}
            </div>
          </section>

          {/* ── Trend Chart ──────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
                Failure Probability Over Time
              </h2>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                Last {history?.length} runs
              </span>
            </div>
            <div className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {history?.length < 2 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <span className="text-3xl">📈</span>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Not enough history yet. Run more inference cycles.</p>
                </div>
              ) : (
                <HistoryChart history={history} />
              )}
            </div>
          </section>

          {/* ── Alert Timeline + Run Log ─────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Alert Timeline */}
            <div className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                Recent Alert Timeline
              </h3>
              <AlertTimeline history={history} />
            </div>

            {/* Run Log */}
            <div className="p-5 rounded-2xl overflow-auto" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                Run Log
              </h3>
              <table className="w-full text-xs" style={{ borderCollapse: "separate", borderSpacing: "0 4px" }}>
                <thead>
                  <tr style={{ color: "rgba(255,255,255,0.3)" }}>
                    <th className="text-left pb-2 pr-3">Timestamp</th>
                    <th className="text-right pb-2 pr-3">Comp.</th>
                    <th className="text-right pb-2 pr-3">Pump</th>
                    <th className="text-right pb-2 pr-3">Cooling</th>
                    <th className="text-right pb-2">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {history?.slice?. (0, 15)?.map((h) => {
                    const rc      = OVERALL_RISK_COLORS[h?.summary?.overall_risk_level] || "#10B981";
                    const isAlert = h?.summary?.targets_triggered?.length > 0;
                    return (
                      <tr key={h._id} style={{ background: isAlert ? `${rc}08` : "rgba(255,255,255,0.02)" }}>
                        <td className="py-1.5 pr-3 rounded-l-lg" style={{ color: "rgba(255,255,255,0.45)" }}>
                          {format(parseISO(h?.inference_timestamp), "MM/dd HH:mm")}
                        </td>
                        <td className="py-1.5 pr-3 text-right font-mono" style={{ color: "#F59E0B" }}>
                          {(h?.predictions?.compressor_failure?.probability * 100).toFixed(1)}%
                        </td>
                        <td className="py-1.5 pr-3 text-right font-mono" style={{ color: "#00D4FF" }}>
                          {(h?.predictions?.pump_failure?.probability * 100).toFixed(1)}%
                        </td>
                        <td className="py-1.5 pr-3 text-right font-mono" style={{ color: "#EF4444" }}>
                          {(h?.predictions?.cooling_degradation?.probability * 100).toFixed(1)}%
                        </td>
                        <td className="py-1.5 rounded-r-lg text-right">
                          <span className="px-2 py-0.5 rounded-full font-bold" style={{ background: `${rc}22`, color: rc }}>
                            {h?.summary?.overall_risk_level}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Drift Report ─────────────────────────────────── */}
          <section>
            <h2 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
              Data Drift Report
            </h2>
            <div className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{latest?.drift_report?.drift_detected ? "⚠️" : "✅"}</span>
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: latest?.drift_report?.drift_detected ? "#F59E0B" : "#10B981" }}
                  >
                    {latest?.drift_report?.drift_detected ? "Data Drift Detected" : "No Data Drift Detected"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{latest?.drift_report?.reason}</p>
                </div>
              </div>
              {Object.keys(latest?.drift_report?.features ?? {}).length > 0 ? (
                <div className="space-y-1.5">
                  {Object.entries(latest?.drift_report?.features ?? {}).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between items-center p-2.5 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.55)" }}>{k}</span>
                      <span className="text-xs font-mono" style={{ color: "#F59E0B" }}>{JSON.stringify(v)}</span>
                    </div>
                  ))}
                </div> 
              ) : (
                <p className="text-xs text-center py-6" style={{ color: "rgba(255,255,255,0.2)" }}>
                  No feature drift metrics available.
                </p>
              )}
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center py-4" style={{ color: "rgba(255,255,255,0.12)", fontSize: 11 }}>
            transACNR TMS · {latest?._id} · {format(lastRefresh, "yyyy-MM-dd HH:mm:ss")}
          </footer>
        </main>
      )}
    </div>
  );
}
