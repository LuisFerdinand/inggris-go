// app/(home)/blog/page.tsx
"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  RefObject,
} from "react";
import {
  Search,
  Clock,
  Eye,
  Heart,
  Mic,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  PlayCircle,
  Filter,
  X,
  ArrowRight,
  Star,
  Zap,
  GraduationCap,
  Flame,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  SlidersHorizontal,
  CheckCircle2,
  Users,
  Headphones,
  ChevronsLeft,
  ChevronsRight,
  Layers3,
  CirclePlus,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { type BlogPlaylist, blogPlaylists } from "./data";
import { trpc } from "@/lib/trpc/client";

/* =========================================================
   TYPES
========================================================= */

/** Matches EnrichedPost from blog.router — keep in sync with RawPostRow */
type LivePost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  isFeatured: boolean;
  publishedAt: Date | null;
  readTime: number | null;
  viewCount: number | null;
  categoryId: string | null;
  // Enriched fields
  likeCount: number;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    order: number;
    createdAt: Date;
  } | null;
  tags: { id: string; name: string; slug: string }[];
};

type LiveCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
};

type LiveTag = { id: string; name: string; slug: string };

/* =========================================================
   CONSTANTS
========================================================= */

const POSTS_PER_PAGE = 6;

/* Category colour tokens — keyed by slug set in CATEGORY_DATA */
const CAT_COLORS: Record<
  string,
  { gradient: string; pill: string; text: string }
> = {
  speaking: {
    gradient: "from-blue-600 via-blue-700 to-indigo-800",
    pill: "bg-blue-50 text-blue-700 border-blue-200",
    text: "text-blue-600",
  },
  grammar: {
    gradient: "from-teal-500 via-teal-600 to-cyan-800",
    pill: "bg-teal-50 text-teal-700 border-teal-200",
    text: "text-teal-600",
  },
  vocabulary: {
    gradient: "from-orange-500 via-orange-600 to-red-700",
    pill: "bg-orange-50 text-orange-700 border-orange-200",
    text: "text-orange-600",
  },
  "tips-motivation": {
    gradient: "from-violet-500 via-violet-600 to-purple-800",
    pill: "bg-violet-50 text-violet-700 border-violet-200",
    text: "text-violet-600",
  },
};

const DEFAULT_COLOR = {
  gradient: "from-slate-500 to-slate-700",
  pill: "bg-slate-50 text-slate-600 border-slate-200",
  text: "text-slate-500",
};

function getCatColor(slug?: string | null) {
  return slug && CAT_COLORS[slug] ? CAT_COLORS[slug]! : DEFAULT_COLOR;
}

type SortValue = "newest" | "popular" | "liked" | "quickread";

const SORT_OPTIONS: { label: string; value: SortValue; icon: ReactNode }[] = [
  { value: "newest",    label: "Terbaru",    icon: <Zap className="w-3.5 h-3.5" /> },
  { value: "popular",  label: "Terpopuler", icon: <Flame className="w-3.5 h-3.5" /> },
  { value: "liked",    label: "Disukai",    icon: <Heart className="w-3.5 h-3.5" /> },
  { value: "quickread",label: "Tercepat",   icon: <Clock className="w-3.5 h-3.5" /> },
];

/* =========================================================
   HOOKS
========================================================= */

function useIntersection<T extends Element>(
  ref: RefObject<T | null>,
  { threshold = 0.1, once = true } = {},
) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { setVisible(true); if (once) obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold, once]);
  return visible;
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useIntersection(ref);
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.65s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.65s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

function formatViews(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

/* =========================================================
   ATOMS
========================================================= */

function ViewsMeta({ value }: { value?: number | null }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
      <Eye className="w-3 h-3" />{formatViews(value)}
    </span>
  );
}

function LikesMeta({ value }: { value?: number }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
      <Heart className="w-3 h-3" />{formatViews(value)}
    </span>
  );
}

/* =========================================================
   HERO SLIDER — only isFeatured posts
========================================================= */

