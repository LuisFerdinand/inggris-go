// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/DetailTab.tsx
"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock } from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { generateTheme } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import { TabSkeleton } from "../ui/sections/ProgramDetailSection";

import {
  BudgetSection,
  CommercePreviewSection,
  PublishingSection,
} from "./detail/CommercePreviewSection";
import { BrandingSection } from "./detail/BrandingSection";
import { IdentitySection } from "./detail/IdentitySection";
import { MarketingSection } from "./detail/MarketingSection";
import { StructureSection } from "./detail/StructureSection";

import type { DetailData as ProgramDetailData } from "@/app/modules/program/server/program.router";

/* ─────────────────────────────────────────────────────────────
   TYPES — inferred from the tRPC getDetail procedure so this can
   never drift from the actual API response again.
───────────────────────────────────────────────────────────── */

export type DetailData = ProgramDetailData;
export type DetailCategory = DetailData["category"];

type Theme = ReturnType<typeof generateTheme>;

/* ─────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────────────────────── */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/* ─────────────────────────────────────────────────────────────
   PUBLIC CARD PREVIEW HELPERS
───────────────────────────────────────────────────────────── */

const HIGHLIGHT_SEPARATOR = "|";

const DURATION_UNITS = [
  { factor: 10080, label: "minggu" },
  { factor: 1440, label: "hari" },
  { factor: 60, label: "jam" },
  { factor: 1, label: "menit" },
] as const;

