import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  MapPin,
  Users,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  DollarSign,
  Shield,
} from "lucide-react";
import { decisionMeta, fairnessData, uncertaintyData } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer } from "recharts";

// ── Confidence ring ───────────────────────────────────────────────────────────

function ConfidenceRing({ value }: { value: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const trackColor = "hsl(var(--muted))";
  const fillColor =
    value >= 75
      ? "hsl(var(--status-warn))"
      : value >= 55
      ? "hsl(var(--status-info))"
      : "hsl(var(--status-danger))";

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="rotate-[-90deg]">
      <circle cx="36" cy="36" r={r} fill="none" stroke={trackColor} strokeWidth="5" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke={fillColor}
        strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text
        x="36"
        y="36"
        fill="hsl(var(--foreground))"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="13"
        fontWeight="600"
        fontFamily="IBM Plex Mono"
        style={{ transform: "rotate(90deg)", transformOrigin: "36px 36px" }}
      >
        {value}%
      </text>
    </svg>
  );
}

// ── Status chip ───────────────────────────────────────────────────────────────

function StatusChip({
  label,
  variant,
}: {
  label: string;
  variant: "pass" | "warn" | "danger" | "info" | "neutral";
}) {
  const cls = {
    pass: "badge-pass",
    warn: "badge-warn",
    danger: "badge-danger",
    info: "badge-info",
    neutral: "badge-neutral",
  }[variant];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium font-mono ${cls}`}>
      {label}
    </span>
  );
}

// ── Mini stat row ─────────────────────────────────────────────────────────────

function MiniStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="w-3 h-3 shrink-0" />
      <span>{label}</span>
      <span className={`font-semibold font-mono ml-auto ${color ?? "text-foreground"}`}>{value}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DecisionSummaryBar() {
  const d = decisionMeta;
  const [expanded, setExpanded] = useState(false);

  const ethicsVariant: "pass" | "warn" | "danger" =
    (d.ethicsStatus as string) === "Passed"
      ? "pass"
      : (d.ethicsStatus as string) === "Needs Review"
      ? "warn"
      : "danger";
  const humanVariant: "pass" | "warn" | "danger" | "neutral" =
    (d.humanStatus as string) === "Approved"
      ? "pass"
      : (d.humanStatus as string) === "Rejected"
      ? "danger"
      : (d.humanStatus as string) === "Overridden"
      ? "warn"
      : "neutral";
  const riskVariant: "pass" | "warn" | "danger" =
    (d.riskLevel as string) === "High"
      ? "danger"
      : (d.riskLevel as string) === "Medium"
      ? "warn"
      : "pass";

  // Severity indicators
  const highFairnessFlags = fairnessData.alerts.filter((a) => a.severity === "high").length;
  const confidenceDelta = uncertaintyData.confidence - 82; // 82 = pre-degradation

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-surface border border-border rounded-lg shadow-card overflow-hidden"
    >
      {/* Urgency accent line — color-coded by risk */}
      <div
        className={`h-[3px] w-full ${
          (d.riskLevel as string) === "High"
            ? "bg-gradient-to-r from-status-danger via-status-warn to-primary"
            : "bg-gradient-to-r from-status-warn via-primary to-status-info"
        }`}
      />

      {/* Main bar */}
      <div className="px-5 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        {/* ── Left: title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-muted-foreground text-xs font-mono">Decision #{d.id}</span>
            <span className="text-border-strong">·</span>
            <span className="text-muted-foreground text-xs">AI Recommendation</span>
            <span className="text-border-strong">·</span>
            <span className="text-muted-foreground text-xs font-mono">
              {new Date(d.timestamp).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-foreground font-semibold text-base leading-tight pr-4 mb-1">
            {d.title}
          </h1>
          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 pr-4 mb-2">
            {d.recommendation}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {d.impactRadius} impact radius
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              {d.populationAffected.toLocaleString()} households
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              {d.riskReduction} risk reduction
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="w-3 h-3" />
              {d.estimatedCost}
            </span>
          </div>
        </div>

        {/* ── Center: Confidence + uncertainty band */}
        <div className="flex items-center gap-5 shrink-0">
          <div className="flex flex-col items-center gap-1">
            <ConfidenceRing value={d.confidence} />
            <span className="text-xs text-muted-foreground font-mono">{d.confidenceLabel}</span>
            {confidenceDelta < 0 && (
              <span className="flex items-center gap-0.5 text-[10px] font-mono text-status-danger">
                <TrendingDown className="w-2.5 h-2.5" />
                {confidenceDelta} pts (stale data)
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <span className="text-[10px] text-muted-foreground block mb-1 uppercase tracking-wider">Risk</span>
              <StatusChip label={d.riskLevel} variant={riskVariant} />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-1 uppercase tracking-wider">Urgency</span>
              <StatusChip label={d.urgency} variant="danger" />
            </div>
          </div>
        </div>

        {/* ── Divider */}
        <div className="hidden lg:block w-px h-16 bg-border self-center" />

        {/* ── Right: status chips */}
        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <div>
              <span className="text-[10px] text-muted-foreground block mb-1 uppercase tracking-wider">Ethics</span>
              <StatusChip label={d.ethicsStatus} variant={ethicsVariant} />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-1 uppercase tracking-wider">Human Review</span>
              <StatusChip label={d.humanStatus} variant={humanVariant} />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1 border-t border-border">
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <Cpu className="w-3 h-3" />
              {d.modelVersion}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <Clock className="w-3 h-3" />
              {new Date(d.timestamp).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {d.isPartiallyInterpretable && (
            <div className="flex items-center gap-1.5 text-xs text-status-warn">
              <AlertTriangle className="w-3 h-3" />
              Partially interpretable
            </div>
          )}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse summary" : "Expand summary"}
          className="hidden lg:flex items-center justify-center w-6 h-6 rounded border border-border text-muted-foreground hover:text-foreground hover:border-border-strong transition-colors self-start mt-1 shrink-0"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Alert strip — always visible when there are critical issues */}
      {highFairnessFlags > 0 && (
        <div className="flex items-center gap-2.5 px-5 py-2 bg-status-danger/5 border-t border-status-danger/20 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-status-danger shrink-0 animate-pulse-warn" />
          <span className="text-status-danger font-medium">
            {highFairnessFlags} high-severity fairness {highFairnessFlags === 1 ? "flag" : "flags"} require Ethics Board review before approval.
          </span>
          <Shield className="w-3.5 h-3.5 text-status-danger ml-auto shrink-0" />
        </div>
      )}

      {/* Expanded detail panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Impact metrics</span>
                <MiniStat icon={Users} label="Households" value={d.populationAffected.toLocaleString()} />
                <MiniStat icon={DollarSign} label="Est. cost" value={d.estimatedCost} />
                <MiniStat icon={TrendingUp} label="Risk reduction" value={d.riskReduction} color="text-status-pass" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Confidence breakdown</span>
                <MiniStat icon={TrendingDown} label="Uncertainty band" value={`${uncertaintyData.uncertaintyBand.low}–${uncertaintyData.uncertaintyBand.high}%`} />
                <MiniStat icon={AlertTriangle} label="Data sufficiency" value={`${uncertaintyData.dataSufficiency}%`} color={uncertaintyData.dataSufficiency < 75 ? "text-status-warn" : undefined} />
                <MiniStat icon={Shield} label="Robustness" value={uncertaintyData.robustness} color={uncertaintyData.robustness === "Fragile" ? "text-status-danger" : "text-status-pass"} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Fairness summary</span>
                {fairnessData.dimensions.map((dim) => (
                  <div key={dim.name} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate">{dim.name}</span>
                    <span className={`font-mono text-[10px] ml-2 shrink-0 ${(dim.status as string) === "pass" ? "text-status-pass" : (dim.status as string) === "warn" ? "text-status-warn" : "text-status-danger"}`}>
                      {dim.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Model & timeline</span>
                <MiniStat icon={Cpu} label="Model" value={d.modelVersion} />
                <MiniStat icon={Clock} label="Generated" value={new Date(d.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} />
                <MiniStat icon={MapPin} label="Impact radius" value={d.impactRadius} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
