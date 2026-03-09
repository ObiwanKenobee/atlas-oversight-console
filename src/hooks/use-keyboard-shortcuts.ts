import { useEffect } from "react";

type TabId = string;

interface UseKeyboardShortcutsOptions {
  tabs: readonly { id: TabId }[];
  setActiveTab: (id: TabId) => void;
  onHelpOpen: () => void;
}

/**
 * Registers global keyboard shortcuts:
 *  - 1–9 → jump to nth tab
 *  - ? → open shortcut cheatsheet
 *
 * Ignores keypresses when focus is inside an input/textarea/select/[contenteditable].
 */
export function useKeyboardShortcuts({
  tabs,
  setActiveTab,
  onHelpOpen,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const editable = (e.target as HTMLElement)?.isContentEditable;
      if (tag === "input" || tag === "textarea" || tag === "select" || editable) return;
      // ? key
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onHelpOpen();
        return;
      }
      // Digit 1–9
      const digit = parseInt(e.key, 10);
      if (digit >= 1 && digit <= 9 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = tabs[digit - 1];
        if (target) {
          e.preventDefault();
          setActiveTab(target.id);
        }
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tabs, setActiveTab, onHelpOpen]);
}
