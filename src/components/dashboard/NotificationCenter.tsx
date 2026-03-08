import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCheck, AlertTriangle, Activity, Scale, ShieldAlert, Info } from "lucide-react";
import type { Notification, NotificationCategory } from "@/hooks/use-notifications";

const CATEGORY_ICON: Record<NotificationCategory, React.ReactNode> = {
  fairness: <ShieldAlert className="w-3.5 h-3.5" />,
  confidence: <Activity className="w-3.5 h-3.5" />,
  appeal: <Scale className="w-3.5 h-3.5" />,
  data: <Info className="w-3.5 h-3.5" />,
  system: <AlertTriangle className="w-3.5 h-3.5" />,
};

const SEVERITY_COLOR: Record<Notification["severity"], string> = {
  high: "text-status-danger",
  medium: "text-status-warn",
  low: "text-muted-foreground",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  notifications: Notification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
}

export function NotificationCenter({ notifications, unreadCount, onMarkRead, onMarkAllRead, onDismiss }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications — ${unreadCount} unread`}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative flex items-center justify-center w-8 h-8 rounded border border-border bg-surface hover:border-accent/50 transition-colors"
      >
        <Bell className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-label={`${unreadCount} unread`}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-status-danger text-[9px] font-bold text-white flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
            <motion.div
              role="dialog"
              aria-label="Notification center"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 z-50 rounded-lg border border-border bg-card shadow-lg overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                  <span className="text-xs font-semibold text-foreground">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-mono text-status-danger border border-status-danger/30 bg-status-danger/10 px-1.5 py-0.5 rounded">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllRead}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Mark all as read"
                    >
                      <CheckCheck className="w-3 h-3" />
                      All read
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close notifications"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-muted-foreground">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkRead(n.id)}
                      className={`px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-surface transition-colors ${!n.read ? "bg-accent/3" : ""}`}
                      role="button"
                      aria-label={`${n.read ? "" : "Unread: "}${n.title}`}
                    >
                      <div className={`mt-0.5 shrink-0 ${SEVERITY_COLOR[n.severity]}`}>
                        {CATEGORY_ICON[n.category]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                            {n.title}
                          </span>
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{n.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-mono text-muted-foreground/70">{timeAgo(n.timestamp)}</span>
                          {n.tabId && (
                            <span className="text-[9px] text-muted-foreground/70 capitalize border border-border rounded px-1 py-0.5">{n.tabId}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDismiss(n.id); }}
                        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                        aria-label={`Dismiss notification: ${n.title}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
