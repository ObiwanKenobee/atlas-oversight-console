import { useState } from "react";
import {
  Database,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  X,
  Shield,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { dataSources } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";

type Source = (typeof dataSources)[0];

// ── Sub-components ─────────────────────────────────────────────────────────────

function ReliabilityBar({ value }: { value: number }) {
  const color =
    value >= 80 ? "bg-status-pass" : value >= 65 ? "bg-status-warn" : "bg-status-danger";
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
    aging: { label: "Aging", cls: "badge-warn" },
    stale: { label: "Stale", cls: "badge-danger" },
  };
  const { label, cls } = map[staleness];
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${cls}`}>{label}</span>
  );
}

// ── Source detail drawer (portal-like modal, not clipped) ─────────────────────

function SourceModal({ source, onClose }: { source: Source; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        key="panel"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.22 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-border shadow-elevated flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface sticky top-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <Database className="w-4 h-4 text-accent shrink-0" />
            <h3 className="text-sm font-semibold text-foreground truncate">{source.name}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close source detail"
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Data Type", value: source.type },
              { label: "Owner", value: source.owner },
              { label: "Last Updated", value: source.lastUpdated },
              { label: "Coverage", value: `${source.coverage}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted rounded-md p-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block mb-0.5">{label}</span>
                <span className="text-xs font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>

          {/* Reliability bar */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Reliability score</span>
            <ReliabilityBar value={source.reliability} />
            <span className="text-[10px] text-muted-foreground">
              {source.reliability >= 80
                ? "High reliability — data well-validated and regularly updated."
                : source.reliability >= 65
                ? "Moderate reliability — some limitations noted. Use with caution."
                : "Low reliability — confidence impact may be significant."}
            </span>
          </div>

          {/* Staleness */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Freshness</span>
            <StalenessChip staleness={source.staleness} />
          </div>

          {/* Known limitations */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Known Limitations</p>
            <p className="text-xs text-foreground leading-relaxed bg-muted rounded-md p-3 border border-border">
              {source.knownLimitations}
            </p>
          </div>

          {/* Bias risk */}
          {source.biasRisk && source.biasNote && (
            <div className="bg-status-warn-bg border border-status-warn/30 rounded-md p-3 flex gap-2">
              <ShieldAlert className="w-4 h-4 text-status-warn shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-status-warn mb-1">Bias Risk Detected</p>
                <p className="text-xs text-foreground leading-relaxed">{source.biasNote}</p>
              </div>
            </div>
          )}

          {/* Transformation lineage */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-3">
              Transformation lineage
            </p>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="badge-info px-2 py-0.5 rounded font-mono text-[10px]">Raw Source</span>
              {source.transformations.map((t, i) => (
                <span key={i} className="flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="badge-neutral px-2 py-0.5 rounded font-mono text-[10px]">{t}</span>
                </span>
              ))}
              <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="badge-warn px-2 py-0.5 rounded font-mono text-[10px]">Model Input</span>
            </div>
          </div>

          {/* Geographic note */}
          <div className="border-t border-border pt-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5">
              Geographic relevance
            </p>
            <p className="text-xs text-foreground leading-relaxed">
              Floodplain Sector 7 — {source.coverage}% spatial coverage. Primary resolution: county-level
              with sub-zone aggregation.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function ProvenancePanel() {
  const [activeSource, setActiveSource] = useState<Source | null>(null);

  const biasCount = dataSources.filter((s) => s.biasRisk).length;
  const staleCount = dataSources.filter((s) => s.staleness !== "current").length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-surface border border-border rounded-lg shadow-card flex flex-col"
      >
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Evidence & Data Provenance</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              What data was used, how trustworthy is it, and how was it transformed?
            </p>
          </div>
          <Database className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-xs min-w-[580px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Source", "Type", "Reliability", "Coverage", "Freshness", "Bias Risk", ""].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left text-muted-foreground font-medium uppercase tracking-wider text-[10px] whitespace-nowrap"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {dataSources.map((src, i) => (
                <tr
                  key={src.id}
                  onClick={() => setActiveSource(src)}
                  className={`border-b border-border/50 hover:bg-surface-hover transition-colors cursor-pointer group ${
                    i % 2 === 0 ? "" : "bg-muted/10"
                  } ${src.staleness === "stale" ? "bg-status-danger/3" : ""}`}
                >
                  <td className="px-3 py-2.5 max-w-[180px]">
                    <span className="font-medium text-foreground truncate block">{src.name}</span>
                    <span className="text-muted-foreground text-[10px]">{src.owner}</span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap text-[11px]">
                    {src.type}
                  </td>
                  <td className="px-3 py-2.5 w-32">
                    <ReliabilityBar value={src.reliability} />
                  </td>
                  <td className="px-3 py-2.5 font-mono text-center">
                    <span
                      className={
                        src.coverage < 70
                          ? "text-status-danger font-semibold"
                          : src.coverage < 85
                          ? "text-status-warn"
                          : "text-foreground"
                      }
                    >
                      {src.coverage}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <StalenessChip staleness={src.staleness} />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {src.biasRisk ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-status-warn mx-auto" />
                    ) : (
                      <Shield className="w-3.5 h-3.5 text-status-pass/60 mx-auto" />
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {biasCount > 0 && (
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-status-danger" />
              {biasCount} sources have bias risk flags
            </span>
          )}
          {staleCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-status-warn" />
              {staleCount} sources aging or stale
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-status-pass" />
            All {dataSources.length} sources active in decision
          </span>
          <span className="ml-auto text-[10px] font-mono">Click any row for full provenance detail</span>
        </div>
      </motion.div>

      {/* Full-screen modal — rendered outside the panel */}
      {activeSource && (
        <SourceModal source={activeSource} onClose={() => setActiveSource(null)} />
      )}
    </>
  );
}
