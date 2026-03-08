import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Printer, Eye, EyeOff, CheckCircle2, AlertTriangle, XCircle, Shield, Calendar, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  decisionMeta,
  reasoningFactors,
  fairnessData,
  auditEvents,
  policyCompliance,
} from "@/data/mockData";

const REPORT_DATE = "14 November 2024";
const REPORT_REF = "ATL-TRANS-2024-FP-0047-001";

function StatusBadge({ status }: { status: "pass" | "warn" | "danger" | "Flagged" | "Needs Review" | "Pending" }) {
  const map: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    pass: { label: "Satisfied", icon: <CheckCircle2 className="w-3.5 h-3.5" />, cls: "text-status-pass border-status-pass/40 bg-status-pass/10" },
    warn: { label: "Pending", icon: <AlertTriangle className="w-3.5 h-3.5" />, cls: "text-status-warn border-status-warn/40 bg-status-warn/10" },
    danger: { label: "Flagged", icon: <XCircle className="w-3.5 h-3.5" />, cls: "text-status-danger border-status-danger/40 bg-status-danger/10" },
    Flagged: { label: "Flagged", icon: <AlertTriangle className="w-3.5 h-3.5" />, cls: "text-status-danger border-status-danger/40 bg-status-danger/10" },
    "Needs Review": { label: "Needs Review", icon: <AlertTriangle className="w-3.5 h-3.5" />, cls: "text-status-warn border-status-warn/40 bg-status-warn/10" },
    Pending: { label: "Pending", icon: <Clock className="w-3.5 h-3.5" />, cls: "text-muted-foreground border-border bg-surface" },
  };
  const cfg = map[status] ?? map["warn"];
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border font-medium ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

const topFactors = reasoningFactors
  .filter((f) => f.influence > 0)
  .sort((a, b) => b.influence - a.influence)
  .slice(0, 5);

const keyFairnessAlerts = fairnessData.alerts.filter((a) => a.severity !== "low");

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 pt-5 border-t border-border first:border-0 first:pt-0">
      <h3 className="text-xs font-semibold text-foreground uppercase tracking-widest">{title}</h3>
      {children}
    </div>
  );
}

