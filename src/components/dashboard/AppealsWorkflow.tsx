import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  Plus,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  Upload,
  Send,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AppealStatus = "submitted" | "under_review" | "escalated" | "resolved_upheld" | "resolved_overturned";
type AppealGrounds = "methodology" | "data_quality" | "fairness" | "policy" | "new_evidence" | "other";

interface Appeal {
  id: string;
  submitter: string;
  role: string;
  grounds: AppealGrounds;
  summary: string;
  detail: string;
  submittedAt: string;
  status: AppealStatus;
  resolution?: string;
  stages: { label: string; completedAt: string | null; actor: string | null }[];
}

const GROUNDS_LABELS: Record<AppealGrounds, string> = {
  methodology: "Methodological challenge",
  data_quality: "Data quality / staleness",
  fairness: "Fairness / disparate impact",
  policy: "Policy compliance concern",
  new_evidence: "New or missing evidence",
  other: "Other grounds",
};

const SAMPLE_APPEALS: Appeal[] = [
  {
    id: "APL-2024-001",
    submitter: "Sector 7 Community Council",
    role: "Affected Community Representative",
    grounds: "fairness",
    summary: "Relocation scoring disproportionately targets low-income households despite equivalent flood exposure.",
    detail:
      "Our analysis shows that mid-income households in adjacent flood zones with identical satellite exposure scores received urgency scores 23 points lower than low-income households in Sector 7. The model's drainage score appears to encode historic under-investment as a fairness-neutral variable.",
    submittedAt: "2024-11-15T10:30:00Z",
    status: "escalated",
    resolution: undefined,
    stages: [
      { label: "Submitted", completedAt: "2024-11-15T10:30:00Z", actor: "Sector 7 Community Council" },
      { label: "Acknowledged", completedAt: "2024-11-15T11:00:00Z", actor: "Ethics Review Officer" },
      { label: "Under Review", completedAt: "2024-11-16T09:00:00Z", actor: "Ethics Board" },
      { label: "Escalated", completedAt: "2024-11-17T14:00:00Z", actor: "P. Adeyemi" },
      { label: "Resolution", completedAt: null, actor: null },
    ],
  },
  {
    id: "APL-2024-002",
    submitter: "Regional Infrastructure Authority",
    role: "Data Owner",
    grounds: "data_quality",
    summary: "Drainage condition survey data is outdated. Updated survey available for zones 7B and 7D.",
    detail:
      "The drainage survey used (June 2023) has been superseded. An updated field assessment was completed in October 2024, showing 15% improvement in drainage capacity in 7B and 7D. This material change was not reflected in the model inputs.",
    submittedAt: "2024-11-14T16:00:00Z",
    status: "under_review",
    resolution: undefined,
    stages: [
      { label: "Submitted", completedAt: "2024-11-14T16:00:00Z", actor: "Regional Infrastructure Authority" },
      { label: "Acknowledged", completedAt: "2024-11-14T16:30:00Z", actor: "Atlas Data Monitor" },
      { label: "Under Review", completedAt: "2024-11-15T09:00:00Z", actor: "Dr. S. Mensah" },
      { label: "Escalated", completedAt: null, actor: null },
      { label: "Resolution", completedAt: null, actor: null },
    ],
  },
];

const STATUS_CONFIG: Record<
  AppealStatus,
  { label: string; color: string; bgBorder: string; icon: React.ReactNode }
