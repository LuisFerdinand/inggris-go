"use client";

import React, { useMemo } from "react";
import {
  BookOpen,
  BarChart2,
  Users,
  Package,
  Layers,
  FileText,
  Pencil,
} from "lucide-react";
import { useQueryState } from "nuqs";
import { PageTabs, Tab } from "@/components/PageTabs";
import { trpc } from "@/lib/trpc/client";
import { PageHeader, PageNav, Crumb } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ProgramDetailPageSection from "../sections/ProgramDetailPageSection";
import {
  DEFAULT_TAB,
  TAB_ICONS,
  TAB_LABELS,
  PROGRAM_TABS,
  ProgramTab,
} from "../../config/program-detail.config";

/* ─────────────────────────────────────────────────────────────
   TAB REGISTRY
   Central source-of-truth for all tab metadata.
   Add / reorder / badge here — nothing else needs to change.
───────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────
   VIEW COMPONENT
   Responsibilities:
   • sticky layout orchestration (PageNav > PageHeader > PageTabs)
   • tab state via nuqs (persists on refresh, supports deep-linking,
     back/forward, never remounts shell)
   • shared program query (title / description / status)
   • passes currentTab down to ProgramDetailPageSection only
───────────────────────────────────────────────────────────── */

interface ProgramDetailPageViewProps {
  programId: string;
}

export default function ProgramDetailPageView({
  programId,
}: ProgramDetailPageViewProps) {
  /* ── Tab state ─────────────────────────────────────────────
     nuqs keeps tab in the URL search param (?tab=packages).
     Switching tabs does NOT remount this component — only
     ProgramDetailPageSection re-renders with a new prop.
  ─────────────────────────────────────────────────────────── */
  const [tab, setTab] = useQueryState("tab", {
    defaultValue: DEFAULT_TAB,
    shallow: true, // no server round-trip; history entry still created
    history: "push", // browser back/forward works correctly
  });

  const currentTab = (
    PROGRAM_TABS.some((t) => t.value === tab) ? tab : DEFAULT_TAB
  ) as ProgramTab;

  /* ── Shared query ──────────────────────────────────────────
     Fetches the minimal program info needed by the shell.
     Tab-level queries live inside each tab component later.
  ─────────────────────────────────────────────────────────── */
  const { data: program, isLoading } = trpc.programs.getById.useQuery(
    { id: programId },
    {
      staleTime: 30_000,
      // Keep cached data while navigating tabs — prevents flash
      placeholderData: (prev) => prev,
    },
  );

  const programTitle = isLoading ? "…" : (program?.title ?? "Program");

  /* ── Breadcrumbs ───────────────────────────────────────────
     Static crumbs + a reactive final crumb that mirrors the
     active tab. PageHeader receives `activeTabCrumb` separately
     so it can slot it in as the last segment cleanly.
  ─────────────────────────────────────────────────────────── */
  const staticCrumbs: Crumb[] = useMemo(
    () => [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Programs", href: "/dashboard/programs", icon: <BookOpen /> },
      {
        label: programTitle,
        href: `/dashboard/programs/${programId}`,
      },
    ],
    [programId, programTitle],
  );

  const activeTabCrumb: Crumb = {
    label: TAB_LABELS[currentTab],
    icon: TAB_ICONS[currentTab],
  };

  /* ── Actions ───────────────────────────────────────────────
     Stays mounted through all tab switches; badge + edit CTA.
  ─────────────────────────────────────────────────────────── */
  const headerActions = (
    <div className="flex items-center gap-2">
      {program?.status && <ProgramStatusBadge status={program.status} />}
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-xs rounded-lg"
        asChild
      >
        <Link href={`/dashboard/programs/${programId}/edit`}>
          <Pencil className="size-3" />
          Edit
        </Link>
      </Button>
    </div>
  );

  /* ── Render ────────────────────────────────────────────────
     Layout contract:
       <main>                       ← full-height page root
         <PageNav sticky>           ← sticky wrapper (z-40)
           <PageHeader />           ← compact on scroll, no border when tabs present
           <PageTabs />             ← sticky under header, visual separator
         </PageNav>
         <section>                  ← scrollable content area
           <ProgramDetailPageSection currentTab={…} />
         </section>
       </main>
  ─────────────────────────────────────────────────────────── */
  return (
    <main className="bg-background min-h-screen">
      {/* ── Sticky navigation shell ───────────────────────── */}
      <PageNav sticky>
        <PageHeader
          breadcrumbs={staticCrumbs}
          title={programTitle}
          description={program?.description ?? undefined}
          activeTabCrumb={activeTabCrumb}
          actions={headerActions}
        />

        {/*
          PageTabs registers hasTabs=true in PageNavContext →
          PageHeader automatically suppresses its bottom border.
          The tab bar becomes the sole visual separator.
        */}
        <PageTabs
          tabs={PROGRAM_TABS}
          value={currentTab}
          onValueChange={(v) => setTab(v as ProgramTab)}
        />
      </PageNav>

      {/* ── Scrollable content area ───────────────────────── */}
      <section
        className="px-4 lg:px-6 py-6 flex flex-col gap-6"
        role="tabpanel"
        id={`tabpanel-${currentTab}`}
        aria-labelledby={`tab-${currentTab}`}
      >
        {/*
          ProgramDetailPageSection receives only the current tab.
          The shell (PageNav, PageHeader, PageTabs) is NEVER remounted
          when the tab changes — only this component re-renders.
        */}
        <ProgramDetailPageSection
          programId={programId}
          currentTab={currentTab}
        />
      </section>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────────────────── */

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-amber-50  text-amber-700  border-amber-200",
  archived: "bg-slate-100 text-slate-500  border-slate-200",
};

function ProgramStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={`text-xs border capitalize ${
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </Badge>
  );
}
