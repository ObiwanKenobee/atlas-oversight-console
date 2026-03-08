import { useState } from "react";
import { motion } from "framer-motion";
import { GitCompare, ChevronDown, TrendingUp, TrendingDown, Minus, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { modelVersionHistory } from "@/data/mockData";

// Extended version data for comparison
const VERSION_DATA: Record<
  string,
  {
    confidence: number;
    recommendation: string;
    factors: { label: string; weight: number }[];
    fairness: { dimension: string; status: "pass" | "warn" | "danger"; score: number }[];
    trainingDate: string;
    retrainReason: string;
    dataSources: number;
    patchNotes: string[];
  }
> = {
  "v3.8.2": {
    confidence: 78,
    recommendation: "Full phased residential relocation (18-month window)",
    factors: [
      { label: "Flood Recurrence", weight: 0.88 },
      { label: "Infrastructure Weakness", weight: 0.74 },
      { label: "Social Vulnerability", weight: 0.69 },
      { label: "Rainfall Volatility", weight: 0.55 },
      { label: "Insurance Losses", weight: 0.48 },
      { label: "Soil Saturation", weight: 0.33 },
    ],
    fairness: [
      { dimension: "Representation", status: "warn", score: 61 },
      { dimension: "Outcome Fairness", status: "danger", score: 38 },
      { dimension: "Error Rate Parity", status: "warn", score: 57 },
      { dimension: "Policy Harm Risk", status: "danger", score: 29 },
    ],
    trainingDate: "2024-10-28",
    retrainReason: "Fairness patch for income disparity weighting",
    dataSources: 8,
    patchNotes: [
      "Fairness patch: income disparity weight normalisation",
      "Drainage data staleness penalty added",
      "Minor threshold adjustments",
    ],
  },
  "v3.7.0": {
    confidence: 83,
    recommendation: "Immediate residential relocation — full displacement",
    factors: [
      { label: "Flood Recurrence", weight: 0.91 },
      { label: "Infrastructure Weakness", weight: 0.79 },
      { label: "Social Vulnerability", weight: 0.55 },
      { label: "Rainfall Volatility", weight: 0.61 },
      { label: "Insurance Losses", weight: 0.52 },
      { label: "Soil Saturation", weight: 0.41 },
    ],
    fairness: [
      { dimension: "Representation", status: "warn", score: 59 },
      { dimension: "Outcome Fairness", status: "danger", score: 22 },
      { dimension: "Error Rate Parity", status: "danger", score: 41 },
      { dimension: "Policy Harm Risk", status: "danger", score: 18 },
    ],
    trainingDate: "2024-08-15",
    retrainReason: "Climate scenario ensemble expanded",
    dataSources: 7,
    patchNotes: [
      "Climate scenario ensemble expanded to 12 models",
      "Social vulnerability composite rebuilt",
    ],
  },
  "v3.6.1": {
    confidence: 71,
    recommendation: "Phased relocation — medium urgency",
    factors: [
      { label: "Flood Recurrence", weight: 0.84 },
      { label: "Infrastructure Weakness", weight: 0.68 },
      { label: "Social Vulnerability", weight: 0.48 },
      { label: "Rainfall Volatility", weight: 0.44 },
      { label: "Insurance Losses", weight: 0.39 },
      { label: "Soil Saturation", weight: 0.29 },
    ],
    fairness: [
      { dimension: "Representation", status: "pass", score: 74 },
      { dimension: "Outcome Fairness", status: "warn", score: 51 },
      { dimension: "Error Rate Parity", status: "warn", score: 53 },
      { dimension: "Policy Harm Risk", status: "warn", score: 44 },
    ],
    trainingDate: "2024-06-02",
    retrainReason: "Infrastructure index recalibration",
    dataSources: 7,
    patchNotes: [
      "Infrastructure weakness index recalibrated",
      "Bug fix: coverage completeness score overflow",
    ],
  },
};

const VERSIONS = Object.keys(VERSION_DATA);

function statusColor(s: "pass" | "warn" | "danger") {
  return {
    pass: "text-status-pass",
    warn: "text-status-warn",
    danger: "text-status-danger",
  }[s];
}

function statusBg(s: "pass" | "warn" | "danger") {
  return {
    pass: "bg-status-pass/10 border-status-pass/30 text-status-pass",
    warn: "bg-status-warn/10 border-status-warn/30 text-status-warn",
    danger: "bg-status-danger/10 border-status-danger/30 text-status-danger",
  }[s];
}

function DeltaIcon({ delta }: { delta: number }) {
  if (delta > 0.01) return <TrendingUp className="w-3 h-3 text-status-warn" />;
  if (delta < -0.01) return <TrendingDown className="w-3 h-3 text-status-pass" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
}

function FactorBar({ weight, color }: { weight: number; color: string }) {
  return (
    <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${weight * 100}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

export function ModelVersionComparison() {
  const [versionA, setVersionA] = useState("v3.8.2");
  const [versionB, setVersionB] = useState("v3.7.0");
  const [openA, setOpenA] = useState(false);
  const [openB, setOpenB] = useState(false);

  const dataA = VERSION_DATA[versionA];
  const dataB = VERSION_DATA[versionB];

  const confDelta = dataA.confidence - dataB.confidence;
  const isSameVersion = versionA === versionB;

  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded bg-surface flex items-center justify-center border border-border flex-shrink-0">
          <GitCompare className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Model Version Comparison</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Compare confidence, factor weights, and fairness metrics between two Atlas versions.
          </p>
        </div>
      </div>

      {/* Version selectors */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Version A (Base)", version: versionA, setVersion: setVersionA, open: openA, setOpen: setOpenA },
          { label: "Version B (Compare)", version: versionB, setVersion: setVersionB, open: openB, setOpen: setOpenB },
        ].map(({ label, version, setVersion, open, setOpen }) => (
          <div key={label} className="relative">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
            <button
              onClick={() => setOpen(!open)}
              className="mt-1 w-full flex items-center justify-between gap-2 border border-border rounded bg-surface px-3 py-2 text-sm font-mono font-semibold text-foreground hover:border-accent/50 transition-colors"
            >
              {version}
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <div className="absolute top-full left-0 w-full mt-1 z-20 border border-border bg-card rounded shadow-lg overflow-hidden">
                {VERSIONS.map((v) => (
                  <button
                    key={v}
                    onClick={() => { setVersion(v); setOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-mono hover:bg-surface transition-colors ${v === version ? "text-accent font-semibold" : "text-foreground"}`}
                  >
                    {v}
                    <span className="ml-2 text-muted-foreground font-sans font-normal">
                      {VERSION_DATA[v].trainingDate}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {isSameVersion && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-surface rounded border border-border px-3 py-2">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Select two different versions to see the diff.</span>
        </div>
      )}

      {!isSameVersion && (
        <div className="flex flex-col gap-4">
          {/* Confidence comparison */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { v: versionA, d: dataA, side: "A" },
              { v: versionB, d: dataB, side: "B" },
            ].map(({ v, d, side }) => (
              <div key={v} className="rounded border border-border bg-surface p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{v}</span>
                  <span className="text-xs text-muted-foreground">{d.trainingDate}</span>
                </div>
                <div className="text-3xl font-bold font-mono text-foreground">{d.confidence}%</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{d.recommendation}</p>
                <div className="pt-1 border-t border-border">
                  <p className="text-[10px] text-muted-foreground">{d.retrainReason}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Confidence delta */}
          <div className={`flex items-center justify-between rounded border px-4 py-3 ${
            Math.abs(confDelta) >= 5 ? "border-status-warn/30 bg-status-warn/5" : "border-border bg-surface/50"
          }`}>
            <div className="flex items-center gap-2">
              {confDelta > 0 ? (
                <TrendingDown className="w-4 h-4 text-status-pass" />
              ) : confDelta < 0 ? (
                <TrendingUp className="w-4 h-4 text-status-danger" />
              ) : (
                <Minus className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-xs font-medium text-foreground">Confidence drift ({versionA} vs {versionB})</span>
            </div>
            <span className={`text-base font-mono font-bold ${confDelta > 0 ? "text-status-pass" : confDelta < 0 ? "text-status-danger" : "text-muted-foreground"}`}>
              {confDelta > 0 ? "−" : confDelta < 0 ? "+" : "±"}{Math.abs(confDelta)} pts
            </span>
          </div>

          {/* Factor weight diff */}
          <div className="rounded border border-border bg-surface/50 overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-surface">
              <span className="text-xs font-medium text-foreground">Factor Weight Drift</span>
            </div>
            <div className="divide-y divide-border">
              {dataA.factors.map((fA, i) => {
                const fB = dataB.factors[i];
                const delta = fA.weight - fB.weight;
                return (
                  <div key={fA.label} className="px-4 py-2.5 flex items-center gap-3">
                    <span className="text-xs text-foreground w-36 shrink-0">{fA.label}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <FactorBar weight={fA.weight} color="bg-accent" />
                      <span className="text-xs font-mono text-muted-foreground w-8 text-right">{fA.weight.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 w-16 justify-center">
                      <DeltaIcon delta={delta} />
                      <span className={`text-xs font-mono font-semibold ${delta > 0.01 ? "text-status-warn" : delta < -0.01 ? "text-status-pass" : "text-muted-foreground"}`}>
                        {delta > 0 ? "+" : ""}{delta.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground w-8">{fB.weight.toFixed(2)}</span>
                      <FactorBar weight={fB.weight} color="bg-muted-foreground/40" />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-2 border-t border-border bg-surface flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>← {versionA} weights</span>
              <span>delta</span>
              <span>{versionB} weights →</span>
            </div>
          </div>

          {/* Fairness comparison */}
          <div className="rounded border border-border bg-surface/50 overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-surface flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Fairness Dimension Comparison</span>
              {dataA.fairness.some((f, i) => f.status !== dataB.fairness[i]?.status) && (
                <div className="flex items-center gap-1.5 text-xs text-status-warn">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Status changes detected</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-border bg-surface/80">
              <div className="px-4 py-2 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{versionA}</div>
              <div className="px-4 py-2 text-[10px] text-muted-foreground uppercase tracking-wider font-medium text-center">Dimension</div>
              <div className="px-4 py-2 text-[10px] text-muted-foreground uppercase tracking-wider font-medium text-right">{versionB}</div>
            </div>
            <div className="divide-y divide-border">
              {dataA.fairness.map((fA, i) => {
                const fB = dataB.fairness[i];
                const changed = fA.status !== fB.status;
                const scoreDelta = fA.score - fB.score;
                return (
                  <div key={fA.dimension} className={`grid grid-cols-[1fr_1fr_1fr] items-center py-2 ${changed ? "bg-status-warn/5" : ""}`}>
                    <div className="px-4 flex items-center gap-2">
                      <span className={`text-xs font-mono font-semibold ${statusColor(fA.status)}`}>{fA.score}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${statusBg(fA.status)}`}>{fA.status}</span>
                    </div>
                    <div className="px-2 text-center">
                      <span className="text-xs text-muted-foreground">{fA.dimension}</span>
                      {changed && (
                        <div className="flex items-center justify-center gap-0.5 mt-0.5">
                          <AlertTriangle className="w-3 h-3 text-status-warn" />
                          <span className="text-[10px] text-status-warn">changed</span>
                        </div>
                      )}
                    </div>
                    <div className="px-4 flex items-center justify-end gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${statusBg(fB.status)}`}>{fB.status}</span>
                      <span className={`text-xs font-mono font-semibold ${statusColor(fB.status)}`}>{fB.score}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Patch notes */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { v: versionA, d: dataA },
              { v: versionB, d: dataB },
            ].map(({ v, d }) => (
              <div key={v} className="rounded border border-border bg-surface/50 p-3 flex flex-col gap-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{v} Patch Notes</span>
                {d.patchNotes.map((note, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="text-accent mt-0.5 shrink-0">·</span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
