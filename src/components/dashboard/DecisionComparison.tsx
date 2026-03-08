import { useState } from "react";
import { motion } from "framer-motion";
import {
  Columns,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ── Mock decisions ────────────────────────────────────────────────────────────

interface Decision {
  id: string;
  title: string;
  shortTitle: string;
  date: string;
  modelVersion: string;
  recommendation: string;
  confidence: number;
  riskLevel: "High" | "Medium" | "Low";
  ethicsStatus: "Passed" | "Needs Review" | "Escalated" | "Flagged";
  humanStatus: "Approved" | "Pending" | "Rejected" | "Overridden";
  populationAffected: number;
  estimatedCost: string;
  riskReduction: string;
  fairnessFlags: number;
  openAppeals: number;
  dataSourceCount: number;
  avgDataReliability: number;
  factors: { label: string; weight: number }[];
  fairnessDimensions: { name: string; status: "pass" | "warn" | "danger"; score: number }[];
  overrideApplied: boolean;
}

const DECISIONS: Record<string, Decision> = {
  "ATL-2024-FP-0047": {
    id: "ATL-2024-FP-0047",
    title: "Floodplain Sector 7 — Household Relocation",
    shortTitle: "FP-0047 · Sector 7",
    date: "14 Nov 2024",
    modelVersion: "v3.8.2",
    recommendation: "Phased residential relocation (18-month window)",
    confidence: 78,
    riskLevel: "High",
    ethicsStatus: "Needs Review",
    humanStatus: "Pending",
    populationAffected: 3200,
    estimatedCost: "$42–58M",
    riskReduction: "67%",
    fairnessFlags: 3,
    openAppeals: 2,
    dataSourceCount: 8,
    avgDataReliability: 74,
    factors: [
      { label: "Flood Recurrence", weight: 0.88 },
      { label: "Infrastructure Weakness", weight: 0.74 },
      { label: "Social Vulnerability", weight: 0.69 },
      { label: "Rainfall Volatility", weight: 0.55 },
      { label: "Insurance Losses", weight: 0.48 },
    ],
    fairnessDimensions: [
      { name: "Representation", status: "warn", score: 61 },
      { name: "Outcome Fairness", status: "danger", score: 38 },
      { name: "Error Rate Parity", status: "warn", score: 57 },
      { name: "Policy Harm Risk", status: "danger", score: 29 },
    ],
    overrideApplied: true,
  },
  "ATL-2024-FP-0031": {
    id: "ATL-2024-FP-0031",
    title: "Coastal Zone C3 — Flood Barrier Assessment",
    shortTitle: "FP-0031 · Zone C3",
    date: "22 Oct 2024",
    modelVersion: "v3.7.0",
    recommendation: "Flood barrier investment — Zone C3 shoreline reinforcement",
    confidence: 64,
    riskLevel: "Medium",
    ethicsStatus: "Passed",
    humanStatus: "Approved",
    populationAffected: 1450,
    estimatedCost: "$18–24M",
    riskReduction: "48%",
    fairnessFlags: 1,
    openAppeals: 0,
    dataSourceCount: 6,
    avgDataReliability: 81,
    factors: [
      { label: "Storm Surge Probability", weight: 0.79 },
      { label: "Coastal Erosion Rate", weight: 0.66 },
      { label: "Infrastructure Weakness", weight: 0.54 },
      { label: "Property Value Exposure", weight: 0.43 },
      { label: "Ecosystem Buffer Loss", weight: 0.31 },
    ],
    fairnessDimensions: [
      { name: "Representation", status: "pass", score: 79 },
      { name: "Outcome Fairness", status: "pass", score: 72 },
      { name: "Error Rate Parity", status: "warn", score: 61 },
      { name: "Policy Harm Risk", status: "warn", score: 53 },
    ],
    overrideApplied: false,
  },
  "ATL-2024-DR-0019": {
    id: "ATL-2024-DR-0019",
    title: "Drought Zone 4 — Agricultural Water Allocation",
    shortTitle: "DR-0019 · Zone 4",
    date: "08 Oct 2024",
    modelVersion: "v3.7.0",
    recommendation: "Mandatory 35% reduction in irrigation allocation — Zone 4",
    confidence: 88,
    riskLevel: "High",
    ethicsStatus: "Escalated",
    humanStatus: "Overridden",
    populationAffected: 6800,
    estimatedCost: "$5–8M (enforcement)",
    riskReduction: "54%",
    fairnessFlags: 4,
    openAppeals: 3,
    dataSourceCount: 9,
    avgDataReliability: 79,
    factors: [
      { label: "Aquifer Depletion Rate", weight: 0.91 },
      { label: "Rainfall Deficit Index", weight: 0.83 },
      { label: "Agricultural Demand", weight: 0.71 },
      { label: "Livelihood Vulnerability", weight: 0.65 },
      { label: "Ecosystem Stress", weight: 0.44 },
    ],
    fairnessDimensions: [
      { name: "Representation", status: "warn", score: 55 },
      { name: "Outcome Fairness", status: "danger", score: 31 },
      { name: "Error Rate Parity", status: "warn", score: 49 },
      { name: "Policy Harm Risk", status: "danger", score: 24 },
    ],
    overrideApplied: true,
  },
};

const DECISION_LIST = Object.keys(DECISIONS);

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusColor(s: "pass" | "warn" | "danger") {
  return { pass: "text-status-pass", warn: "text-status-warn", danger: "text-status-danger" }[s];
}

function statusBg(s: "pass" | "warn" | "danger") {
  return {
    pass: "bg-status-pass/10 border-status-pass/30 text-status-pass",
    warn: "bg-status-warn/10 border-status-warn/30 text-status-warn",
    danger: "bg-status-danger/10 border-status-danger/30 text-status-danger",
  }[s];
}

function ethicsColor(s: Decision["ethicsStatus"]) {
  return {
    Passed: "text-status-pass",
    "Needs Review": "text-status-warn",
    Escalated: "text-accent",
    Flagged: "text-status-danger",
  }[s];
}

function humanStatusIcon(s: Decision["humanStatus"]) {
  if (s === "Approved") return <CheckCircle2 className="w-3.5 h-3.5 text-status-pass" />;
  if (s === "Rejected") return <XCircle className="w-3.5 h-3.5 text-status-danger" />;
  if (s === "Overridden") return <AlertTriangle className="w-3.5 h-3.5 text-status-warn" />;
  return <Clock className="w-3.5 h-3.5 text-muted-foreground" />;
}

function DeltaChip({ a, b, unit = "" }: { a: number; b: number; unit?: string }) {
  const delta = a - b;
  if (Math.abs(delta) < 0.5) return <span className="text-xs font-mono text-muted-foreground">—</span>;
  return (
    <span className={`text-xs font-mono font-semibold flex items-center gap-0.5 ${delta > 0 ? "text-status-warn" : "text-status-pass"}`}>
      {delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {delta > 0 ? "+" : ""}
      {delta.toFixed(delta % 1 === 0 ? 0 : 1)}{unit}
    </span>
  );
}

function VersionDropdown({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const d = DECISIONS[value];
  return (
    <div className="relative flex-1">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-1 w-full flex items-center justify-between gap-2 border border-border rounded bg-surface px-3 py-2 text-xs font-mono font-semibold text-foreground hover:border-accent/50 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex flex-col items-start min-w-0">
          <span className="truncate">{value}</span>
          <span className="text-[10px] font-sans font-normal text-muted-foreground truncate">{d.shortTitle}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 w-full mt-1 z-20 border border-border bg-card rounded shadow-lg overflow-hidden">
          {DECISION_LIST.map((id) => (
            <button
              key={id}
              role="option"
              aria-selected={id === value}
              onClick={() => { onChange(id); setOpen(false); }}
              className={`w-full text-left px-3 py-2.5 text-xs hover:bg-surface transition-colors flex flex-col gap-0.5 ${id === value ? "text-accent font-semibold" : "text-foreground"}`}
            >
              <span className="font-mono">{id}</span>
              <span className="text-muted-foreground font-normal">{DECISIONS[id].shortTitle}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DecisionComparison() {
  const [decisionA, setDecisionA] = useState("ATL-2024-FP-0047");
  const [decisionB, setDecisionB] = useState("ATL-2024-FP-0031");

  const dA = DECISIONS[decisionA];
  const dB = DECISIONS[decisionB];
  const isSame = decisionA === decisionB;

  const confDelta = dA.confidence - dB.confidence;

  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded bg-surface flex items-center justify-center border border-border flex-shrink-0">
          <Columns className="w-4 h-4 text-accent" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Decision Comparison</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Compare two Atlas decisions side-by-side across confidence, evidence quality, and fairness outcomes.
          </p>
        </div>
      </div>

      {/* Selectors */}
      <div className="flex gap-3 flex-wrap sm:flex-nowrap">
        <VersionDropdown label="Decision A" value={decisionA} onChange={setDecisionA} />
        <div className="flex items-center justify-center px-2 pt-5">
          <Minus className="w-4 h-4 text-muted-foreground" aria-hidden />
        </div>
        <VersionDropdown label="Decision B" value={decisionB} onChange={setDecisionB} />
      </div>

      {isSame && (
        <div className="rounded border border-border bg-surface/50 px-3 py-2 text-xs text-muted-foreground">
          Select two different decisions to see the comparison.
        </div>
      )}

      {!isSame && (
        <motion.div
          key={`${decisionA}-${decisionB}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="flex flex-col gap-4"
        >
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            {([{ d: dA, id: decisionA }, { d: dB, id: decisionB }] as const).map(({ d, id }) => (
              <div key={id} className="rounded border border-border bg-surface p-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground">{id}</span>
                  <span className="text-[10px] text-muted-foreground">{d.date} · {d.modelVersion}</span>
                </div>
                <p className="text-xs font-medium text-foreground leading-snug">{d.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{d.recommendation}</p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { label: "Confidence", value: `${d.confidence}%` },
                    { label: "Risk", value: d.riskLevel },
                    { label: "Population", value: d.populationAffected.toLocaleString() },
                    { label: "Cost", value: d.estimatedCost },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wide block">{label}</span>
                      <span className="text-xs font-semibold font-mono text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-border">
                  <span className={`text-xs font-medium ${ethicsColor(d.ethicsStatus)}`}>{d.ethicsStatus}</span>
                  <span className="text-muted-foreground text-[10px]">·</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {humanStatusIcon(d.humanStatus)}{d.humanStatus}
                  </span>
                  {d.overrideApplied && (
                    <span className="ml-auto text-[10px] text-status-warn border border-status-warn/30 bg-status-warn/10 px-1.5 py-0.5 rounded">Override</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Confidence delta */}
          <div className={`flex items-center justify-between rounded border px-4 py-3 ${
            Math.abs(confDelta) >= 8 ? "border-status-warn/30 bg-status-warn/5" : "border-border bg-surface/50"
          }`}>
            <div className="flex items-center gap-2">
              {confDelta !== 0
                ? (confDelta > 0 ? <TrendingUp className="w-4 h-4 text-status-warn" /> : <TrendingDown className="w-4 h-4 text-status-pass" />)
                : <Minus className="w-4 h-4 text-muted-foreground" />}
              <span className="text-xs font-medium text-foreground">Confidence gap (A vs B)</span>
            </div>
            <span className={`text-xl font-mono font-bold ${confDelta > 0 ? "text-status-warn" : confDelta < 0 ? "text-status-pass" : "text-muted-foreground"}`}>
              {confDelta > 0 ? "+" : ""}{confDelta} pts
            </span>
          </div>

          {/* Evidence quality comparison */}
          <div className="rounded border border-border bg-surface/50 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-surface">
              <span className="text-xs font-semibold text-foreground">Evidence Quality</span>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border text-center py-3">
              {[
                { label: "Data Sources", a: dA.dataSourceCount, b: dB.dataSourceCount, fmt: (v: number) => v.toString() },
                { label: "Avg Reliability", a: dA.avgDataReliability, b: dB.avgDataReliability, fmt: (v: number) => `${v}%` },
                { label: "Risk Reduction", a: parseInt(dA.riskReduction), b: parseInt(dB.riskReduction), fmt: (v: number) => `${v}%` },
              ].map(({ label, a, b, fmt }) => (
                <div key={label} className="flex flex-col items-center gap-1 px-3">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-foreground">{fmt(a)}</span>
                    <DeltaChip a={a} b={b} />
                    <span className="text-sm font-mono font-bold text-muted-foreground">{fmt(b)}</span>
                  </div>
                  <div className="flex gap-2 text-[9px] text-muted-foreground">
                    <span>A</span><span>·</span><span>B</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Factor weight comparison */}
          <div className="rounded border border-border bg-surface/50 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-surface">
              <span className="text-xs font-semibold text-foreground">Top Factor Weights</span>
            </div>
            <div className="divide-y divide-border">
              {dA.factors.map((fA, i) => {
                const fB = dB.factors[i];
                if (!fB) return null;
                return (
                  <div key={i} className="px-4 py-2 grid grid-cols-[1fr_80px_1fr] items-center gap-2">
                    {/* A */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${fA.weight * 100}%` }}
                          transition={{ duration: 0.4 }}
                          className="h-full bg-accent rounded-full"
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-8 text-right shrink-0">{fA.weight.toFixed(2)}</span>
                    </div>
                    {/* Label */}
                    <div className="text-center">
                      <span className="text-[10px] text-muted-foreground leading-tight">{fA.label}</span>
                    </div>
                    {/* B */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground w-8 shrink-0">{fB.weight.toFixed(2)}</span>
                      <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${fB.weight * 100}%` }}
                          transition={{ duration: 0.4 }}
                          className="h-full bg-muted-foreground/40 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-2 border-t border-border bg-surface flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>← Decision A</span><span>Decision B →</span>
            </div>
          </div>

          {/* Fairness comparison */}
          <div className="rounded border border-border bg-surface/50 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-surface flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Fairness Outcomes</span>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>A: <span className="text-status-danger font-semibold">{dA.fairnessFlags} flag{dA.fairnessFlags !== 1 ? "s" : ""}</span></span>
                <span>B: <span className={`font-semibold ${dB.fairnessFlags > 0 ? "text-status-warn" : "text-status-pass"}`}>{dB.fairnessFlags} flag{dB.fairnessFlags !== 1 ? "s" : ""}</span></span>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-border bg-surface/80">
              <div className="px-4 py-2 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">A — {dA.id}</div>
              <div className="px-4 py-2 text-[10px] text-muted-foreground uppercase tracking-wider font-medium text-center">Dimension</div>
              <div className="px-4 py-2 text-[10px] text-muted-foreground uppercase tracking-wider font-medium text-right">B — {dB.id}</div>
            </div>
            <div className="divide-y divide-border">
              {dA.fairnessDimensions.map((fA, i) => {
                const fB = dB.fairnessDimensions[i];
                if (!fB) return null;
                const changed = fA.status !== fB.status;
                return (
                  <div key={fA.name} className={`grid grid-cols-[1fr_1fr_1fr] items-center py-2 ${changed ? "bg-status-warn/5" : ""}`}>
                    <div className="px-4 flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold ${statusColor(fA.status)}`}>{fA.score}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${statusBg(fA.status)}`}>{fA.status}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground">{fA.name}</span>
                      {changed && (
                        <div className="flex items-center justify-center gap-0.5 mt-0.5">
                          <AlertTriangle className="w-3 h-3 text-status-warn" aria-hidden />
                          <span className="text-[10px] text-status-warn">differs</span>
                        </div>
                      )}
                    </div>
                    <div className="px-4 flex items-center justify-end gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${statusBg(fB.status)}`}>{fB.status}</span>
                      <span className={`text-xs font-mono font-bold ${statusColor(fB.status)}`}>{fB.score}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Appeals & override comparison */}
          <div className="grid grid-cols-2 gap-3">
            {([{ d: dA, id: decisionA }, { d: dB, id: decisionB }] as const).map(({ d, id }) => (
              <div key={id} className="rounded border border-border bg-surface/50 p-3 flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{id}</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Open appeals</span>
                  <span className={`font-mono font-semibold ${d.openAppeals > 0 ? "text-status-warn" : "text-status-pass"}`}>{d.openAppeals}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Human override</span>
                  <span className={`font-mono font-semibold ${d.overrideApplied ? "text-status-warn" : "text-muted-foreground"}`}>
                    {d.overrideApplied ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Ethics status</span>
                  <span className={`font-mono font-semibold ${ethicsColor(d.ethicsStatus)}`}>{d.ethicsStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
