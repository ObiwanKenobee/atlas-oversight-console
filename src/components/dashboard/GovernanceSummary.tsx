import { motion } from "framer-motion";
import {
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Users,
  Activity,
  ShieldAlert,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── Mock institutional data ───────────────────────────────────────────────────

const STATS = [
  {
    label: "Decisions Reviewed",
    value: "142",
    delta: "+12 this month",
    trend: "up",
    icon: LayoutGrid,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    label: "Override Rate",
    value: "23%",
    delta: "33 overrides",
    trend: "neutral",
    icon: Users,
    color: "text-status-warn",
    bg: "bg-status-warn/10",
  },
  {
    label: "Avg Confidence",
    value: "74%",
    delta: "−2 pts vs prev. quarter",
    trend: "down",
    icon: Activity,
    color: "text-muted-foreground",
    bg: "bg-surface",
  },
  {
    label: "Fairness Flags",
    value: "38",
    delta: "27% of all decisions",
    trend: "warn",
    icon: ShieldAlert,
    color: "text-status-danger",
    bg: "bg-status-danger/10",
  },
  {
    label: "Open Appeals",
    value: "9",
    delta: "3 escalated",
    trend: "warn",
    icon: Scale,
    color: "text-status-warn",
    bg: "bg-status-warn/10",
  },
  {
    label: "Ethics Reviews",
    value: "51",
    delta: "36% required escalation",
    trend: "neutral",
    icon: CheckCircle2,
    color: "text-status-pass",
    bg: "bg-status-pass/10",
  },
];

const MONTHLY_DECISIONS = [
  { month: "Jun", decisions: 9, overrides: 2, flags: 3 },
  { month: "Jul", decisions: 11, overrides: 3, flags: 4 },
  { month: "Aug", decisions: 14, overrides: 2, flags: 3 },
  { month: "Sep", decisions: 18, overrides: 5, flags: 5 },
  { month: "Oct", decisions: 22, overrides: 6, flags: 7 },
  { month: "Nov", decisions: 19, overrides: 5, flags: 6 },
];

const CATEGORY_BREAKDOWN = [
  { category: "Flood Risk", count: 48, flags: 18, overrides: 11 },
  { category: "Drought", count: 31, flags: 10, overrides: 8 },
  { category: "Infrastructure", count: 24, flags: 5, overrides: 4 },
  { category: "Wildfire", count: 19, flags: 3, overrides: 6 },
  { category: "Other", count: 20, flags: 2, overrides: 4 },
];

const RECENT_DECISIONS = [
  { id: "ATL-2024-FP-0047", title: "Floodplain Sector 7 Relocation", confidence: 78, status: "Pending", flags: 3, date: "14 Nov" },
  { id: "ATL-2024-FP-0031", title: "Coastal Zone C3 Flood Barrier", confidence: 64, status: "Approved", flags: 1, date: "22 Oct" },
  { id: "ATL-2024-DR-0019", title: "Drought Zone 4 Water Allocation", confidence: 88, status: "Overridden", flags: 4, date: "08 Oct" },
  { id: "ATL-2024-WF-0012", title: "Wildfire Zone 9 Evacuation Order", confidence: 91, status: "Approved", flags: 0, date: "01 Oct" },
  { id: "ATL-2024-IF-0008", title: "Bridge Sector 12 Load Restriction", confidence: 69, status: "Approved", flags: 1, date: "24 Sep" },
];

const statusColor: Record<string, string> = {
  Approved: "text-status-pass",
  Pending: "text-status-warn",
  Overridden: "text-status-danger",
  Rejected: "text-status-danger",
};

const CONFIDENCE_THRESHOLDS = [
  { range: "≥85%", count: 31, label: "High", color: "hsl(var(--status-pass))" },
  { range: "70–84%", count: 54, label: "Moderate-High", color: "hsl(var(--accent))" },
  { range: "55–69%", count: 38, label: "Moderate", color: "hsl(var(--status-warn))" },
  { range: "<55%", count: 19, label: "Low", color: "hsl(var(--status-danger))" },
];

// ── Subcomponents ─────────────────────────────────────────────────────────────

function StatCard({ stat, delay }: { stat: (typeof STATS)[0]; delay: number }) {
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</span>
        <div className={`w-6 h-6 rounded flex items-center justify-center ${stat.bg}`}>
          <Icon className={`w-3.5 h-3.5 ${stat.color}`} aria-hidden="true" />
        </div>
      </div>
      <span className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</span>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {stat.trend === "up" && <TrendingUp className="w-3 h-3 text-status-warn" />}
        {stat.trend === "down" && <TrendingDown className="w-3 h-3 text-status-pass" />}
        {stat.trend === "warn" && <AlertTriangle className="w-3 h-3 text-status-warn" />}
        <span>{stat.delta}</span>
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function GovernanceSummary() {
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded bg-surface flex items-center justify-center border border-border flex-shrink-0">
            <LayoutGrid className="w-4 h-4 text-accent" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Governance Summary</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Institutional overview — aggregate statistics across all Atlas decisions.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs font-mono text-muted-foreground border border-border rounded px-2 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-pass animate-pulse" />
            YTD 2024
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {STATS.map((s, i) => (
            <StatCard key={s.label} stat={s} delay={i * 0.05} />
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Monthly volume */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-xs font-semibold text-foreground mb-1">Monthly Decision Volume</h3>
          <p className="text-[10px] text-muted-foreground mb-4">Decisions, overrides, and fairness flags per month</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={MONTHLY_DECISIONS} barSize={8} barGap={2}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 11 }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="decisions" name="Decisions" fill="hsl(var(--accent))" radius={[2, 2, 0, 0]} opacity={0.8} />
              <Bar dataKey="overrides" name="Overrides" fill="hsl(var(--status-warn))" radius={[2, 2, 0, 0]} opacity={0.8} />
              <Bar dataKey="flags" name="Flags" fill="hsl(var(--status-danger))" radius={[2, 2, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center">
            {[
              { color: "bg-accent", label: "Decisions" },
              { color: "bg-status-warn", label: "Overrides" },
              { color: "bg-status-danger", label: "Flags" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className={`w-2 h-2 rounded-sm ${l.color}`} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Confidence distribution */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-xs font-semibold text-foreground mb-1">Confidence Distribution</h3>
          <p className="text-[10px] text-muted-foreground mb-4">Breakdown of all 142 decisions by confidence band</p>
          <div className="flex flex-col gap-3">
            {CONFIDENCE_THRESHOLDS.map((band, i) => (
              <div key={band.range} className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-14 shrink-0">{band.range}</span>
                <div className="flex-1 h-5 bg-surface rounded overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(band.count / 142) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="h-full rounded flex items-center px-2"
                    style={{ background: band.color, opacity: 0.8 }}
                  >
                    <span className="text-[9px] font-bold text-card">{band.count}</span>
                  </motion.div>
                </div>
                <span className="text-xs text-muted-foreground w-24 shrink-0">{band.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category breakdown + recent decisions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Category */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-xs font-semibold text-foreground mb-1">Decision Categories</h3>
          <p className="text-[10px] text-muted-foreground mb-4">Decisions by domain — flags and overrides per category</p>
          <div className="rounded border border-border overflow-hidden">
            <div className="grid grid-cols-4 bg-surface px-3 py-2 border-b border-border">
              {["Category", "Count", "Flags", "Overrides"].map((h) => (
                <span key={h} className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{h}</span>
              ))}
            </div>
            {CATEGORY_BREAKDOWN.map((row, i) => (
              <div key={row.category} className={`grid grid-cols-4 px-3 py-2.5 text-xs ${i < CATEGORY_BREAKDOWN.length - 1 ? "border-b border-border" : ""}`}>
                <span className="text-foreground font-medium">{row.category}</span>
                <span className="font-mono text-muted-foreground">{row.count}</span>
                <span className={`font-mono ${row.flags > 5 ? "text-status-danger" : row.flags > 2 ? "text-status-warn" : "text-muted-foreground"}`}>
                  {row.flags}
                </span>
                <span className={`font-mono ${row.overrides > 7 ? "text-status-warn" : "text-muted-foreground"}`}>{row.overrides}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent decisions */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-xs font-semibold text-foreground mb-1">Recent Decisions</h3>
          <p className="text-[10px] text-muted-foreground mb-4">Latest 5 decisions reviewed by Atlas</p>
          <div className="flex flex-col gap-2">
            {RECENT_DECISIONS.map((dec) => (
              <div key={dec.id} className="flex items-center gap-3 rounded border border-border bg-surface px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono text-muted-foreground">{dec.id}</span>
                    <span className="text-[10px] text-muted-foreground">{dec.date}</span>
                  </div>
                  <p className="text-xs text-foreground font-medium truncate">{dec.title}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-muted-foreground">{dec.confidence}%</span>
                  {dec.flags > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-status-danger border border-status-danger/30 bg-status-danger/10 px-1.5 py-0.5 rounded">
                      <AlertTriangle className="w-2.5 h-2.5" />{dec.flags}
                    </span>
                  )}
                  <span className={`text-[10px] font-medium ${statusColor[dec.status] ?? "text-muted-foreground"}`}>{dec.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
