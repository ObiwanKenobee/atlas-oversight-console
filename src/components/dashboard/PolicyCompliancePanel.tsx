import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  ArrowRight,
  FileCheck,
  Gavel,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Mock data ─────────────────────────────────────────────────────────────────

const REGULATIONS = [
  {
    id: "reg-1",
    law: "Disaster Risk Management Act §14",
    shortName: "DRMA §14",
    status: "pass" as const,
    note: "Relocation mandate triggered by ≥3 flood events in 5-year window. Sector 7 recorded 4 events (2019–2024). Condition satisfied.",
    requiresSignOff: false,
    signOffBy: null,
    checkedAt: "2024-11-14T10:02:00Z",
    authority: "Disaster Risk Compliance Engine",
    category: "Statutory" as const,
  },
  {
    id: "reg-2",
    law: "Housing Relocation Protocol 2019",
    shortName: "HRP 2019",
    status: "warn" as const,
    note: "Requires a housing allocation plan (HAP) to be submitted and approved before the decision is enacted. No HAP on file as of today.",
    requiresSignOff: true,
    signOffBy: "District Housing Authority",
    checkedAt: "2024-11-14T10:02:00Z",
    authority: "Policy Compliance Engine",
    category: "Procedural" as const,
    action: "Submit Housing Allocation Plan to District Housing Authority before final approval.",
  },
  {
    id: "reg-3",
    law: "Environmental Impact Framework §8",
    shortName: "EIF §8",
    status: "warn" as const,
    note: "Environmental Impact Assessment (EIA) is mandatory for relocations affecting >2,000 households. Affects 3,200 — EIA is pending.",
    requiresSignOff: true,
    signOffBy: "National Environment Agency",
    checkedAt: "2024-11-14T10:02:00Z",
    authority: "Policy Compliance Engine",
    category: "Environmental" as const,
    action: "Commission and submit EIA report to National Environment Agency. Estimated 4–6 weeks.",
  },
  {
    id: "reg-4",
    law: "Ethical AI Governance Standards 2023",
    shortName: "EAGS 2023",
    status: "pass" as const,
    note: "Ethics review triggered for high-risk AI recommendation. Fairness analysis completed. Escalation pathway followed. Ethics Board notified.",
    requiresSignOff: false,
    signOffBy: null,
    checkedAt: "2024-11-14T10:02:00Z",
    authority: "Atlas Ethics Module",
    category: "AI Governance" as const,
  },
  {
    id: "reg-5",
    law: "Social Equity & Displacement Act §22",
    shortName: "SEDA §22",
    status: "fail" as const,
    note: "Requires demonstration that displacement does not disproportionately burden protected groups. Current fairness analysis flags significant income-group disparity (2.4×). Condition not satisfied.",
    requiresSignOff: true,
    signOffBy: "Ethics Board & Social Equity Officer",
    checkedAt: "2024-11-14T10:02:00Z",
    authority: "Policy Compliance Engine",
    category: "Equity" as const,
    action: "Resolve income-group disparity in fairness analysis. Ethics Board sign-off required.",
  },
  {
    id: "reg-6",
    law: "Public Consultation Requirement §6",
    shortName: "PCR §6",
    status: "pass" as const,
    note: "Participatory survey conducted (55% response rate — above 40% threshold). Community reports included in evidence base. Condition satisfied.",
    requiresSignOff: false,
    signOffBy: null,
    checkedAt: "2024-11-14T10:02:00Z",
    authority: "District Social Services",
    category: "Procedural" as const,
  },
];

