// app/(home)/blog/[slug]/page.tsx
"use client";

import {
  use,
  useEffect,
  useRef,
  useState,
  useCallback,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  GraduationCap,
  Hash,
  Heart,
  Link2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  Send,
  LogIn,
  User,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/* =========================================================
   CATEGORY / TAG THEME
========================================================= */

const TAG_THEME: Record<
  string,
  { gradient: string; border: string; accent: string; text: string; pill: string }
> = {
  beginner:          { gradient: "from-blue-600 to-indigo-700",    border: "border-l-blue-500",   accent: "#1e6eee", text: "text-blue-600",   pill: "bg-blue-50 text-blue-700 border-blue-200" },
  "daily-conversation": { gradient: "from-teal-500 to-cyan-700",   border: "border-l-teal-500",   accent: "#2db8b0", text: "text-teal-600",   pill: "bg-teal-50 text-teal-700 border-teal-200" },
  "grammar-basics":  { gradient: "from-teal-500 to-cyan-700",      border: "border-l-teal-500",   accent: "#2db8b0", text: "text-teal-600",   pill: "bg-teal-50 text-teal-700 border-teal-200" },
  confidence:        { gradient: "from-violet-500 to-purple-700",  border: "border-l-violet-500", accent: "#8b5cf6", text: "text-violet-600", pill: "bg-violet-50 text-violet-700 border-violet-200" },
  vocabulary:        { gradient: "from-orange-500 to-red-600",     border: "border-l-orange-500", accent: "#ff6b35", text: "text-orange-600", pill: "bg-orange-50 text-orange-700 border-orange-200" },
  "speaking-tips":   { gradient: "from-blue-600 to-indigo-700",    border: "border-l-blue-500",   accent: "#1e6eee", text: "text-blue-600",   pill: "bg-blue-50 text-blue-700 border-blue-200" },
  "study-habits":    { gradient: "from-emerald-500 to-teal-600",   border: "border-l-emerald-500",accent: "#10b981", text: "text-emerald-600",pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const DEFAULT_THEME = {
  gradient: "from-slate-600 to-slate-800",
  border: "border-l-slate-400",
  accent: "#64748b",
  text: "text-slate-600",
  pill: "bg-slate-50 text-slate-600 border-slate-200",
};

function getTheme(slug?: string) {
  if (!slug) return DEFAULT_THEME;
  return TAG_THEME[slug] ?? DEFAULT_THEME;
}

/* =========================================================
   READING PROGRESS BAR
========================================================= */

function ReadingProgressBar({ color }: { color: string }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px]">
      <div className="h-full" style={{ width: `${progress}%`, background: color, transition: "none" }} />
    </div>
  );
}

/* =========================================================
   COPY LINK BUTTON
========================================================= */

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-[12px] font-semibold text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
    >
      {copied ? (
        <><CheckCircle2 className="size-3.5 text-emerald-500" />Tersalin!</>
      ) : (
        <><Link2 className="size-3.5" />Salin link</>
      )}
    </button>
  );
}

/* =========================================================
   LIKE BUTTON
========================================================= */

