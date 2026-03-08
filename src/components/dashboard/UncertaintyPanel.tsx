import { AlertTriangle, HelpCircle } from "lucide-react";
import { uncertaintyData } from "@/data/mockData";
import { motion } from "framer-motion";

function RobustnessChip({ r }: { r: typeof uncertaintyData.robustness }) {
  return (
    <span className={`text-xs font-mono px-2.5 py-1 rounded ${
      r === "Stable" ? "badge-pass" : r === "Fragile" ? "badge-danger" : "badge-warn"
    }`}>{r}</span>
  );
}

function ConfidenceGauge({ value, low, high }: { value: number; low: number; high: number }) {
  const r = 52;
  const circ = Math.PI * r; // semicircle
  const valueDash = (value / 100) * circ;
  const color = value >= 75 ? "hsl(160 58% 40%)" : value >= 55 ? "hsl(38 90% 52%)" : "hsl(0 72% 52%)";

  return (
    <div className="relative flex flex-col items-center">
      <svg width="130" height="70" viewBox="0 0 130 70">
        {/* Track */}
        <path d="M 10 65 A 55 55 0 0 1 120 65" fill="none" stroke="hsl(220 14% 18%)" strokeWidth="8" strokeLinecap="round"/>
        {/* Fill */}
        <path
          d="M 10 65 A 55 55 0 0 1 120 65"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${valueDash * 1.06} ${circ * 1.1}`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        <text x="65" y="60" textAnchor="middle" fill="hsl(210 20% 92%)" fontSize="20" fontWeight="700" fontFamily="IBM Plex Mono">
          {value}%
        </text>
      </svg>
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono -mt-1">
        <span>{low}%</span>
        <span className="text-border-strong">uncertainty band</span>
        <span>{high}%</span>
      </div>
    </div>
  );
}

export function UncertaintyPanel() {
  const d = uncertaintyData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-surface border border-border rounded-lg shadow-card flex flex-col"
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Uncertainty & Confidence Analysis</h2>
          <p className="text-xs text-muted-foreground mt-0.5">How sure is the system, and where does it break down?</p>
        </div>
        <HelpCircle className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>

      <div className="p-4 flex flex-col gap-5">
        {/* Gauge row */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <ConfidenceGauge value={d.confidence} low={d.uncertaintyBand.low} high={d.uncertaintyBand.high} />

          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Recommendation robustness</span>
              <RobustnessChip r={d.robustness} />
            </div>
            <p className="text-xs text-foreground leading-relaxed">{d.robustnessNote}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Data sufficiency</span>
              <div className="flex items-center gap-2 w-32">
                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-status-warn"
                    initial={{ width: 0 }}
                    animate={{ width: `${d.dataSufficiency}%` }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                  />
                </div>
                <span className="font-mono text-muted-foreground">{d.dataSufficiency}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sensitivity tornado */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Sensitivity — what drives uncertainty most?</p>
          <div className="flex flex-col gap-1.5">
            {d.sensitivityFactors.map((sf, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-foreground w-48 truncate">{sf.factor}</span>
                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${sf.impact > 0.65 ? "bg-status-danger" : sf.impact > 0.4 ? "bg-status-warn" : "bg-status-info"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${sf.impact * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.07 }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-8 text-right">{(sf.impact * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scenario comparison */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Scenario sensitivity</p>
          <div className="flex flex-col gap-1.5">
            {d.scenarios.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs ${i === 0 ? "bg-primary-muted border border-primary/30" : "bg-muted"}`}>
                <span className={`font-mono font-semibold w-9 ${s.confidence >= 75 ? "text-status-pass" : s.confidence >= 55 ? "text-status-warn" : "text-status-danger"}`}>
                  {s.confidence}%
                </span>
                <span className="text-muted-foreground flex-1 truncate">{s.label}</span>
                <span className={`text-right truncate ${i === 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s.recommendation}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Counterfactual */}
        <div className="bg-status-info-bg border border-status-info/30 rounded-md p-3">
          <p className="text-xs font-semibold text-status-info mb-1.5">Counterfactual View</p>
          <p className="text-xs text-foreground leading-relaxed">{d.counterfactual}</p>
        </div>
      </div>
    </motion.div>
  );
}
