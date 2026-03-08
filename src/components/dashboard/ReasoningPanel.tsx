import { useState } from "react";
import { ChevronDown, ChevronRight, Info, AlertTriangle } from "lucide-react";
import { reasoningFactors } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";

type Factor = (typeof reasoningFactors)[0];

function InfluenceBadge({ dir }: { dir: Factor["direction"] }) {
  const map = {
    "strong-positive": { label: "Strong ↑", cls: "badge-danger" },
    "medium-positive": { label: "Medium ↑", cls: "badge-warn" },
    "weak-positive":   { label: "Weak ↑",   cls: "badge-info" },
    "negative":        { label: "Mitigating ↓", cls: "badge-pass" },
  } as const;
  const { label, cls } = map[dir];
  return <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${cls}`}>{label}</span>;
}

function InfluenceBar({ value, direction }: { value: number; direction: Factor["direction"] }) {
  const pct = Math.abs(value) * 100;
  const fill =
    direction === "strong-positive" ? "bg-status-danger" :
    direction === "medium-positive" ? "bg-status-warn" :
    direction === "weak-positive"   ? "bg-status-info" : "bg-status-pass";
  const isNeg = direction === "negative";
  return (
    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${fill} ${isNeg ? "opacity-70" : ""}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
      />
    </div>
  );
}

function FactorRow({ factor, isSelected, onSelect }: { factor: Factor; isSelected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 rounded-md transition-colors group flex flex-col gap-1.5 ${
        isSelected ? "bg-surface-elevated border border-border-strong" : "hover:bg-surface-hover"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground leading-tight">{factor.label}</span>
        <InfluenceBadge dir={factor.direction} />
      </div>
      <InfluenceBar value={factor.influence} direction={factor.direction} />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-mono">
          {factor.influence > 0 ? "+" : ""}{(factor.influence * 100).toFixed(0)}% weight
        </span>
        <span className="text-xs text-muted-foreground">
          {factor.confidence}% confidence
        </span>
      </div>
    </button>
  );
}

export function ReasoningPanel() {
  const [selected, setSelected] = useState<string>(reasoningFactors[0].id);
  const [showInfluenceChain, setShowInfluenceChain] = useState(false);
  const selectedFactor = reasoningFactors.find(f => f.id === selected)!;

  const positives = reasoningFactors.filter(f => f.direction !== "negative");
  const negatives = reasoningFactors.filter(f => f.direction === "negative");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-surface border border-border rounded-lg shadow-card flex flex-col"
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Reasoning Transparency</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Why did the model reach this recommendation?</p>
        </div>
        <AlertTriangle className="w-4 h-4 text-status-warn shrink-0" />
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* ── Left: Ranked factors */}
        <div className="lg:w-[52%] border-b lg:border-b-0 lg:border-r border-border p-3 flex flex-col gap-1 overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground px-1 mb-1 uppercase tracking-wider">Driving factors</p>
          {positives.map(f => (
            <FactorRow key={f.id} factor={f} isSelected={selected === f.id} onSelect={() => setSelected(f.id)} />
          ))}
          <p className="text-xs font-medium text-muted-foreground px-1 mt-3 mb-1 uppercase tracking-wider">Mitigating factors</p>
          {negatives.map(f => (
            <FactorRow key={f.id} factor={f} isSelected={selected === f.id} onSelect={() => setSelected(f.id)} />
          ))}
        </div>

        {/* ── Right: Explanation panel */}
        <div className="lg:w-[48%] p-4 flex flex-col gap-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <InfluenceBadge dir={selectedFactor.direction} />
                  <span className="text-xs text-muted-foreground font-mono">{(Math.abs(selectedFactor.influence) * 100).toFixed(0)}% weight</span>
                </div>
                <h3 className="text-base font-semibold text-foreground leading-snug">{selectedFactor.label}</h3>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{selectedFactor.note}</p>

              <div className="bg-muted rounded-md p-3 border border-border">
                <span className="text-xs text-muted-foreground block mb-1.5 uppercase tracking-wider font-medium">Evidence source</span>
                <span className="text-sm text-foreground">{selectedFactor.source}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted rounded-md p-2.5 text-center">
                  <span className="text-lg font-mono font-semibold text-foreground">{selectedFactor.confidence}%</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Source confidence</p>
                </div>
                <div className="bg-muted rounded-md p-2.5 text-center">
                  <span className="text-lg font-mono font-semibold text-foreground">{(Math.abs(selectedFactor.influence) * 100).toFixed(0)}%</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Model weight</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Narrative summary */}
          <div className="mt-auto border-t border-border pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Plain-language summary</p>
            <p className="text-sm text-foreground leading-relaxed">
              The recommendation is primarily driven by{" "}
              <span className="text-status-warn font-medium">repeated flood exposure</span>,{" "}
              <span className="text-status-warn font-medium">poor drainage resilience</span>, and{" "}
              <span className="text-status-warn font-medium">elevated household vulnerability</span>.
              Displacement disruption acts as a counterbalancing factor but does not outweigh accumulated structural risk.
            </p>
          </div>

          {/* Influence chain */}
          <button
            onClick={() => setShowInfluenceChain(v => !v)}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
          >
            {showInfluenceChain ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            View influence chain
          </button>
          <AnimatePresence>
            {showInfluenceChain && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-muted rounded-md p-3 border border-border font-mono text-xs text-muted-foreground leading-loose">
                  <div className="flex items-center gap-2">
                    <span className="badge-info px-1.5 py-0.5 rounded text-[10px]">Input Data</span>
                    <span>→</span>
                    <span className="badge-warn px-1.5 py-0.5 rounded text-[10px]">Risk Models</span>
                    <span>→</span>
                    <span className="badge-danger px-1.5 py-0.5 rounded text-[10px]">Policy Inference</span>
                    <span>→</span>
                    <span className="badge-neutral px-1.5 py-0.5 rounded text-[10px]">Recommendation</span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed">
                    Satellite imagery + census + drainage data → flood risk score (82/100) → social vulnerability overlay (79/100) → policy threshold exceeded → phased relocation triggered.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
