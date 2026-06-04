// app/(dashboard)/dashboard/programs/[programId]/_modules/ui/views/ProgramDetailView.tsx
"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useRef } from "react";
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Users,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageNav, PageHeader } from "@/components/PageHeader";

import OverviewTab from "../../tabs/OverviewTab";
import DetailTab from "../../tabs/DetailTab";
import CommerceTab from "../../tabs/CommerceTab";

const TAB_OPTIONS = ["overview", "detail", "commerce", "enrollments"] as const;
type ProgramTab = (typeof TAB_OPTIONS)[number];

const TAB_CONFIG: {
  value: ProgramTab;
  label: string;
  Icon: React.FC<{ className?: string }>;
}[] = [
  { value: "overview", label: "Ringkasan", Icon: LayoutDashboard },
  { value: "detail", label: "Detail", Icon: FileText },
  { value: "commerce", label: "Batch & Paket", Icon: ShoppingBag },
  { value: "enrollments", label: "Pendaftar", Icon: Users },
];

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
  title?: string;
}

export function ProgramDetailView({
  programId,
  title = "Program",
}: ProgramDetailViewProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral(TAB_OPTIONS).withDefault("overview"),
  );

  const overviewInfoRef = useRef<{ startEditing: () => void } | null>(null);
  const active = tab as ProgramTab;

  return (
    <div className="flex flex-col gap-y-4 pt-2.5">
      <PageNav sticky>
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Program", href: "/dashboard/programs", icon: <BookOpen /> },
            { label: title },
          ]}
          title={title}
          description="Kelola identitas, konten, batch, paket, dan pendaftaran program."
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
