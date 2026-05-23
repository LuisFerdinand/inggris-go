"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { LayoutList, Kanban, Calendar } from "lucide-react";
import { getProgramColumns } from "./Table/ProgramColumns";
import { trpc } from "@/lib/trpc/client";
import { ProgramDataTable } from "./Table/ProgramDataTable";
import { useProgramFilters } from "../../hooks/use-program-filters";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { FilteredProgram } from "@/app/modules/program/server/program.router";

// ─── View types ───────────────────────────────────────────────────────────────

const VIEW_OPTIONS = ["table", "kanban", "calendar"] as const;
type ProgramView = (typeof VIEW_OPTIONS)[number];

const VIEW_CONFIG: {
  value: ProgramView;
  label: string;
  Icon: React.FC<{ className?: string }>;
}[] = [
  { value: "table", label: "Tabel", Icon: LayoutList },
  { value: "kanban", label: "Kanban", Icon: Kanban },
  { value: "calendar", label: "Kalender", Icon: Calendar },
];

// ─── View tab bar ─────────────────────────────────────────────────────────────

function ViewTabBar({
  active,
  onChange,
}: {
  active: ProgramView;
  onChange: (v: ProgramView) => void;
}) {
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-lg border border-neutral-200 bg-neutral-50 p-0.5"
      role="tablist"
    >
      {VIEW_CONFIG.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={active === value}
          onClick={() => onChange(value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-all duration-150 select-none",
            active === value
              ? "bg-white border border-neutral-200 text-neutral-800 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700",
          )}
        >
          <Icon className="size-3.5 shrink-0" />
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Summary strip ────────────────────────────────────────────────────────────

function SummaryStrip({ data }: { data: FilteredProgram[] }) {
  const published = data.filter((d) => d.status === "published").length;
  const draft = data.filter((d) => d.status === "draft").length;
  const archived = data.filter((d) => d.status === "archived").length;

  const stats = [
    {
      label: "Total Program",
      value: data.length,
      sub: "semua program",
      valueClass: "text-neutral-800",
      dotClass: "bg-neutral-300",
      barClass: "bg-neutral-200",
      pct: 100,
    },
    {
      label: "Terbit",
      value: published,
      sub: "aktif & live",
      valueClass: "text-teal-700",
      dotClass: "bg-teal-500",
      barClass: "bg-teal-500",
      pct: data.length ? Math.round((published / data.length) * 100) : 0,
    },
    {
      label: "Draf",
      value: draft,
      sub: "sedang diedit",
      valueClass: "text-blue-700",
      dotClass: "bg-blue-500",
      barClass: "bg-blue-500",
      pct: data.length ? Math.round((draft / data.length) * 100) : 0,
    },
    {
      label: "Diarsip",
      value: archived,
      sub: "disembunyikan",
      valueClass: "text-neutral-400",
      dotClass: "bg-neutral-300",
      barClass: "bg-neutral-300",
      pct: data.length ? Math.round((archived / data.length) * 100) : 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-neutral-100 bg-neutral-50/40">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={cn(
            "relative flex flex-col justify-between px-5 py-4 gap-3",
            // dividers between columns
            i < stats.length - 1 && "sm:border-r border-neutral-100",
            // mobile: right border on col 1, bottom border on row 1
            i % 2 === 0 && "border-r border-neutral-100 sm:border-r-0",
            i < 2 && "border-b border-neutral-100 sm:border-b-0",
          )}
        >
          {/* Top: label + dot */}
          <div className="flex items-center gap-1.5">
            <span
              className={cn("size-1.5 rounded-full shrink-0", s.dotClass)}
              aria-hidden
            />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
              {s.label}
            </p>
          </div>

          {/* Middle: big number + sub */}
          <div className="flex items-end justify-between gap-2">
            <p
              className={cn(
                "text-[28px] font-bold leading-none tabular-nums tracking-tight",
                s.valueClass,
              )}
            >
              {s.value}
            </p>
            <p className="text-[10px] text-neutral-400 mb-0.5 leading-tight text-right">
              {s.sub}
            </p>
          </div>

          {/* Bottom: micro progress bar */}
          <div className="h-1 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                s.barClass,
              )}
              style={{ width: `${s.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Coming soon placeholder ──────────────────────────────────────────────────

function ComingSoon({ view }: { view: ProgramView }) {
  const Icon = VIEW_CONFIG.find((v) => v.value === view)?.Icon ?? Kanban;
  const label = VIEW_CONFIG.find((v) => v.value === view)?.label ?? view;
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 py-20 text-neutral-400">
      <div className="size-10 rounded-full bg-neutral-100 flex items-center justify-center">
        <Icon className="size-5 opacity-40" />
      </div>
      <p className="text-sm font-medium text-neutral-500">
        Tampilan {label} segera hadir
      </p>
      <p className="text-xs opacity-60">Kami sedang mengerjakan fitur ini</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProgramsViewSwitcher() {
  const [view, setView] = useQueryState(
    "view",
    parseAsStringLiteral(VIEW_OPTIONS).withDefault("table"),
  );

  const [filters] = useProgramFilters();
  const columns = useMemo(() => getProgramColumns(), []);

  const { data: programs = [], isLoading } = trpc.programs.getFiltered.useQuery(
    {
      status: filters.status ?? undefined,
      categoryId: filters.categoryId ?? undefined,
      format: filters.format ?? undefined,
      level: filters.level ?? undefined,
      registrationType: filters.registrationType ?? undefined,
      scheduleType: filters.scheduleType ?? undefined,
      searchQuery: filters.searchQuery ?? undefined,
    },
    { enabled: view === "table" },
  );

  return (
    <div className="flex flex-col rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
      {/* ── Top header: view tabs only ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
        <ViewTabBar active={view as ProgramView} onChange={(v) => setView(v)} />
      </div>

      {/* ── Summary strip — visible for table view ── */}
      {view === "table" && <SummaryStrip data={programs} />}

      {/* ── Content ── */}
      {view === "table" && (
        <ProgramDataTable
          columns={columns}
          data={programs}
          isLoading={isLoading}
        />
      )}
      {view !== "table" && <ComingSoon view={view as ProgramView} />}
    </div>
  );
}
