import { useState } from "react";
import { ShieldAlert, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { fairnessData } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";

function DimensionBadge({ status }: { status: "pass" | "warn" | "danger" }) {
  const map = { pass: "badge-pass", warn: "badge-warn", danger: "badge-danger" };
  const label = { pass: "OK", warn: "Review", danger: "Flagged" };
  return <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${map[status]}`}>{label[status]}</span>;
}

export function FairnessPanel() {
  const [expanded, setExpanded] = useState<string | null>("fa-1");
  const d = fairnessData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="bg-surface border border-border rounded-lg shadow-card flex flex-col"
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Bias, Fairness & Harm Monitoring</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Who might be disproportionately affected?</p>
        </div>
        <ShieldAlert className="w-4 h-4 text-status-danger shrink-0" />
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Overall status */}
        <div className="flex items-center gap-2 px-3 py-2 bg-status-danger-bg border border-status-danger/30 rounded-md">
          <AlertTriangle className="w-4 h-4 text-status-danger shrink-0" />
          <span className="text-xs font-semibold text-status-danger">Fairness Status: Flagged</span>
          <span className="text-xs text-muted-foreground ml-auto">Ethics review required</span>
        </div>

        {/* 4 fairness dimensions */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Fairness dimensions</p>
          <div className="grid grid-cols-2 gap-2">
            {d.dimensions.map(dim => (
              <div key={dim.name} className="bg-muted rounded-md p-2.5 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{dim.name}</span>
                  <DimensionBadge status={dim.status} />
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">{dim.note}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 italic">Fairness is not one score. Each dimension must be individually reviewed.</p>
        </div>

        {/* Alerts */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Fairness alerts</p>
          <div className="flex flex-col gap-2">
            {d.alerts.map(alert => (
              <div key={alert.id} className="rounded-md border overflow-hidden" style={{ borderColor: alert.severity === "high" ? "hsl(0 72% 52% / 0.3)" : alert.severity === "medium" ? "hsl(38 90% 52% / 0.3)" : "hsl(214 72% 55% / 0.3)" }}>
                <button
                  onClick={() => setExpanded(expanded === alert.id ? null : alert.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-hover transition-colors"
                >
                  <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${alert.severity === "high" ? "text-status-danger" : alert.severity === "medium" ? "text-status-warn" : "text-status-info"}`} />
                  <span className="text-xs text-foreground flex-1 leading-snug line-clamp-1">{alert.message}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${alert.severity === "high" ? "badge-danger" : alert.severity === "medium" ? "badge-warn" : "badge-info"}`}>{alert.dimension}</span>
                  {expanded === alert.id ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                </button>
                <AnimatePresence>
                  {expanded === alert.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 pt-1 border-t border-border/50">
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{alert.message}</p>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Info className="w-3 h-3 text-status-info" />
                          <span className="text-status-info font-medium">Required action:</span>
                          <span className="text-foreground">{alert.action}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Group comparison */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Urgency score by group</p>
          <div className="space-y-1.5">
            {d.groupComparison.map((g, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-32 text-muted-foreground truncate">{g.group}</span>
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden relative">
                  <motion.div
                    className={`h-full rounded-full ${g.urgencyScore >= 80 ? "bg-status-danger" : g.urgencyScore >= 65 ? "bg-status-warn" : "bg-status-info"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${g.urgencyScore}%` }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                  />
                  {/* Flood exposure reference line */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-foreground/30"
                    style={{ left: `${g.floodExposure}%` }}
                    title={`Flood exposure: ${g.floodExposure}%`}
                  />
                </div>
                <span className={`font-mono w-7 text-right ${g.urgencyScore >= 80 ? "text-status-danger" : g.urgencyScore >= 65 ? "text-status-warn" : "text-muted-foreground"}`}>{g.urgencyScore}</span>
                <span className="text-muted-foreground w-16 text-right text-[10px]">err ±{g.errorRate}%</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Bar = urgency score · Vertical line = flood exposure baseline · Disparity = bar extends beyond baseline
          </p>
        </div>
      </div>
    </motion.div>
  );
}
