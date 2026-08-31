// app/(dashboard)/dashboard/programs/_modules/ui/components/Table/ProgramColumns.tsx
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
import { useConfirm } from "@/components/ui/confirm-dialog";
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
} from "@/lib/enums/enums";
import { ProgramThumb, CountBadge, ProgramStatusBadge } from "..";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { trpc } from "@/lib/trpc/client";

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

type DurationUnit = {
  id: "weeks" | "days" | "hours" | "minutes";
  factor: number;
  label: string;
};

const DURATION_UNITS: DurationUnit[] = [
  { id: "weeks", factor: 10080, label: "minggu" },
  { id: "days", factor: 1440, label: "hari" },
  { id: "hours", factor: 60, label: "jam" },
  { id: "minutes", factor: 1, label: "menit" },
];

function formatProgramDuration(totalMinutes: number | null | undefined) {
  if (!totalMinutes || totalMinutes <= 0) return "—";

  const unit =
    DURATION_UNITS.find((u) => totalMinutes % u.factor === 0) ??
    DURATION_UNITS[DURATION_UNITS.length - 1];

  const value = totalMinutes / unit.factor;

  return `${value} ${unit.label}`;
}

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

function getSetupProgressColor(progress: number) {
  if (progress >= 80) return "bg-emerald-500";
  if (progress >= 50) return "bg-amber-400";
  return "bg-red-400";
}

function SetupProgressCell({ progress }: { progress: number }) {
  return (
    <div className="flex min-w-[84px] flex-col gap-1">
      <span className="text-[11px] font-semibold tabular-nums text-neutral-600">
        {progress}%
      </span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            getSetupProgressColor(progress),
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

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

function ProgramRowActions({ program }: { program: FilteredProgram }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const confirm = useConfirm();

  const publicUrl = program.category?.slug
    ? `/programs/${program.category.slug}/${program.slug}`
    : null;

  const refreshList = async () => {
    await utils.programs.getFiltered.invalidate();
  };

  const updateStatus = trpc.programs.updateStatus.useMutation({
    onSuccess: async () => {
      await refreshList();
      toast.success("Status program berhasil diperbarui");
    },
    onError: (err) => {
      toast.error(err.message ?? "Gagal memperbarui status program");
    },
  });

  const duplicateProgram = trpc.programs.duplicate.useMutation({
    onSuccess: async (newProgram) => {
      await refreshList();
      toast.success("Program berhasil diduplikat");

      if (newProgram?.id) {
        router.push(`/dashboard/programs/${newProgram.id}`);
      }
    },
    onError: (err) => {
      toast.error(err.message ?? "Gagal menduplikat program");
    },
  });

  const removeProgram = trpc.programs.remove.useMutation({
    onSuccess: async () => {
      await refreshList();
      toast.success("Program berhasil dihapus");
    },
    onError: (err) => {
      toast.error(err.message ?? "Gagal menghapus program");
    },
  });

  const isMutating =
    updateStatus.isPending ||
    duplicateProgram.isPending ||
    removeProgram.isPending;

  function handleOpenPublicPage() {
    if (!publicUrl) {
      toast.error("Kategori program belum tersedia");
      return;
    }

    window.open(publicUrl, "_blank", "noopener,noreferrer");
  }

  function handleDuplicate() {
    duplicateProgram.mutate({ id: program.id });
  }

  async function handleRemove() {
    const confirmed = await confirm({
      title: `Hapus program "${program.title}"?`,
      description: "Tindakan ini tidak bisa dibatalkan.",
      confirmText: "Hapus Program",
    });

    if (!confirmed) return;

    removeProgram.mutate({ id: program.id });
  }

  function handleStatusChange(status: ProgramStatus) {
    if (program.status === status) return;

    updateStatus.mutate({
      id: program.id,
      status,
    });
  }

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isMutating}
            className="size-7 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 data-[state=open]:bg-neutral-100 data-[state=open]:text-neutral-700 disabled:opacity-50"
            aria-label="Buka menu aksi"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            Aksi Program
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/programs/${program.id}`}
              className="flex cursor-pointer items-center gap-2 text-xs"
            >
              <Eye className="size-3.5 text-neutral-400" />
              Lihat detail
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={!publicUrl}
            onClick={handleOpenPublicPage}
            className="flex cursor-pointer items-center gap-2 text-xs"
          >
            <ExternalLink className="size-3.5 text-neutral-400" />
            Buka halaman publik
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={isMutating}
            onClick={handleDuplicate}
            className="flex cursor-pointer items-center gap-2 text-xs"
          >
            <Copy className="size-3.5 text-neutral-400" />
            Duplikat program
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {program.status !== "published" && (
            <DropdownMenuItem
              disabled={isMutating}
              onClick={() => handleStatusChange("published")}
              className="flex cursor-pointer items-center gap-2 text-xs text-emerald-700 focus:bg-emerald-50 focus:text-emerald-700"
            >
              <Eye className="size-3.5" />
              Publish program
            </DropdownMenuItem>
          )}

          {program.status !== "draft" && (
            <DropdownMenuItem
              disabled={isMutating}
              onClick={() => handleStatusChange("draft")}
              className="flex cursor-pointer items-center gap-2 text-xs"
            >
              <Clock className="size-3.5 text-neutral-400" />
              Jadikan draft
            </DropdownMenuItem>
          )}

          {program.status !== "archived" && (
            <DropdownMenuItem
              disabled={isMutating}
              onClick={() => handleStatusChange("archived")}
              className="flex cursor-pointer items-center gap-2 text-xs"
            >
              <Archive className="size-3.5 text-neutral-400" />
              Arsipkan program
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            disabled={isMutating}
            onClick={handleRemove}
            className="flex cursor-pointer items-center gap-2 text-xs text-red-600 focus:bg-red-50 focus:text-red-600"
          >
            <Trash2 className="size-3.5" />
            Hapus program
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
        const { title, slug, thumbnailUrl } = row.original;
        return (
          <div className="flex items-center gap-2.5 min-w-[180px] max-w-[260px]">
            <ProgramThumb thumbnail={thumbnailUrl} title={title} />
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
              <span>{formatProgramDuration(duration)}</span>
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
      cell: ({ row }) => <ProgramStatusBadge status={row.original.status} />,
      sortingFn: (a, b) => {
        const order = { published: 0, scheduled: 1, draft: 2, archived: 3 };
        return (
          (order[a.original.status as keyof typeof order] ?? 9) -
          (order[b.original.status as keyof typeof order] ?? 9)
        );
      },
    },

    // ── Setup progress ──
    {
      accessorKey: "setupProgress",
      header: ({ column }) => <SortHeader column={column} label="Progress" />,
      cell: ({ row }) => (
        <SetupProgressCell progress={row.original.setupProgress} />
      ),
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
      size: 56,
      minSize: 56,
      maxSize: 56,
      meta: {
        headerClassName:
          "sticky right-0 z-30 w-[56px] min-w-[56px] bg-white shadow-[-12px_0_18px_-18px_rgba(15,23,42,0.55)]",
        cellClassName:
          "sticky right-0 z-20 w-[56px] min-w-[56px] bg-white shadow-[-12px_0_18px_-18px_rgba(15,23,42,0.55)]",
      },
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => <ProgramRowActions program={row.original} />,
    },
  ];
}
