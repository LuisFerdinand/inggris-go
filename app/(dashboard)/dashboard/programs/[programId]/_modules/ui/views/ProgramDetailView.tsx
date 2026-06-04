// app/(dashboard)/dashboard/programs/[programId]/_modules/ui/views/ProgramDetailView.tsx
"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useRef } from "react";
import {
  LayoutDashboard,
  FileText,
  LayoutTemplate,
  ShoppingBag,
  Users,
  BookOpen,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { PageNav, PageHeader } from "@/components/PageHeader";

import OverviewTab from "../../tabs/OverviewTab";
import DetailTab from "../../tabs/DetailTab";
import ContentTab from "../../tabs/ContentTab";
import CommerceTab from "../../tabs/CommerceTab";

const TAB_OPTIONS = [
  "overview",
  "detail",
  "content",
  "commerce",
  "enrollments",
] as const;
type ProgramTab = (typeof TAB_OPTIONS)[number];

const TAB_CONFIG: {
  value: ProgramTab;
  label: string;
  Icon: React.FC<{ className?: string }>;
}[] = [
  { value: "overview", label: "Ringkasan", Icon: LayoutDashboard },
  { value: "detail", label: "Detail", Icon: FileText },
  { value: "content", label: "Konten", Icon: LayoutTemplate },
  { value: "commerce", label: "Batch & Paket", Icon: ShoppingBag },
  { value: "enrollments", label: "Pendaftar", Icon: Users },
];

function getTabLabel(tab: ProgramTab) {
  return TAB_CONFIG.find((item) => item.value === tab)?.label ?? "Ringkasan";
}

function TabBar({
  active,
  onChange,
}: {
  active: ProgramTab;
  onChange: (v: ProgramTab) => void;
}) {
  return (
    <div
      className="no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-[var(--border-soft)]"
      role="tablist"
    >
      {TAB_CONFIG.map(({ value, label, Icon }) => {
        const isActive = active === value;

        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(value)}
            className={cn(
              "relative inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 text-[13px] font-semibold transition-colors",
              isActive
                ? "text-[var(--blue-navy)]"
                : "text-[var(--text-faint)] hover:text-[var(--blue)]",
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            {label}

            {isActive && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-blue-gradient" />
            )}
          </button>
        );
      })}
    </div>
  );
}

interface ProgramDetailViewProps {
  programId: string;
}

export function ProgramDetailView({ programId }: ProgramDetailViewProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral(TAB_OPTIONS).withDefault("overview"),
  );

  const overviewInfoRef = useRef<{ startEditing: () => void } | null>(null);
  const active = tab as ProgramTab;

  const headerQuery = trpc.programs.getHeader.useQuery(
    { id: programId },
    {
      staleTime: 60_000,
      placeholderData: (prev) => prev,
    },
  );

  const program = headerQuery.data;

  const title = program?.title ?? "Memuat program...";
  const categoryLabel = program?.category?.label;

  return (
    <div className="flex flex-col gap-y-4 pt-2.5">
      <PageNav sticky>
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            {
              label: "Program",
              href: "/dashboard/programs",
              icon: <BookOpen />,
            },
            {
              label: title,
            },
          ]}
          activeTabCrumb={{
            label: getTabLabel(active),
          }}
          title={title}
          description={
            program
              ? [
                  categoryLabel,
                  program.format,
                  program.level,
                  program.registrationType,
                ]
                  .filter(Boolean)
                  .join(" • ")
              : "Mengambil detail program..."
          }
          badge={
            program?.status
              ? {
                  label: program.status,
                  variant:
                    program.status === "published"
                      ? "success"
                      : program.status === "draft"
                        ? "secondary"
                        : "outline",
                }
              : undefined
          }
          actions={
            headerQuery.isFetching ? (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--text-faint)]">
                <Loader2 className="size-3.5 animate-spin" />
                Sync
              </div>
            ) : null
          }
        />
      </PageNav>

      <div className="px-4">
        <TabBar active={active} onChange={(v) => setTab(v)} />
      </div>

      <div className="px-4 pb-10">
        {active === "overview" && (
          <OverviewTab programId={programId} overviewInfoRef={overviewInfoRef} />
        )}

        {active === "detail" && <DetailTab programId={programId} />}

        {active === "content" && <ContentTab programId={programId} />}

        {active === "commerce" && <CommerceTab programId={programId} />}

        {active === "enrollments" && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-[var(--border-soft)] bg-white py-20 text-[var(--text-faint)] shadow-badge">
            <Users className="size-6 opacity-50" />
            <p className="text-sm font-semibold text-[var(--text-muted)]">
              Pendaftar segera hadir
            </p>
          </div>
        )}
      </div>
    </div>
  );
}