import { alternatives } from "@/data/mockData";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Alt = (typeof alternatives)[0];

function TradeoffRow({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-1.5">
        {positive
          ? <CheckCircle2 className="w-3 h-3 text-status-pass shrink-0" />
          : <XCircle className="w-3 h-3 text-status-danger/70 shrink-0" />
        }
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className={`text-xs font-medium ${positive ? "text-status-pass" : "text-muted-foreground"}`}>{value}</span>
    </div>
  );
}

function AlternativeCard({ alt, isExpanded, onToggle }: { alt: Alt; isExpanded: boolean; onToggle: () => void }) {
  const confColor = alt.confidence >= 70 ? "text-status-pass" : alt.confidence >= 50 ? "text-status-warn" : "text-status-danger";

  return (
    <div className={`rounded-md border overflow-hidden transition-colors ${alt.isPrimary ? "border-primary/40 bg-primary-muted/20" : "border-border bg-muted/30"}`}>
      <button onClick={onToggle} className="w-full text-left px-3 py-3 flex items-center gap-3 hover:bg-surface-hover/50 transition-colors">
        <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-bold shrink-0 ${alt.isPrimary ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border"}`}>
          {alt.rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-foreground truncate">{alt.label}</span>
            {alt.isPrimary && <span className="badge-info text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0">Primary</span>}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className={`font-mono font-semibold ${confColor}`}>{alt.confidence}% confidence</span>
            <span>{alt.riskReduction} risk reduction</span>
            <span>{alt.timeframe}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${alt.socialDisruption === "Low" ? "badge-pass" : alt.socialDisruption === "Medium" ? "badge-warn" : "badge-danger"}`}>
            Social: {alt.socialDisruption}
          </span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
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
                ].map(m => (
                  <div key={m.label} className="bg-muted rounded p-2 text-center">
                    <span className="text-xs font-mono font-semibold text-foreground block">{m.value}</span>
                    <span className="text-[10px] text-muted-foreground">{m.label}</span>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 font-medium">Tradeoffs</p>
                <div className="bg-background/50 rounded p-2">
                  {alt.tradeoffs.map((t, i) => <TradeoffRow key={i} {...t} />)}
                </div>
              </div>

              {alt.whySelected && (
                <div className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-pass mt-0.5 shrink-0" />
                  <div><span className="text-status-pass font-medium">Why selected: </span><span className="text-muted-foreground">{alt.whySelected}</span></div>
                </div>
              )}
              {alt.notSelected && (
                <div className="flex items-start gap-2 text-xs">
                  <XCircle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div><span className="text-muted-foreground font-medium">Not selected: </span><span className="text-muted-foreground">{alt.notSelected}</span></div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AlternativesPanel() {
  const [expanded, setExpanded] = useState<string>("alt-1");

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
          <p className="text-xs text-muted-foreground mt-0.5">What else was considered, and why was it not selected?</p>
        </div>
        <Zap className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>

      <div className="p-4 flex flex-col gap-2">
        {alternatives.map(alt => (
          <AlternativeCard
            key={alt.id}
            alt={alt}
            isExpanded={expanded === alt.id}
            onToggle={() => setExpanded(expanded === alt.id ? "" : alt.id)}
          />
        ))}
      </div>
    </motion.div>
  );
}
