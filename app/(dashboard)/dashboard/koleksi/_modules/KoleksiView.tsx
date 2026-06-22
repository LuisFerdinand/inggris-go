// app/(dashboard)/dashboard/koleksi/_modules/KoleksiView.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  Bookmark,
  MessageSquare,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Eye,
  Clock,
  BookOpen,
  Inbox,
  ImageOff,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

function formatDate(value?: string | Date | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ─────────────────────────────────────────────────────────────
   TABS
───────────────────────────────────────────────────────────── */

type TabKey = "liked" | "saved" | "comments";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "liked", label: "Disukai", icon: Heart },
  { key: "saved", label: "Disimpan", icon: Bookmark },
  { key: "comments", label: "Komentar", icon: MessageSquare },
];

function TabBar({
  active,
  onChange,
  counts,
}: {
  active: TabKey;
  onChange: (v: TabKey) => void;
  counts: Partial<Record<TabKey, number>>;
}) {
  return (
    <div
      className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-2xl border bg-white p-1.5"
      style={{ borderColor: "var(--border-soft)" }}
    >
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        const count = counts[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-semibold transition-colors",
              isActive ? "text-white" : "text-slate-500 hover:bg-slate-50",
            )}
            style={isActive ? { background: "var(--blue-navy)" } : undefined}
          >
            <Icon className="size-3.5" />
            {label}
            {typeof count === "number" && (
              <span
                className={cn(
                  "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   POST CARD (used by liked + saved tabs)
───────────────────────────────────────────────────────────── */

type CollectionPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  status: string | null;
  publishedAt: string | Date | null;
  readTime: number | null;
  viewCount: number | null;
  category: { name: string; slug: string } | null;
  likedAt?: string | Date | null;
  savedAt?: string | Date | null;
};

function PostThumb({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div
        className="flex size-16 shrink-0 items-center justify-center rounded-xl"
        style={{ background: "var(--bg-soft)" }}
      >
        <ImageOff className="size-5" style={{ color: "var(--border)" }} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="size-16 shrink-0 rounded-xl object-cover"
    />
  );
}

function CollectionPostCard({
  post,
  badge,
}: {
  post: CollectionPost;
  badge: { icon: React.ElementType; label: string };
}) {
  const isUnpublished = post.status !== "published";
  const BadgeIcon = badge.icon;

  return (
    <div
      className="flex gap-3 rounded-2xl border bg-white p-3.5"
      style={{ borderColor: "var(--border-soft)" }}
    >
      <PostThumb src={post.coverImage} alt={post.title} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          {isUnpublished ? (
            <p
              className="line-clamp-2 text-[13.5px] font-bold"
              style={{ color: "var(--text-faint)" }}
            >
              {post.title}{" "}
              <span className="text-[10.5px] font-medium">(tidak tersedia)</span>
            </p>
          ) : (
            <Link
              href={`/blog/${post.slug}`}
              className="line-clamp-2 text-[13.5px] font-bold transition-colors hover:underline"
              style={{ color: "var(--text-main)" }}
            >
              {post.title}
            </Link>
          )}

          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold"
            style={{ background: "var(--surface-soft)", color: "var(--blue)" }}
          >
            <BadgeIcon className="size-3" />
          </span>
        </div>

        {post.excerpt && (
          <p
            className="mt-1 line-clamp-1 text-[11.5px]"
            style={{ color: "var(--text-faint)" }}
          >
            {post.excerpt}
          </p>
        )}

        <div
          className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px]"
          style={{ color: "var(--text-faint)" }}
        >
          {post.category && (
            <span className="font-semibold" style={{ color: "var(--blue)" }}>
              {post.category.name}
            </span>
          )}
          {post.readTime && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {post.readTime} mnt
            </span>
          )}
          {post.viewCount != null && (
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3" />
              {post.viewCount}
            </span>
          )}
          <span>
            {badge.label} {formatDate(post.likedAt ?? post.savedAt) ?? ""}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMMENT CARD
───────────────────────────────────────────────────────────── */

type MyComment = {
  id: string;
  content: string;
  status: string | null;
  createdAt: string | Date;
  post: {
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
    status: string | null;
  };
};

const COMMENT_STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: "Menunggu Moderasi", className: "bg-amber-50 text-amber-700" },
  approved: { label: "Tampil", className: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Ditolak", className: "bg-red-50 text-red-600" },
};

function CommentCard({ comment }: { comment: MyComment }) {
  const statusMeta = COMMENT_STATUS_META[comment.status ?? "approved"] ?? {
    label: comment.status ?? "—",
    className: "bg-slate-100 text-slate-500",
  };
  const isUnpublished = comment.post.status !== "published";

  return (
    <div
      className="rounded-2xl border bg-white p-3.5"
      style={{ borderColor: "var(--border-soft)" }}
    >
      <div className="flex items-start justify-between gap-2">
        {isUnpublished ? (
          <p
            className="line-clamp-1 text-[12.5px] font-bold"
            style={{ color: "var(--text-faint)" }}
          >
            {comment.post.title}
          </p>
        ) : (
          <Link
            href={`/blog/${comment.post.slug}`}
            className="line-clamp-1 text-[12.5px] font-bold transition-colors hover:underline"
            style={{ color: "var(--text-main)" }}
          >
            {comment.post.title}
          </Link>
        )}

        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
            statusMeta.className,
          )}
        >
          {statusMeta.label}
        </span>
      </div>

      <p
        className="mt-2 line-clamp-3 rounded-xl px-3 py-2 text-[12.5px] leading-relaxed"
        style={{ background: "var(--bg-soft)", color: "var(--text-muted)" }}
      >
        "{comment.content}"
      </p>

      <p className="mt-2 text-[10.5px]" style={{ color: "var(--text-faint)" }}>
        {formatDate(comment.createdAt)}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────── */

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
      <div
        className="flex size-12 items-center justify-center rounded-2xl"
        style={{ background: "var(--surface-soft)", color: "var(--blue)" }}
      >
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-[13.5px] font-bold" style={{ color: "var(--text-main)" }}>
          {title}
        </p>
        <p
          className="mx-auto mt-1.5 max-w-xs text-[12px] leading-relaxed"
          style={{ color: "var(--text-faint)" }}
        >
          {description}
        </p>
      </div>
      <Link
        href="/blog"
        className="mt-1 inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-[12.5px] font-bold text-white shadow-sm"
        style={{ background: "var(--blue-navy)" }}
      >
        <BookOpen className="size-4" />
        Jelajahi Artikel
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGER
───────────────────────────────────────────────────────────── */

function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[12px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="size-3.5" /> Sebelumnya
      </button>
      <p className="text-[11.5px] font-medium text-slate-400">
        {page} / {totalPages}
      </p>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[12px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Berikutnya <ChevronRight className="size-3.5" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN VIEW
───────────────────────────────────────────────────────────── */

const PAGE_SIZE = 8;

export function KoleksiView() {
  const [tab, setTab] = useState<TabKey>("liked");
  const [page, setPage] = useState(1);

  function handleTabChange(next: TabKey) {
    setTab(next);
    setPage(1);
  }

  const likedQuery = trpc.blog.getMyLikedPosts.useQuery(
    { page, limit: PAGE_SIZE },
    { enabled: tab === "liked", placeholderData: (prev) => prev },
  );

  const savedQuery = trpc.blog.getMySavedPosts.useQuery(
    { page, limit: PAGE_SIZE },
    { enabled: tab === "saved", placeholderData: (prev) => prev },
  );

  const commentsQuery = trpc.blog.getMyComments.useQuery(
    { page, limit: PAGE_SIZE },
    { enabled: tab === "comments", placeholderData: (prev) => prev },
  );

  const activeQuery =
    tab === "liked" ? likedQuery : tab === "saved" ? savedQuery : commentsQuery;

  const isLoading = activeQuery.isLoading && !activeQuery.data;

  const total =
    tab === "liked"
      ? likedQuery.data?.total
      : tab === "saved"
        ? savedQuery.data?.total
        : commentsQuery.data?.total;

  const totalPages = Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-4 px-4 pb-10 pt-4 sm:px-6">
      {/* Header */}
      <div>
        <h1
          className="text-[18px] font-extrabold sm:text-[20px]"
          style={{ color: "var(--text-main)" }}
        >
          Koleksi Saya
        </h1>
        <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--text-faint)" }}>
          Artikel yang kamu sukai, simpan, dan komentari.
        </p>
      </div>

      <TabBar
        active={tab}
        onChange={handleTabChange}
        counts={{
          liked: likedQuery.data?.total,
          saved: savedQuery.data?.total,
          comments: commentsQuery.data?.total,
        }}
      />

      {isLoading ? (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-white py-16"
          style={{ borderColor: "var(--border-soft)", color: "var(--text-faint)" }}
        >
          <Loader2 className="size-5 animate-spin" style={{ color: "var(--blue)" }} />
          <p className="text-[12.5px]">Memuat koleksi…</p>
        </div>
      ) : (
        <>
          {tab === "liked" && (
            <>
              {(likedQuery.data?.posts.length ?? 0) === 0 ? (
                <EmptyState
                  icon={Heart}
                  title="Belum ada artikel yang disukai"
                  description="Tekan ikon hati pada artikel yang kamu suka agar muncul di sini."
                />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {likedQuery.data!.posts.map((p) => (
                    <CollectionPostCard
                      key={p.id}
                      post={p as CollectionPost}
                      badge={{ icon: Heart, label: "Disukai" }}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "saved" && (
            <>
              {(savedQuery.data?.posts.length ?? 0) === 0 ? (
                <EmptyState
                  icon={Bookmark}
                  title="Belum ada artikel yang disimpan"
                  description="Simpan artikel menarik untuk dibaca lagi nanti."
                />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {savedQuery.data!.posts.map((p) => (
                    <CollectionPostCard
                      key={p.id}
                      post={p as CollectionPost}
                      badge={{ icon: Bookmark, label: "Disimpan" }}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "comments" && (
            <>
              {(commentsQuery.data?.comments.length ?? 0) === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="Belum ada komentar"
                  description="Komentar yang kamu tulis di artikel akan muncul di sini."
                />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {commentsQuery.data!.comments.map((c) => (
                    <CommentCard key={c.id} comment={c as MyComment} />
                  ))}
                </div>
              )}
            </>
          )}

          <Pager page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}