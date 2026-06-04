// app/(dashboard)/dashboard/programs/_modules/ui/components/ProgramsViewSwitcher.tsx
"use client";

import { useMemo } from "react";
import { getProgramColumns } from "./Table/ProgramColumns";
import { trpc } from "@/lib/trpc/client";
import { ProgramDataTable } from "./Table/ProgramDataTable";
import { useProgramFilters } from "../../hooks/use-program-filters";
import { cn } from "@/lib/utils";
import { FilteredProgram } from "@/app/modules/program/server/program.router";
import type { ProgramFilterInput } from "@/app/modules/program/program.schema";

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
            i < stats.length - 1 && "sm:border-r border-neutral-100",
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

// ─── Main component ───────────────────────────────────────────────────────────

export function ProgramsViewSwitcher() {
  const [filters] = useProgramFilters();
  const columns = useMemo(() => getProgramColumns(), []);

  // nuqs gives us `string | null`; the schema narrows + `.catch(undefined)`
  // drops anything invalid server-side, so this cast is safe.
  const queryInput: ProgramFilterInput = {
    status: filters.status ?? undefined,
    categoryId: filters.categoryId ?? undefined,
    format: filters.format ?? undefined,
    level: filters.level ?? undefined,
    registrationType: filters.registrationType ?? undefined,
    scheduleType: filters.scheduleType ?? undefined,
    searchQuery: filters.searchQuery ?? undefined,
  } as ProgramFilterInput;

  const { data: programs = [], isLoading } =
    trpc.programs.getFiltered.useQuery(queryInput);

  return (
    <div className="flex flex-col rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm w-full">
      {/* Summary strip */}
      <SummaryStrip data={programs} />

      {/* Table */}
      <ProgramDataTable
        columns={columns}
        data={programs}
        isLoading={isLoading}
      />
    </div>
  );
}