> = {
  submitted: {
    label: "Submitted",
    color: "text-muted-foreground",
    bgBorder: "bg-surface border-border",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  under_review: {
    label: "Under Review",
    color: "text-status-warn",
    bgBorder: "bg-status-warn/10 border-status-warn/30",
    icon: <Eye className="w-3.5 h-3.5" />,
  },
  escalated: {
    label: "Escalated",
    color: "text-accent",
    bgBorder: "bg-accent/10 border-accent/30",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  resolved_upheld: {
    label: "Resolved — Upheld",
    color: "text-status-pass",
    bgBorder: "bg-status-pass/10 border-status-pass/30",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  resolved_overturned: {
    label: "Resolved — Overturned",
    color: "text-status-danger",
    bgBorder: "bg-status-danger/10 border-status-danger/30",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

function StageTracker({ stages }: { stages: Appeal["stages"] }) {
  const completedCount = stages.filter((s) => s.completedAt).length;
  return (
    <div className="flex items-center gap-0">
      {stages.map((stage, i) => {
        const done = !!stage.completedAt;
        const active = i === completedCount - 1;
        const isLast = i === stages.length - 1;
        return (
          <div key={stage.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border text-[9px] font-bold transition-colors ${
                  done
                    ? active
                      ? "bg-accent border-accent text-accent-foreground"
                      : "bg-status-pass/20 border-status-pass text-status-pass"
                    : "bg-surface border-border text-muted-foreground"
                }`}
              >
                {done ? (active ? i + 1 : "✓") : i + 1}
              </div>
              <span className="text-[9px] text-muted-foreground text-center w-12 leading-tight">{stage.label}</span>
            </div>
            {!isLast && (
              <div
                className={`h-px w-6 mb-4 transition-colors ${
                  stages[i + 1]?.completedAt ? "bg-status-pass/50" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function AppealCard({ appeal }: { appeal: Appeal }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[appeal.status];

  return (
    <div className="rounded border border-border bg-surface/50 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 hover:bg-surface transition-colors"
      >
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">{appeal.id}</span>
            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded border font-medium ${cfg.bgBorder} ${cfg.color}`}>
              {cfg.icon}{cfg.label}
            </span>
            <span className="text-xs px-2 py-0.5 rounded border border-border bg-surface text-muted-foreground">
              {GROUNDS_LABELS[appeal.grounds]}
            </span>
          </div>
          <p className="text-xs font-medium text-foreground">{appeal.summary}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{appeal.submitter}</span>
            <span>·</span>
            <span>{appeal.role}</span>
            <span>·</span>
            <span>{new Date(appeal.submittedAt).toLocaleDateString()}</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-4 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground leading-relaxed">{appeal.detail}</p>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-3 block">Review Progress</span>
                <div className="overflow-x-auto">
                  <StageTracker stages={appeal.stages} />
                </div>
              </div>
              {appeal.stages.map((s) => s.completedAt && (
                <div key={s.label} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-3 h-3 text-status-pass shrink-0" />
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-foreground">{s.actor}</span>
                  <span className="text-muted-foreground ml-auto font-mono">
                    {new Date(s.completedAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const GROUNDS_OPTIONS: AppealGrounds[] = [
  "methodology",
  "data_quality",
  "fairness",
  "policy",
  "new_evidence",
  "other",
];

export function AppealsWorkflow() {
  const [appeals, setAppeals] = useState<Appeal[]>(SAMPLE_APPEALS);
  const [showForm, setShowForm] = useState(false);
  const [submitter, setSubmitter] = useState("");
  const [role, setRole] = useState("");
  const [grounds, setGrounds] = useState<AppealGrounds>("fairness");
  const [summary, setSummary] = useState("");
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!submitter.trim()) e.submitter = "Submitter name is required";
    if (!role.trim()) e.role = "Role is required";
    if (!summary.trim()) e.summary = "Summary is required";
    if (summary.trim().length < 20) e.summary = "Please provide a summary of at least 20 characters";
    if (!detail.trim()) e.detail = "Detailed grounds are required";
    if (detail.trim().length < 50) e.detail = "Please provide at least 50 characters of detail";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const newAppeal: Appeal = {
      id: `APL-2024-00${appeals.length + 1}`,
      submitter: submitter.trim(),
      role: role.trim(),
      grounds,
      summary: summary.trim(),
      detail: detail.trim(),
      submittedAt: new Date().toISOString(),
      status: "submitted",
      stages: [
        { label: "Submitted", completedAt: new Date().toISOString(), actor: submitter.trim() },
        { label: "Acknowledged", completedAt: null, actor: null },
        { label: "Under Review", completedAt: null, actor: null },
        { label: "Escalated", completedAt: null, actor: null },
        { label: "Resolution", completedAt: null, actor: null },
      ],
    };

    setAppeals((prev) => [newAppeal, ...prev]);
    setSubmitted(true);
    setSubmitter("");
    setRole("");
    setSummary("");
    setDetail("");
    setGrounds("fairness");
    setErrors({});
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
    }, 3000);
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-surface flex items-center justify-center border border-border flex-shrink-0">
            <Scale className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Appeals & Dispute Workflow</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Authorized parties may formally challenge the AI recommendation with supporting evidence.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm((v) => !v)}
          className="gap-1.5 text-xs shrink-0"
        >
          {showForm ? <ChevronUp className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? "Close" : "Submit Appeal"}
        </Button>
      </div>

      {/* New appeal form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="rounded border border-accent/20 bg-accent/5 p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-foreground">New Formal Appeal — ATL-2024-FP-0047</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">Submitter Name *</Label>
                  <Input
                    value={submitter}
                    onChange={(e) => setSubmitter(e.target.value)}
                    placeholder="e.g. Sector 7 Community Council"
                    className="text-xs h-8"
                    maxLength={120}
                  />
                  {errors.submitter && <span className="text-[10px] text-status-danger">{errors.submitter}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">Role / Organisation *</Label>
                  <Input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Affected Community Representative"
                    className="text-xs h-8"
                    maxLength={120}
                  />
                  {errors.role && <span className="text-[10px] text-status-danger">{errors.role}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Grounds for Appeal *</Label>
                <div className="flex flex-wrap gap-2">
                  {GROUNDS_OPTIONS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGrounds(g)}
                      className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                        grounds === g
                          ? "bg-accent/20 border-accent text-accent font-medium"
                          : "bg-surface border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {GROUNDS_LABELS[g]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Summary (1–2 sentences) *</Label>
                <Input
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief statement of the challenge..."
                  className="text-xs h-8"
                  maxLength={300}
                />
                {errors.summary && <span className="text-[10px] text-status-danger">{errors.summary}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Detailed Grounds & Supporting Evidence *</Label>
                <Textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="Describe in detail the basis for this challenge, referencing specific data, methodology, or policy concerns..."
                  className="text-xs min-h-[100px] resize-none"
                  maxLength={2000}
                />
                <span className="text-[10px] text-muted-foreground self-end">{detail.length}/2000</span>
                {errors.detail && <span className="text-[10px] text-status-danger">{errors.detail}</span>}
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Document upload available in full deployment</span>
                </div>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={submitted}
                  className="gap-1.5 text-xs"
                >
                  {submitted ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Appeal Submitted
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit Formal Appeal
                    </>
                  )}
                </Button>
              </div>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-xs text-status-pass bg-status-pass/10 border border-status-pass/30 rounded px-3 py-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Appeal submitted. You will receive acknowledgement within 24 hours. Reference number assigned.</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Total Appeals", value: appeals.length, color: "text-foreground" },
          { label: "Under Review", value: appeals.filter((a) => a.status === "under_review").length, color: "text-status-warn" },
          { label: "Escalated", value: appeals.filter((a) => a.status === "escalated").length, color: "text-accent" },
          { label: "Resolved", value: appeals.filter((a) => a.status.startsWith("resolved")).length, color: "text-status-pass" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded border border-border bg-surface/50 px-3 py-2 text-center">
            <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
            <div className="text-[10px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Appeals list */}
      <div className="flex flex-col gap-2">
        {appeals.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground">No appeals submitted for this decision.</div>
        )}
        {appeals.map((appeal) => (
          <AppealCard key={appeal.id} appeal={appeal} />
        ))}
      </div>

      {/* Governance notice */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-surface/50 rounded border border-border px-3 py-2.5">
        <Scale className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent" />
        <p>
          All formal appeals are logged to the immutable audit trail. Submissions require a written rationale and are
          reviewed by the Ethics Board within 5 working days. All parties are notified of outcomes.
        </p>
      </div>
    </div>
  );
}
