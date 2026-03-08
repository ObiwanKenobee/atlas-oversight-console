import { useState, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";

export type NotificationCategory = "fairness" | "confidence" | "appeal" | "data" | "system";

export interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  timestamp: string;
  read: boolean;
  tabId?: string;
}

// Badge counters per tab
export type TabBadges = Record<string, number>;

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n-1",
    category: "fairness",
    title: "Fairness Flag — Income Disparity",
    description: "Low-income households 2.4× more likely to receive high-urgency score.",
    severity: "high",
    timestamp: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
    read: false,
    tabId: "fairness",
  },
  {
    id: "n-2",
    category: "confidence",
    title: "Confidence Degraded",
    description: "Stale geotechnical data reduced confidence by −4 points to 78%.",
    severity: "high",
    timestamp: new Date(Date.now() - 1000 * 60 * 46).toISOString(),
    read: false,
    tabId: "health",
  },
  {
    id: "n-3",
    category: "appeal",
    title: "Appeal Escalated",
    description: "APL-2024-001 escalated to Ethics Board by P. Adeyemi.",
    severity: "medium",
    timestamp: new Date(Date.now() - 1000 * 60 * 17).toISOString(),
    read: false,
    tabId: "appeals",
  },
  {
    id: "n-4",
    category: "data",
    title: "Data Pipeline Degraded",
    description: "Drainage survey feed showing intermittent failures. Coverage at 72%.",
    severity: "medium",
    timestamp: new Date(Date.now() - 1000 * 60 * 52).toISOString(),
    read: true,
    tabId: "health",
  },
];

let idCounter = 100;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const shownIds = useRef<Set<string>>(new Set(["n-1", "n-2", "n-3", "n-4"]));

  const addNotification = useCallback(
    (n: Omit<Notification, "id" | "timestamp" | "read">) => {
      const id = `n-${++idCounter}`;
      const newNotif: Notification = {
        ...n,
        id,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // Surface as toast
      toast({
        title: newNotif.title,
        description: newNotif.description,
        variant: newNotif.severity === "high" ? "destructive" : "default",
      });

      return id;
    },
    []
  );

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Badge count per tabId
  const tabBadges: TabBadges = {};
  for (const n of notifications) {
    if (!n.read && n.tabId) {
      tabBadges[n.tabId] = (tabBadges[n.tabId] ?? 0) + 1;
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    addNotification,
    markRead,
    markAllRead,
    dismiss,
    tabBadges,
    unreadCount,
  };
}