const COMPLIANCE_TIMELINE = [
  {
    id: "ct-1",
    timestamp: "2024-11-14T10:02:00Z",
    event: "Automated compliance check run",
    actor: "Policy Compliance Engine",
    type: "check" as const,
    status: "neutral" as const,
    detail: "6 regulations evaluated. 3 pass, 2 warn, 1 fail.",
  },
  {
    id: "ct-2",
    timestamp: "2024-11-14T10:05:00Z",
    event: "SEDA §22 fail — Ethics Board notified",
    actor: "Atlas Ethics Module",
    type: "escalation" as const,
    status: "danger" as const,
    detail: "Automated notification sent to Ethics Board chair re: income-group disparity under SEDA §22.",
  },
  {
    id: "ct-3",
    timestamp: "2024-11-14T10:15:00Z",
    event: "Ethics Board review initiated",
    actor: "Ethics Board (Chair: Prof. R. Acheampong)",
    type: "human_review" as const,
    status: "warn" as const,
    detail: "Board opened decision file. Requested additional income-group breakdowns from fairness panel.",
  },
  {
    id: "ct-4",
    timestamp: "2024-11-14T10:40:00Z",
    event: "HRP 2019 sign-off pending — Housing Authority contacted",
    actor: "Commissioner J. Osei",
    type: "action" as const,
    status: "warn" as const,
    detail: "District Housing Authority formally requested to prepare Housing Allocation Plan within 10 working days.",
  },
  {
    id: "ct-5",
    timestamp: "2024-11-14T11:00:00Z",
    event: "EIF §8 — EIA scoping initiated",
    actor: "National Environment Agency",
    type: "action" as const,
    status: "warn" as const,
    detail: "EIA scoping meeting scheduled for 2024-11-21. Estimated completion 2024-12-19.",
  },
];

const SIGN_OFF_ACTIONS = REGULATIONS.filter((r) => r.requiresSignOff);

// ── Sub-components ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pass: {
    icon: CheckCircle2,
    cls: "text-status-pass",
    badge: "badge-pass",
    bg: "bg-status-pass/5 border-status-pass/20",
    label: "Pass",
  },
  warn: {
    icon: AlertTriangle,
    cls: "text-status-warn",
    badge: "badge-warn",
    bg: "bg-status-warn/5 border-status-warn/20",
    label: "Action Required",
  },
  fail: {
    icon: XCircle,
    cls: "text-status-danger",
    badge: "badge-danger",
    bg: "bg-status-danger/5 border-status-danger/20",
    label: "Fail",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  Statutory: "badge-info",
  Procedural: "badge-neutral",
  Environmental: "badge-pass",
  "AI Governance": "badge-warn",
  Equity: "badge-danger",
};

const TIMELINE_TYPE_ICONS = {
  check: Shield,
  escalation: AlertTriangle,
  human_review: User,
  action: FileCheck,
};