function HeroSlider({ posts }: { posts: LivePost[] }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setCurrent(idx); setAnimating(false); }, 300);
  }, [animating]);

  const next = useCallback(() => goTo((current + 1) % posts.length), [current, posts.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + posts.length) % posts.length), [current, posts.length, goTo]);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  const p = posts[current];
  if (!p) return null;
  const t = getCatColor(p.category?.slug);

  return (
    <div className="relative">
      <div className="rounded-2xl bg-white border border-white/60 shadow-xl overflow-hidden"
        style={{ opacity: animating ? 0 : 1, transform: animating ? "translateY(8px) scale(0.98)" : "translateY(0) scale(1)", transition: "opacity 0.3s ease, transform 0.3s ease" }}>
        <div className={`h-1.5 bg-gradient-to-r ${t.gradient}`} />
        <div className={`relative h-44 bg-gradient-to-br ${t.gradient} overflow-hidden`}>
          {p.coverImage && (
            <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover opacity-80"
              onError={(e) => { e.currentTarget.style.display = "none"; }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {p.category && (
            <div className="absolute top-3 left-3">
              <span className={`inline-flex items-center gap-1 border font-semibold rounded-full text-[10px] px-2 py-0.5 ${t.pill}`}>
                {p.category.name}
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 bg-amber-400 text-amber-900 text-[9px] font-bold px-2 py-1 rounded-full">
              <Star className="w-2.5 h-2.5" fill="currentColor" /> Featured
            </span>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 drop-shadow">{p.title}</h3>
          </div>
        </div>
        <div className="p-4">
          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-3">{p.excerpt}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {p.readTime && <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Clock className="w-3 h-3" />{p.readTime} mnt</span>}
              <ViewsMeta value={p.viewCount} />
            </div>
            <a href={`/blog/${p.slug}`} className={`flex items-center gap-1 text-xs font-bold ${t.text}`}>
              Baca <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Dots + arrows */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          {posts.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? "w-5 h-2 bg-amber-400" : "w-2 h-2 bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center transition-all">
            <ChevronLeft className="w-3.5 h-3.5 text-white" />
          </button>
          <button onClick={next} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center transition-all">
            <ChevronRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* Thumbnail strip for non-current featured */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {posts.filter((_, i) => i !== current).slice(0, 2).map((q) => {
          const qt = getCatColor(q.category?.slug);
          return (
            <a key={q.id} href={`/blog/${q.slug}`}
              className="group flex items-start gap-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl p-2.5 transition-all">
              <div className={`w-8 h-8 flex-shrink-0 rounded-lg bg-gradient-to-br ${qt.gradient} flex items-center justify-center`} />
              <span className="text-white/80 text-[11px] font-medium leading-snug line-clamp-2 group-hover:text-white transition-colors">
                {q.title}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   POST CARD
========================================================= */

function PostCard({ post, index = 0 }: { post: LivePost; index: number }) {
  const t = getCatColor(post.category?.slug);
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useIntersection(ref);

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.55s ease ${index * 70}ms, transform 0.55s ease ${index * 70}ms`,
    }}>
      <a href={`/blog/${post.slug}`}
        className="group flex flex-col h-full overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="relative h-44 flex-shrink-0 overflow-hidden">
          {post.coverImage ? (
            <img src={post.coverImage} alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${t.gradient}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {post.category && (
            <div className="absolute top-3 left-3">
              <span className={`inline-flex items-center gap-1 border font-semibold rounded-full text-[10px] px-2 py-0.5 ${t.pill}`}>
                {post.category.name}
              </span>
            </div>
          )}
          {post.isFeatured && (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1 bg-amber-400 text-amber-900 text-[9px] font-bold px-2 py-0.5 rounded-full">
                <Star className="w-2 h-2" fill="currentColor" /> Featured
              </span>
            </div>
          )}
          {post.readTime && (
            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />{post.readTime} mnt
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 p-4">
          <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors mb-2">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed flex-1">{post.excerpt}</p>
          )}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {post.tags.slice(0, 2).map((tag) => (
                <span key={tag.id} className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
            <ViewsMeta value={post.viewCount} />
            <LikesMeta value={post.likeCount} />
            <span className={`ml-auto text-xs font-bold ${t.text} flex items-center gap-0.5`}>
              Baca <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </a>
    </div>
  );
}

/* =========================================================
   SORT BAR
========================================================= */

function SortBar({ sortBy, setSortBy }: { sortBy: SortValue; setSortBy: (v: SortValue) => void }) {
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mr-1">
        <ArrowUpDown className="w-3 h-3" /> Urutkan
      </span>
      {SORT_OPTIONS.map((opt) => {
        const active = sortBy === opt.value;
        return (
          <button key={opt.value} onClick={() => setSortBy(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 whitespace-nowrap ${active ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 scale-105" : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"}`}>
            <span className={active ? "text-white/90" : "text-slate-400"}>{opt.icon}</span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ResetFilterBadge({ onClick, count }: { onClick: () => void; count: number }) {
  return (
    <button onClick={onClick}
      className="group flex items-center gap-2 pl-3.5 pr-4 py-2 rounded-full font-bold text-sm border-2 border-red-400 bg-red-500 text-white hover:bg-red-600 hover:border-red-600 hover:shadow-lg hover:shadow-red-200 transition-all duration-200 whitespace-nowrap shadow-sm shadow-red-200">
      <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
      Reset
      {count > 0 && <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5">{count}</span>}
    </button>
  );
}

/* =========================================================
   PAGINATION
========================================================= */

function Pagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number; totalPages: number; onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };
  const btn = "w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center";
  const edge = `${btn} border border-slate-200 bg-white text-slate-400 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed`;
  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className={edge}><ChevronsLeft className="w-4 h-4" /></button>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={edge}><ChevronLeft className="w-4 h-4" /></button>
      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">…</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p as number)}
            className={`${btn} ${p === currentPage ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-110" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"}`}>
            {p}
          </button>
        ),
      )}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={edge}><ChevronRight className="w-4 h-4" /></button>
      <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={edge}><ChevronsRight className="w-4 h-4" /></button>
    </div>
  );
}

/* =========================================================
   EXPANDABLE SECTION
========================================================= */

function ExpandableSection({ title, icon, children, defaultOpen = true, badge }: {
  title: string; icon?: ReactNode; children: ReactNode; defaultOpen?: boolean; badge?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50/70 transition-colors group">
        <span className="flex items-center gap-2">
          {icon && <span className="text-slate-400 group-hover:text-blue-500 transition-colors">{icon}</span>}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">{title}</span>
          {badge}
        </span>
        <span className={`w-5 h-5 rounded-full flex items-center justify-center ${open ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
          {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </span>
      </button>
      <div style={{ maxHeight: open ? "600px" : "0px", overflow: "hidden", transition: "max-height 0.35s cubic-bezier(.22,1,.36,1)" }}>
        <div className="px-4 pb-4 pt-1">{children}</div>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function BlogSidebar({
  search, setSearch,
  activeCategory, setActiveCategory,
  activeTag, setActiveTag,
  categories, tags, popularPosts,
}: {
  search: string; setSearch: (v: string) => void;
  activeCategory: string; setActiveCategory: (v: string) => void;
  activeTag: string; setActiveTag: (v: string) => void;
  categories: LiveCategory[]; tags: LiveTag[]; popularPosts: LivePost[];
}) {
  return (
    <aside className="space-y-3">
      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Cari Artikel</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input type="text" value={search} onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder="Ketik kata kunci…"
            className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 bg-slate-50 transition-all placeholder:text-slate-300"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-slate-400 hover:text-red-500 transition-colors" />
            </button>
          )}
        </div>
      </div>

      {/* Categories — from DB */}
      {categories.length > 0 && (
        <ExpandableSection title="Kategori" icon={<FolderOpen className="w-3.5 h-3.5" />} defaultOpen
          badge={activeCategory ? <span className="ml-1 bg-blue-100 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">aktif</span> : undefined}>
          <div className="space-y-0.5">
            <button onClick={() => setActiveCategory("")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeCategory === "" ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-600"}`}>
              Semua
            </button>
            {categories.map((cat) => (
              <button key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.slug ? "" : cat.slug)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeCategory === cat.slug ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-600"}`}>
                <FolderOpen className={`size-3.5 ${activeCategory === cat.slug ? "text-white/80" : "text-slate-400"}`} />
                {cat.name}
              </button>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* Tags — from DB */}
      {tags.length > 0 && (
        <ExpandableSection title="Topik" icon={<Layers3 className="w-3.5 h-3.5" />} defaultOpen
          badge={activeTag ? <span className="ml-1 bg-blue-100 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">aktif</span> : undefined}>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <button key={tag.id}
                onClick={() => setActiveTag(activeTag === tag.slug ? "" : tag.slug)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${activeTag === tag.slug ? "bg-blue-600 text-white border-blue-600 scale-105 shadow-sm" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"}`}>
                #{tag.name}
              </button>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* Popular posts */}
      {popularPosts.length > 0 && (
        <ExpandableSection title="Artikel Populer" icon={<Flame className="w-3.5 h-3.5 text-orange-400" />} defaultOpen>
          <div className="space-y-3">
            {popularPosts.map((p, i) => (
              <a key={p.id} href={`/blog/${p.slug}`} className="group flex items-start gap-2.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: i === 0 ? "#f5a800" : i === 1 ? "#1e6eee" : i === 2 ? "#10b981" : "#94a3b8" }}>
                  {i + 1}
                </span>
                <span className="text-xs text-slate-600 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors font-medium">
                  {p.title}
                </span>
              </a>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* Mini CTA */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0a2d87 0%, #1e6eee 100%)" }}>
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
        <GraduationCap className="w-7 h-7 mb-3 opacity-70 relative" />
        <p className="font-bold text-sm mb-1 relative">Siap belajar lebih serius?</p>
        <p className="text-white/65 text-xs mb-4 leading-relaxed relative">Ikuti program speaking kami dan langsung praktik!</p>
        <a href="/courses" className="relative inline-flex items-center gap-1.5 text-xs font-bold bg-amber-400 text-amber-900 px-3.5 py-2 rounded-full hover:bg-amber-300 transition-colors">
          Lihat Program <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </aside>
  );
}

/* =========================================================
   MOBILE FILTER DRAWER
========================================================= */

function MobileFilterDrawer({
  open, onClose,
  search, setSearch,
  activeCategory, setActiveCategory,
  activeTag, setActiveTag,
  categories, tags, filteredCount,
}: {
  open: boolean; onClose: () => void;
  search: string; setSearch: (v: string) => void;
  activeCategory: string; setActiveCategory: (v: string) => void;
  activeTag: string; setActiveTag: (v: string) => void;
  categories: LiveCategory[]; tags: LiveTag[]; filteredCount: number;
}) {
  return (
    <>
      <div onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} />
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl lg:hidden max-h-[82vh] overflow-y-auto transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-full"}`}>
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-slate-200" /></div>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />Filter & Cari
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Cari</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" value={search} onChange={(e) => setSearch(e.currentTarget.value)}
                placeholder="Ketik kata kunci…"
                className="w-full pl-9 pr-3 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 bg-slate-50"
              />
            </div>
          </div>
          {categories.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Kategori</p>
              <div className="flex flex-wrap gap-2">
                {[{ id: "", name: "Semua", slug: "" }, ...categories].map((cat) => (
                  <button key={cat.id || "all"} onClick={() => setActiveCategory(cat.slug)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${activeCategory === cat.slug ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {tags.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Topik</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button key={tag.id} onClick={() => setActiveTag(activeTag === tag.slug ? "" : tag.slug)}
                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold border transition-all ${activeTag === tag.slug ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Tampilkan {filteredCount} Artikel
          </button>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   STATS BAR
========================================================= */

function StatsBar({ totalPosts }: { totalPosts: number }) {
  const stats = [
    { icon: <Users className="w-4 h-4" />, value: "1.200+", label: "Pelajar Aktif" },
    { icon: <BookOpen className="w-4 h-4" />, value: `${totalPosts || "–"}+`, label: "Artikel Gratis" },
    { icon: <PlayCircle className="w-4 h-4" />, value: `${blogPlaylists.length}`, label: "Learning Path" },
    { icon: <Star className="w-4 h-4" />, value: "4.9/5", label: "Rating Pelajar" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
      {stats.map((s, i) => (
        <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3 py-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">{s.icon}</div>
          <div>
            <div className="text-white font-extrabold text-base leading-none">{s.value}</div>
            <div className="text-white/55 text-[10px] mt-0.5">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   PLAYLIST CARD (static data is fine here)
========================================================= */

function PlaylistCard({ playlist, index }: { playlist: BlogPlaylist; index: number }) {
  const gradients = [
    "from-blue-700 via-blue-800 to-indigo-900",
    "from-teal-600 via-teal-700 to-cyan-900",
    "from-violet-600 via-violet-700 to-purple-900",
    "from-orange-600 via-orange-700 to-red-900",
  ];
  const icons = [
    <Mic key="m" className="w-5 h-5" />,
    <BookOpen key="b" className="w-5 h-5" />,
    <Headphones key="h" className="w-5 h-5" />,
    <GraduationCap key="g" className="w-5 h-5" />,
  ];
  const g = gradients[index % gradients.length]!;
  const icon = icons[index % icons.length]!;

  return (
    <a href={`/blog/playlist/${playlist.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br ${g} min-h-[210px] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer`}>
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500" />
      <div className="relative z-10 flex flex-col h-full p-5">
        <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">{icon}</div>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="bg-white/15 text-white/80 text-[10px] font-bold px-2 py-0.5 rounded-full">{playlist.posts.length} artikel</span>
          {playlist.isSystem && <span className="bg-amber-400/20 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">Kurikulum</span>}
        </div>
        <h3 className="font-extrabold text-white text-lg leading-tight mb-2">{playlist.name}</h3>
        {playlist.description && <p className="text-white/60 text-sm line-clamp-2 leading-relaxed flex-1">{playlist.description}</p>}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
          <span className="ml-auto flex items-center gap-1 text-white text-xs font-bold group-hover:gap-2 transition-all">
            Mulai belajar <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(""); // slug
  const [activeTag, setActiveTag] = useState("");           // slug
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortValue>("newest");

  useEffect(() => { setCurrentPage(1); }, [search, activeCategory, activeTag, sortBy]);

  /* ── Live data ──────────────────────────────────────── */

  // Featured posts (isFeatured=true, published) for hero slider
  const { data: featuredData } = trpc.blog.getPublished.useQuery({
    isFeatured: true,
    sort: "newest",
    limit: 5,
    page: 1,
  });

  // Main post grid
  const { data, isLoading } = trpc.blog.getPublished.useQuery({
    search: search || undefined,
    categorySlug: activeCategory || undefined,
    tagSlug: activeTag || undefined,
    page: currentPage,
    limit: POSTS_PER_PAGE,
    sort: sortBy,
  });

  // Popular sidebar posts
  const { data: popularData } = trpc.blog.getPublished.useQuery({
    sort: "popular",
    limit: 4,
    page: 1,
  });

  // Categories from DB
  const { data: categories = [] } = trpc.blog.getCategories.useQuery();

  // Tags from DB (public endpoint)
  const { data: tags = [] } = trpc.blog.getTagsPublic.useQuery();

  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  const popularPosts = popularData?.posts ?? [];
  const featuredPosts = featuredData?.posts ?? [];

  const hasFilter = !!(search || activeCategory || activeTag);
  const filterCount = [search, activeCategory, activeTag].filter(Boolean).length;

  const resetFilters = () => { setSearch(""); setActiveCategory(""); setActiveTag(""); };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById("blog-content")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const heroRef = useRef<HTMLElement | null>(null);
  const heroVisible = useIntersection(heroRef, { threshold: 0.05 });

  /* ── What to show as the active section label ──────── */
  const sectionLabel = hasFilter
    ? activeCategory
      ? (categories.find((c) => c.slug === activeCategory)?.name ?? "Hasil Filter")
      : activeTag
        ? (tags.find((t) => t.slug === activeTag)?.name ?? "Hasil Filter")
        : `Hasil: "${search}"`
    : "Semua Artikel";

  return (
    <div className="min-h-screen pt-10" style={{ background: "var(--bg-soft, #f4f8ff)" }}>

      {/* ════ HERO ════ */}
      <section ref={heroRef} className="relative overflow-hidden"
        style={{ background: "linear-gradient(155deg, #060f2e 0%, #0a2d87 40%, #1a52c8 75%, #2a6fd4 100%)", minHeight: "580px" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left copy */}
            <div>
              <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(16px)", transition: "opacity .6s ease, transform .6s ease" }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white text-xs font-semibold mb-6">
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />Blog & Pusat Belajar InggrisGo
              </div>
              <h1 style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(20px)", transition: "opacity .65s .1s ease, transform .65s .1s ease", fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
                className="font-extrabold text-white leading-[1.1] tracking-tight mb-5">
                Bahasa Inggris Bisa{" "}<span className="block" style={{ color: "#ffc107" }}>Kamu Kuasai — Mulai Hari Ini</span>
              </h1>
              <p style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(20px)", transition: "opacity .65s .2s ease, transform .65s .2s ease" }}
                className="text-blue-100/75 text-[15px] leading-relaxed mb-6 max-w-[440px]">
                Dari tips speaking, grammar, kosakata, sampai motivasi — semua tersedia gratis di sini.
              </p>
              <div style={{ opacity: heroVisible ? 1 : 0, transition: "opacity .65s .25s ease" }}>
                <StatsBar totalPosts={total} />
              </div>
              <div style={{ opacity: heroVisible ? 1 : 0, transition: "opacity .65s .4s ease" }}
                className="flex flex-wrap gap-3 mt-7">
                <a href="#blog-content" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-blue-900 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  style={{ background: "linear-gradient(135deg, #f5a800, #ffc107)", boxShadow: "0 4px 20px rgba(180,100,0,0.35)" }}>
                  <BookOpen className="w-4 h-4" /> Jelajahi Artikel
                </a>
                <a href="/courses" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white bg-white/10 border border-white/20 hover:bg-white/15 transition-all">
                  Lihat Program <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right — hero slider (featured posts) */}
            <div style={{ opacity: heroVisible ? 1 : 0, transition: "opacity .8s .15s ease" }}
              className="relative hidden lg:block">
              <div className="relative z-10 flex justify-center">
                <div className="w-full max-w-[380px]">
                  <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Star className="w-3 h-3 text-amber-400" fill="currentColor" /> Artikel Pilihan — Mulai Dari Sini
                  </div>
                  {featuredPosts.length > 0 ? (
                    <HeroSlider posts={featuredPosts} />
                  ) : (
                    <div className="h-56 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Loader2 className="size-6 text-white/40 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 56 C480 0 960 0 1440 56 L1440 56 L0 56Z" fill="#f4f8ff" />
          </svg>
        </div>
      </section>

      {/* ════ CATEGORY + SORT BAR ════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category quick filters — from DB */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveCategory("")}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 whitespace-nowrap ${activeCategory === "" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"}`}>
                Semua
              </button>
              {categories.map((cat) => {
                const t = getCatColor(cat.slug);
                const isActive = activeCategory === cat.slug;
                return (
                  <button key={cat.id}
                    onClick={() => setActiveCategory(isActive ? "" : cat.slug)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 whitespace-nowrap ${isActive ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"}`}>
                    {cat.name}
                  </button>
                );
              })}
            </div>
            <div className="flex-1" />
            <div className="hidden md:flex items-center">
              <SortBar sortBy={sortBy} setSortBy={setSortBy} />
            </div>
          </div>
          <div className="flex md:hidden mt-2 pt-2 border-t border-slate-100 overflow-x-auto pb-1">
            <SortBar sortBy={sortBy} setSortBy={setSortBy} />
          </div>
        </div>
      </div>

      {/* ════ MAIN CONTENT ════ */}
      <section id="blog-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        {/* Mobile filter button */}
        <div className="lg:hidden flex items-center gap-3 mb-6">
          <button onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-600 transition-all">
            <Filter className="w-4 h-4 text-blue-600" />
            Filter & Cari
            {filterCount > 0 && <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{filterCount}</span>}
          </button>
          <span className="ml-auto text-xs text-slate-400 font-medium">{total} artikel</span>
        </div>

        <div className="flex gap-8 items-start">
          {/* Sidebar */}
          <div className="hidden lg:block w-[268px] flex-shrink-0 sticky top-6">
            <BlogSidebar
              search={search} setSearch={setSearch}
              activeCategory={activeCategory} setActiveCategory={setActiveCategory}
              activeTag={activeTag} setActiveTag={setActiveTag}
              categories={categories} tags={tags}
              popularPosts={popularPosts}
            />
          </div>

          {/* Post grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-7 rounded-full" style={{ background: "linear-gradient(to bottom, #1a52c8, #3a8ff5)" }} />
                <div>
                  <h2 className="font-extrabold text-slate-800 text-lg">{sectionLabel}</h2>
                  <p className="text-xs text-slate-400">
                    {total} artikel · Hal. {currentPage}/{Math.max(1, totalPages)}
                    {" · "}<span className="text-blue-500 font-medium">{SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
                  </p>
                </div>
              </div>
              {hasFilter && <ResetFilterBadge onClick={resetFilters} count={filterCount} />}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-7 animate-spin text-blue-400" />
              </div>
            ) : posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </>
            ) : (
              <div className="flex flex-col items-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <Search className="w-7 h-7 text-slate-300" />
                </div>
                <h3 className="font-bold text-slate-600 mb-2">Artikel tidak ditemukan</h3>
                <p className="text-slate-400 text-sm mb-5 max-w-xs">Coba kata kunci atau filter yang berbeda.</p>
                <button onClick={resetFilters} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
                  Lihat semua artikel
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════ PLAYLIST ════ */}
      <section className="py-16 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #f4f8ff 0%, #e8f0fe 50%, #f4f8ff 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-900/20">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-800 text-2xl">Learning Path</h2>
                  <p className="text-slate-400 text-sm">Kurikulum terstruktur — belajar langkah demi langkah</p>
                </div>
              </div>
              <a href="/blog/playlists" className="hidden sm:flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Lihat semua <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {blogPlaylists.map((pl, i) => (
              <Reveal key={pl.id} delay={i * 100}><PlaylistCard playlist={pl} index={i} /></Reveal>
            ))}
            <Reveal delay={blogPlaylists.length * 100}>
              <div className="relative flex flex-col items-center justify-center min-h-[210px] rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 text-center p-6 hover:border-blue-300 hover:bg-white transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                  <CirclePlus className="w-5 h-5 text-slate-300" />
                </div>
                <p className="font-bold text-slate-400 text-sm mb-1">Playlist Baru</p>
                <p className="text-slate-300 text-xs leading-relaxed">Segera hadir!<br />Pantau terus ya 👀</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════ CTA ════ */}
      <section className="relative overflow-hidden py-20"
        style={{ background: "linear-gradient(145deg, #060f2e 0%, #0a2d87 45%, #1a52c8 100%)" }}>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/15 border border-amber-400/25 text-amber-300 text-xs font-bold mb-6">
              <Zap className="w-3.5 h-3.5" /> Sudah baca? Sekarang saatnya praktik
            </div>
            <h2 className="font-extrabold text-white mb-5 leading-tight" style={{ fontSize: "clamp(1.75rem, 4vw, 2.8rem)" }}>
              Dari Membaca Artikel ke{" "}<span style={{ color: "#ffc107" }}>Speaking Percaya Diri</span>
            </h2>
            <p className="text-blue-100/65 text-base leading-relaxed mb-10 max-w-2xl mx-auto">
              Membaca adalah awal yang bagus. Tapi untuk benar-benar lancar, kamu butuh praktik langsung.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="/courses" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm hover:-translate-y-0.5 hover:shadow-2xl transition-all"
                style={{ background: "linear-gradient(135deg, #f5a800, #ffc107)", color: "#0a2d87", boxShadow: "0 6px 24px rgba(180,100,0,0.38)" }}>
                Lihat Program Speaking <ArrowRight className="w-4 h-4" />
              </a>
              <a href="/courses/english-camp" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm text-white bg-white/10 border border-white/20 hover:bg-white/15 transition-all">
                English Camp <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mobile drawer */}
      <MobileFilterDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        search={search} setSearch={setSearch}
        activeCategory={activeCategory} setActiveCategory={setActiveCategory}
        activeTag={activeTag} setActiveTag={setActiveTag}
        categories={categories} tags={tags} filteredCount={total}
      />
    </div>
  );
}