export function TransparencyReport() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    if (!reportRef.current) return;
    const printContent = reportRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Atlas Transparency Report — ${REPORT_REF}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 10pt; color: #0f1117; background: #fff; padding: 24pt; }
            h1 { font-size: 16pt; font-weight: bold; }
            h2 { font-size: 12pt; font-weight: bold; border-bottom: 1pt solid #ccc; padding-bottom: 4pt; margin-top: 16pt; }
            h3 { font-size: 10pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; }
            table { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 8pt 0; }
            th { text-align: left; border-bottom: 1pt solid #000; padding: 4pt; font-weight: bold; }
            td { padding: 4pt; border-bottom: 1pt solid #eee; vertical-align: top; }
            .badge { display: inline-block; border: 1pt solid; border-radius: 2pt; padding: 1pt 4pt; font-size: 8pt; font-weight: bold; }
            .pass { color: #15803d; border-color: #15803d; }
            .warn { color: #b45309; border-color: #b45309; }
            .danger { color: #b91c1c; border-color: #b91c1c; }
            .meta { color: #555; font-size: 9pt; }
            .notice { border: 1pt solid #ccc; padding: 8pt; margin-top: 16pt; font-size: 8pt; color: #555; }
            .bar { background: #eee; height: 6pt; border-radius: 3pt; }
            .bar-fill { background: #374151; height: 6pt; border-radius: 3pt; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-surface flex items-center justify-center border border-border flex-shrink-0">
            <FileText className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Public Transparency Report</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Simplified non-technical summary for public disclosure and regulatory submission.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPreviewOpen((v) => !v)}
            className="gap-1.5 text-xs"
          >
            {previewOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {previewOpen ? "Close Preview" : "Preview"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            className="gap-1.5 text-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF
          </Button>
        </div>
      </div>

      {/* Report info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { icon: Hash, label: "Reference", value: REPORT_REF },
          { icon: Calendar, label: "Generated", value: REPORT_DATE },
          { icon: Shield, label: "Ethical Status", value: decisionMeta.ethicsStatus },
          { icon: FileText, label: "Model", value: decisionMeta.modelVersion },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded border border-border bg-surface/50 px-3 py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className="w-3 h-3 text-accent" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
            </div>
            <span className="text-xs font-mono text-foreground font-semibold">{value}</span>
          </div>
        ))}
      </div>

      {/* Preview */}
      {previewOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded border border-border bg-background overflow-hidden"
        >
          {/* Report content */}
          <div ref={reportRef} className="p-6 sm:p-8 flex flex-col gap-6 text-foreground">
            {/* Cover */}
            <div className="flex flex-col gap-1 pb-5 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-[9px] font-bold text-primary-foreground font-mono">A</span>
                </div>
                <span className="text-sm font-semibold text-foreground">Atlas Ethical AI Oversight System</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Public Transparency Report</h1>
              <p className="text-sm text-muted-foreground">{decisionMeta.title}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground font-mono">
                <span>Ref: {REPORT_REF}</span>
                <span>Date: {REPORT_DATE}</span>
                <span>Decision: {decisionMeta.id}</span>
                <span>Model: {decisionMeta.modelVersion}</span>
              </div>
            </div>

            <ReportSection title="1. Decision Summary">
              <div className="rounded border border-border bg-surface/50 p-4 flex flex-col gap-3">
                <p className="text-sm font-medium text-foreground">{decisionMeta.recommendation}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Confidence", value: `${decisionMeta.confidence}% (${decisionMeta.confidenceLabel})` },
                    { label: "Risk Level", value: decisionMeta.riskLevel },
                    { label: "Households Affected", value: decisionMeta.populationAffected.toLocaleString() },
                    { label: "Estimated Cost", value: decisionMeta.estimatedCost },
                    { label: "Risk Reduction", value: decisionMeta.riskReduction },
                    { label: "Timeframe", value: "18 months" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block">{label}</span>
                      <span className="text-sm font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This recommendation was generated by Atlas v3.8.2 on{" "}
                {new Date(decisionMeta.timestamp).toLocaleString()}. It is advisory and requires human review before
                any action is taken. Human oversight is always possible and has been engaged in this case.
              </p>
            </ReportSection>

            <ReportSection title="2. Key Evidence Used">
              <p className="text-xs text-muted-foreground">
                The following factors had the greatest influence on the recommendation. Each factor is derived from
                verified data sources. Influence is rated on a scale of 0–100%.
              </p>
              <div className="flex flex-col gap-2">
                {topFactors.map((f) => (
                  <div key={f.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">{f.label}</span>
                      <span className="font-mono text-muted-foreground">Source: {f.source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent/70 rounded-full transition-all"
                          style={{ width: `${f.influence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-10 text-right">{Math.round(f.influence * 100)}%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{f.note}</p>
                  </div>
                ))}
              </div>
            </ReportSection>

            <ReportSection title="3. Fairness & Community Impact">
              <div className="flex items-center gap-2 rounded border border-status-danger/30 bg-status-danger/5 px-3 py-2.5 text-xs text-status-danger">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Fairness analysis has identified significant concerns. Ethics Board review has been triggered and is
                  in progress. Final approval is withheld pending resolution.
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {keyFairnessAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-2 text-xs">
                    <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${alert.severity === "high" ? "text-status-danger" : "text-status-warn"}`} />
                    <div>
                      <span className={`font-medium ${alert.severity === "high" ? "text-status-danger" : "text-status-warn"}`}>
                        {alert.dimension}: </span>
                      <span className="text-muted-foreground">{alert.message}</span>
                      <span className="block text-muted-foreground/70 mt-0.5">Action: {alert.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ReportSection>

            <ReportSection title="4. Policy & Legal Compliance">
              <div className="flex flex-col gap-2">
                {policyCompliance.map((p) => (
                  <div key={p.law} className="flex items-start justify-between gap-3 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground">{p.law}</span>
                      <span className="text-muted-foreground">{p.note}</span>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </div>
            </ReportSection>

            <ReportSection title="5. Review & Audit Log">
              <p className="text-xs text-muted-foreground">
                The following is a summary of human oversight actions taken during this decision process.
              </p>
              <div className="flex flex-col gap-2">
                {auditEvents.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-2.5 text-xs">
                    <span className="font-mono text-muted-foreground shrink-0">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <div>
                      <span className="font-medium text-foreground">{ev.event}</span>
                      <span className="text-muted-foreground"> — {ev.actor} ({ev.actorRole})</span>
                      <p className="text-muted-foreground/70 mt-0.5">{ev.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ReportSection>

            {/* Footer disclaimer */}
            <div className="pt-4 border-t border-border text-[10px] text-muted-foreground leading-relaxed">
              <p>
                <strong>Disclaimer:</strong> This report is generated from the Atlas Ethical AI Oversight System. All
                recommendations are advisory and subject to human review. This document does not constitute a final
                administrative decision. Affected parties have the right to formally appeal any recommendation through
                the established disputes process. This report is intended for public disclosure in accordance with
                transparency obligations under the Ethical AI Governance Standards 2023.
              </p>
              <p className="mt-2 font-mono">
                Reference: {REPORT_REF} · Generated: {REPORT_DATE} · Model: {decisionMeta.modelVersion} · Decision: {decisionMeta.id}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {!previewOpen && (
        <div className="rounded border border-dashed border-border bg-surface/30 px-4 py-8 flex flex-col items-center gap-3 text-center">
          <FileText className="w-8 h-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Transparency Report Ready</p>
            <p className="text-xs text-muted-foreground mt-1">
              Covers decision summary, key evidence, fairness flags, policy compliance, and the full audit trail.
              Suitable for public disclosure and regulatory submission.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setPreviewOpen(true)} className="gap-1.5 text-xs">
              <Eye className="w-3.5 h-3.5" />
              Preview Report
            </Button>
            <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" />
              Export as PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
