import { ReactNode } from "react";

export interface TabDef<T extends string = string> {
  value: T;
  label: string;
  icon: ReactNode;
  badge?: number;
  /** Optional href for right-click → open in new tab */
  href?: (entityId: string) => string;
}

export interface NavRegistry<T extends string = string> {
  tabs: TabDef<T>[];
  defaultTab: T;
  /** Derives a safe tab value from an arbitrary string (e.g. from URL) */
  parse: (raw: string | null | undefined) => T;
}

export function createRegistry<T extends string>(
  tabs: TabDef<T>[],
  defaultTab: T,
): NavRegistry<T> {
  const values = new Set(tabs.map((t) => t.value));
  return {
    tabs,
    defaultTab,
    parse: (raw) => (raw && values.has(raw as T) ? (raw as T) : defaultTab),
  };
}