function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [optimisticLiked, setOptimisticLiked] = useState(initialLiked);
  const [optimisticCount, setOptimisticCount] = useState(initialCount);

  // Keep in sync when server data loads
  useEffect(() => { setOptimisticLiked(initialLiked); }, [initialLiked]);
  useEffect(() => { setOptimisticCount(initialCount); }, [initialCount]);

  const toggleLike = trpc.blog.toggleLike.useMutation({
    onMutate: () => {
      // Optimistic update
      const willLike = !optimisticLiked;
      setOptimisticLiked(willLike);
      setOptimisticCount((c) => (willLike ? c + 1 : Math.max(0, c - 1)));
    },
    onError: () => {
      // Rollback
      setOptimisticLiked(!optimisticLiked);
      setOptimisticCount(initialCount);
    },
    onSuccess: (data) => {
      setOptimisticLiked(data.liked);
      setOptimisticCount(data.likeCount);
    },
  });

  const handleClick = () => {
    if (!isLoggedIn) {
      // Nudge toward login — could redirect or show modal
      window.location.href = "/?modal=login";
      return;
    }
    toggleLike.mutate({ postId });
  };

  return (
    <button
      onClick={handleClick}
      disabled={toggleLike.isPending}
      title={isLoggedIn ? (optimisticLiked ? "Hapus suka" : "Suka artikel ini") : "Login untuk menyukai"}
      className={cn(
        "group flex items-center gap-2 px-5 py-2.5 rounded-full border font-bold text-[13px] transition-all duration-200 select-none",
        optimisticLiked && isLoggedIn
          ? "bg-red-500 border-red-500 text-white shadow-md shadow-red-200"
          : "bg-white border-slate-200 text-slate-500 hover:border-red-400 hover:text-red-500 hover:bg-red-50",
        toggleLike.isPending && "opacity-70 cursor-not-allowed",
      )}
    >
      <Heart
        className={cn(
          "size-4 transition-transform duration-150",
          optimisticLiked && isLoggedIn && "fill-current scale-110",
          "group-hover:scale-110",
        )}
      />
      <span>{optimisticCount > 0 ? formatViews(optimisticCount) : "Suka"}</span>
      {!isLoggedIn && (
        <span className="text-[10px] font-normal opacity-60">· Login dulu</span>
      )}
    </button>
  );
}

/* =========================================================
   COMMENT SECTION
========================================================= */

type CommentType = {
  id: string;
  content: string;
  createdAt: Date;
  user: { id: string; name: string; image: string | null };
};

