import { useState, useCallback, useRef } from "react";
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
import { DecisionComparison } from "@/components/dashboard/DecisionComparison";
import { GovernanceSummary } from "@/components/dashboard/GovernanceSummary";
import { PolicyCompliancePanel } from "@/components/dashboard/PolicyCompliancePanel";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { useNotifications } from "@/hooks/use-notifications";
import { useSimulation } from "@/hooks/use-simulation";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useTheme } from "next-themes";
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
  Columns,
  Building2,
  Sun,
  Moon,
  Zap,
  ZapOff,
  Shield,
  Keyboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_TABS = [
  { id: "overview",    label: "Overview",        icon: LayoutGrid,  shortcut: "1" },
  { id: "reasoning",   label: "Reasoning",       icon: Eye,         shortcut: "2" },
  { id: "fairness",    label: "Fairness & Risk",  icon: Scale,       shortcut: "3" },
  { id: "audit",       label: "Audit Trail",     icon: History,     shortcut: "4" },
  { id: "health",      label: "Data Health",     icon: Activity,    shortcut: "5" },
  { id: "scenarios",   label: "Scenarios",       icon: FlaskConical, shortcut: "6" },
  { id: "versions",    label: "Model Versions",  icon: GitCompare,  shortcut: "7" },
  { id: "appeals",     label: "Appeals",         icon: Gavel,       shortcut: "8" },
  { id: "compare",     label: "Compare",         icon: Columns,     shortcut: "9" },
  { id: "compliance",  label: "Compliance",      icon: Shield,      shortcut: "0" },
  { id: "governance",  label: "Governance",      icon: Building2,   shortcut: null },
  { id: "report",      label: "Report",          icon: FileText,    shortcut: null },
] as const;

type TabId = (typeof NAV_TABS)[number]["id"];

const PRIMARY_TABS = NAV_TABS.slice(0, 5);
const SECONDARY_TABS = NAV_TABS.slice(5);