function splitProgramHighlight(highlight: string | null | undefined) {
  if (!highlight) return [];

  const separator = highlight.includes(HIGHLIGHT_SEPARATOR)
    ? HIGHLIGHT_SEPARATOR
    : "•";

  return highlight
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatProgramDuration(
  duration: string | number | null | undefined,
) {
  if (duration == null || duration === "") return null;

  if (typeof duration === "string") {
    const trimmed = duration.trim();
    if (!trimmed) return null;

    const numericOnly = /^\d+$/.test(trimmed);
    if (!numericOnly) return trimmed;

    duration = Number(trimmed);
  }

  if (!Number.isFinite(duration) || duration <= 0) return null;

  const unit =
    DURATION_UNITS.find((u) => duration % u.factor === 0) ??
    DURATION_UNITS[DURATION_UNITS.length - 1];

  const value = duration / unit.factor;

  return `${value} ${unit.label}`;
}

function formatRupiah(value: number | null | undefined) {
  if (typeof value !== "number") return null;

  return `Rp ${value.toLocaleString("id-ID")}`;
}

function PublicBadgePreview({
  badge,
  theme,
}: {
  badge: string;
  theme: Theme;
}) {
  return (
    <span
      className="inline-flex items-center rounded-[6px] px-2 py-0.5 font-display font-bold"
      style={{
        fontSize: "0.5625rem",
        background: theme.primary,
        color: "white",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      {badge}
    </span>
  );
}

function PublicHighlightPreview({
  highlight,
  theme,
}: {
  highlight: string;
  theme: Theme;
}) {
  const highlightItems = splitProgramHighlight(highlight);
  const isMultiHighlight = highlightItems.length > 1;

  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: "var(--surface-soft)",
        border: "1px solid var(--border-soft)",
      }}
    >
      {isMultiHighlight ? (
        <div className="flex flex-wrap gap-1.5">
          {highlightItems.map((text, i) => (
            <span
              key={`${text}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-display font-semibold"
              style={{
                fontSize: "0.625rem",
                background: theme.soft,
                color: theme.primary,
                border: `1px solid ${theme.border}`,
              }}
            >
              <svg
                viewBox="0 0 10 10"
                className="h-2 w-2 flex-shrink-0"
                fill="none"
              >
                <path
                  d="M2 5l2 2 4-4"
                  stroke={theme.primary}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {text}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex items-start gap-2.5">
          <div
            className="mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full"
            style={{ background: theme.soft }}
          >
            <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none">
              <path
                d="M2 5l2 2 4-4"
                stroke={theme.primary}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              lineHeight: "1.55",
            }}
          >
            {highlightItems[0] ?? highlight}
          </p>
        </div>
      )}
    </div>
  );
}

function PublicTagsPreview({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.slice(0, 4).map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="rounded-full px-2 py-0.5"
          style={{
            fontSize: "0.5875rem",
            background: "var(--surface-soft)",
            color: "var(--text-faint)",
            border: "1px solid var(--border-soft)",
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function ProgramPublicCardPreview({ data }: { data: DetailData }) {
  const theme = useMemo(
    () => generateTheme(data.category.themePrimary),
    [data.category.themePrimary],
  );

  const durationLabel = formatProgramDuration(data.duration);
  const priceLabel =
    formatRupiah(data.startingPrice) ??
    formatRupiah(data.startingOriginalPrice) ??
    "Harga belum diatur";

  const tags = data.tags ?? [];
  const description = data.shortDesc || data.description || "Deskripsi program";
  const categoryLabel =
    data.category.shortLabel ?? data.category.label ?? "Program";

  return (
    <aside className="xl:sticky xl:top-[calc(var(--navbar-height,64px)+76px)]">
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Preview Publik
          </p>
          <p className="mt-0.5 text-xs text-neutral-500">
            Tampilan kartu program setelah disimpan.
          </p>
        </div>

        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
          style={{
            background: theme.soft,
            color: theme.primary,
            border: `1px solid ${theme.border}`,
          }}
        >
          Card
        </span>
      </div>

      <div
        className="flex h-full flex-col overflow-hidden rounded-[20px]"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-soft)",
          boxShadow: "0 1px 8px rgba(10,45,135,0.04)",
          textDecoration: "none",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: "3px",
            background: theme.border,
          }}
        />

        {/* Header */}
        <div className="flex items-start gap-3.5 px-5 pt-5">
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px]"
            style={{
              background: theme.soft,
              border: `1.5px solid ${theme.border}`,
            }}
          >
            {data.icon ? (
              <Icon
                name={data.icon as any}
                className="h-5 w-5"
                style={{ color: theme.primary }}
              />
            ) : (
              <BookOpen className="h-5 w-5" style={{ color: theme.primary }} />
            )}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <p
              className="mb-1.5 font-display font-bold leading-snug"
              style={{ fontSize: "1rem", color: "var(--blue-navy)" }}
            >
              {data.title}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {data.badge && (
                <PublicBadgePreview badge={data.badge} theme={theme} />
              )}

              {data.level && (
                <span
                  className="inline-flex items-center rounded-[6px] px-2 py-0.5 font-display font-semibold"
                  style={{
                    fontSize: "0.5625rem",
                    background: "var(--surface-soft)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  {data.level}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3.5 px-5 pb-0 pt-4">
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              lineHeight: "1.68",
            }}
          >
            {description}
          </p>

          {data.highlight && (
            <PublicHighlightPreview highlight={data.highlight} theme={theme} />
          )}

          {(durationLabel || data.format) && (
            <div className="flex flex-wrap gap-1.5">
              {[durationLabel, data.format]
                .filter((v): v is string => Boolean(v))
                .map((v, i) => (
                  <span
                    key={`${v}-${i}`}
                    className="rounded-[8px] px-2.5 py-1 font-display font-semibold"
                    style={{
                      fontSize: "0.625rem",
                      background: "var(--surface-soft)",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border-soft)",
                    }}
                  >
                    {v}
                  </span>
                ))}
            </div>
          )}

          <PublicTagsPreview tags={tags} />

          <div
            className="rounded-xl px-3 py-2"
            style={{
              background: theme.soft,
              border: `1px solid ${theme.border}`,
            }}
          >
            <p
              className="font-display font-semibold"
              style={{
                fontSize: "0.625rem",
                color: theme.primary,
              }}
            >
              Kategori
            </p>
            <p
              className="mt-0.5 font-display font-bold"
              style={{
                fontSize: "0.8125rem",
                color: "var(--blue-navy)",
              }}
            >
              {categoryLabel}
            </p>
          </div>

          <div className="flex-1" />
        </div>

        {/* Footer */}
        <div
          className="mt-4 flex items-center justify-between px-5 pb-5 pt-4"
          style={{ borderTop: "1px solid var(--border-soft)" }}
        >
          <div>
            <p style={{ fontSize: "0.5875rem", color: "var(--text-faint)" }}>
              Mulai dari
            </p>
            <p
              className="font-display font-black"
              style={{
                fontSize: "1.1875rem",
                color: theme.primary,
                letterSpacing: "-0.03em",
              }}
            >
              {priceLabel}
            </p>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-display font-bold text-white"
            style={{
              fontSize: "0.875rem",
              background: theme.primary,
              border: "none",
              cursor: "default",
            }}
          >
            Daftar
            <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none">
              <path
                d="M2.5 7h9M7.5 3.5l3.5 3.5-3.5 3.5"
                stroke="white"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <p className="mt-3 px-1 text-[11px] leading-relaxed text-neutral-400">
        Preview ini memakai data yang sudah tersimpan. Saat sedang edit, klik
        simpan untuk melihat perubahan di preview kanan.
      </p>
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────
   DETAIL TAB
───────────────────────────────────────────────────────────── */

interface DetailTabProps {
  programId: string;
}

export default function DetailTab({ programId }: DetailTabProps) {
  const { data, isLoading } = trpc.programs.getDetail.useQuery(
    { id: programId },
    { staleTime: 30_000, placeholderData: (prev) => prev },
  );

  if (isLoading && !data) return <TabSkeleton />;
  if (!data) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid max-w-7xl grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]"
    >
      {/* Left — editable sections */}
      <div className="flex min-w-0 flex-col gap-3">
        {/* 1 — Identity */}
        <motion.div variants={itemVariants}>
          <IdentitySection data={data} programId={programId} />
        </motion.div>

        {/* 2 — Structure */}
        <motion.div variants={itemVariants}>
          <StructureSection data={data} programId={programId} />
        </motion.div>

        {/* 3 — Marketing */}
        <motion.div variants={itemVariants}>
          <MarketingSection data={data} programId={programId} />
        </motion.div>

        {/* 4 — Branding */}
        <motion.div variants={itemVariants}>
          <BrandingSection data={data} programId={programId} />
        </motion.div>

        {/* 5 — Publishing */}
        <motion.div variants={itemVariants}>
          <PublishingSection data={data} programId={programId} />
        </motion.div>

        {/* 6 — Commerce Preview (read-only) */}
        <motion.div variants={itemVariants}>
          <CommercePreviewSection data={data} programId={programId} />
        </motion.div>

        {/* 7 — Budget (internal, editable) */}
        <motion.div variants={itemVariants}>
          <BudgetSection data={data} programId={programId} />
        </motion.div>
      </div>

      {/* Right — public card preview */}
      <motion.div variants={itemVariants} className="hidden xl:block">
        <ProgramPublicCardPreview data={data} />
      </motion.div>
    </motion.div>
  );
}