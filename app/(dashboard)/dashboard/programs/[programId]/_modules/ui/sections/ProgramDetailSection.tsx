// app/(dashboard)/dashboard/programs/[programId]/_modules/ui/sections/ProgramDetailSection.tsx
"use client";

/* ─────────────────────────────────────────────────────────────
   This module previously held a tab registry + stub tabs, but the
   live route renders `ProgramDetailView` (see page.tsx), which owns
   its own tab list and component switch. Everything here except the
   loading skeleton was dead code and has been removed.

   `TabSkeleton` stays — it's imported by DetailTab (and other tabs)
   as the loading fallback, so the import path is kept stable.
───────────────────────────────────────────────────────────── */

export function TabSkeleton() {
  return (
    <div
      className="animate-pulse space-y-4"
      aria-busy="true"
      aria-label="Loading tab content"
    >
      <div className="h-6 w-1/3 rounded-md bg-muted" />
      <div className="h-4 w-2/3 rounded-md bg-muted" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}