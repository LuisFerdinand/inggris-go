"use client";

import { ColumnDef, Column } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Eye,
  Pencil,
  Trash2,
  Wifi,
  Building,
  Users,
  Sprout,
  TrendingUp,
  Rocket,
  Clock,
  Repeat,
  CalendarClock,
  MoreHorizontal,
  Copy,
  Archive,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FilteredProgram } from "@/app/modules/program/server/program.router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ProgramFormat,
  ProgramLevel,
  ProgramScheduleType,
  ProgramStatus,
} from "@/lib/enums";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function relDate(ds: string | Date) {
  const diff = Math.floor((Date.now() - new Date(ds).getTime()) / 86400000);
  if (diff === 0) return "hari ini";
  if (diff === 1) return "kemarin";
  if (diff < 30) return `${diff} hari lalu`;
  if (diff < 365) return `${Math.floor(diff / 30)} bln lalu`;
  return `${Math.floor(diff / 365)} thn lalu`;
}

const STATUS_STYLES: Record<ProgramStatus, string> = {
  published: "bg-teal-50 border-teal-200 text-teal-800",
  draft: "bg-blue-50 border-blue-200 text-blue-800",
  archived: "bg-neutral-100 border-neutral-200 text-neutral-600",
};
const STATUS_DOT: Record<ProgramStatus, string> = {
  published: "bg-teal-500",
  draft: "bg-blue-500",
  archived: "bg-neutral-400",
};
const STATUS_LABEL: Record<string, string> = {
  published: "Terbit",
  draft: "Draf",
  archived: "Diarsip",
  scheduled: "Terjadwal",
};

const FORMAT_CONFIG: Record<
  ProgramFormat,
  { label: string; Icon: React.FC<{ className?: string }> }
> = {
  online: { label: "Online", Icon: Wifi },
  offline: { label: "Offline", Icon: Building },
  hybrid: { label: "Hybrid", Icon: Users },
};

const LEVEL_CONFIG: Record<
  ProgramLevel,
  { label: string; Icon: React.FC<{ className?: string }> }
> = {
  beginner: { label: "Pemula", Icon: Sprout },
  intermediate: { label: "Menengah", Icon: TrendingUp },
  advanced: { label: "Mahir", Icon: Rocket },
};

const SCHEDULE_CONFIG: Record<
  ProgramScheduleType,
  { label: string; Icon: React.FC<{ className?: string }> }
> = {
  permanent: { label: "Permanen", Icon: Repeat },
  scheduled: { label: "Terjadwal", Icon: CalendarClock },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SortHeader({
  column,
  label,
  right,
}: {
  column: Column<FilteredProgram, unknown>;
  label: string;
  right?: boolean;
}) {
  const sorted = column.getIsSorted();
  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === "asc")}
      className={cn(
        "flex items-center gap-1 rounded px-0.5 transition-colors uppercase",
        right && "ml-auto",
      )}
    >
      {label}
      <ArrowUpDown
        className={cn(
          "size-3 transition-opacity",
          sorted ? "opacity-100 text-blue-500" : "opacity-30",
        )}
      />
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        STATUS_STYLES[status as ProgramStatus] ??
          "bg-neutral-100 border-neutral-200 text-neutral-600",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          STATUS_DOT[status as ProgramStatus] ?? "bg-neutral-400",
        )}
        aria-hidden="true"
      />
      <span>{STATUS_LABEL[status] ?? status}</span>
    </span>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[22px] h-5 rounded-full px-1.5 text-[11px] font-medium border",
        count > 0
          ? "bg-blue-50 border-blue-200 text-blue-700"
          : "bg-neutral-100 border-neutral-200 text-neutral-400",
      )}
    >
      {count}
    </span>
  );
}

function ProgramThumb({
  thumbnail,
  title,
}: {
  thumbnail?: string | null;
  title: string;
}) {
  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  if (thumbnail) {
    return (
      <img
        src={thumbnail}
        alt={title}
        className="size-9 rounded-lg object-cover border border-neutral-200 shrink-0"
      />
    );
  }
  return (
    <div className="size-9 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 flex items-center justify-center shrink-0 text-[11px] font-semibold text-blue-700 select-none">
      {initials}
    </div>
  );
}

// ─── Columns ──────────────────────────────────────────────────────────────────

