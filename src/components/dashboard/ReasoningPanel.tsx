import { useState } from "react";
import { ChevronDown, ChevronRight, Info, AlertTriangle, BarChart2 } from "lucide-react";
import { reasoningFactors } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Factor = (typeof reasoningFactors)[0];

// ── Direction badge ───────────────────────────────────────────────────────────

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

// ── Tornado chart (horizontal diverging bar) ──────────────────────────────────

const CHART_DATA = reasoningFactors
  .slice()
  .sort((a, b) => Math.abs(b.influence) - Math.abs(a.influence))
  .map((f) => ({
    name: f.label.length > 26 ? f.label.slice(0, 24) + "…" : f.label,
    fullName: f.label,
    value: Math.round(f.influence * 100),
    confidence: f.confidence,
    id: f.id,
  }));

function TornadoChart({ onSelect, selected }: { onSelect: (id: string) => void; selected: string }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        layout="vertical"
        data={CHART_DATA}
        margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
        barCategoryGap="18%"
      >
        <XAxis
          type="number"
          domain={[-55, 95]}
          tickCount={5}
          tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={148}
          tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--surface-hover))" }}
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 6,
            fontSize: 11,
            color: "hsl(var(--foreground))",
          }}
          formatter={(value: number, _name: string, props: { payload?: { fullName?: string; confidence?: number } }) => [
            `${value > 0 ? "+" : ""}${value}%  ·  ${props.payload?.confidence ?? 0}% confidence`,
            props.payload?.fullName ?? "",
          ]}
        />
        <ReferenceLine x={0} stroke="hsl(var(--border-strong))" strokeWidth={1.5} />
        <Bar dataKey="value" radius={[0, 2, 2, 0]} onClick={(d) => {
          const match = reasoningFactors.find((f) => CHART_DATA.find((c) => c.name === d.name && c.id === f.id));
          if (match) onSelect(match.id);
        }}>
          {CHART_DATA.map((entry) => {
            const isSelected = reasoningFactors.find((f) => f.id === selected)?.label.startsWith(entry.name.replace("…", ""));
            return (
              <Cell
                key={entry.id}
                fill={
                  entry.value <= -30
                    ? "hsl(var(--status-pass))"
                    : entry.value <= 0
                    ? "hsl(var(--status-pass) / 0.6)"
                    : entry.value >= 80
                    ? "hsl(var(--status-danger))"
                    : entry.value >= 60
                    ? "hsl(var(--status-warn))"
                    : "hsl(var(--status-info))"
                }
                opacity={isSelected ? 1 : 0.75}
                stroke={isSelected ? "hsl(var(--foreground))" : "none"}
                strokeWidth={isSelected ? 1 : 0}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Factor detail row (compact list) ─────────────────────────────────────────

function FactorRow({ factor, isSelected, onSelect }: { factor: Factor; isSelected: boolean; onSelect: () => void }) {
  const pct = Math.abs(factor.influence) * 100;
  const fill =
    factor.direction === "strong-positive" ? "bg-status-danger" :
    factor.direction === "medium-positive" ? "bg-status-warn" :
    factor.direction === "weak-positive"   ? "bg-status-info" : "bg-status-pass";

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2 rounded-md transition-colors group flex flex-col gap-1.5 ${
        isSelected ? "bg-surface-elevated border border-border" : "hover:bg-surface-hover"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-foreground leading-tight truncate">{factor.label}</span>
        <InfluenceBadge dir={factor.direction} />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${fill}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
          />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground w-12 text-right shrink-0">
          {factor.influence > 0 ? "+" : ""}{(factor.influence * 100).toFixed(0)}% · {factor.confidence}%
        </span>
      </div>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ReasoningPanel() {
  const [selected, setSelected] = useState<string>(reasoningFactors[0].id);
  const [view, setView] = useState<"list" | "chart">("chart");
  const [showInfluenceChain, setShowInfluenceChain] = useState(false);
  const selectedFactor = reasoningFactors.find((f) => f.id === selected)!;

  const positives = reasoningFactors.filter((f) => f.direction !== "negative");
  const negatives = reasoningFactors.filter((f) => f.direction === "negative");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-surface border border-border rounded-lg shadow-card flex flex-col"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Reasoning Transparency</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Why did the model reach this recommendation?</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded border border-border overflow-hidden text-[10px]">
            <button
              onClick={() => setView("chart")}
              className={`px-2 py-1 transition-colors ${view === "chart" ? "bg-surface-elevated text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <BarChart2 className="w-3 h-3 inline mr-1" />Chart
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-2 py-1 transition-colors border-l border-border ${view === "list" ? "bg-surface-elevated text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              List
            </button>
          </div>
          <AlertTriangle className="w-4 h-4 text-status-warn shrink-0" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* ── Left: factors */}
        <div className="lg:w-[55%] border-b lg:border-b-0 lg:border-r border-border p-3 flex flex-col gap-2 overflow-y-auto">
          {view === "chart" ? (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] text-muted-foreground px-1 uppercase tracking-wider font-medium">
                Factor influence — click a bar to inspect
              </p>
              <TornadoChart onSelect={setSelected} selected={selected} />
              <p className="text-[10px] text-muted-foreground px-1">
                <span className="inline-block w-2 h-2 rounded-sm bg-status-danger mr-1 align-middle" />strong driving ·
                <span className="inline-block w-2 h-2 rounded-sm bg-status-warn mx-1 align-middle" />medium ·
                <span className="inline-block w-2 h-2 rounded-sm bg-status-pass mx-1 align-middle" />mitigating
              </p>
            </div>
          ) : (
            <>
              <p className="text-[10px] text-muted-foreground px-1 uppercase tracking-wider font-medium mb-0.5">Driving factors</p>
              {positives.map((f) => (
                <FactorRow key={f.id} factor={f} isSelected={selected === f.id} onSelect={() => setSelected(f.id)} />
              ))}
              <p className="text-[10px] text-muted-foreground px-1 mt-2 uppercase tracking-wider font-medium mb-0.5">Mitigating factors</p>
              {negatives.map((f) => (
                <FactorRow key={f.id} factor={f} isSelected={selected === f.id} onSelect={() => setSelected(f.id)} />
              ))}
            </>
          )}
        </div>

        {/* ── Right: detail panel */}
        <div className="lg:w-[45%] p-4 flex flex-col gap-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-3"
            >
              {/* Factor header */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <InfluenceBadge dir={selectedFactor.direction} />
                  <span className="text-xs text-muted-foreground font-mono">
                    {(Math.abs(selectedFactor.influence) * 100).toFixed(0)}% influence weight
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground leading-snug">{selectedFactor.label}</h3>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{selectedFactor.note}</p>

              {/* Evidence source */}
              <div className="bg-muted rounded-md p-3 border border-border">
                <span className="text-[10px] text-muted-foreground block mb-1 uppercase tracking-wider font-medium">Evidence source</span>
                <span className="text-xs text-foreground font-medium">{selectedFactor.source}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Source confidence", value: `${selectedFactor.confidence}%`, highlight: selectedFactor.confidence < 65 },
                  { label: "Model influence", value: `${(Math.abs(selectedFactor.influence) * 100).toFixed(0)}%`, highlight: false },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="bg-muted rounded-md p-2.5 text-center">
                    <span className={`text-lg font-mono font-semibold block ${highlight ? "text-status-warn" : "text-foreground"}`}>{value}</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Low confidence warning */}
              {selectedFactor.confidence < 65 && (
                <div className="flex items-start gap-2 bg-status-warn-bg border border-status-warn/30 rounded p-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-status-warn shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Source confidence below 65% — this factor contributes to model uncertainty. Consider requesting updated data.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Plain-language summary */}
          <div className="mt-auto border-t border-border pt-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Plain-language summary</p>
            <p className="text-xs text-foreground leading-relaxed">
              The recommendation is primarily driven by{" "}
              <span className="text-status-danger font-medium">repeated flood exposure</span>,{" "}
              <span className="text-status-warn font-medium">poor drainage resilience</span>, and{" "}
              <span className="text-status-warn font-medium">elevated household vulnerability</span>.
              Displacement disruption acts as a counterbalancing factor but does not outweigh accumulated structural risk.
            </p>
          </div>

          {/* Influence chain toggle */}
          <button
            onClick={() => setShowInfluenceChain((v) => !v)}
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
                  <div className="flex items-center gap-2 flex-wrap">
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
