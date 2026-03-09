import { alternatives } from "@/data/mockData";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  BarChart2,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type Alt = (typeof alternatives)[0];

// ── Radar chart data ──────────────────────────────────────────────────────────
// Normalise metrics 0–100 for all 4 alternatives

const RADAR_DATA = [
  {
    metric: "Confidence",
    "Phased Relocation": 78,
    "Drainage + Road": 61,
    "Seasonal Evac.": 45,
    "Flood Barrier": 38,
  },
  {
    metric: "Risk Reduction",
    "Phased Relocation": 67,
    "Drainage + Road": 41,
    "Seasonal Evac.": 29,
    "Flood Barrier": 55,
  },
  {
    metric: "Low Disruption",
    "Phased Relocation": 10,   // high disruption → inverted
    "Drainage + Road": 90,
    "Seasonal Evac.": 55,
    "Flood Barrier": 88,
  },
  {
    metric: "Cost Efficiency",
    "Phased Relocation": 50,
    "Drainage + Road": 72,
    "Seasonal Evac.": 85,
    "Flood Barrier": 20,
  },
  {
    metric: "Speed",
    "Phased Relocation": 60,
    "Drainage + Road": 40,
    "Seasonal Evac.": 95,
    "Flood Barrier": 25,
  },
  {
    metric: "Long-term Safety",
    "Phased Relocation": 95,
    "Drainage + Road": 55,
    "Seasonal Evac.": 20,
    "Flood Barrier": 65,
  },
];

const RADAR_COLORS = [
  "hsl(var(--status-danger))",
  "hsl(var(--accent))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--status-info))",
];

const ALT_NAMES = [
  "Phased Relocation",
  "Drainage + Road",
  "Seasonal Evac.",
  "Flood Barrier",
];

// ── Subcomponents ─────────────────────────────────────────────────────────────

function TradeoffRow({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-1.5">
        {positive ? (
          <CheckCircle2 className="w-3 h-3 text-status-pass shrink-0" />
        ) : (
          <XCircle className="w-3 h-3 text-status-danger/70 shrink-0" />
        )}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className={`text-xs font-medium ${positive ? "text-status-pass" : "text-muted-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

function AlternativeCard({
  alt,
  isExpanded,
  onToggle,
}: {
  alt: Alt;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const confColor =
    alt.confidence >= 70
      ? "text-status-pass"
      : alt.confidence >= 50
      ? "text-status-warn"
      : "text-status-danger";

  return (
    <div
      className={`rounded-md border overflow-hidden transition-colors ${
        alt.isPrimary
          ? "border-primary/40 bg-primary-muted/20"
          : "border-border bg-muted/30"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-3 py-3 flex items-center gap-3 hover:bg-surface-hover/50 transition-colors"
      >
        <div
          className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-bold shrink-0 ${
            alt.isPrimary
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground border border-border"
          }`}
        >
          {alt.rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium text-foreground truncate">{alt.label}</span>
            {alt.isPrimary && (
              <span className="badge-info text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0">
                Primary
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className={`font-mono font-semibold ${confColor}`}>
              {alt.confidence}% confidence
            </span>
            <span>{alt.riskReduction} risk reduction</span>
            <span>{alt.timeframe}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              alt.socialDisruption === "Low"
                ? "badge-pass"
                : alt.socialDisruption === "Medium"
                ? "badge-warn"
                : "badge-danger"
            }`}
          >
            Social: {alt.socialDisruption}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-border/50 pt-3 flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Cost", value: alt.costEstimate },
                  { label: "Risk Reduction", value: alt.riskReduction },
                  { label: "Timeframe", value: alt.timeframe },
                ].map((m) => (
                  <div key={m.label} className="bg-muted rounded p-2 text-center">
                    <span className="text-xs font-mono font-semibold text-foreground block">
                      {m.value}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{m.label}</span>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 font-medium">
                  Tradeoffs
                </p>
                <div className="bg-background/50 rounded p-2">
                  {alt.tradeoffs.map((t, i) => (
                    <TradeoffRow key={i} {...t} />
                  ))}
                </div>
              </div>

              {alt.whySelected && (
                <div className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-pass mt-0.5 shrink-0" />
                  <div>
                    <span className="text-status-pass font-medium">Why selected: </span>
                    <span className="text-muted-foreground">{alt.whySelected}</span>
                  </div>
                </div>
              )}
              {alt.notSelected && (
                <div className="flex items-start gap-2 text-xs">
                  <XCircle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="text-muted-foreground font-medium">Not selected: </span>
                    <span className="text-muted-foreground">{alt.notSelected}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AlternativesPanel() {
  const [expanded, setExpanded] = useState<string>("alt-1");
  const [view, setView] = useState<"list" | "radar">("list");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-surface border border-border rounded-lg shadow-card flex flex-col"
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Alternative Recommendations</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            What else was considered, and why was it not selected?
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded border border-border overflow-hidden text-[10px]">
            <button
              onClick={() => setView("list")}
              className={`px-2 py-1 transition-colors ${
                view === "list"
                  ? "bg-surface-elevated text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView("radar")}
              className={`px-2 py-1 transition-colors border-l border-border ${
                view === "radar"
                  ? "bg-surface-elevated text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart2 className="w-3 h-3 inline mr-1" />Radar
            </button>
          </div>
          <Zap className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="p-4 flex flex-col gap-2"
          >
            {alternatives.map((alt) => (
              <AlternativeCard
                key={alt.id}
                alt={alt}
                isExpanded={expanded === alt.id}
                onToggle={() => setExpanded(expanded === alt.id ? "" : alt.id)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="radar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="p-4 flex flex-col gap-3"
          >
            <p className="text-xs text-muted-foreground">
              Multi-axis comparison — higher score = more desirable on each dimension.
              <span className="text-status-warn font-medium ml-1">"Low Disruption"</span> and{" "}
              <span className="text-status-warn font-medium">"Cost Efficiency"</span> are inverted (higher = better).
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={RADAR_DATA} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 6,
                    fontSize: 11,
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}
                />
                {ALT_NAMES.map((name, i) => (
                  <Radar
                    key={name}
                    name={name}
                    dataKey={name}
                    stroke={RADAR_COLORS[i]}
                    fill={RADAR_COLORS[i]}
                    fillOpacity={i === 0 ? 0.2 : 0.07}
                    strokeWidth={i === 0 ? 2 : 1.5}
                    strokeDasharray={i === 0 ? undefined : "4 3"}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2">
              {alternatives.map((alt, i) => (
                <div key={alt.id} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: RADAR_COLORS[i] }}
                  />
                  <span className={`font-medium ${alt.isPrimary ? "text-foreground" : "text-muted-foreground"}`}>
                    {alt.label}
                  </span>
                  <span className="font-mono text-muted-foreground ml-auto">{alt.confidence}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