export function getProgramColumns(): ColumnDef<FilteredProgram>[] {
  return [
    // ── Program ──
    {
      accessorKey: "title",
      header: ({ column }) => <SortHeader column={column} label="Program" />,
      cell: ({ row }) => {
        const { title, slug, thumbnail } = row.original;
        return (
          <div className="flex items-center gap-2.5 min-w-[180px] max-w-[260px]">
            <ProgramThumb thumbnail={thumbnail} title={title} />
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-neutral-800 truncate leading-tight">
                {title}
              </p>
              <p className="text-[10px] text-neutral-400 truncate mt-0.5 font-mono">
                /{slug}
              </p>
            </div>
          </div>
        );
      },
    },

    // ── Category ──
    {
      accessorKey: "category.label",
      id: "category.label",
      header: "Kategori",
      cell: ({ row }) => {
        const label = row.original.category?.label;
        if (!label)
          return <span className="text-[11px] text-neutral-300">—</span>;
        return (
          <span className="inline-block max-w-[100px] truncate rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-600">
            {label}
          </span>
        );
      },
    },

    // ── Details — compact two-line layout ──
    {
      id: "details",
      header: "Detail",
      enableSorting: false,
      cell: ({ row }) => {
        const { format, level, duration, scheduleType } = row.original;
        const fmt = FORMAT_CONFIG[format as ProgramFormat] ?? {
          label: format ?? "—",
          Icon: Wifi,
        };
        const lvl = LEVEL_CONFIG[level as ProgramLevel] ?? {
          label: level ?? "—",
          Icon: TrendingUp,
        };
        const sch = SCHEDULE_CONFIG[scheduleType as ProgramScheduleType] ?? {
          label: scheduleType ?? "—",
          Icon: Repeat,
        };

        return (
          <div className="flex flex-col gap-1 min-w-[140px]">
            {/* Row 1: format · level */}
            <div className="flex items-center gap-1 text-[11px] text-neutral-500">
              <fmt.Icon
                className="size-3 shrink-0 text-neutral-400"
                aria-hidden
              />
              <span>{fmt.label}</span>
              <span className="text-neutral-300">·</span>
              <lvl.Icon
                className="size-3 shrink-0 text-neutral-400"
                aria-hidden
              />
              <span>{lvl.label}</span>
            </div>
            {/* Row 2: duration · schedule */}
            <div className="flex items-center gap-1 text-[11px] text-neutral-400">
              <Clock className="size-3 shrink-0" aria-hidden />
              <span>{duration ? `${duration} hari` : "—"}</span>
              <span className="text-neutral-300">·</span>
              <sch.Icon className="size-3 shrink-0" aria-hidden />
              <span>{sch.label}</span>
            </div>
          </div>
        );
      },
    },

    // ── Status ──
    {
      accessorKey: "status",
      header: ({ column }) => <SortHeader column={column} label="Status" />,
      cell: ({ row }) => (
        <StatusBadge status={row.original.status ?? "draft"} />
      ),
      sortingFn: (a, b) => {
        const order = { published: 0, scheduled: 1, draft: 2, archived: 3 };
        return (
          (order[a.original.status as keyof typeof order] ?? 9) -
          (order[b.original.status as keyof typeof order] ?? 9)
        );
      },
    },

    // ── Batches ──
    {
      accessorKey: "batchCount",
      header: ({ column }) => <SortHeader column={column} label="Batch" />,
      cell: ({ row }) => (
        <CountBadge count={Number(row.original.batchCount ?? 0)} />
      ),
    },

    // ── Packages ──
    {
      accessorKey: "packageCount",
      header: ({ column }) => <SortHeader column={column} label="Paket" />,
      cell: ({ row }) => (
        <CountBadge count={Number(row.original.packageCount ?? 0)} />
      ),
    },

    // ── Price ──
    {
      accessorKey: "startingPrice",
      header: ({ column }) => (
        <SortHeader column={column} label="Harga" right />
      ),
      cell: ({ row }) => {
        const price = row.original.startingPrice;
        const isFree = price === 0 || price === null || price === undefined;
        return (
          <div className="text-right">
            <span
              className={cn(
                "text-[12px] font-medium",
                isFree ? "text-teal-700" : "text-neutral-700",
              )}
            >
              {isFree ? "Gratis" : formatRupiah(price)}
            </span>
          </div>
        );
      },
    },

    // ── Last updated ──
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <SortHeader column={column} label="Diperbarui" />,
      cell: ({ row }) => {
        const updatedAt = row.original.updatedAt;
        if (!updatedAt)
          return <span className="text-[11px] text-neutral-300">—</span>;
        const d = new Date(updatedAt);
        return (
          <div>
            <p className="text-[11px] text-neutral-600">
              {d.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="text-[10px] text-neutral-400 mt-0.5">{relDate(d)}</p>
          </div>
        );
      },
    },

    // ── Created (hidden by default) ──
    {
      accessorKey: "createdAt",
      header: ({ column }) => <SortHeader column={column} label="Dibuat" />,
      cell: ({ row }) => {
        const d = new Date(row.original.createdAt);
        return (
          <p className="text-[11px] text-neutral-500">
            {d.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        );
      },
    },

    // ── Actions — 3-dot dropdown ──
    {
      id: "actions",
      enableHiding: false,
      enableSorting: false,
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => {
        const { id } = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 data-[state=open]:bg-neutral-100 data-[state=open]:text-neutral-700"
                  aria-label="Buka menu aksi"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                  Aksi Program
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/programs/${id}`}
                    className="flex items-center gap-2 text-xs cursor-pointer"
                  >
                    <Eye className="size-3.5 text-neutral-400" />
                    Lihat detail
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/programs/${id}/edit`}
                    className="flex items-center gap-2 text-xs cursor-pointer"
                  >
                    <Pencil className="size-3.5 text-neutral-400" />
                    Edit program
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-2 text-xs cursor-pointer">
                  <Copy className="size-3.5 text-neutral-400" />
                  Duplikat
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-2 text-xs cursor-pointer">
                  <ExternalLink className="size-3.5 text-neutral-400" />
                  Buka halaman publik
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="flex items-center gap-2 text-xs cursor-pointer">
                  <Archive className="size-3.5 text-neutral-400" />
                  Arsipkan
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="flex items-center gap-2 text-xs cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    // wire delete mutation here
                  }}
                >
                  <Trash2 className="size-3.5" />
                  Hapus program
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
