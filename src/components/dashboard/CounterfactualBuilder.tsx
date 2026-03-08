import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";

interface ScenarioInput {
  id: string;
  label: string;
  description: string;
  unit: string;
  min: number;
  max: number;
  baseline: number;
  value: number;
  influenceWeight: number; // how much this input moves confidence
  direction: "positive" | "negative"; // positive = higher value → more confidence in relocation
}

const BASELINE_CONFIDENCE = 78;
const BASELINE_RECOMMENDATION = "Phased residential relocation (18-month window)";

const DEFAULT_INPUTS: ScenarioInput[] = [
  {
    id: "rainfall",
    label: "Rainfall Intensity Forecast",
    description: "Projected increase in peak rainfall events",
    unit: "%",
    min: -30,
    max: 60,
    baseline: 0,
    value: 0,
    influenceWeight: 0.82,
    direction: "positive",
  },
  {
    id: "drainage",
    label: "Drainage Resilience Improvement",
    description: "Increase in drainage system capacity vs. current baseline",
    unit: "%",
    min: 0,
    max: 60,
    baseline: 0,
    value: 0,
    influenceWeight: 0.74,
    direction: "negative",
  },
  {
    id: "soil_saturation",
    label: "Soil Saturation Index",
    description: "Ground saturation level affecting flood absorption",
    unit: "%",
    min: -40,
    max: 40,
    baseline: 0,
    value: 0,
    influenceWeight: 0.33,
    direction: "positive",
  },
  {
    id: "social_vulnerability",
    label: "Social Vulnerability Score",
    description: "Composite index of household vulnerability (elderly, disability, income)",
    unit: "%",
    min: -30,
    max: 30,
    baseline: 0,
    value: 0,
    influenceWeight: 0.69,
    direction: "positive",
  },
  {
    id: "infrastructure",
    label: "Infrastructure Condition",
    description: "Structural improvement to roads and drainage networks",
    unit: "%",
    min: 0,
    max: 50,
    baseline: 0,
    value: 0,
    influenceWeight: 0.74,
    direction: "negative",
  },
  {
    id: "flood_recurrence",
    label: "Flood Recurrence Probability",
    description: "Annual probability of a major flood event",
    unit: "%",
    min: -50,
    max: 50,
    baseline: 0,
    value: 0,
    influenceWeight: 0.88,
    direction: "positive",
  },
  {
    id: "insurance_loss",
    label: "Insurance Loss Projection",
    description: "Change in projected 10-year cumulative losses",
    unit: "%",
    min: -50,
    max: 50,
    baseline: 0,
    value: 0,
    influenceWeight: 0.48,
    direction: "positive",
  },
];

function deriveOutcome(confidence: number): {
  recommendation: string;
  label: string;
  color: "danger" | "warn" | "pass";
  icon: React.ReactNode;
} {
  if (confidence >= 75) {
    return {
      recommendation: "Full phased residential relocation",
      label: "Relocation recommended",
      color: "danger",
      icon: <TrendingUp className="w-3.5 h-3.5" />,
    };
  } else if (confidence >= 55) {
    return {
      recommendation: "Partial relocation + drainage reinforcement",
      label: "Hybrid approach",
      color: "warn",
      icon: <Minus className="w-3.5 h-3.5" />,
    };
  } else if (confidence >= 40) {
    return {
      recommendation: "Drainage reinforcement — relocation deferred",
      label: "Drainage primary",
      color: "warn",
      icon: <TrendingDown className="w-3.5 h-3.5" />,
    };
  } else {
    return {
      recommendation: "Voluntary relocation + monitoring — no forced displacement",
      label: "Monitoring only",
      color: "pass",
      icon: <TrendingDown className="w-3.5 h-3.5" />,
    };
  }
}

function formatDelta(delta: number): string {
  if (delta === 0) return "—";
  return delta > 0 ? `+${delta.toFixed(1)}` : `${delta.toFixed(1)}`;
}

