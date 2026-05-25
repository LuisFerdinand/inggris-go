"use client";

import { BookOpen, Pencil } from "lucide-react";
import {
  PageNav,
  PageHeader,
  Crumb,
  PageNavSkeleton,
} from "@/components/PageHeader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useQueryState } from "nuqs";
import {
  DEFAULT_TAB,
  PROGRAM_TAB_REGISTRY,
  ProgramTab,
  buildProgramTabs,
  isProgramTab,
} from "../../config/program-detail.config";
import { useEffect, useMemo, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { Badge } from "@/components/ui/badge";
import { PageTabs } from "@/components/PageTabs";
import ProgramDetailSection from "../sections/ProgramDetailSection";
import { getProgramHeaderActions } from "../../config/program-header-actions";

interface ProgramDetailViewProps {
  programId: string;
}

export const ProgramDetailView = ({ programId }: ProgramDetailViewProps) => {
  const [tab, setTab] = useQueryState("tab", {
    defaultValue: DEFAULT_TAB,
    shallow: true,
    history: "push",
  });

  const overviewInfoRef = useRef<{ startEditing: () => void }>(null);

  const { data: program, isLoading: isLoadingProgram } =
    trpc.programs.getDetailShell.useQuery(
      { id: programId },
      {
        staleTime: 30_000,
        placeholderData: (prev) => prev,
      },
    );

  const tabs = useMemo(() => buildProgramTabs(program), [program]);
  const currentTab = useMemo(() => {
    const isValid = tabs.some((t) => t.value === tab);

    return (isValid ? tab : DEFAULT_TAB) as ProgramTab;
  }, [tab, tabs]);

  useEffect(() => {
    if (tab !== currentTab) {
      setTab(currentTab);
    }
  }, [tab, currentTab, setTab]);

  const programTitle = program?.title ?? "Program";

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

  const activeTab = PROGRAM_TAB_REGISTRY[currentTab];

  const activeTabCrumb: Crumb = {
    label: activeTab.label,
    icon: activeTab.icon,
  };

  const headerActions = getProgramHeaderActions({
    tab: currentTab,
    shell: program,
    onEdit: () => {
      if (currentTab === "overview") {
        overviewInfoRef?.current?.startEditing();

        const el = document.getElementById("overview-info");

        if (el) {
          const HEADER_OFFSET = 220;

          const y =
            el.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;

          window.scrollTo({
            top: y,
            behavior: "smooth",
          });
        }
      }
    },
  });

  if (isLoadingProgram && !program) {
    return (
      <div className="flex flex-col gap-y-5 pt-2.5">
        <PageNavSkeleton sticky tabCount={8} />
        {/* optional content skeleton */}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-5 pt-2.5">
      <PageNav sticky>
        <PageHeader
          breadcrumbs={staticCrumbs}
          title={programTitle}
          description={program?.shortDesc ?? undefined}
          activeTabCrumb={activeTabCrumb}
          actions={headerActions}
        />
        <PageTabs
          tabs={tabs}
          value={currentTab}
          onValueChange={(v) => {
            if (isProgramTab(v)) {
              setTab(v);
            }
          }}
        />
      </PageNav>
      <section
        className="px-4 lg:px-6 py-6 flex flex-col gap-6"
        role="tabpanel"
        id={`tabpanel-${currentTab}`}
        aria-labelledby={`tab-${currentTab}`}
      >
        {/*
          ProgramDetailSection receives only the current tab.
          The shell (PageNav, PageHeader, PageTabs) is NEVER remounted
          when the tab changes — only this component re-renders.
        */}
        <ProgramDetailSection
          programId={programId}
          currentTab={currentTab}
          overviewInfoRef={overviewInfoRef}
        />
      </section>
    </div>
  );
};
