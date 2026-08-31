// app/(dashboard)/dashboard/blog/comments/_modules/CommentsManager.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Loader2,
  MessageSquare,
  MessageSquareOff,
  MoreHorizontal,
  Search,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/ui/confirm-dialog";

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

type CommentStatus = "pending" | "approved" | "rejected";

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

function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_META: Record<
  CommentStatus,
  { label: string; pill: string; dotClass: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Menunggu",
    pill: "border-amber-200 bg-amber-50 text-amber-700",
    dotClass: "bg-amber-400",
    icon: <Clock className="size-3" />,
  },
  approved: {
    label: "Disetujui",
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClass: "bg-emerald-500",
    icon: <Check className="size-3" />,
  },
  rejected: {
    label: "Ditolak",
    pill: "border-red-200 bg-red-50 text-red-600",
    dotClass: "bg-red-400",
    icon: <XCircle className="size-3" />,
  },
};

const ALL_STATUSES: (CommentStatus | "")[] = ["", "pending", "approved", "rejected"];

const LIMIT = 15;

/* ─────────────────────────────────────────────────────────────
   SUMMARY STRIP
───────────────────────────────────────────────────────────── */

function SummaryStrip({
  stats,
}: {
  stats: { total: number; pending: number; approved: number; rejected: number };
}) {
  const items = [
    {
      label: "Total Komentar",
      value: stats.total,
      sub: "semua komentar",
      valueClass: "text-neutral-800",
      dotClass: "bg-neutral-300",
      barClass: "bg-neutral-200",
      pct: 100,
    },
    {
      label: "Menunggu",
      value: stats.pending,
      sub: "perlu ditinjau",
      valueClass: "text-amber-600",
      dotClass: "bg-amber-400",
      barClass: "bg-amber-400",
      pct: stats.total ? Math.round((stats.pending / stats.total) * 100) : 0,
    },
    {
      label: "Disetujui",
      value: stats.approved,
      sub: "tampil di blog",
      valueClass: "text-emerald-700",
      dotClass: "bg-emerald-500",
      barClass: "bg-emerald-500",
      pct: stats.total ? Math.round((stats.approved / stats.total) * 100) : 0,
    },
    {
      label: "Ditolak",
      value: stats.rejected,
      sub: "disembunyikan",
      valueClass: "text-red-500",
      dotClass: "bg-red-400",
      barClass: "bg-red-400",
      pct: stats.total ? Math.round((stats.rejected / stats.total) * 100) : 0,
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
            <p className={cn("text-[28px] font-bold leading-none tracking-tight tabular-nums", s.valueClass)}>
              {s.value}
            </p>
            <p className="mb-0.5 text-right text-[10px] leading-tight text-neutral-400">{s.sub}</p>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100">
            <div className={cn("h-full rounded-full transition-all duration-500", s.barClass)} style={{ width: `${s.pct}%` }} />
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
  const meta = STATUS_META[status as CommentStatus] ?? STATUS_META.pending;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", meta.pill)}>
      {meta.icon}
      {meta.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────────────────────── */

function Avatar({ name, image }: { name: string; image: string | null }) {
  if (image) {
    return <img src={image} alt={name} className="size-9 shrink-0 rounded-full object-cover" />;
  }
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[12px] font-bold text-white">
      {initial}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROW ACTIONS — fixed-position dropdown (matches BlogManager fix)
───────────────────────────────────────────────────────────── */

function RowActions({
  status,
  onSetStatus,
  onDelete,
  busy,
}: {
  status: string;
  onSetStatus: (s: CommentStatus) => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleOpen = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    setOpen(true);
  };

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
        disabled={busy}
        className="flex size-7 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition-colors hover:border-neutral-300 hover:text-neutral-600 disabled:opacity-50"
      >
        {busy ? <Loader2 className="size-3.5 animate-spin" /> : <MoreHorizontal className="size-3.5" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 min-w-[168px] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl shadow-neutral-900/10"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            {status !== "approved" && (
              <button
                onClick={() => { onSetStatus("approved"); setOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
              >
                <Check className="size-3.5" />
                Setujui
              </button>
            )}
            {status !== "pending" && (
              <button
                onClick={() => { onSetStatus("pending"); setOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] font-medium text-amber-600 transition-colors hover:bg-amber-50"
              >
                <Clock className="size-3.5" />
                Tandai Menunggu
              </button>
            )}
            {status !== "rejected" && (
              <button
                onClick={() => { onSetStatus("rejected"); setOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] font-medium text-red-500 transition-colors hover:bg-red-50"
              >
                <XCircle className="size-3.5" />
                Tolak
              </button>
            )}

            <div className="mx-3 h-px bg-neutral-100" />

            <button
              onClick={() => { onDelete(); setOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] font-medium text-red-500 transition-colors hover:bg-red-50"
            >
              <Trash2 className="size-3.5" />
              Hapus Permanen
            </button>
          </div>
        </>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMMENT ROW
───────────────────────────────────────────────────────────── */

type CommentItem = {
  id: string;
  content: string;
  status: string;
  createdAt: Date;
  updatedAt: Date | null;
  user: { id: string; name: string; image: string | null; email: string };
  post: { id: string; title: string; slug: string };
};

function CommentRow({
  comment,
  selected,
  onToggleSelect,
  onSetStatus,
  onDelete,
  busy,
}: {
  comment: CommentItem;
  selected: boolean;
  onToggleSelect: () => void;
  onSetStatus: (s: CommentStatus) => void;
  onDelete: () => void;
  busy: boolean;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 border-b border-neutral-100 px-4 py-3.5 transition-colors last:border-0",
        selected ? "bg-blue-50/50" : "hover:bg-neutral-50/70",
      )}
    >
      {/* Checkbox */}
      <div className="flex items-start pt-1.5">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="size-3.5 cursor-pointer rounded border-neutral-300 text-blue-600 focus:ring-blue-500/30"
        />
      </div>

      {/* Avatar */}
      <Avatar name={comment.user.name} image={comment.user.image} />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[12.5px] font-semibold text-neutral-800">{comment.user.name}</p>
          <span className="text-[11px] text-neutral-400">{comment.user.email}</span>
          <StatusBadge status={comment.status} />
        </div>

        <p className="mt-1 text-[13px] leading-relaxed text-neutral-700">{comment.content}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-400">
          <span title={formatDate(comment.createdAt)}>{timeAgo(comment.createdAt)}</span>
          <span className="text-neutral-200">·</span>
          <a
            href={`/blog/${comment.post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-medium text-blue-500 hover:text-blue-600 hover:underline"
          >
            {comment.post.title}
            <ExternalLink className="size-2.5" />
          </a>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex shrink-0 items-start gap-1.5 pt-0.5">
        {comment.status !== "approved" && (
          <button
            onClick={() => onSetStatus("approved")}
            disabled={busy}
            title="Setujui"
            className="flex size-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 disabled:opacity-50"
          >
            <Check className="size-3.5" />
          </button>
        )}
        {comment.status !== "rejected" && (
          <button
            onClick={() => onSetStatus("rejected")}
            disabled={busy}
            title="Tolak"
            className="flex size-7 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <X className="size-3.5" />
          </button>
        )}
        <RowActions status={comment.status} onSetStatus={onSetStatus} onDelete={onDelete} busy={busy} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────── */

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-neutral-100">
        {hasFilter ? (
          <MessageSquareOff className="size-5 text-neutral-400" />
        ) : (
          <MessageSquare className="size-5 text-neutral-400" />
        )}
      </div>
      <p className="mt-3 text-[13px] font-semibold text-neutral-600">
        {hasFilter ? "Tidak ada komentar yang cocok" : "Belum ada komentar"}
      </p>
      <p className="mt-1 text-[12px] text-neutral-400">
        {hasFilter
          ? "Coba ubah kata kunci atau filter status."
          : "Komentar dari pembaca blog akan muncul di sini."}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MANAGER
───────────────────────────────────────────────────────────── */

export function CommentsManager() {
  const utils = trpc.useUtils();
  const confirm = useConfirm();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CommentStatus | "">("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: stats } = trpc.blog.getCommentStats.useQuery();
  const { data, isLoading } = trpc.blog.getCommentsAdmin.useQuery({
    status: statusFilter || undefined,
    searchQuery: search || undefined,
    page,
    limit: LIMIT,
  });

  const invalidate = () => {
    utils.blog.getCommentsAdmin.invalidate();
    utils.blog.getCommentStats.invalidate();
  };

  const setStatus = trpc.blog.setCommentStatus.useMutation({
    onSuccess: (_, vars) => {
      invalidate();
      toast.success(`Komentar ditandai: ${STATUS_META[vars.status].label}`);
    },
    onError: (e) => toast.error(e.message || "Gagal mengubah status"),
  });

  const remove = trpc.blog.deleteComment.useMutation({
    onSuccess: async () => {
      await invalidate();
      toast.success("Komentar dihapus");
    },
    onError: (e) => toast.error(e.message || "Gagal menghapus komentar"),
  });

  const bulkSetStatus = trpc.blog.bulkSetCommentStatus.useMutation({
    onSuccess: async (data, vars) => {
      await invalidate();
      setSelectedIds(new Set());
      toast.success(`${data.count} komentar ditandai: ${STATUS_META[vars.status].label}`);
    },
    onError: (e) => toast.error(e.message || "Gagal memperbarui komentar"),
  });

  const bulkRemove = trpc.blog.bulkDeleteComments.useMutation({
    onSuccess: async (data) => {
      await invalidate();
      setSelectedIds(new Set());
      toast.success(`${data.count} komentar dihapus`);
    },
    onError: (e) => toast.error(e.message || "Gagal menghapus komentar"),
  });

  const busyId = (id: string) =>
    (setStatus.isPending && setStatus.variables?.id === id) ||
    (remove.isPending && remove.variables?.id === id);

  const comments = data?.comments ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);
  const hasFilter = !!(search || statusFilter);

  const allSelected = comments.length > 0 && comments.every((c) => selectedIds.has(c.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(comments.map((c) => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkBusy = bulkSetStatus.isPending || bulkRemove.isPending;

  return (
    <div className="flex w-full px-4 pb-8">
      <div className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {/* Summary strip */}
        {stats && <SummaryStrip stats={stats} />}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-neutral-100 bg-neutral-50/60 px-4 py-3">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari komentar, nama, atau judul artikel…"
              className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-8 pr-8 text-[12px] placeholder:text-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="size-3.5 text-neutral-400 hover:text-red-500" />
              </button>
            )}
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-1">
            {ALL_STATUSES.map((s) => {
              const isTabActive = statusFilter === s;
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
                    isTabActive ? "bg-blue-600 text-white shadow-sm" : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700",
                  )}
                >
                  {meta?.icon}
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

        {/* Bulk action bar — appears when items are selected */}
        {someSelected && (
          <div className="flex flex-wrap items-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-2.5">
            <span className="text-[12px] font-semibold text-blue-700">
              {selectedIds.size} dipilih
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() => bulkSetStatus.mutate({ ids: [...selectedIds], status: "approved" })}
                disabled={bulkBusy}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-50"
              >
                <CheckCheck className="size-3.5" />
                Setujui
              </button>
              <button
                onClick={() => bulkSetStatus.mutate({ ids: [...selectedIds], status: "rejected" })}
                disabled={bulkBusy}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle className="size-3.5" />
                Tolak
              </button>
              <button
                onClick={async () => {
                  if (
                    await confirm({
                      title: `Hapus permanen ${selectedIds.size} komentar?`,
                      description:
                        "Komentar yang dipilih akan dihapus permanen dan tidak bisa dikembalikan.",
                      confirmText: "Hapus Permanen",
                    })
                  ) {
                    bulkRemove.mutate({ ids: [...selectedIds] });
                  }
                }}
                disabled={bulkBusy}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                {bulkBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                Hapus
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-blue-600 hover:text-blue-700"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Select-all row */}
        {comments.length > 0 && (
          <div className="flex items-center gap-3 border-b border-neutral-100 bg-white px-4 py-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="size-3.5 cursor-pointer rounded border-neutral-300 text-blue-600 focus:ring-blue-500/30"
            />
            <span className="text-[11px] font-medium text-neutral-400">
              {allSelected ? "Batalkan pilih semua" : "Pilih semua di halaman ini"}
            </span>
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-blue-400" />
          </div>
        ) : comments.length === 0 ? (
          <EmptyState hasFilter={hasFilter} />
        ) : (
          <div>
            {comments.map((comment) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                selected={selectedIds.has(comment.id)}
                onToggleSelect={() => toggleSelect(comment.id)}
                busy={busyId(comment.id)}
                onSetStatus={(status) => setStatus.mutate({ id: comment.id, status })}
                onDelete={async () => {
                  if (
                    await confirm({
                      title: "Hapus komentar ini secara permanen?",
                      description:
                        "Komentar akan dihapus permanen dan tidak bisa dikembalikan.",
                      confirmText: "Hapus Permanen",
                    })
                  ) {
                    remove.mutate({ id: comment.id });
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
            <p className="text-[11px] text-neutral-400">
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} dari {total} komentar
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
                .filter((p2) => p2 === 1 || p2 === totalPages || Math.abs(p2 - page) <= 1)
                .map((p2, i, arr) => (
                  <span key={p2} className="flex items-center">
                    {i > 0 && arr[i - 1] !== p2 - 1 && (
                      <span className="px-1 text-[11px] text-neutral-400">…</span>
                    )}
                    <button
                      onClick={() => setPage(p2)}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg text-[11px] font-medium transition-colors",
                        p2 === page ? "bg-blue-600 text-white" : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50",
                      )}
                    >
                      {p2}
                    </button>
                  </span>
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
      </div>
    </div>
  );
}