function ConfidenceArc({ confidence, baseline }: { confidence: number; baseline: number }) {
  const r = 44;
  const cx = 56;
  const cy = 56;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcPath = (pct: number) => {
    const angle = startAngle + totalAngle * pct;
    const x = cx + r * Math.cos(toRad(angle));
    const y = cy + r * Math.sin(toRad(angle));
    const large = totalAngle * pct > 180 ? 1 : 0;
    const sx = cx + r * Math.cos(toRad(startAngle));
    const sy = cy + r * Math.sin(toRad(startAngle));
    return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${x} ${y}`;
  };

  const pct = confidence / 100;
  const basePct = baseline / 100;
  const delta = confidence - baseline;

  const trackColor = "hsl(var(--surface))";
  const fillColor =
    confidence >= 70
      ? "hsl(var(--status-warn))"
      : confidence >= 50
      ? "hsl(var(--muted-foreground))"
      : "hsl(var(--status-pass))";

  return (
    <div className="flex flex-col items-center">
      <svg width="112" height="80" viewBox="0 0 112 112">
        {/* Track */}
        <path d={arcPath(1)} fill="none" stroke={trackColor} strokeWidth="8" strokeLinecap="round" />
        {/* Baseline ghost */}
        {delta !== 0 && (
          <path
            d={arcPath(basePct)}
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="3 3"
            opacity={0.4}
          />
        )}
        {/* Fill */}
        <path d={arcPath(pct)} fill="none" stroke={fillColor} strokeWidth="8" strokeLinecap="round" />
        {/* Score */}
        <text x={cx} y={cy + 4} textAnchor="middle" fill="hsl(var(--foreground))" fontSize="18" fontWeight="bold" fontFamily="monospace">
          {confidence}%
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="8" fontFamily="monospace">
          CONFIDENCE
        </text>
      </svg>
      {delta !== 0 && (
        <span
          className={`text-xs font-mono font-semibold ${delta > 0 ? "text-status-danger" : "text-status-pass"}`}
        >
          {formatDelta(delta)} pts vs baseline
        </span>
      )}
    </div>
  );
}

export function CounterfactualBuilder() {
  const [inputs, setInputs] = useState<ScenarioInput[]>(DEFAULT_INPUTS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCounterfactual, setShowCounterfactual] = useState(false);

  const confidenceResult = useMemo(() => {
    let delta = 0;
    for (const inp of inputs) {
      const change = inp.value - inp.baseline;
      const normalised = change / (inp.max - inp.min) * 2; // -1 to +1
      const contribution = normalised * inp.influenceWeight * 18; // max swing ~18 pts per factor
      delta += inp.direction === "positive" ? contribution : -contribution;
    }
    const raw = Math.round(BASELINE_CONFIDENCE + delta);
    return Math.min(99, Math.max(12, raw));
  }, [inputs]);

  const outcome = deriveOutcome(confidenceResult);
  const confidenceDelta = confidenceResult - BASELINE_CONFIDENCE;
  const isModified = inputs.some((i) => i.value !== i.baseline);

  // Threshold at which relocation is no longer primary
  const counterfactualThreshold = inputs.find(
    (i) => i.id === "drainage" && i.value >= 28
  );

  function updateInput(id: string, val: number) {
    setInputs((prev) => prev.map((i) => (i.id === id ? { ...i, value: val } : i)));
  }

  function reset() {
    setInputs(DEFAULT_INPUTS);
  }

  const colorMap = {
    danger: "text-status-danger",
    warn: "text-status-warn",
    pass: "text-status-pass",
  };

  const badgeMap = {
    danger: "border-status-danger/30 text-status-danger bg-status-danger/10",
    warn: "border-status-warn/30 text-status-warn bg-status-warn/10",
    pass: "border-status-pass/30 text-status-pass bg-status-pass/10",
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-surface flex items-center justify-center border border-border flex-shrink-0">
            <FlaskConical className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Counterfactual Scenario Builder</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Adjust input assumptions to see how the recommendation changes in real time.
            </p>
          </div>
        </div>
        {isModified && (
          <Button variant="ghost" size="sm" onClick={reset} className="text-xs text-muted-foreground gap-1.5 shrink-0">
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-5">
        {/* Left: sliders */}
        <div className="flex flex-col gap-3">
          {inputs.map((inp) => {
            const change = inp.value - inp.baseline;
            const isExpanded = expandedId === inp.id;
            const hasChange = change !== 0;

            return (
              <div
                key={inp.id}
                className={`rounded border transition-colors ${
                  hasChange ? "border-accent/40 bg-accent/5" : "border-border bg-surface/40"
                } p-3`}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-foreground truncate">{inp.label}</span>
                    {hasChange && (
                      <span
                        className={`text-xs font-mono font-bold shrink-0 ${
                          (inp.direction === "positive" && change > 0) ||
                          (inp.direction === "negative" && change < 0)
                            ? "text-status-warn"
                            : "text-status-pass"
                        }`}
                      >
                        {change > 0 ? "+" : ""}
                        {change}
                        {inp.unit}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : inp.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    aria-label="toggle description"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="text-xs text-muted-foreground mb-2 overflow-hidden"
                    >
                      {inp.description}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-8 text-right shrink-0">
                    {inp.min}{inp.unit}
                  </span>
                  <Slider
                    min={inp.min}
                    max={inp.max}
                    step={1}
                    value={[inp.value]}
                    onValueChange={([v]) => updateInput(inp.id, v)}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono text-muted-foreground w-8 shrink-0">
                    +{inp.max}{inp.unit}
                  </span>
                  <span className="text-xs font-mono font-semibold text-foreground w-14 text-right shrink-0">
                    {inp.value >= 0 ? "+" : ""}{inp.value}{inp.unit}
                  </span>
                </div>

                {/* Influence weight bar */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground shrink-0">Influence weight</span>
                  <div className="flex-1 h-1 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent/60 rounded-full transition-all"
                      style={{ width: `${inp.influenceWeight * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">{Math.round(inp.influenceWeight * 100)}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: live result */}
        <div className="flex flex-col gap-3">
          <div className="rounded border border-border bg-surface p-4 flex flex-col items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Scenario Result</span>

            <ConfidenceArc confidence={confidenceResult} baseline={BASELINE_CONFIDENCE} />

            <div className={`text-center ${colorMap[outcome.color]}`}>
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold mb-1">
                {outcome.icon}
                <span>{outcome.label}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{outcome.recommendation}</p>
            </div>

            <div className={`w-full rounded border text-xs px-3 py-2 ${badgeMap[outcome.color]}`}>
              <span className="font-mono">Confidence delta: </span>
              <span className="font-bold font-mono">{formatDelta(confidenceDelta)} pts</span>
            </div>
          </div>

          {/* Baseline comparison */}
          <div className="rounded border border-border bg-surface/60 p-3 flex flex-col gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Baseline (unmodified)</span>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Confidence</span>
              <span className="text-xs font-mono font-semibold text-foreground">{BASELINE_CONFIDENCE}%</span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs text-muted-foreground shrink-0">Recommendation</span>
              <span className="text-xs text-muted-foreground text-right leading-relaxed">{BASELINE_RECOMMENDATION}</span>
            </div>
          </div>

          {/* Counterfactual condition */}
          <button
            onClick={() => setShowCounterfactual((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors text-left"
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>What would reverse the recommendation?</span>
            {showCounterfactual ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <AnimatePresence>
            {showCounterfactual && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="rounded border border-accent/20 bg-accent/5 p-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    If <span className="text-foreground font-medium">drainage resilience improves by ≥30%</span> AND{" "}
                    <span className="text-foreground font-medium">rainfall stays within historical bounds</span>, relocation
                    would no longer be the primary recommendation. Drainage reinforcement would suffice for Zones 7A and 7C.
                  </p>
                  {counterfactualThreshold ? (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-status-pass">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Counterfactual conditions partially met in current scenario</span>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Conditions not yet met — try raising drainage resilience</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active changes summary */}
          {isModified && (
            <div className="rounded border border-border bg-surface/40 p-3 flex flex-col gap-1.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Active Changes</span>
              {inputs
                .filter((i) => i.value !== i.baseline)
                .map((i) => (
                  <div key={i.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate">{i.label}</span>
                    <span
                      className={`font-mono font-semibold shrink-0 ml-2 ${
                        (i.direction === "positive" && i.value > i.baseline) ||
                        (i.direction === "negative" && i.value < i.baseline)
                          ? "text-status-warn"
                          : "text-status-pass"
                      }`}
                    >
                      {i.value > i.baseline ? "+" : ""}
                      {i.value - i.baseline}
                      {i.unit}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
