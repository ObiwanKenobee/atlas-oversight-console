import { useEffect, useRef, useCallback } from "react";
import { useNotifications } from "@/hooks/use-notifications";

/** Simulated breach events that cycle through every tick */
const SIMULATION_EVENTS = [
  {
    category: "confidence" as const,
    title: "Confidence Threshold Breach",
    description: "Model confidence dropped to 74% — below the 78% alert threshold.",
    severity: "high" as const,
    tabId: "health",
  },
  {
    category: "fairness" as const,
    title: "Fairness Flag — Ethnicity Proxy",
    description: "Postcode variable acting as ethnicity proxy detected in top-5 features.",
    severity: "high" as const,
    tabId: "fairness",
  },
  {
    category: "appeal" as const,
    title: "Appeal Status Updated",
    description: "APL-2024-003 advanced to 'Under Review' by the Ethics Board.",
    severity: "medium" as const,
    tabId: "appeals",
  },
  {
    category: "confidence" as const,
    title: "Scenario Confidence Change",
    description: "Counterfactual simulation shows +12% confidence with drainage improvement.",
    severity: "low" as const,
    tabId: "scenarios",
  },
  {
    category: "data" as const,
    title: "Data Feed Degraded",
    description: "Satellite imagery pipeline latency >45 s — sensor data may be stale.",
    severity: "medium" as const,
    tabId: "health",
  },
  {
    category: "fairness" as const,
    title: "Fairness Score Improved",
    description: "Reweighting reduced income-group disparity from 2.4× to 1.9×.",
    severity: "low" as const,
    tabId: "fairness",
  },
];

let eventIndex = 0;

export function useSimulation(enabled: boolean) {
  const { addNotification } = useNotifications();
  // Keep a stable ref to addNotification so the interval doesn't recreate
  const addRef = useRef(addNotification);
  useEffect(() => { addRef.current = addNotification; }, [addNotification]);

  const fire = useCallback(() => {
    const event = SIMULATION_EVENTS[eventIndex % SIMULATION_EVENTS.length];
    eventIndex++;
    addRef.current(event);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(fire, 30_000);
    return () => clearInterval(id);
  }, [enabled, fire]);
}
