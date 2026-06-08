// app/(dashboard)/dashboard/programs/categories/_modules/CategoriesManager.tsx
"use client";

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Loader2,
  Pencil,
  Tags,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import type { FilteredCategory } from "@/app/modules/program/server/category.router";

/* ─────────────────────────────────────────────────────────────
   STATUS META
───────────────────────────────────────────────────────────── */

const STATUS_META: Record<
  string,
  { label: string; pill: string }
> = {
  published: {
    label: "Terbit",
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  draft: {
    label: "Draf",
    pill: "border-blue-200 bg-blue-50 text-blue-700",
  },
  archived: {
    label: "Diarsip",
    pill: "border-neutral-200 bg-neutral-50 text-neutral-500",
  },
};

/* ─────────────────────────────────────────────────────────────
   SUMMARY STRIP (mirrors the programs page)
───────────────────────────────────────────────────────────── */

function SummaryStrip({ data }: { data: FilteredCategory[] }) {
  const published = data.filter((d) => d.status === "published").length;
  const draft = data.filter((d) => d.status === "draft").length;
  const archived = data.filter((d) => d.status === "archived").length;

  const stats = [
    {
      label: "Total Kategori",
      value: data.length,
      sub: "semua kategori",
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
    <div className="grid grid-cols-2 border-b border-neutral-100 bg-neutral-50/40 sm:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={cn(
            "relative flex flex-col justify-between gap-3 px-5 py-4",
            i < stats.length - 1 && "sm:border-r border-neutral-100",
            i % 2 === 0 && "border-r border-neutral-100 sm:border-r-0",
            i < 2 && "border-b border-neutral-100 sm:border-b-0",
          )}
        >
          <div className="flex items-center gap-1.5">
            <span className={cn("size-1.5 shrink-0 rounded-full", s.dotClass)} />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
              {s.label}
            </p>
          </div>

          <div className="flex items-end justify-between gap-2">
            <p
              className={cn(
                "text-[28px] font-bold leading-none tracking-tight tabular-nums",
                s.valueClass,
              )}
            >
              {s.value}
            </p>
            <p className="mb-0.5 text-right text-[10px] leading-tight text-neutral-400">
              {s.sub}
            </p>
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className={cn("h-full rounded-full transition-all duration-500", s.barClass)}
              style={{ width: `${s.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CATEGORY CARD
───────────────────────────────────────────────────────────── */

function CtrlBtn({
  children,
  onClick,
  disabled,
  danger,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex size-7 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        danger
          ? "hover:border-red-200 hover:bg-red-50 hover:text-red-500"
          : "hover:border-neutral-300 hover:text-neutral-600",
      )}
    >
      {children}
    </button>
  );
}

function CategoryCard({
  category,
  index,
  total,
  busy,
  onEdit,
  onMove,
  onDelete,
}: {
  category: FilteredCategory;
  index: number;
  total: number;
  busy: boolean;
  onEdit: () => void;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
}) {
  const status = STATUS_META[category.status] ?? STATUS_META.draft;
  const theme = category.themePrimary || "#4da3ff";
  const hasPrograms = category.programCount > 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-colors hover:bg-neutral-50/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${theme}1A`, color: theme }}
          >
            <Icon name={category.icon ?? undefined} className="size-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-[13px] font-bold text-neutral-800">
                {category.label}
              </h3>
              <span
                className={cn(
                  "rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
                  status.pill,
                )}
              >
                {status.label}
              </span>
            </div>
            <p className="mt-0.5 truncate font-mono text-[11px] text-neutral-400">
              /{category.slug}
            </p>
          </div>
        </div>

        <CtrlBtn title="Edit" onClick={onEdit}>
          <Pencil className="size-3.5" />
        </CtrlBtn>
      </div>

      {category.tagline ? (
        <p className="line-clamp-2 text-[12px] leading-relaxed text-neutral-500">
          {category.tagline}
        </p>
      ) : (
        <p className="text-[12px] italic text-neutral-300">Belum ada tagline</p>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
          <BookOpen className="size-3.5 text-neutral-400" />
          {category.programCount} program
        </span>

        <div className="flex items-center gap-1.5">
          <CtrlBtn
            title="Naikkan urutan"
            disabled={index === 0 || busy}
            onClick={() => onMove("up")}
          >
            <ArrowUp className="size-3.5" />
          </CtrlBtn>
          <CtrlBtn
            title="Turunkan urutan"
            disabled={index === total - 1 || busy}
            onClick={() => onMove("down")}
          >
            <ArrowDown className="size-3.5" />
          </CtrlBtn>
          <CtrlBtn
            danger
            title={
              hasPrograms
                ? "Tidak bisa dihapus: masih ada program"
                : "Hapus kategori"
            }
            disabled={hasPrograms || busy}
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
          </CtrlBtn>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MANAGER
───────────────────────────────────────────────────────────── */

export function CategoriesManager({
  onEdit,
}: {
  onEdit: (id: string) => void;
}) {
  const utils = trpc.useUtils();
  const { data = [], isLoading } = trpc.categories.getFiltered.useQuery({});

  const invalidate = () => utils.categories.getFiltered.invalidate();

  const move = trpc.categories.move.useMutation({
    onSuccess: invalidate,
    onError: (e) => toast.error(e.message || "Gagal mengubah urutan"),
  });

  const remove = trpc.categories.remove.useMutation({
    onSuccess: async () => {
      await invalidate();
      toast.success("Kategori dihapus");
    },
    onError: (e) => toast.error(e.message || "Gagal menghapus kategori"),
  });

  const busy = move.isPending || remove.isPending;

  return (
    <div className="flex w-full px-4 pb-8">
      <div className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <SummaryStrip data={data} />

        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-neutral-400">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/60 px-6 py-14 text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-400 shadow-sm">
                <Tags className="size-4" />
              </div>
              <p className="text-[13px] font-bold text-neutral-800">
                Belum ada kategori
              </p>
              <p className="mx-auto mt-1 max-w-md text-[12px] text-neutral-400">
                Buat kategori pertama seperti Online, Offline, atau Leads lewat
                tombol “Kategori Baru”.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                  total={data.length}
                  busy={busy}
                  onEdit={() => onEdit(category.id)}
                  onMove={(direction) =>
                    move.mutate({ id: category.id, direction })
                  }
                  onDelete={() => {
                    if (
                      window.confirm(
                        `Hapus kategori "${category.label}"? Tindakan ini tidak bisa dibatalkan.`,
                      )
                    ) {
                      remove.mutate({ id: category.id });
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}