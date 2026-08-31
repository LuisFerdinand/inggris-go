// app/(dashboard)/dashboard/blog/_modules/BlogManager.tsx
"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import {
  Archive,
  Clock,
  Eye,
  FileText,
  Globe,
  Loader2,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  X,
  BookOpen,
  Hash,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
/* ── Native date helpers (no date-fns dependency) ── */
function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} minggu lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bulan lalu`;
  return `${Math.floor(months / 12)} tahun lalu`;
}

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/ui/confirm-dialog";

import type { PostStatus } from "@/app/modules/blog/blog.schema";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */

const STATUS_META: Record<
  PostStatus | string,
  { label: string; pill: string; icon: React.ReactNode; dotClass: string }
> = {
  published: {
    label: "Terbit",
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClass: "bg-emerald-500",
    icon: <Globe className="size-3" />,
  },
  draft: {
    label: "Draf",
    pill: "border-blue-200 bg-blue-50 text-blue-700",
    dotClass: "bg-blue-500",
    icon: <Pencil className="size-3" />,
  },
  archived: {
    label: "Diarsip",
    pill: "border-neutral-200 bg-neutral-50 text-neutral-500",
    dotClass: "bg-neutral-300",
    icon: <Archive className="size-3" />,
  },
};

const ALL_STATUSES: (PostStatus | "")[] = ["", "draft", "published", "archived"];

/* ─────────────────────────────────────────────────────────────
   SUMMARY STRIP
───────────────────────────────────────────────────────────── */

function SummaryStrip({
  stats,
}: {
  stats: { total: number; published: number; draft: number; archived: number };
}) {
  const items = [
    {
      label: "Total Artikel",
      value: stats.total,
      sub: "semua artikel",
      valueClass: "text-neutral-800",
      dotClass: "bg-neutral-300",
      barClass: "bg-neutral-200",
      pct: 100,
    },
    {
      label: "Terbit",
      value: stats.published,
      sub: "live di website",
      valueClass: "text-emerald-700",
      dotClass: "bg-emerald-500",
      barClass: "bg-emerald-500",
      pct: stats.total ? Math.round((stats.published / stats.total) * 100) : 0,
    },
    {
      label: "Draf",
      value: stats.draft,
      sub: "sedang diedit",
      valueClass: "text-blue-700",
      dotClass: "bg-blue-500",
      barClass: "bg-blue-500",
      pct: stats.total ? Math.round((stats.draft / stats.total) * 100) : 0,
    },
    {
      label: "Diarsip",
      value: stats.archived,
      sub: "disembunyikan",
      valueClass: "text-neutral-400",
      dotClass: "bg-neutral-300",
      barClass: "bg-neutral-300",
      pct: stats.total ? Math.round((stats.archived / stats.total) * 100) : 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 border-b border-neutral-100 bg-neutral-50/40 sm:grid-cols-4">
      {items.map((s, i) => (
        <div
          key={s.label}
          className={cn(
            "relative flex flex-col justify-between gap-3 px-5 py-4",
            i < items.length - 1 && "sm:border-r border-neutral-100",
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
   STATUS BADGE
───────────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.draft;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        meta.pill,
      )}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROW ACTION MENU
   Uses fixed positioning calculated from the trigger button's
   bounding rect so the dropdown is never clipped by
   overflow-x:auto on the table wrapper.
───────────────────────────────────────────────────────────── */

function RowActions({
  postId,
  currentStatus,
  onStatusChange,
  onDelete,
}: {
  postId: string;
  currentStatus: string;
  onStatusChange: (status: PostStatus) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const handleOpen = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    // Anchor to the right edge of the button, just below it
    setMenuPos({
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
    });
    setOpen(true);
  };

  // Close on scroll so the menu doesn't drift from its trigger
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", close, { capture: true });
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleOpen}
        className="flex size-7 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition-colors hover:border-neutral-300 hover:text-neutral-600"
      >
        <MoreHorizontal className="size-3.5" />
      </button>

      {open && (
        <>
          {/* Invisible backdrop to close on outside click */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Menu is fixed to the viewport — never clipped by overflow */}
          <div
            className="fixed z-50 min-w-[168px] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl shadow-neutral-900/10"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            <button
              onClick={() => {
                router.push(`/dashboard/blog/${postId}`);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
            >
              <Pencil className="size-3.5 text-neutral-400" />
              Edit Artikel
            </button>

            <div className="mx-3 h-px bg-neutral-100" />

            {currentStatus !== "published" && (
              <button
                onClick={() => { onStatusChange("published"); setOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
              >
                <Globe className="size-3.5" />
                Terbitkan
              </button>
            )}

            {currentStatus !== "draft" && (
              <button
                onClick={() => { onStatusChange("draft"); setOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] font-medium text-blue-600 transition-colors hover:bg-blue-50"
              >
                <Pencil className="size-3.5" />
                Ke Draf
              </button>
            )}

            {currentStatus !== "archived" && (
              <button
                onClick={() => { onStatusChange("archived"); setOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
              >
                <Archive className="size-3.5" />
                Arsipkan
              </button>
            )}

            <div className="mx-3 h-px bg-neutral-100" />

            <button
              onClick={() => { onDelete(); setOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] font-medium text-red-500 transition-colors hover:bg-red-50"
            >
              <Trash2 className="size-3.5" />
              Hapus
            </button>
          </div>
        </>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────── */

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 text-neutral-300">
        <FileText className="size-5" />
      </div>
      <p className="text-[13px] font-bold text-neutral-700">
        {hasFilter ? "Tidak ada artikel yang cocok" : "Belum ada artikel"}
      </p>
      <p className="mx-auto mt-1 max-w-xs text-[12px] text-neutral-400">
        {hasFilter
          ? "Coba ubah filter atau kata kunci pencarian."
          : "Mulai tulis artikel pertama untuk blog Anda."}
      </p>
      {!hasFilter && (
        <button
          onClick={() => router.push("/dashboard/blog/new")}
          className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-blue-700"
        >
          Tulis Artikel Pertama
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MANAGER
───────────────────────────────────────────────────────────── */

export function BlogManager() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const confirm = useConfirm();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "">("");
  const [page, setPage] = useState(1);

  const LIMIT = 20;

  const { data: stats } = trpc.blog.getStats.useQuery();
  const { data, isLoading } = trpc.blog.getFiltered.useQuery({
    searchQuery: search || undefined,
    status: (statusFilter as PostStatus) || undefined,
    page,
    limit: LIMIT,
  });

  const invalidate = () => {
    utils.blog.getFiltered.invalidate();
    utils.blog.getStats.invalidate();
  };

  const setStatus = trpc.blog.setStatus.useMutation({
    onSuccess: (_, vars) => {
      invalidate();
      const label = STATUS_META[vars.status]?.label ?? vars.status;
      toast.success(`Status diubah ke: ${label}`);
    },
    onError: (e) => toast.error(e.message || "Gagal mengubah status"),
  });

  const remove = trpc.blog.remove.useMutation({
    onSuccess: async () => {
      await invalidate();
      toast.success("Artikel dihapus");
    },
    onError: (e) => toast.error(e.message || "Gagal menghapus artikel"),
  });

  const busy = setStatus.isPending || remove.isPending;
  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);
  const hasFilter = !!(search || statusFilter);

  return (
    <div className="flex w-full px-4 pb-8">
      <div className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {/* Summary strip */}
        {stats && <SummaryStrip stats={stats} />}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-neutral-100 bg-neutral-50/60 px-4 py-3">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari judul artikel…"
              className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-8 pr-8 text-[12px] placeholder:text-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="size-3.5 text-neutral-400 hover:text-red-500" />
              </button>
            )}
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-1">
            {ALL_STATUSES.map((s) => {
              const isActive = statusFilter === s;
              const meta = s ? STATUS_META[s] : null;
              return (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all",
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700",
                  )}
                >
                  {meta?.icon && <span>{meta.icon}</span>}
                  {s === "" ? "Semua" : meta?.label}
                </button>
              );
            })}
          </div>

          {hasFilter && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setPage(1);
              }}
              className="flex items-center gap-1 text-[11px] font-medium text-red-500 hover:text-red-600"
            >
              <X className="size-3" /> Reset
            </button>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-neutral-400">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState hasFilter={hasFilter} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                      Artikel
                    </th>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                      Status
                    </th>
                    <th className="hidden px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400 md:table-cell">
                      Tag
                    </th>
                    <th className="hidden px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400 lg:table-cell">
                      Dibuat
                    </th>
                    <th className="hidden px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400 lg:table-cell">
                      Views
                    </th>
                    <th className="w-10 px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {posts.map((p) => (
                    <tr
                      key={p.id}
                      className="group transition-colors hover:bg-neutral-50/60"
                    >
                      {/* Artikel */}
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          {p.coverImage ? (
                            <img
                              src={p.coverImage}
                              alt={p.title}
                              className="size-10 shrink-0 rounded-lg object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-300">
                              <BookOpen className="size-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <button
                              onClick={() =>
                                router.push(`/dashboard/blog/${p.id}`)
                              }
                              className="line-clamp-1 text-left text-[13px] font-semibold text-neutral-800 transition-colors hover:text-blue-600"
                            >
                              {p.title}
                            </button>
                            {p.excerpt && (
                              <p className="mt-0.5 line-clamp-1 font-mono text-[11px] text-neutral-400">
                                /{p.slug}
                              </p>
                            )}
                            {p.readTime && (
                              <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-neutral-400">
                                <Clock className="size-2.5" />
                                {p.readTime} mnt baca
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status ?? "draft"} />
                        {p.publishedAt && (
                          <p className="mt-1 text-[10px] text-neutral-400">
                            {formatDate(new Date(p.publishedAt))}
                          </p>
                        )}
                      </td>

                      {/* Tags */}
                      <td className="hidden px-4 py-3 md:table-cell">
                        {p.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {p.tags.slice(0, 3).map((t) => (
                              <span
                                key={t.id}
                                className="inline-flex items-center gap-0.5 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500"
                              >
                                <Hash className="size-2.5" />
                                {t.name}
                              </span>
                            ))}
                            {p.tags.length > 3 && (
                              <span className="text-[10px] text-neutral-400">
                                +{p.tags.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] italic text-neutral-300">
                            Tidak ada tag
                          </span>
                        )}
                      </td>

                      {/* Created at */}
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <span className="text-[11px] text-neutral-500">
                          {timeAgo(new Date(p.createdAt))}
                        </span>
                      </td>

                      {/* Views */}
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                          <Eye className="size-3 text-neutral-400" />
                          {(p.viewCount ?? 0).toLocaleString("id-ID")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <RowActions
                          postId={p.id}
                          currentStatus={p.status ?? "draft"}
                          onStatusChange={(status) =>
                            setStatus.mutate({ id: p.id, status })
                          }
                          onDelete={async () => {
                            if (
                              await confirm({
                                title: `Hapus artikel "${p.title}"?`,
                                description: "Tindakan ini tidak bisa dibatalkan.",
                                confirmText: "Hapus Artikel",
                              })
                            ) {
                              remove.mutate({ id: p.id });
                            }
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
                <p className="text-[11px] text-neutral-400">
                  {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} dari{" "}
                  {total} artikel
                </p>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="flex size-7 items-center justify-center rounded-lg border border-neutral-200 bg-white text-[11px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p2) =>
                        p2 === 1 ||
                        p2 === totalPages ||
                        Math.abs(p2 - page) <= 1,
                    )
                    .map((p2, i, arr) => (
                      <>
                        {i > 0 && arr[i - 1] !== p2 - 1 && (
                          <span
                            key={`ellipsis-${p2}`}
                            className="px-1 text-[11px] text-neutral-400"
                          >
                            …
                          </span>
                        )}
                        <button
                          key={p2}
                          onClick={() => setPage(p2)}
                          className={cn(
                            "flex size-7 items-center justify-center rounded-lg text-[11px] font-medium transition-colors",
                            p2 === page
                              ? "bg-blue-600 text-white"
                              : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50",
                          )}
                        >
                          {p2}
                        </button>
                      </>
                    ))}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="flex size-7 items-center justify-center rounded-lg border border-neutral-200 bg-white text-[11px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}