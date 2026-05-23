"use client";

import React, { Suspense } from "react";
import { ProgramTab } from "../../config/program-detail.config";

/* ─────────────────────────────────────────────────────────────
   TAB COMPONENT STUBS
   Replace each stub with its real implementation.
   The import shape is already correct for lazy() later:
     const OverviewTab = lazy(() => import("../tabs/OverviewTab"))
───────────────────────────────────────────────────────────── */

function OverviewTab({ programId }: { programId: string }) {
  return <TabPlaceholder label="Overview" programId={programId} />;
}
function BatchesTab({ programId }: { programId: string }) {
  return <TabPlaceholder label="Batches" programId={programId} />;
}
function PackagesTab({ programId }: { programId: string }) {
  return <TabPlaceholder label="Packages" programId={programId} />;
}
function EnrollmentsTab({ programId }: { programId: string }) {
  return <TabPlaceholder label="Enrollments" programId={programId} />;
}
function ContentTab({ programId }: { programId: string }) {
  return <TabPlaceholder label="Content" programId={programId} />;
}
function AnalyticsTab({ programId }: { programId: string }) {
  return <TabPlaceholder label="Analytics" programId={programId} />;
}

/* ─────────────────────────────────────────────────────────────
   TAB REGISTRY
   Maps tab value → component.  Extend here only.
───────────────────────────────────────────────────────────── */

const TAB_COMPONENTS: Record<
  ProgramTab,
  React.ComponentType<{ programId: string }>
> = {
  overview: OverviewTab,
  batches: BatchesTab,
  packages: PackagesTab,
  enrollments: EnrollmentsTab,
  content: ContentTab,
  analytics: AnalyticsTab,
};

/* ─────────────────────────────────────────────────────────────
   SECTION COMPONENT
   Responsibilities:
   • Receives currentTab from ProgramDetailPageView (no tab state here)
   • Resolves + renders the matching tab component
   • Wraps in Suspense for future lazy() splits
   • Does NOT touch sticky layout, PageNav, or PageHeader
───────────────────────────────────────────────────────────── */

interface ProgramDetailPageSectionProps {
  programId: string;
  currentTab: ProgramTab;
}

export default function ProgramDetailPageSection({
  programId,
  currentTab,
}: ProgramDetailPageSectionProps) {
  const TabComponent = TAB_COMPONENTS[currentTab] ?? OverviewTab;

  return (
    /*
      Suspense boundary is here so that when stubs are replaced
      with lazy() imports, you only need to add:
        const OverviewTab = lazy(() => import("../tabs/OverviewTab"))
      No other code changes required.
    */
    <Suspense fallback={<TabSkeleton />}>
      <TabComponent programId={programId} />
    </Suspense>
  );
}

/* ─────────────────────────────────────────────────────────────
   LOADING SKELETON
   Used by Suspense fallback during lazy tab chunk loads.
───────────────────────────────────────────────────────────── */

function TabSkeleton() {
  return (
    <div
      className="animate-pulse space-y-4"
      aria-busy="true"
      aria-label="Loading tab content"
    >
      <div className="h-6 w-1/3 rounded-md bg-muted" />
      <div className="h-4 w-2/3 rounded-md bg-muted" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DEV PLACEHOLDER
   Remove once real tab components are built.
───────────────────────────────────────────────────────────── */

function TabPlaceholder({
  label,
  programId,
}: {
  label: string;
  programId: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-10 flex flex-col items-center justify-center gap-3 text-center min-h-[300px]">
      <span className="text-2xl font-semibold tracking-tight text-foreground/40">
        {label}
      </span>
      <span className="text-xs text-muted-foreground font-mono">
        programId: {programId}
      </span>
      <span className="text-xs text-muted-foreground/60 mt-1">
        Replace this stub with the real tab component.
      </span>
    </div>
  );
}
