import { useState, useEffect, useRef } from "react";
import { dataSources } from "@/data/mockData";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  TrendingDown,
  Wifi,
  WifiOff,
  Database,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Pipeline health types ────────────────────────────────────────────────────

type ConnectionStatus = "live" | "degraded" | "stale" | "broken";

interface PipelineHealth {
  id: string;
  name: string;
  type: string;
  owner: string;
  status: ConnectionStatus;
  lastPing: string;
  latencyMs: number | null;
  confidenceContribution: number; // –N points added to model confidence degradation
  staleDays: number | null;
  coverage: number;
  reliability: number;
  issue: string | null;
  isAnimating?: boolean;
}

// ── Build pipeline health from mock data ────────────────────────────────────

const buildPipelines = (): PipelineHealth[] => [
  {
    id: "ds-1",
    name: "Satellite Flood Imagery",
    type: "Remote Sensing",
    owner: "National Geospatial Agency",
    status: "live",
    lastPing: "2 min ago",
    latencyMs: 142,
    confidenceContribution: 0,
    staleDays: 0,
    coverage: 98,
    reliability: 94,
    issue: null,
  },
  {
    id: "ds-2",
    name: "Drainage & Roads Survey",
    type: "Infrastructure Assessment",
    owner: "Regional Infrastructure Authority",
    status: "stale",
    lastPing: "17 mo ago",
    latencyMs: null,
    confidenceContribution: -2,
    staleDays: 510,
    coverage: 76,
    reliability: 71,
    issue: "Last field survey >17 months ago. Sub-zones 7B/7D below 80% coverage.",
  },
  {
    id: "ds-3",
    name: "Population Census 2023",
    type: "Demographic",
    owner: "National Statistics Office",
    status: "live",
    lastPing: "12 min ago",
    latencyMs: 88,
    confidenceContribution: 0,
    staleDays: 0,
    coverage: 94,
    reliability: 88,
    issue: null,
  },
  {
    id: "ds-4",
    name: "Climate Projections 2024–2050",
    type: "Climate Model Ensemble",
    owner: "Meteorological Research Institute",
    status: "degraded",
    lastPing: "3 hr ago",
    latencyMs: 2340,
    confidenceContribution: -1,
    staleDays: 0,
    coverage: 100,
    reliability: 63,
    issue: "High model spread RCP4.5 vs 8.5 scenario. Ensemble refresh delayed.",
  },
  {
    id: "ds-5",
    name: "Health Vulnerability Dataset",
    type: "Public Health",
    owner: "District Health Authority",
    status: "stale",
    lastPing: "11 mo ago",
    latencyMs: null,
    confidenceContribution: -1,
    staleDays: 335,
    coverage: 85,
    reliability: 79,
    issue: "GP registration data not refreshed since March 2023.",
  },
  {
    id: "ds-6",
    name: "Community Participatory Survey",
    type: "Community Input",
    owner: "District Social Services",
    status: "live",
    lastPing: "8 min ago",
    latencyMs: 204,
    confidenceContribution: 0,
    staleDays: 0,
    coverage: 55,
    reliability: 60,
    issue: null,
  },
  {
    id: "ds-7",
    name: "Insurance Bureau Loss Dataset",
    type: "Financial",
    owner: "National Insurance Bureau",
    status: "live",
    lastPing: "5 min ago",
    latencyMs: 310,
    confidenceContribution: 0,
    staleDays: 0,
    coverage: 91,
    reliability: 83,
    issue: null,
  },
  {
    id: "ds-8",
    name: "Geotechnical Subsidence Survey",
    type: "Ground Survey",
    owner: "National Geological Survey",
    status: "broken",
    lastPing: "25 mo ago",
    latencyMs: null,
    confidenceContribution: -4,
    staleDays: 757,
    coverage: 68,
    reliability: 55,
    issue: "Pipeline timeout. Survey dataset >25 months old. Confidence –4 pts applied.",
  },
];

// ── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ConnectionStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
  Icon: React.ElementType;
  dot: string;
}> = {
  live:     { label: "Live",     color: "text-status-pass",   bg: "bg-status-pass/10",   border: "border-status-pass/30",   Icon: CheckCircle, dot: "bg-status-pass" },
  degraded: { label: "Degraded", color: "text-status-warn",   bg: "bg-status-warn/10",   border: "border-status-warn/30",   Icon: AlertTriangle, dot: "bg-status-warn" },
  stale:    { label: "Stale",    color: "text-status-warn",   bg: "bg-status-warn/10",   border: "border-status-warn/30",   Icon: Clock,       dot: "bg-status-warn" },
  broken:   { label: "Broken",   color: "text-status-danger", bg: "bg-status-danger/10", border: "border-status-danger/30", Icon: XCircle,     dot: "bg-status-danger" },
};

function StatusPip({ status }: { status: ConnectionStatus }) {
  const { dot, label } = STATUS_CONFIG[status];
  const pulse = status === "live";
  return (
    <span className="relative flex items-center gap-1.5">
      <span className={`relative flex h-2 w-2`}>
        {pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dot} opacity-60`} />}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dot}`} />
      </span>
      <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${STATUS_CONFIG[status].color}`}>
        {label}
      </span>
    </span>
  );
}

function ConfidenceDeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return null;
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold text-status-danger bg-status-danger/10 border border-status-danger/20 rounded px-1.5 py-0.5">
      <TrendingDown className="w-2.5 h-2.5" />
      {delta} pts
    </span>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function DataHealthMonitor() {
  const [pipelines, setPipelines] = useState<PipelineHealth[]>(buildPipelines);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulated live ticker — nudge latency values every 4s for live sources
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTick(t => t + 1);
      setPipelines(prev =>
        prev.map(p => {
          if (p.status !== "live" || p.latencyMs === null) return p;
          const jitter = Math.floor((Math.random() - 0.5) * 60);
          return { ...p, latencyMs: Math.max(40, (p.latencyMs ?? 100) + jitter) };
        })
      );
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function handleRefresh(id: string) {
    setRefreshing(id);
    setTimeout(() => {
      setPipelines(prev =>
        prev.map(p => {
          if (p.id !== id) return p;
          // Only allow non-broken to "refresh"
          if (p.status === "broken") return p;
          return { ...p, lastPing: "just now", latencyMs: p.status === "degraded" ? 890 : p.latencyMs };
        })
      );
      setRefreshing(null);
      setLastRefresh(new Date());
    }, 1500);
  }

  const broken   = pipelines.filter(p => p.status === "broken").length;
  const stale    = pipelines.filter(p => p.status === "stale").length;
  const degraded = pipelines.filter(p => p.status === "degraded").length;
  const live     = pipelines.filter(p => p.status === "live").length;
  const totalConfidenceDrop = pipelines.reduce((acc, p) => acc + p.confidenceContribution, 0);

  return (
    <section className="rounded-lg border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">Data Health Monitor</h2>
              <p className="text-xs text-muted-foreground">Real-time pipeline integrity — confidence degradation from weak inputs</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Summary chips */}
          <div className="hidden sm:flex items-center gap-2">
            {broken > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-status-danger bg-status-danger/10 border border-status-danger/20 rounded px-2 py-0.5">
                <XCircle className="w-3 h-3" />{broken} broken
              </span>
            )}
            {stale > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-status-warn bg-status-warn/10 border border-status-warn/20 rounded px-2 py-0.5">
                <Clock className="w-3 h-3" />{stale} stale
              </span>
            )}
            {degraded > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-status-warn bg-status-warn/10 border border-status-warn/20 rounded px-2 py-0.5">
                <AlertTriangle className="w-3 h-3" />{degraded} degraded
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-status-pass bg-status-pass/10 border border-status-pass/20 rounded px-2 py-0.5">
              <CheckCircle className="w-3 h-3" />{live} live
            </span>
          </div>

          <span className="text-[10px] text-muted-foreground font-mono hidden md:block">
            Refreshed {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>
      </div>

      {/* Confidence degradation banner */}
      {totalConfidenceDrop < 0 && (
        <div className="flex items-center gap-3 px-5 py-2.5 bg-status-danger/5 border-b border-status-danger/20">
          <TrendingDown className="w-3.5 h-3.5 text-status-danger shrink-0" />
          <p className="text-xs text-status-danger font-medium">
            Cumulative confidence degradation from weak/stale/broken inputs:
            <span className="font-mono font-bold ml-1">{totalConfidenceDrop} pts</span>
            {" "}— overall model confidence adjusted from 82% → {82 + totalConfidenceDrop}%
          </p>
        </div>
      )}

      {/* Pipeline grid */}
      <div className="divide-y divide-border">
        {pipelines.map((pipeline, i) => {
          const cfg = STATUS_CONFIG[pipeline.status];
          const StatusIcon = cfg.Icon;
          const isRefreshing = refreshing === pipeline.id;
          const canRefresh = pipeline.status !== "broken";

          return (
            <motion.div
              key={pipeline.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className={`group flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-elevated ${
                pipeline.status === "broken" ? "bg-status-danger/3" : ""
              }`}
            >
              {/* Left: name + owner */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className={`mt-0.5 w-7 h-7 rounded flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
                  <Database className={`w-3.5 h-3.5 ${cfg.color}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground truncate">{pipeline.name}</span>
                    <StatusPip status={pipeline.status} />
                    <ConfidenceDeltaBadge delta={pipeline.confidenceContribution} />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[11px] text-muted-foreground">{pipeline.owner}</span>
                    <span className="text-[11px] text-muted-foreground/50">·</span>
                    <span className="text-[11px] text-muted-foreground font-mono">{pipeline.type}</span>
                  </div>
                  {/* Issue text */}
                  <AnimatePresence>
                    {pipeline.issue && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`text-[11px] mt-1 ${cfg.color} leading-relaxed`}
                      >
                        {pipeline.issue}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right: metrics */}
              <div className="flex items-center gap-4 shrink-0 ml-10 sm:ml-0">
                {/* Coverage bar */}
                <div className="hidden md:block w-20">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Coverage</span>
                    <span className="text-[10px] font-mono text-foreground">{pipeline.coverage}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pipeline.coverage}%` }}
                      transition={{ delay: i * 0.04 + 0.2, duration: 0.5, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        pipeline.coverage >= 90 ? "bg-status-pass" :
                        pipeline.coverage >= 70 ? "bg-status-warn" : "bg-status-danger"
                      }`}
                    />
                  </div>
                </div>

                {/* Reliability bar */}
                <div className="hidden lg:block w-20">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Reliability</span>
                    <span className="text-[10px] font-mono text-foreground">{pipeline.reliability}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pipeline.reliability}%` }}
                      transition={{ delay: i * 0.04 + 0.3, duration: 0.5, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        pipeline.reliability >= 80 ? "bg-status-pass" :
                        pipeline.reliability >= 65 ? "bg-status-warn" : "bg-status-danger"
                      }`}
                    />
                  </div>
                </div>

                {/* Latency / last ping */}
                <div className="text-right w-24">
                  {pipeline.latencyMs !== null ? (
                    <div className="flex items-center justify-end gap-1">
                      <Wifi className="w-3 h-3 text-status-pass" />
                      <motion.span
                        key={`${pipeline.id}-${tick}`}
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        className="text-[11px] font-mono text-status-pass"
                      >
                        {pipeline.latencyMs}ms
                      </motion.span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      <WifiOff className="w-3 h-3 text-status-danger" />
                      <span className="text-[11px] font-mono text-muted-foreground">offline</span>
                    </div>
                  )}
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    <Clock className="inline w-2.5 h-2.5 mr-0.5 -mt-0.5" />
                    {pipeline.lastPing}
                  </div>
                </div>

                {/* Refresh button */}
                <button
                  onClick={() => handleRefresh(pipeline.id)}
                  disabled={!canRefresh || isRefreshing}
                  title={canRefresh ? "Re-ping source" : "Source unavailable — request manual update"}
                  className={`p-1.5 rounded transition-colors ${
                    canRefresh
                      ? "text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                      : "text-muted-foreground/30 cursor-not-allowed"
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer: integrity summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-5 py-3 border-t border-border bg-background/40">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="w-3.5 h-3.5" />
          <span>
            <span className="text-foreground font-medium">{live}</span> of {pipelines.length} sources active ·{" "}
            <span className={broken > 0 ? "text-status-danger font-medium" : "text-muted-foreground"}>
              {broken} broken
            </span>{" "}
            ·{" "}
            <span className={stale > 0 ? "text-status-warn font-medium" : "text-muted-foreground"}>
              {stale} stale
            </span>
          </span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          Data integrity affects model confidence. Stale or broken sources degrade recommendation quality.
        </span>
      </div>
    </section>
  );
}
