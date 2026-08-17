// app/(dashboard)/dashboard/blog/_modules/BlogPreviewModal.tsx
"use client";

import { useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Hash,
  X,
} from "lucide-react";

import { getTheme } from "@/app/(home)/blog/blog-theme";
import {
  COVER_IMAGE_HEIGHT_DEFAULT,
  type CoverImageLayout,
} from "@/app/modules/blog/blog.schema";
import "@/app/(home)/blog/blog-prose.css";

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface PreviewTag {
  id: string;
  name: string;
  slug: string;
}

interface BlogPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  coverImageLayout?: CoverImageLayout;
  coverImageHeight?: number | null;
  contentHtml?: string | null;
  readTime?: number | null;
  tags: PreviewTag[];
}

export function BlogPreviewModal({
  open,
  onClose,
  title,
  excerpt,
  coverImage,
  coverImageLayout = "cover",
  coverImageHeight,
  contentHtml,
  readTime,
  tags,
}: BlogPreviewModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const theme = getTheme(tags[0]?.slug);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/60 backdrop-blur-sm">
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-b border-black/10 bg-neutral-900 px-4 py-2.5">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-neutral-300">
          <BookOpen className="size-3.5 text-blue-400" />
          Pratinjau Artikel
          <span className="hidden text-neutral-500 sm:inline">
            — tampilan ini meniru halaman blog publik
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-neutral-200 hover:bg-white/10 transition-colors"
        >
          <X className="size-3.5" />
          Tutup
        </button>
      </div>

      {/* ── Scrollable page preview ─────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div style={{ background: "var(--bg-soft, #f4f8ff)" }} className="min-h-full">
          {/* Cover hero */}
          <div
            className="relative w-full overflow-hidden"
            style={
              coverImage && coverImageLayout === "auto"
                ? undefined
                : {
                    height:
                      coverImage && coverImageLayout === "custom"
                        ? `${coverImageHeight ?? COVER_IMAGE_HEIGHT_DEFAULT}px`
                        : "clamp(200px, 34vh, 380px)",
                  }
            }
          >
            {coverImage ? (
              coverImageLayout === "auto" ? (
                <>
                  <img src={coverImage} alt={title} className="block h-auto w-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{ background: `linear-gradient(135deg, ${theme.accent}60 0%, transparent 60%)` }}
                  />
                </>
              ) : (
                <>
                  <img
                    src={coverImage}
                    alt={title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{ background: `linear-gradient(135deg, ${theme.accent}60 0%, transparent 60%)` }}
                  />
                </>
              )
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
            )}

            <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                <ArrowLeft className="size-3" />Blog
              </span>
            </div>

            {tags[0] && (
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-8 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm">
                  <Hash className="size-3 opacity-70" />{tags[0].name}
                </span>
              </div>
            )}
          </div>

          {/* Title strip */}
          <div className="border-b border-slate-100 bg-white shadow-sm">
            <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 lg:py-8">
              <div className={`border-l-4 pl-5 ${theme.border}`}>
                <h1
                  className="font-extrabold leading-[1.15] tracking-tight text-slate-900"
                  style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)", fontFamily: "var(--font-display, sans-serif)" }}
                >
                  {title || "Judul artikel belum diisi"}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                      <span className="text-[9px] font-bold text-white">IG</span>
                    </div>
                    <span className="font-medium">Tim InggrisGo</span>
                  </div>

                  <span className="hidden text-slate-200 sm:block">·</span>
                  <span className="inline-flex items-center gap-1 text-[12px] text-slate-400">
                    <Calendar className="size-3" />{formatDate(new Date())}
                  </span>

                  {readTime ? (
                    <>
                      <span className="hidden text-slate-200 sm:block">·</span>
                      <span className="inline-flex items-center gap-1 text-[12px] text-slate-400">
                        <Clock className="size-3" />{readTime} menit baca
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            <article>
              {excerpt && (
                <p
                  className="mb-8 border-l-2 border-slate-200 pl-4 font-medium leading-relaxed text-slate-600"
                  style={{ fontSize: "clamp(1rem, 2vw, 1.1rem)" }}
                >
                  {excerpt}
                </p>
              )}

              {contentHtml ? (
                <div className="blog-prose" dangerouslySetInnerHTML={{ __html: contentHtml }} />
              ) : (
                <div className="flex flex-col items-center py-16 text-center text-slate-400">
                  <BookOpen className="mb-3 size-10 opacity-40" />
                  <p className="text-sm">Konten artikel belum tersedia.</p>
                </div>
              )}

              {tags.length > 0 && (
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">Tag:</span>
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500"
                    >
                      <Hash className="size-2.5" />{tag.name}
                    </span>
                  ))}
                </div>
              )}
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
