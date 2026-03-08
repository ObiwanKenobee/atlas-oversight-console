import { auditEvents, modelVersionHistory } from "@/data/mockData";
import { Bot, User, AlertTriangle, Database, GitBranch, Scale, CheckCircle2, ChevronDown, ChevronUp, Download, Filter } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type AuditEvent = (typeof auditEvents)[0];

function EventIcon({ type }: { type: AuditEvent["type"] }) {
  const map = {
    model_output:           { Icon: Bot, cls: "text-status-info bg-status-info-bg" },
    human_review:           { Icon: User, cls: "text-status-pass bg-status-pass-bg" },
    ethics_flag:            { Icon: Scale, cls: "text-status-warn bg-status-warn-bg" },
    data_alert:             { Icon: Database, cls: "text-status-warn bg-status-warn-bg" },
    alternative_generated:  { Icon: GitBranch, cls: "text-status-neutral bg-status-neutral-bg" },
    human_override:         { Icon: CheckCircle2, cls: "text-status-pass bg-status-pass-bg" },
    policy_check:           { Icon: Scale, cls: "text-status-warn bg-status-warn-bg" },
    escalation:             { Icon: AlertTriangle, cls: "text-status-danger bg-status-danger-bg" },
  } as const;
  const { Icon, cls } = map[type] ?? { Icon: Bot, cls: "text-muted-foreground bg-muted" };
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${cls}`}>
      <Icon className="w-3.5 h-3.5" />
    </div>
  );
}

function EventRow({ event, isLast }: { event: AuditEvent; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  const time = new Date(event.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="flex gap-3">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <EventIcon type={event.type} />
        {!isLast && <div className="w-px flex-1 bg-border mt-1 min-h-[20px]" />}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-4 ${isLast ? "pb-0" : ""}`}>
        <button onClick={() => setOpen(v => !v)} className="w-full text-left group">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-foreground">{event.event}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  (event.status as string) === "pass" ? "badge-pass" :
                  (event.status as string) === "warn" ? "badge-warn" :
                  (event.status as string) === "danger" ? "badge-danger" : "badge-neutral"
                }`}>{event.actorRole}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground font-mono">{time}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{event.actor}</span>
              </div>
            </div>
            <div className="shrink-0 mt-0.5">
              {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
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
              <div className="mt-2 bg-muted rounded-md p-3 border border-border">
                <p className="text-xs text-foreground leading-relaxed">{event.detail}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground font-mono">
                  <span>Model: {event.modelVersion}</span>
                  <span>·</span>
                  <span>Decision ID: ATL-2024-FP-0047</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function AuditTrail() {
  const [showVersions, setShowVersions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="bg-surface border border-border rounded-lg shadow-card flex flex-col"
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Audit Trail & Review Log</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Full institutional memory — who did what, when, and why</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-border-strong">
            <Filter className="w-3 h-3" />Filter
          </button>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-border-strong">
            <Download className="w-3 h-3" />Export
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1">
        {/* Timeline */}
        <div className="flex-1 p-4 overflow-y-auto max-h-[600px]">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Decision timeline · 2024-11-14
          </p>
          <div className="flex flex-col">
            {auditEvents.map((event, i) => (
              <EventRow key={event.id} event={event} isLast={i === auditEvents.length - 1} />
            ))}
          </div>
        </div>

        {/* Model version history sidebar */}
        <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-border p-4 flex flex-col gap-3">
          <button
            onClick={() => setShowVersions(v => !v)}
            className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-1.5"><GitBranch className="w-3.5 h-3.5" />Model Version History</span>
            {showVersions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {showVersions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-2">
                  {modelVersionHistory.map((v, i) => (
                    <div key={v.version} className={`rounded-md p-2.5 border ${i === 0 ? "border-primary/30 bg-primary-muted/20" : "border-border bg-muted/30"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-semibold text-foreground">{v.version}</span>
                        {i === 0 && <span className="badge-info text-[10px] px-1.5 py-0.5 rounded font-mono">Current</span>}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono block mb-1.5">{v.date}</span>
                      <ul className="space-y-0.5">
                        {v.changes.map((c, j) => (
                          <li key={j} className="text-[11px] text-muted-foreground flex gap-1.5">
                            <span className="text-status-info shrink-0">·</span>{c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary stats */}
          <div className="border-t border-border pt-3 mt-auto">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Audit summary</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Events logged", value: auditEvents.length.toString() },
                { label: "Human actors", value: "3" },
                { label: "Flags raised", value: "2" },
                { label: "Overrides", value: "1" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-muted rounded p-2 text-center">
                  <span className="text-sm font-mono font-semibold text-foreground">{value}</span>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
