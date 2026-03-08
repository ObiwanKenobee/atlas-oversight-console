import { useState } from "react";
import { DecisionSummaryBar } from "@/components/dashboard/DecisionSummaryBar";
import { ReasoningPanel } from "@/components/dashboard/ReasoningPanel";
import { ProvenancePanel } from "@/components/dashboard/ProvenancePanel";
import { UncertaintyPanel } from "@/components/dashboard/UncertaintyPanel";
import { FairnessPanel } from "@/components/dashboard/FairnessPanel";
import { AlternativesPanel } from "@/components/dashboard/AlternativesPanel";
import { AuditTrail } from "@/components/dashboard/AuditTrail";
import { HumanOverrideConsole } from "@/components/dashboard/HumanOverrideConsole";
import { AlertCenter } from "@/components/dashboard/AlertCenter";
import { DataHealthMonitor } from "@/components/dashboard/DataHealthMonitor";
import { CounterfactualBuilder } from "@/components/dashboard/CounterfactualBuilder";
import { TransparencyReport } from "@/components/dashboard/TransparencyReport";
import { ModelVersionComparison } from "@/components/dashboard/ModelVersionComparison";
import { AppealsWorkflow } from "@/components/dashboard/AppealsWorkflow";
import {
  LayoutGrid,
  Eye,
  Scale,
  History,
  Activity,
  FlaskConical,
  FileText,
  GitCompare,
  Gavel,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_TABS = [
  { id: "overview",       label: "Overview",            icon: LayoutGrid  },
  { id: "reasoning",      label: "Reasoning",           icon: Eye         },
  { id: "fairness",       label: "Fairness & Risk",     icon: Scale       },
  { id: "audit",          label: "Audit Trail",         icon: History     },
  { id: "health",         label: "Data Health",         icon: Activity    },
  { id: "scenarios",      label: "Scenarios",           icon: FlaskConical },
  { id: "versions",       label: "Model Versions",      icon: GitCompare  },
  { id: "appeals",        label: "Appeals",             icon: Gavel       },
  { id: "report",         label: "Report",              icon: FileText    },
] as const;

type TabId = (typeof NAV_TABS)[number]["id"];

// Split nav into two rows: primary (always shown) and secondary (overflow)
const PRIMARY_TABS = NAV_TABS.slice(0, 5);
const SECONDARY_TABS = NAV_TABS.slice(5);

function NavBar({ activeTab, setActiveTab }: { activeTab: TabId; setActiveTab: (t: TabId) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Wordmark */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground font-mono">A</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground tracking-tight">Atlas</span>
                <span className="hidden sm:inline text-xs text-muted-foreground ml-2">Ethical AI Oversight</span>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <ChevronRight className="w-3 h-3" />
              <span>ATL-2024-FP-0047</span>
            </div>
          </div>

          {/* Desktop nav — primary row */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? "bg-surface text-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </nav>

          {/* Tablet: primary only */}
          <nav className="hidden md:flex lg:hidden items-center gap-1">
            {PRIMARY_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                  activeTab === id
                    ? "bg-surface text-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </nav>

          {/* Right: version + mobile toggle */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-2 text-xs font-mono text-muted-foreground border border-border rounded px-2 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-status-pass animate-pulse" />
              Atlas v3.8.2
            </span>
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {/* Tablet extra menu */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="hidden md:flex lg:hidden items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded px-2 py-1"
            >
              <Menu className="w-3.5 h-3.5" />
              More
            </button>
          </div>
        </div>

        {/* Mobile/overflow nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="py-2 flex flex-col gap-1">
                {/* On mobile show all; on tablet show secondary only */}
                {NAV_TABS.filter(t =>
                  // on mobile show all
                  window.innerWidth < 768 ||
                  // on tablet show secondary (overflow)
                  SECONDARY_TABS.some(s => s.id === t.id)
                ).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => { setActiveTab(id); setMobileOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                      activeTab === id ? "bg-surface text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />{label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5 flex flex-col gap-4">
        {/* Always-visible alert center */}
        <AlertCenter />

        {/* Always-visible decision summary bar */}
        <DecisionSummaryBar />

        {/* Tab-gated content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <ReasoningPanel />
                <UncertaintyPanel />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <AlternativesPanel />
                <HumanOverrideConsole />
              </div>
            </motion.div>
          )}

          {activeTab === "reasoning" && (
            <motion.div key="reasoning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4">
              <ReasoningPanel />
              <ProvenancePanel />
              <UncertaintyPanel />
            </motion.div>
          )}

          {activeTab === "fairness" && (
            <motion.div key="fairness" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4">
              <FairnessPanel />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <AlternativesPanel />
                <HumanOverrideConsole />
              </div>
            </motion.div>
          )}

          {activeTab === "audit" && (
            <motion.div key="audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4">
              <AuditTrail />
              <ProvenancePanel />
            </motion.div>
          )}

          {activeTab === "health" && (
            <motion.div key="health" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4">
              <DataHealthMonitor />
              <ProvenancePanel />
            </motion.div>
          )}

          {activeTab === "scenarios" && (
            <motion.div key="scenarios" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4">
              <CounterfactualBuilder />
              <UncertaintyPanel />
            </motion.div>
          )}

          {activeTab === "versions" && (
            <motion.div key="versions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4">
              <ModelVersionComparison />
            </motion.div>
          )}

          {activeTab === "appeals" && (
            <motion.div key="appeals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4">
              <AppealsWorkflow />
              <AuditTrail />
            </motion.div>
          )}

          {activeTab === "report" && (
            <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4">
              <TransparencyReport />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-border py-4">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            Atlas Ethical AI Oversight · Decision ATL-2024-FP-0047 · Model v3.8.2
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            This system is advisory. Human review and override is always possible and required for high-risk decisions.
          </span>
        </div>
      </footer>
    </div>
  );
}
