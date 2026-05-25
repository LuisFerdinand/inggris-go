"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Pencil,
  Clock,
  Repeat,
  CalendarClock,
  ImageOff,
  BookOpen,
  Layers,
  Package,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OverviewData } from "@/app/modules/program/server/program.router";
import { ProgramStatusBadge } from "../../../../_modules/ui/components";

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */

const FORMAT_LABELS: Record<string, string> = {
  online: "Online",
  offline: "Offline",
  hybrid: "Hybrid",
};
const LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.3,
    ease: [0.16, 1, 0.3, 1] as const,
  },
};
/* ═══════════════════════════════════════════════════════════
   HeroThumbnail
═══════════════════════════════════════════════════════════ */

interface HeroThumbnailProps {
  thumbnailUrl: string | null | undefined;
  title: string;
  badge?: string | null;
}

export function HeroThumbnail({
  thumbnailUrl,
  title,
  badge,
}: HeroThumbnailProps) {
  return (
    // was: sm:w-[140px] md:w-[160px]
    // now: stacks until lg (sidebar clears), then fixed width
    <div className="relative w-full lg:w-[148px] shrink-0">
      <motion.div
        className={cn(
          "group relative overflow-hidden rounded-xl border border-neutral-200",
          // was: aspect-[3/4] sm:aspect-[3/4]
          // mobile: wide banner feel; lg+: portrait cover
          "aspect-[16/7] lg:aspect-[3/4]",
          "bg-neutral-100 shadow-sm",
        )}
        whileHover={{ scale: 1.015 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
      >
        {thumbnailUrl ? (
          <>
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, 160px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-50">
            <div className="rounded-lg bg-neutral-200/60 p-3">
              <ImageOff className="size-5 text-neutral-400" />
            </div>
            <span className="text-[11px] text-neutral-400 font-medium">
              No thumbnail
            </span>
          </div>
        )}

        {/* Badge overlay */}
        {badge && (
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold shadow-sm">
              {badge}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HeroMeta — inline dot-separated metadata
═══════════════════════════════════════════════════════════ */

interface HeroMetaProps {
  format: string;
  level: string;
  scheduleType: string;
  duration?: number | null;
}

export function HeroMeta({
  format,
  level,
  scheduleType,
  duration,
}: HeroMetaProps) {
  const items = [
    { icon: null, label: FORMAT_LABELS[format] ?? format },
    { icon: null, label: LEVEL_LABELS[level] ?? level },
    {
      icon:
        scheduleType === "scheduled" ? (
          <CalendarClock className="size-3" />
        ) : (
          <Repeat className="size-3" />
        ),
      label: scheduleType === "scheduled" ? "Scheduled" : "Permanent",
    },
    ...(duration
      ? [{ icon: <Clock className="size-3" />, label: `${duration} days` }]
      : []),
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && (
            <span className="text-neutral-300 select-none text-xs mr-1">·</span>
          )}
          {item.icon && (
            <span className="text-neutral-400 shrink-0">{item.icon}</span>
          )}
          <span className="text-[13px] text-neutral-500 font-medium">
            {item.label}
          </span>
        </span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HeroStats — compact counters row
═══════════════════════════════════════════════════════════ */

interface HeroStatsProps {
  stats: OverviewData["stats"];
  contentMeta: OverviewData["contentMeta"];
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-neutral-400 shrink-0">{icon}</span>
      <div className="min-w-0">
        <span className="text-sm font-semibold text-neutral-800 tabular-nums">
          {value}
        </span>
        <span className="text-[12px] text-neutral-400 ml-1.5">{label}</span>
      </div>
    </div>
  );
}

export function HeroStats({ stats, contentMeta }: HeroStatsProps) {
  const contentUpdated = contentMeta?.updatedAt
    ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        Math.round(
          (new Date(contentMeta.updatedAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
        "day",
      )
    : null;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-neutral-100">
      <StatItem
        icon={<Layers className="size-3.5" />}
        label="batches"
        value={stats.batchesCount}
      />
      <StatItem
        icon={<Package className="size-3.5" />}
        label="packages"
        value={stats.packagesCount}
      />
      <StatItem
        icon={<FileText className="size-3.5" />}
        label="sections"
        value={stats.contentSectionsCount}
      />
      {contentUpdated && (
        <div className="flex items-center gap-1.5 text-[12px] text-neutral-400 ml-auto">
          <RefreshCw className="size-3" />
          <span>Content updated {contentUpdated}</span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HeroIdentity — title, desc, pills
═══════════════════════════════════════════════════════════ */

interface HeroIdentityProps {
  data: OverviewData;
}

export function HeroIdentity({ data }: HeroIdentityProps) {
  return (
    <div className="flex-1 min-w-0 flex flex-col gap-2.5">
      {/* Status + Category row */}
      <div className="flex flex-wrap items-center gap-2">
        <ProgramStatusBadge status={data.status} />
        {data.category && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600 uppercase tracking-wide">
            <BookOpen className="size-3" />
            {data.category.label}
          </span>
        )}
      </div>

      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 leading-tight tracking-tight line-clamp-2">
          {data.title}
        </h2>
        {data.shortDesc && (
          <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed line-clamp-2">
            {data.shortDesc}
          </p>
        )}
      </div>

      {/* Inline meta */}
      <HeroMeta
        format={data.format}
        level={data.level}
        scheduleType={data.scheduleType}
        duration={data.duration}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HeroActions
═══════════════════════════════════════════════════════════ */

interface HeroActionsProps {
  slug: string;
  onEditDetails?: () => void;
}

export function HeroActions({ slug, onEditDetails }: HeroActionsProps) {
  return (
    <div className="flex items-center gap-2 shrink-0 self-start">
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs font-medium"
        onClick={onEditDetails}
      >
        <Pencil className="size-3.5" />
        Edit details
      </Button>
      <Button size="sm" className="h-8 text-xs font-medium" asChild>
        <Link
          href={`/programs/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className="size-3.5" />
          View live
        </Link>
      </Button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   OverviewHero — root
═══════════════════════════════════════════════════════════ */

interface OverviewHeroProps {
  data: OverviewData;
  /** Called when "Edit details" is clicked — e.g. scroll to + activate OverviewInfo edit mode */
  onEditDetails?: () => void;
}

export function OverviewHero({ data, onEditDetails }: OverviewHeroProps) {
  return (
    <motion.div
      className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden"
      {...fadeUp}
    >
      <div className="p-5 flex flex-col lg:flex-row gap-5">
        {/* Thumbnail — full-width banner on mobile/sm/md, portrait aside on lg+ */}
        <div className="w-full lg:w-auto">
          <HeroThumbnail
            thumbnailUrl={data.thumbnailUrl}
            title={data.title}
            badge={data.badge}
          />
        </div>

        {/* Right column */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <HeroIdentity data={data} />
            {/* Actions: visible lg+, hidden below (footer handles it) */}
            <div className="hidden lg:flex">
              <HeroActions slug={data.slug} onEditDetails={onEditDetails} />
            </div>
          </div>
          <HeroStats stats={data.stats} contentMeta={data.contentMeta} />
        </div>
      </div>

      {/* Mobile+tablet action footer — hidden on lg+ */}
      <div className="lg:hidden flex items-center gap-2 px-5 py-3 border-t border-neutral-100 bg-neutral-50/60">
        <HeroActions slug={data.slug} onEditDetails={onEditDetails} />
      </div>
    </motion.div>
  );
}
