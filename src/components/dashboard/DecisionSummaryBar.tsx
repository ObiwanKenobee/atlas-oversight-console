import { AlertTriangle, CheckCircle2, Clock, Cpu, MapPin, Users, TrendingUp, AlertCircle } from "lucide-react";
import { decisionMeta } from "@/data/mockData";
import { motion } from "framer-motion";

function StatusChip({ label, variant }: { label: string; variant: "pass" | "warn" | "danger" | "info" | "neutral" }) {
  const cls = {
    pass:    "badge-pass",
    warn:    "badge-warn",
    danger:  "badge-danger",
    info:    "badge-info",
    neutral: "badge-neutral",
  }[variant];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium font-mono ${cls}`}>
      {label}
    </span>
  );
}

function ConfidenceArc({ value }: { value: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const color = value >= 75 ? "hsl(160 58% 40%)" : value >= 55 ? "hsl(38 90% 52%)" : "hsl(0 72% 52%)";
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="rotate-[-90deg]">
      <circle cx="36" cy="36" r={r} fill="none" stroke="hsl(220 14% 18%)" strokeWidth="5" />
      <circle
        cx="36" cy="36" r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text x="36" y="36" fill="hsl(210 20% 92%)" textAnchor="middle" dominantBaseline="middle"
        fontSize="13" fontWeight="600" fontFamily="IBM Plex Mono"
        style={{ transform: "rotate(90deg)", transformOrigin: "36px 36px" }}>
        {value}%
      </text>
    </svg>
  );
}

export function DecisionSummaryBar() {
  const d = decisionMeta;
  const ethicsVariant: "pass" | "warn" | "danger" = d.ethicsStatus === ("Passed" as string) ? "pass" : d.ethicsStatus === ("Needs Review" as string) ? "warn" : "danger";
  const humanVariant: "pass" | "warn" | "danger" | "neutral"  = d.humanStatus  === ("Approved" as string) ? "pass" : d.humanStatus === ("Rejected" as string) ? "danger" : d.humanStatus === ("Overridden" as string) ? "warn" : "neutral";
  const riskVariant: "pass" | "warn" | "danger"   = d.riskLevel === ("High" as string) ? "danger" : d.riskLevel === ("Medium" as string) ? "warn" : "pass";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-surface border border-border rounded-lg shadow-card overflow-hidden"
    >
      {/* Top accent line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-status-danger via-status-warn to-primary" />

      <div className="px-5 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        {/* ── Left: Decision title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-muted-foreground text-xs font-mono">Decision #{d.id}</span>
            <span className="text-border-strong">·</span>
            <span className="text-muted-foreground text-xs">AI Recommendation</span>
          </div>
          <h1 className="text-foreground font-semibold text-lg leading-tight truncate pr-4">{d.title}</h1>
          <p className="text-muted-foreground text-xs mt-1 leading-relaxed line-clamp-2 pr-4">{d.recommendation}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />{d.impactRadius} impact radius
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />{d.populationAffected.toLocaleString()} households
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />{d.riskReduction} risk reduction
            </span>
          </div>
        </div>

        {/* ── Center: Confidence + risk */}
        <div className="flex items-center gap-5 shrink-0">
          <div className="flex flex-col items-center gap-1">
            <ConfidenceArc value={d.confidence} />
            <span className="text-xs text-muted-foreground font-mono">{d.confidenceLabel}</span>
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Risk Level</span>
              <StatusChip label={d.riskLevel} variant={riskVariant} />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Urgency</span>
              <StatusChip label={d.urgency} variant="danger" />
            </div>
          </div>
        </div>

        {/* ── Divider */}
        <div className="hidden lg:block w-px h-16 bg-border self-center" />

        {/* ── Right: Status chips + meta */}
        <div className="flex flex-col gap-2.5 shrink-0">
          <div className="flex flex-wrap gap-2">
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Ethics Status</span>
              <StatusChip label={d.ethicsStatus} variant={ethicsVariant} />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Human Approval</span>
              <StatusChip label={d.humanStatus} variant={humanVariant} />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1 border-t border-border">
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <Cpu className="w-3 h-3" />{d.modelVersion}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <Clock className="w-3 h-3" />{new Date(d.timestamp).toLocaleString("en-GB", { day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit" })}
            </span>
          </div>
          {d.isPartiallyInterpretable && (
            <div className="flex items-center gap-1.5 text-xs text-status-warn">
              <AlertTriangle className="w-3 h-3" />
              Partially interpretable model
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