function CommentItem({ comment }: { comment: CommentType }) {
  return (
    <div className="flex gap-3 items-start py-4 border-b border-slate-100 last:border-0">
      <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
        {comment.user.image ? (
          <img src={comment.user.image} alt={comment.user.name} className="size-8 rounded-full object-cover" />
        ) : (
          <User className="size-4 text-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[12px] font-bold text-slate-800">{comment.user.name}</span>
          <span className="text-[10px] text-slate-400">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="text-[13px] text-slate-600 leading-relaxed">{comment.content}</p>
      </div>
    </div>
  );
}

function CommentSection({ postId }: { postId: string }) {
  const { data: session, status: sessionStatus } = useSession();
  const isLoggedIn = !!session?.user;
  const [content, setContent] = useState("");
  const [localComments, setLocalComments] = useState<CommentType[]>([]);

  const { data: comments = [], isLoading: commentsLoading } =
    trpc.blog.getComments.useQuery({ postId });

  const addComment = trpc.blog.addComment.useMutation({
    onSuccess: (data) => {
      // Optimistically show the new comment immediately
      setLocalComments((prev) => [
        {
          id: data.id,
          content: data.content,
          createdAt: data.createdAt,
          user: {
            id: session!.user!.id!,
            name: session!.user!.name ?? "Kamu",
            image: session!.user?.image ?? null,
          },
        },
        ...prev,
      ]);
      setContent("");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addComment.mutate({ postId, content: content.trim() });
  };

  const allComments = [...localComments, ...comments];

  return (
    <div className="mt-12 pt-10 border-t-2 border-slate-100">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-600 to-blue-400" />
        <h3 className="font-extrabold text-slate-800 text-lg">
          Komentar
          {allComments.length > 0 && (
            <span className="ml-2 text-[13px] font-normal text-slate-400">
              ({allComments.length})
            </span>
          )}
        </h3>
      </div>

      {/* Comment form */}
      {sessionStatus === "loading" ? (
        <div className="flex items-center gap-2 py-4 text-slate-400 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Memuat...
        </div>
      ) : isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3 items-start">
            <div className="size-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              {session.user?.image ? (
                <img src={session.user.image} alt="" className="size-9 rounded-full object-cover" />
              ) : (
                <User className="size-4 text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tulis komentarmu…"
                  rows={3}
                  maxLength={1000}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-400">
                    {content.length}/1000
                  </span>
                  <button
                    type="submit"
                    disabled={!content.trim() || addComment.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addComment.isPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Send className="size-3.5" />
                    )}
                    Kirim
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Login prompt */
        <div className="mb-8 flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50">
          <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="size-4 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-700">
              Ingin ikut berkomentar?
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Login atau daftar untuk berbagi pendapatmu.
            </p>
          </div>
          <a
            href="/?modal=login"
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 transition-colors"
          >
            <LogIn className="size-3.5" />
            Login
          </a>
        </div>
      )}

      {/* Comments list */}
      {commentsLoading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
          <Loader2 className="size-4 animate-spin" />
          Memuat komentar...
        </div>
      ) : allComments.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <MessageCircle className="size-8 text-slate-200 mb-3" />
          <p className="text-[13px] font-semibold text-slate-500">Belum ada komentar</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {isLoggedIn ? "Jadilah yang pertama berkomentar!" : "Login untuk meninggalkan komentar."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {allComments.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   TABLE OF CONTENTS
========================================================= */

type TocItem = { id: string; text: string; level: 2 | 3 };

function parseToc(html: string): TocItem[] {
  const items: TocItem[] = [];
  const re = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const level = Number(match[1]) as 2 | 3;
    const rawText = (match[2] ?? "").replace(/<[^>]+>/g, "").trim();
    const id = rawText.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
    if (rawText) items.push({ id, text: rawText, level });
  }
  return items;
}

function injectHeadingIds(html: string): string {
  return html.replace(
    /<h([23])([^>]*)>(.*?)<\/h[23]>/gi,
    (_, level, attrs, inner) => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
      return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
    },
  );
}

function TableOfContents({ items, activeId }: { items: TocItem[]; activeId: string }) {
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Daftar Isi</p>
      </div>
      <nav className="px-3 py-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "flex items-start gap-2 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-colors",
              item.level === 3 && "ml-3",
              activeId === item.id
                ? "text-blue-600 bg-blue-50 font-semibold"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50",
            )}
          >
            <span className={cn("mt-[3px] flex-shrink-0 size-1.5 rounded-full", activeId === item.id ? "bg-blue-500" : "bg-slate-300")} />
            <span className="leading-snug">{item.text}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

/* =========================================================
   RELATED POST CARD
========================================================= */

type RelatedPost = {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  readTime: number | null;
  tags: { id: string; name: string; slug: string }[];
};

function RelatedCard({ post }: { post: RelatedPost }) {
  return (
    <a
      href={`/blog/${post.slug}`}
      className="group flex gap-3 items-start py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/70 -mx-3 px-3 rounded-xl transition-colors"
    >
      {post.coverImage ? (
        <img src={post.coverImage} alt={post.title} className="size-14 rounded-xl object-cover flex-shrink-0"
          onError={(e) => { e.currentTarget.style.display = "none"; }} />
      ) : (
        <div className="size-14 rounded-xl flex-shrink-0 bg-slate-100 flex items-center justify-center">
          <BookOpen className="size-4 text-slate-300" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[12px] font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
          {post.title}
        </p>
        {post.readTime && (
          <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
            <Clock className="size-2.5" />{post.readTime} mnt baca
          </span>
        )}
      </div>
    </a>
  );
}

/* =========================================================
   NOT FOUND
========================================================= */

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--bg-soft, #f4f8ff)" }}>
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
        <AlertCircle className="size-7 text-slate-400" />
      </div>
      <h1 className="text-xl font-bold text-slate-800 mb-2">Artikel tidak ditemukan</h1>
      <p className="text-slate-500 text-sm mb-8 text-center max-w-xs">
        Artikel yang kamu cari tidak ada, masih draf, atau sudah dihapus.
      </p>
      <a href="/blog" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
        <ArrowLeft className="size-4" /> Kembali ke Blog
      </a>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const { data: post, isLoading, error } = trpc.blog.getBySlug.useQuery(
    { slug },
    { retry: false },
  );

  const { data: related = [] } = trpc.blog.getRelated.useQuery(
    { postId: post?.id ?? "", limit: 4 },
    { enabled: !!post?.id },
  );

  // View tracking — fire once per mount for published posts
  const recordView = trpc.blog.recordView.useMutation();
  const viewFired = useRef(false);
  useEffect(() => {
    if (slug && !viewFired.current) {
      viewFired.current = true;
      recordView.mutate({ slug });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // TOC active heading tracking
  const [activeId, setActiveId] = useState("");
  useEffect(() => {
    if (!post?.contentHtml) return;
    const headings = document.querySelectorAll(".blog-prose h2, .blog-prose h3");
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [post?.contentHtml]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-soft, #f4f8ff)" }}>
        <Loader2 className="size-7 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !post) return <NotFound />;

  const theme = getTheme(post.tags[0]?.slug);
  const tocItems = post.contentHtml ? parseToc(post.contentHtml) : [];
  const processedHtml = post.contentHtml ? injectHeadingIds(post.contentHtml) : "";

  return (
    <>
      <ReadingProgressBar color="#f7b500" />

      <div style={{ background: "var(--bg-soft, #f4f8ff)" }} className="min-h-screen">

        {/* ── COVER HERO ──────────────────────────────────────────── */}
        <div className="relative w-full overflow-hidden" style={{ height: "clamp(240px, 40vh, 420px)" }}>
          {post.coverImage ? (
            <>
              <img src={post.coverImage} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
              <div className="absolute inset-0 opacity-30"
                style={{ background: `linear-gradient(135deg, ${theme.accent}60 0%, transparent 60%)` }} />
            </>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
          )}

          <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-10">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-[11px] font-semibold border border-white/20 hover:bg-black/60 transition-colors"
            >
              <ArrowLeft className="size-3" />Blog
            </button>
          </div>

          {post.tags[0] && (
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-8 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white border border-white/25 text-[11px] font-bold">
                <Hash className="size-3 opacity-70" />{post.tags[0].name}
              </span>
            </div>
          )}
        </div>

        {/* ── TITLE STRIP ─────────────────────────────────────────── */}
        <div className="bg-white border-b border-slate-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-8">
            <div className={`border-l-4 pl-5 ${theme.border}`}>
              <h1
                className="font-extrabold text-slate-900 leading-[1.15] tracking-tight"
                style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)", fontFamily: "var(--font-display, sans-serif)" }}
              >
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
                {/* Author */}
                <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <div className="size-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[9px] font-bold">IG</span>
                  </div>
                  <span className="font-medium">Tim InggrisGo</span>
                </div>

                <span className="text-slate-200 hidden sm:block">·</span>

                {post.publishedAt && (
                  <span className="inline-flex items-center gap-1 text-[12px] text-slate-400">
                    <Calendar className="size-3" />{formatDate(post.publishedAt)}
                  </span>
                )}

                {post.readTime && (
                  <>
                    <span className="text-slate-200 hidden sm:block">·</span>
                    <span className="inline-flex items-center gap-1 text-[12px] text-slate-400">
                      <Clock className="size-3" />{post.readTime} menit baca
                    </span>
                  </>
                )}

                {/* Live view count — includes the view just recorded */}
                {(post.viewCount ?? 0) > 0 && (
                  <>
                    <span className="text-slate-200 hidden sm:block">·</span>
                    <span className="inline-flex items-center gap-1 text-[12px] text-slate-400">
                      <Eye className="size-3" />{formatViews((post.viewCount ?? 0) + 1)} pembaca
                    </span>
                  </>
                )}

                {/* Like count in meta row */}
                {post.likeCount > 0 && (
                  <>
                    <span className="text-slate-200 hidden sm:block">·</span>
                    <span className="inline-flex items-center gap-1 text-[12px] text-slate-400">
                      <Heart className="size-3" />{formatViews(post.likeCount)} suka
                    </span>
                  </>
                )}

                <div className="sm:ml-auto">
                  <CopyLinkButton />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY ────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex gap-10 items-start">

            {/* ── Article column ──────────────────────────────────── */}
            <article className="flex-1 min-w-0">

              {/* Lede */}
              {post.excerpt && (
                <p
                  className="text-slate-600 leading-relaxed mb-8 font-medium border-l-2 border-slate-200 pl-4"
                  style={{ fontSize: "clamp(1rem, 2vw, 1.1rem)" }}
                >
                  {post.excerpt}
                </p>
              )}

              {/* Body */}
              {processedHtml ? (
                <div className="blog-prose" dangerouslySetInnerHTML={{ __html: processedHtml }} />
              ) : (
                <div className="flex flex-col items-center py-16 text-center text-slate-400">
                  <BookOpen className="size-10 mb-3 opacity-40" />
                  <p className="text-sm">Konten artikel belum tersedia.</p>
                </div>
              )}

              {/* ── Engagement bar ─────────────────────────────────── */}
              <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <LikeButton
                  postId={post.id}
                  initialLiked={post.userLiked}
                  initialCount={post.likeCount}
                />
                <a
                  href="#comments"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-white text-[13px] font-bold text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  <MessageCircle className="size-4" />
                  Komentar
                </a>
                <CopyLinkButton />
              </div>

              {/* Tags footer */}
              {post.tags.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2 items-center">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mr-1">Tag:</span>
                  {post.tags.map((tag) => (
                    <a
                      key={tag.id}
                      href={`/blog?tag=${tag.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-[11px] font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <Hash className="size-2.5" />{tag.name}
                    </a>
                  ))}
                </div>
              )}

              {/* ── CTA block ──────────────────────────────────────── */}
              <div
                className="mt-10 rounded-2xl p-7 relative overflow-hidden"
                style={{ background: "linear-gradient(145deg, #060f2e 0%, #0a2d87 50%, #1a52c8 100%)" }}
              >
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold mb-4">
                    <GraduationCap className="size-3.5" />Sudah baca? Saatnya praktik
                  </div>
                  <h3 className="font-extrabold text-white text-xl leading-snug mb-2">
                    Dari teori ke speaking percaya diri
                  </h3>
                  <p className="text-blue-100/65 text-sm leading-relaxed mb-5 max-w-lg">
                    Artikel ini baru awal. Program InggrisGo memberimu latihan langsung, feedback nyata, dan komunitas yang mendukung.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="/courses"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all"
                      style={{ background: "linear-gradient(135deg, #f5a800, #ffc107)", color: "#0a2d87", boxShadow: "0 4px 16px rgba(180,100,0,0.4)" }}
                    >
                      Lihat Program <ArrowRight className="size-4" />
                    </a>
                    <a href="/blog" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-white/10 border border-white/20 hover:bg-white/15 transition-all">
                      Baca artikel lain
                    </a>
                  </div>
                </div>
              </div>

              {/* ── Comments ───────────────────────────────────────── */}
              <div id="comments">
                <CommentSection postId={post.id} />
              </div>
            </article>

            {/* ── Sidebar ─────────────────────────────────────────── */}
            <aside className="hidden lg:flex flex-col gap-4 w-[268px] flex-shrink-0 sticky top-24">

              {/* TOC */}
              {tocItems.length > 0 && (
                <TableOfContents items={tocItems} activeId={activeId} />
              )}

              {/* Like widget in sidebar */}
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4 flex flex-col items-center gap-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Artikel ini membantu?
                </p>
                <LikeButton
                  postId={post.id}
                  initialLiked={post.userLiked}
                  initialCount={post.likeCount}
                />
                {!session?.user && (
                  <p className="text-[10px] text-slate-400">
                    <a href="/?modal=login" className="text-blue-500 hover:underline font-medium">Login</a> untuk menyukai artikel ini
                  </p>
                )}
              </div>

              {/* Related */}
              {related.length > 0 && (
                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Artikel Terkait</p>
                  </div>
                  <div className="px-3 py-1">
                    {related.map((p) => <RelatedCard key={p.id} post={p} />)}
                  </div>
                  <div className="px-4 py-3 border-t border-slate-100">
                    <a href="/blog" className="flex items-center justify-between text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
                      Lihat semua artikel <ChevronRight className="size-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Mini CTA */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 mb-2">Program Populer</p>
                <p className="text-[13px] font-bold text-slate-800 leading-snug mb-1">Speaking Challenge 14 Hari</p>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                  Latihan harian via WhatsApp. Feedback langsung dari coach. Mulai kapan saja.
                </p>
                <a
                  href="/courses/speaking-challenge"
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-400 text-amber-900 text-[11px] font-bold hover:bg-amber-300 transition-colors"
                >
                  Coba Sekarang <ArrowRight className="size-3.5" />
                </a>
              </div>
            </aside>
          </div>

          {/* Mobile related */}
          {related.length > 0 && (
            <div className="lg:hidden mt-10">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Artikel Terkait</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {related.map((p) => (
                  <a
                    key={p.id}
                    href={`/blog/${p.slug}`}
                    className="group flex gap-3 items-start p-3 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    {p.coverImage ? (
                      <img src={p.coverImage} alt={p.title} className="size-14 rounded-xl object-cover flex-shrink-0"
                        onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    ) : (
                      <div className="size-14 rounded-xl flex-shrink-0 bg-slate-100 flex items-center justify-center">
                        <BookOpen className="size-4 text-slate-300" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{p.title}</p>
                      {p.readTime && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
                          <Clock className="size-2.5" />{p.readTime} mnt
                        </span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PROSE STYLES ──────────────────────────────────────────── */}
      <style>{`
        .blog-prose { color: #1e293b; font-size: 1rem; line-height: 1.8; font-family: var(--font-sans, sans-serif); }
        .blog-prose p { margin-bottom: 1.4em; }
        .blog-prose h2 { font-size: 1.35rem; font-weight: 800; color: #0f172a; margin-top: 2.2em; margin-bottom: 0.75em; line-height: 1.25; letter-spacing: -0.01em; font-family: var(--font-display, sans-serif); scroll-margin-top: 80px; }
        .blog-prose h3 { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-top: 1.8em; margin-bottom: 0.5em; line-height: 1.3; scroll-margin-top: 80px; }
        .blog-prose ul, .blog-prose ol { padding-left: 1.5em; margin-bottom: 1.4em; }
        .blog-prose ul { list-style-type: disc; }
        .blog-prose ol { list-style-type: decimal; }
        .blog-prose li { margin-bottom: 0.5em; line-height: 1.7; }
        .blog-prose li::marker { color: #1e6eee; }
        .blog-prose strong { font-weight: 700; color: #0f172a; }
        .blog-prose em { font-style: italic; color: #334155; }
        .blog-prose a { color: #1a52c8; text-decoration: underline; text-underline-offset: 3px; font-weight: 500; }
        .blog-prose a:hover { color: #1e6eee; }
        .blog-prose blockquote { border-left: 3px solid #1e6eee; padding: 0.8em 1em 0.8em 1.1rem; margin: 1.8em 0; color: #475569; font-style: italic; background: #f4f8ff; border-radius: 0 0.75rem 0.75rem 0; }
        .blog-prose code { background: #f1f5f9; border-radius: 0.3rem; padding: 0.15em 0.4em; font-size: 0.875em; color: #0f172a; font-family: var(--font-mono, monospace); }
        .blog-prose pre { background: #0f172a; color: #e2e8f0; border-radius: 0.75rem; padding: 1.2rem; overflow-x: auto; margin: 1.5em 0; font-size: 0.875rem; }
        .blog-prose pre code { background: transparent; padding: 0; color: inherit; }
        .blog-prose hr { border: none; border-top: 1px solid #e2e8f0; margin: 2.5em 0; }
        .blog-prose img { border-radius: 0.75rem; width: 100%; height: auto; margin: 1.5em 0; }
        .blog-prose h2 + p, .blog-prose h3 + p { margin-top: 0.4em; }
        @media (max-width: 640px) { .blog-prose h2 { font-size: 1.2rem; } .blog-prose h3 { font-size: 1rem; } }
      `}</style>
    </>
  );
}