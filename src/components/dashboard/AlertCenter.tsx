import { systemAlerts } from "@/data/mockData";
import { Bell, AlertTriangle, Info, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AlertCenter() {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = systemAlerts.filter(a => !dismissed.includes(a.id));

  if (visible.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-surface border border-border rounded-lg shadow-card flex flex-col"
    >
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-status-warn" />
          <span className="text-xs font-semibold text-foreground">System Alerts</span>
          <span className="badge-warn text-[10px] px-1.5 py-0.5 rounded font-mono">{visible.length}</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">Live · Auto-updated</span>
      </div>

      <div className="divide-y divide-border/50">
        <AnimatePresence>
          {visible.map(alert => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-3 px-4 py-2.5 hover:bg-surface-hover/40 transition-colors"
            >
              <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                alert.severity === "high" ? "text-status-danger animate-pulse-warn" :
                alert.severity === "medium" ? "text-status-warn" : "text-status-info"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground leading-relaxed">{alert.message}</p>
                <span className="text-[10px] font-mono text-muted-foreground">{alert.timestamp}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  alert.severity === "high" ? "badge-danger" :
                  alert.severity === "medium" ? "badge-warn" : "badge-info"
                }`}>{alert.severity}</span>
                <button
                  onClick={() => setDismissed(d => [...d, alert.id])}
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
