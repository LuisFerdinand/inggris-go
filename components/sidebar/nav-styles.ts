// components/sidebar/nav-styles.ts
// Shared visual language for flat sidebar nav items, used by NavMain and
// NavGroups so the "Dashboard" link and every group item look identical.

export const SECTION_LABEL_CLASS =
  "px-3 pb-1.5 text-[10px] font-bold uppercase text-[var(--text-faint)]";

export const SECTION_LABEL_STYLE = { letterSpacing: "0.09em" } as const;

export function navItemClass(isActive?: boolean) {
  return [
    "relative h-8 rounded-lg px-2.5 text-[0.8125rem] font-medium transition-colors duration-150",
    "hover:bg-[rgba(10,45,135,0.06)] hover:text-[var(--blue-navy)]",
    isActive
      ? [
          "bg-[rgba(26,82,200,0.09)] text-[var(--blue)] font-semibold",
          "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
          "before:h-4 before:w-[3px] before:rounded-r-full before:bg-[var(--blue)]",
        ].join(" ")
      : "text-[var(--text-muted)]",
  ].join(" ");
}

export function navIconClass(isActive?: boolean) {
  return `!size-4 shrink-0 ${isActive ? "text-[var(--blue)]" : "text-[var(--text-faint)]"}`;
}
