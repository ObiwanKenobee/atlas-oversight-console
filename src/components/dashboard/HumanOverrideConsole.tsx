import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, MessageSquare, ArrowUpCircle, ChevronDown, Shield, Lock } from "lucide-react";
import { policyCompliance } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";

const actions = [
  { id: "approve", label: "Approve Recommendation", icon: CheckCircle2, variant: "pass", requiresReason: true },
  { id: "reject",  label: "Reject Recommendation",  icon: XCircle,      variant: "danger", requiresReason: true },
  { id: "evidence",label: "Request More Evidence",   icon: MessageSquare,variant: "info",  requiresReason: true },
  { id: "escalate",label: "Escalate to Ethics Board",icon: ArrowUpCircle, variant: "warn", requiresReason: true },
] as const;

export function HumanOverrideConsole() {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!reason.trim()) return;
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setActiveAction(null); setReason(""); }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-surface border border-border rounded-lg shadow-card flex flex-col"
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Human Override Console</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Authorized decision actions — all overrides require a recorded rationale</p>
        </div>
        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Auth notice */}
        <div className="flex items-center gap-2 px-3 py-2 bg-status-info-bg border border-status-info/30 rounded-md text-xs">
          <Shield className="w-3.5 h-3.5 text-status-info shrink-0" />
          <span className="text-muted-foreground">Logged in as <span className="text-foreground font-medium">Commissioner J. Osei</span></span>
          <span className="ml-auto badge-info text-[10px] px-1.5 py-0.5 rounded font-mono">County Disaster Officer</span>
        </div>

        {/* Action buttons */}
        {!submitted ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              {actions.map(action => {
                const Icon = action.icon;
                const isActive = activeAction === action.id;
                const btnCls = {
                  pass:   "border-status-pass/40 hover:bg-status-pass-bg hover:border-status-pass/70 text-status-pass",
                  danger: "border-status-danger/40 hover:bg-status-danger-bg hover:border-status-danger/70 text-status-danger",
                  info:   "border-status-info/40 hover:bg-status-info-bg hover:border-status-info/70 text-status-info",
                  warn:   "border-status-warn/40 hover:bg-status-warn-bg hover:border-status-warn/70 text-status-warn",
                }[action.variant];
                return (
                  <button
                    key={action.id}
                    onClick={() => setActiveAction(isActive ? null : action.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-md border transition-all text-xs font-medium ${btnCls} ${isActive ? "ring-1" : ""}`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="leading-snug">{action.label}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {activeAction && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-2 pt-1">
                    <label className="text-xs font-medium text-foreground">
                      Required rationale
                      <span className="text-status-danger ml-1">*</span>
                      <span className="text-muted-foreground font-normal ml-2 text-[11px]">All override decisions are permanently recorded in the audit log.</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      rows={3}
                      placeholder="Enter your rationale for this decision. Be specific about the evidence and reasoning..."
                      className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring font-sans"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => { setActiveAction(null); setReason(""); }}
                        className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded border border-border hover:border-border-strong transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!reason.trim()}
                        className="px-4 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Confirm &amp; Record
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2 py-6"
          >
            <CheckCircle2 className="w-8 h-8 text-status-pass" />
            <p className="text-sm font-medium text-foreground">Decision recorded</p>
            <p className="text-xs text-muted-foreground">Added to audit trail with your rationale and timestamp.</p>
          </motion.div>
        )}

        {/* Policy compliance */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Shield className="w-3 h-3" />Policy compliance
          </p>
          <div className="flex flex-col gap-1.5">
            {policyCompliance.map((p, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                {p.status === "pass"
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-status-pass shrink-0 mt-0.5" />
                  : <AlertTriangle className="w-3.5 h-3.5 text-status-warn shrink-0 mt-0.5 animate-pulse-warn" />
                }
                <div>
                  <span className="font-medium text-foreground">{p.law}</span>
                  <span className="text-muted-foreground ml-2">{p.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impact preview */}
        <div className="border-t border-border pt-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Decision impact preview</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Households affected", value: "3,200", cls: "text-status-warn" },
              { label: "Estimated cost", value: "$42–58M", cls: "text-foreground" },
              { label: "Risk reduction", value: "67%", cls: "text-status-pass" },
              { label: "Social disruption", value: "High", cls: "text-status-danger" },
            ].map(({ label, value, cls }) => (
              <div key={label} className="bg-muted rounded p-2">
                <span className={`text-sm font-mono font-semibold ${cls} block`}>{value}</span>
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