// ── Theme Toggle ──────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="hidden sm:flex items-center justify-center w-7 h-7 rounded border border-border text-muted-foreground hover:text-foreground hover:border-border-strong transition-colors"
    >
      {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── Keyboard Shortcut Modal ───────────────────────────────────────────────────

function ShortcutModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-xl shadow-elevated w-full max-w-md flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground">Keyboard Shortcuts</h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close shortcuts"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col gap-5">
            {/* Tab navigation */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-3">Tab Navigation</p>
              <div className="grid grid-cols-2 gap-1.5">
                {NAV_TABS.filter((t) => t.shortcut && t.shortcut !== "0").map((tab) => (
                  <div key={tab.id} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      <tab.icon className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-foreground">{tab.label}</span>
                    </div>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-muted-foreground">
                      {tab.shortcut}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Global shortcuts */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-3">Global</p>
              <div className="flex flex-col gap-1.5">
                {[
                  { key: "?", label: "Open keyboard shortcuts" },
                  { key: "←", label: "Previous tab (in nav focus)" },
                  { key: "→", label: "Next tab (in nav focus)" },
                  { key: "Home", label: "First tab (in nav focus)" },
                  { key: "End", label: "Last tab (in nav focus)" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded bg-muted/50">
                    <span className="text-xs text-foreground">{label}</span>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-muted-foreground whitespace-nowrap">
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              Shortcuts are disabled when focus is inside an input field.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── NavBar ────────────────────────────────────────────────────────────────────

interface NavBarProps {
  activeTab: TabId;
  setActiveTab: (t: TabId) => void;
  tabBadges: Record<string, number>;
  unreadCount: number;
  notifications: ReturnType<typeof useNotifications>["notifications"];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
  simEnabled: boolean;
  onToggleSim: () => void;
  onOpenShortcuts: () => void;
}

function NavBar({
  activeTab,
  setActiveTab,
  tabBadges,
  unreadCount,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  simEnabled,
  onToggleSim,
  onOpenShortcuts,
}: NavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keyboard arrow navigation within the nav
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: number) => {
      const tabs = NAV_TABS;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = (idx + 1) % tabs.length;
        tabRefs.current[next]?.focus();
        setActiveTab(tabs[next].id);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = (idx - 1 + tabs.length) % tabs.length;
        tabRefs.current[prev]?.focus();
        setActiveTab(tabs[prev].id);
      } else if (e.key === "Home") {
        e.preventDefault();
        tabRefs.current[0]?.focus();
        setActiveTab(tabs[0].id);
      } else if (e.key === "End") {
        e.preventDefault();
        tabRefs.current[tabs.length - 1]?.focus();
        setActiveTab(tabs[tabs.length - 1].id);
      }
    },
    [setActiveTab]
  );

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Wordmark */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground font-mono" aria-hidden="true">A</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground tracking-tight">Atlas</span>
                <span className="hidden sm:inline text-xs text-muted-foreground ml-2">Ethical AI Oversight</span>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <span>ATL-2024-FP-0047</span>
            </div>
          </div>

          {/* Desktop nav */}
          <nav
            aria-label="Dashboard sections"
            className="hidden lg:flex items-center gap-1"
            role="tablist"
          >
            {NAV_TABS.map(({ id, label, icon: Icon, shortcut }, idx) => {
              const badge = tabBadges[id] ?? 0;
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  ref={(el) => { tabRefs.current[idx] = el; }}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${id}`}
                  id={`tab-${id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTab(id)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  title={shortcut ? `${label} (${shortcut})` : label}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-surface text-foreground border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {label}
                  {badge > 0 && (
                    <span
                      aria-label={`${badge} unread`}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-status-danger text-[9px] font-bold text-primary-foreground flex items-center justify-center"
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Tablet: primary only */}
          <nav className="hidden md:flex lg:hidden items-center gap-1" aria-label="Primary dashboard sections">
            {PRIMARY_TABS.map(({ id, label, icon: Icon }) => {
              const badge = tabBadges[id] ?? 0;
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={activeTab === id}
                  onClick={() => setActiveTab(id)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                    activeTab === id
                      ? "bg-surface text-foreground border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {label}
                  {badge > 0 && (
                    <span aria-label={`${badge} unread`} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-status-danger text-[9px] font-bold text-primary-foreground flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Live simulation toggle */}
            <button
              onClick={onToggleSim}
              aria-label={simEnabled ? "Stop live simulation" : "Start live simulation"}
              aria-pressed={simEnabled}
              title={simEnabled ? "Live simulation ON — alerts fire every 30 s" : "Start live simulation"}
              className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-medium transition-colors ${
                simEnabled
                  ? "border-status-pass text-status-pass bg-status-pass-bg"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {simEnabled ? (
                <>
                  <Zap className="w-3 h-3" aria-hidden="true" />
                  <span className="hidden md:inline">Live</span>
                </>
              ) : (
                <>
                  <ZapOff className="w-3 h-3" aria-hidden="true" />
                  <span className="hidden md:inline">Simulate</span>
                </>
              )}
            </button>

            {/* Keyboard shortcuts help button */}
            <button
              onClick={onOpenShortcuts}
              aria-label="Keyboard shortcuts (?)"
              title="Keyboard shortcuts (?)"
              className="hidden sm:flex items-center justify-center w-7 h-7 rounded border border-border text-muted-foreground hover:text-foreground hover:border-border-strong transition-colors"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </button>

            <ThemeToggle />

            <NotificationCenter
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkRead={onMarkRead}
              onMarkAllRead={onMarkAllRead}
              onDismiss={onDismiss}
            />
            <span className="hidden sm:flex items-center gap-2 text-xs font-mono text-muted-foreground border border-border rounded px-2 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-status-pass animate-pulse" aria-hidden="true" />
              Atlas v3.8.2
            </span>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
              className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="More navigation options"
              aria-expanded={mobileOpen}
              className="hidden md:flex lg:hidden items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded px-2 py-1"
            >
              <Menu className="w-3.5 h-3.5" aria-hidden="true" />
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
              role="navigation"
              aria-label="Mobile navigation"
            >
              <div className="py-2 flex flex-col gap-1">
                {NAV_TABS.filter((t) =>
                  typeof window !== "undefined"
                    ? window.innerWidth < 768 || SECONDARY_TABS.some((s) => s.id === t.id)
                    : true
                ).map(({ id, label, icon: Icon }) => {
                  const badge = tabBadges[id] ?? 0;
                  return (
                    <button
                      key={id}
                      role="tab"
                      aria-selected={activeTab === id}
                      onClick={() => { setActiveTab(id); setMobileOpen(false); }}
                      className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                        activeTab === id ? "bg-surface text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      {label}
                      {badge > 0 && (
                        <span aria-label={`${badge} unread`} className="ml-auto w-5 h-5 rounded-full bg-status-danger text-[9px] font-bold text-primary-foreground flex items-center justify-center">
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
                {/* Mobile: sim + shortcuts */}
                <div className="flex items-center gap-2 px-3 py-2 border-t border-border mt-1 pt-2">
                  <button
                    onClick={onToggleSim}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-medium transition-colors ${
                      simEnabled
                        ? "border-status-pass text-status-pass bg-status-pass-bg"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {simEnabled ? <Zap className="w-3 h-3" /> : <ZapOff className="w-3 h-3" />}
                    {simEnabled ? "Live ON" : "Simulate"}
                  </button>
                  <button
                    onClick={() => { onOpenShortcuts(); setMobileOpen(false); }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded border border-border text-xs text-muted-foreground"
                  >
                    <Keyboard className="w-3 h-3" />
                    Shortcuts
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [simEnabled, setSimEnabled] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const {
    notifications,
    addNotification,
    markRead,
    markAllRead,
    dismiss,
    tabBadges,
    unreadCount,
  } = useNotifications();

  // Live simulation — fires breach events every 30 s when enabled
  useSimulation(simEnabled);

  // Global keyboard shortcuts: 1–9 → tabs, ? → shortcuts modal
  useKeyboardShortcuts({
    tabs: NAV_TABS as unknown as { id: string }[],
    setActiveTab: setActiveTab as (id: string) => void,
    onHelpOpen: () => setShortcutsOpen(true),
  });

  const mainRef = useRef<HTMLElement>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Skip-to-main link */}
      <a
        href="#main-content"
        onClick={(e) => { e.preventDefault(); mainRef.current?.focus(); }}
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-card focus:border focus:border-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground"
      >
        Skip to main content
      </a>

      <NavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabBadges={tabBadges}
        unreadCount={unreadCount}
        notifications={notifications}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onDismiss={dismiss}
        simEnabled={simEnabled}
        onToggleSim={() => setSimEnabled((v) => !v)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />

      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5 flex flex-col gap-4 outline-none"
        aria-label="Dashboard content"
      >
        {/* ARIA live region */}
        <div aria-live="polite" aria-atomic="true" className="sr-only" id="live-region" />

        {/* Always-visible zones */}
        <AlertCenter />
        <DecisionSummaryBar />

        {/* Tab-gated content */}
        <AnimatePresence mode="wait">

          {activeTab === "overview" && (
            <motion.div key="overview" role="tabpanel" id="tabpanel-overview" aria-labelledby="tab-overview"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
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
            <motion.div key="reasoning" role="tabpanel" id="tabpanel-reasoning" aria-labelledby="tab-reasoning"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <ReasoningPanel />
              <ProvenancePanel />
              <UncertaintyPanel />
            </motion.div>
          )}

          {activeTab === "fairness" && (
            <motion.div key="fairness" role="tabpanel" id="tabpanel-fairness" aria-labelledby="tab-fairness"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <FairnessPanel />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <AlternativesPanel />
                <HumanOverrideConsole />
              </div>
            </motion.div>
          )}

          {activeTab === "audit" && (
            <motion.div key="audit" role="tabpanel" id="tabpanel-audit" aria-labelledby="tab-audit"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <AuditTrail />
              <ProvenancePanel />
            </motion.div>
          )}

          {activeTab === "health" && (
            <motion.div key="health" role="tabpanel" id="tabpanel-health" aria-labelledby="tab-health"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <DataHealthMonitor />
              <ProvenancePanel />
            </motion.div>
          )}

          {activeTab === "scenarios" && (
            <motion.div key="scenarios" role="tabpanel" id="tabpanel-scenarios" aria-labelledby="tab-scenarios"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <CounterfactualBuilder />
              <UncertaintyPanel />
            </motion.div>
          )}

          {activeTab === "versions" && (
            <motion.div key="versions" role="tabpanel" id="tabpanel-versions" aria-labelledby="tab-versions"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <ModelVersionComparison />
            </motion.div>
          )}

          {activeTab === "appeals" && (
            <motion.div key="appeals" role="tabpanel" id="tabpanel-appeals" aria-labelledby="tab-appeals"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <AppealsWorkflow />
              <AuditTrail />
            </motion.div>
          )}

          {activeTab === "compare" && (
            <motion.div key="compare" role="tabpanel" id="tabpanel-compare" aria-labelledby="tab-compare"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <DecisionComparison />
            </motion.div>
          )}

          {activeTab === "compliance" && (
            <motion.div key="compliance" role="tabpanel" id="tabpanel-compliance" aria-labelledby="tab-compliance"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <PolicyCompliancePanel />
            </motion.div>
          )}

          {activeTab === "governance" && (
            <motion.div key="governance" role="tabpanel" id="tabpanel-governance" aria-labelledby="tab-governance"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <GovernanceSummary />
            </motion.div>
          )}

          {activeTab === "report" && (
            <motion.div key="report" role="tabpanel" id="tabpanel-report" aria-labelledby="tab-report"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
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

      {/* Keyboard shortcuts modal */}
      {shortcutsOpen && <ShortcutModal onClose={() => setShortcutsOpen(false)} />}
    </div>
  );
}