function RegulationRow({ reg }: { reg: (typeof REGULATIONS)[0] }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[reg.status];
  const StatusIcon = cfg.icon;

  return (
    <div className={`rounded-lg border ${cfg.bg} overflow-hidden`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-hover transition-colors"
      >
        <StatusIcon className={`w-4 h-4 shrink-0 ${cfg.cls}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-foreground">{reg.law}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${CATEGORY_COLORS[reg.category] ?? "badge-neutral"}`}>
              {reg.category}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{reg.note}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${cfg.badge}`}>{cfg.label}</span>
          {open ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border/50 pt-3">
              <p className="text-xs text-foreground leading-relaxed">{reg.note}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted rounded-md p-2.5">
                  <span className="text-[10px] text-muted-foreground block mb-0.5 uppercase tracking-wider font-medium">Authority</span>
                  <span className="text-xs text-foreground font-medium">{reg.authority}</span>
                </div>
                <div className="bg-muted rounded-md p-2.5">
                  <span className="text-[10px] text-muted-foreground block mb-0.5 uppercase tracking-wider font-medium">Checked</span>
                  <span className="text-xs font-mono text-foreground">
                    {new Date(reg.checkedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
              {reg.requiresSignOff && reg.action && (
                <div className="flex items-start gap-2 bg-status-warn-bg border border-status-warn/30 rounded p-3">
                  <Gavel className="w-3.5 h-3.5 text-status-warn shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-status-warn font-semibold mb-1 uppercase tracking-wider">Required Action</p>
                    <p className="text-xs text-foreground">{reg.action}</p>
                    {reg.signOffBy && (
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono">Sign-off required by: {reg.signOffBy}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TimelineEntry({ entry, isLast }: { entry: (typeof COMPLIANCE_TIMELINE)[0]; isLast: boolean }) {
  const Icon = TIMELINE_TYPE_ICONS[entry.type] ?? Shield;
  const dotColor =
    entry.status === "danger"
      ? "bg-status-danger"
      : entry.status === "warn"
      ? "bg-status-warn"
      : "bg-status-pass";

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
        {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
      </div>
      <div className="pb-4 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="text-xs font-medium text-foreground leading-tight">{entry.event}</span>
          <span className="text-[10px] font-mono text-muted-foreground ml-auto shrink-0">
            {new Date(entry.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">{entry.actor}</p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1 bg-muted/50 rounded p-2 border border-border/50">
          {entry.detail}
        </p>
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function PolicyCompliancePanel() {
  const passCount = REGULATIONS.filter((r) => r.status === "pass").length;
  const warnCount = REGULATIONS.filter((r) => r.status === "warn").length;
  const failCount = REGULATIONS.filter((r) => r.status === "fail").length;
  const overallStatus = failCount > 0 ? "fail" : warnCount > 0 ? "warn" : "pass";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex flex-col gap-4"
    >
      {/* Summary header card */}
      <div className="bg-surface border border-border rounded-lg shadow-card px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              overallStatus === "fail"
                ? "bg-status-danger/10"
                : overallStatus === "warn"
                ? "bg-status-warn/10"
                : "bg-status-pass/10"
            }`}
          >
            {overallStatus === "fail" ? (
              <XCircle className="w-5 h-5 text-status-danger" />
            ) : overallStatus === "warn" ? (
              <AlertTriangle className="w-5 h-5 text-status-warn" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-status-pass" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Policy Compliance Status</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Decision ATL-2024-FP-0047 · Checked 14 Nov 2024 · {REGULATIONS.length} regulations evaluated
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center">
            <span className="text-xl font-mono font-bold text-status-pass">{passCount}</span>
            <p className="text-[10px] text-muted-foreground">Pass</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <span className="text-xl font-mono font-bold text-status-warn">{warnCount}</span>
            <p className="text-[10px] text-muted-foreground">Action Req.</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <span className="text-xl font-mono font-bold text-status-danger">{failCount}</span>
            <p className="text-[10px] text-muted-foreground">Fail</p>
          </div>
        </div>
      </div>

      {/* Required sign-off actions */}
      {SIGN_OFF_ACTIONS.length > 0 && (
        <div className="bg-surface border border-border rounded-lg shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Gavel className="w-4 h-4 text-status-warn" />
            <h3 className="text-sm font-semibold text-foreground">Required Sign-Off Actions</h3>
            <span className="ml-auto badge-warn px-2 py-0.5 rounded font-mono text-[10px]">
              {SIGN_OFF_ACTIONS.length} pending
            </span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {SIGN_OFF_ACTIONS.map((reg, i) => {
              const cfg = STATUS_CONFIG[reg.status];
              const StatusIcon = cfg.icon;
              return (
                <div key={reg.id} className="flex items-start gap-3">
                  <span className="text-[10px] font-mono text-muted-foreground w-4 mt-0.5 shrink-0">{i + 1}.</span>
                  <StatusIcon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${cfg.cls}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">{reg.shortName}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-foreground">{reg.action}</span>
                    </div>
                    {reg.signOffBy && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-mono flex items-center gap-1">
                        <User className="w-2.5 h-2.5" />
                        {reg.signOffBy}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Regulation checks — full list */}
        <div className="xl:col-span-3 bg-surface border border-border rounded-lg shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Regulation Checks</h3>
            <span className="ml-auto text-[10px] text-muted-foreground font-mono">Click to expand</span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {REGULATIONS.map((reg) => (
              <RegulationRow key={reg.id} reg={reg} />
            ))}
          </div>
        </div>

        {/* Compliance timeline */}
        <div className="xl:col-span-2 bg-surface border border-border rounded-lg shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Compliance Timeline</h3>
          </div>
          <div className="p-4">
            {COMPLIANCE_TIMELINE.map((entry, i) => (
              <TimelineEntry
                key={entry.id}
                entry={entry}
                isLast={i === COMPLIANCE_TIMELINE.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
