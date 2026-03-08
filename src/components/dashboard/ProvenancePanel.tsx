import { useState } from "react";
import { Database, AlertTriangle, CheckCircle2, Clock, ChevronRight, X, Shield, ShieldAlert } from "lucide-react";
import { dataSources } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";

type Source = (typeof dataSources)[0];

function ReliabilityBar({ value }: { value: number }) {
  const color = value >= 80 ? "bg-status-pass" : value >= 65 ? "bg-status-warn" : "bg-status-danger";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-8 text-right">{value}%</span>
    </div>
  );
}

function StalenessChip({ staleness }: { staleness: Source["staleness"] }) {
  const map = {
    current: { label: "Current", cls: "badge-pass" },
    aging:   { label: "Aging",   cls: "badge-warn" },
    stale:   { label: "Stale",   cls: "badge-danger" },
  };
  const { label, cls } = map[staleness];
  return <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${cls}`}>{label}</span>;
}

function SourceDrawer({ source, onClose }: { source: Source; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 bg-surface-elevated z-10 flex flex-col overflow-y-auto"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-surface-elevated">
        <h3 className="text-sm font-semibold text-foreground truncate pr-4">{source.name}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Type", value: source.type },
            { label: "Owner", value: source.owner },
            { label: "Last Updated", value: source.lastUpdated },
            { label: "Coverage", value: `${source.coverage}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-muted rounded-md p-2.5">
              <span className="text-xs text-muted-foreground block">{label}</span>
              <span className="text-sm font-medium text-foreground font-mono">{value}</span>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Known Limitations</p>
          <p className="text-sm text-foreground leading-relaxed bg-muted rounded-md p-3 border border-border">{source.knownLimitations}</p>
        </div>

        {source.biasRisk && (
          <div className="bg-status-warn-bg border border-status-warn/30 rounded-md p-3 flex gap-2">
            <ShieldAlert className="w-4 h-4 text-status-warn shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-status-warn mb-1">Bias Risk Detected</p>
              <p className="text-xs text-foreground leading-relaxed">{source.biasNote}</p>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Transformation lineage</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="badge-info px-2 py-0.5 rounded font-mono text-[10px]">Raw Source</span>
              <span className="text-muted-foreground">→</span>
              {source.transformations.map((t, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="badge-neutral px-2 py-0.5 rounded font-mono text-[10px]">{t}</span>
                  {i < source.transformations.length - 1 && <span className="text-muted-foreground">→</span>}
                </span>
              ))}
              <span className="text-muted-foreground">→</span>
              <span className="badge-warn px-2 py-0.5 rounded font-mono text-[10px]">Model Input</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 font-medium">Geographic relevance</p>
          <p className="text-sm text-foreground">
            Floodplain Sector 7 — {source.coverage}% spatial coverage. Primary resolution: county-level with sub-zone aggregation.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function ProvenancePanel() {
  const [activeSource, setActiveSource] = useState<Source | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-surface border border-border rounded-lg shadow-card flex flex-col relative overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Evidence & Data Provenance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">What data was used, and how trustworthy is it?</p>
        </div>
        <Database className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>

      <div className="overflow-x-auto overflow-y-auto flex-1">
        <table className="w-full text-xs min-w-[580px]">
          <thead>
            <tr className="border-b border-border">
              {["Source", "Type", "Reliability", "Coverage", "Freshness", "Bias Risk", ""].map(col => (
                <th key={col} className="px-3 py-2 text-left text-muted-foreground font-medium uppercase tracking-wider text-[10px] whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataSources.map((src, i) => (
              <tr key={src.id} className={`border-b border-border/50 hover:bg-surface-hover transition-colors cursor-pointer ${i % 2 === 0 ? "" : "bg-muted/20"}`} onClick={() => setActiveSource(src)}>
                <td className="px-3 py-2.5 max-w-[180px]">
                  <span className="font-medium text-foreground truncate block">{src.name}</span>
                  <span className="text-muted-foreground text-[10px]">{src.owner}</span>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{src.type}</td>
                <td className="px-3 py-2.5 w-32">
                  <ReliabilityBar value={src.reliability} />
                </td>
                <td className="px-3 py-2.5 font-mono text-center">{src.coverage}%</td>
                <td className="px-3 py-2.5">
                  <StalenessChip staleness={src.staleness} />
                </td>
                <td className="px-3 py-2.5 text-center">
                  {src.biasRisk
                    ? <ShieldAlert className="w-3.5 h-3.5 text-status-warn mx-auto" />
                    : <Shield className="w-3.5 h-3.5 text-status-pass/60 mx-auto" />
                  }
                </td>
                <td className="px-3 py-2.5">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-status-danger" />3 sources have bias risk flags</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-status-warn" />2 sources are aging or stale</span>
        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-status-pass" />All 8 sources active in decision</span>
      </div>

      {/* Drawer overlay */}
      <AnimatePresence>
        {activeSource && (
          <SourceDrawer source={activeSource} onClose={() => setActiveSource(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
