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
  Users,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDuration } from "@/lib/utils";
import { OverviewData } from "@/app/modules/program/server/program.router";
import {
  MetaBadge,
  ProgramStatusBadge,
} from "../../../../_modules/ui/components";
import {
  PROGRAM_FORMAT_META,
  PROGRAM_LEVEL_META,
  PROGRAM_SCHEDULE_TYPE_META,
  ProgramFormat,
  ProgramLevel,
  ProgramScheduleType,
  ProgramStatus,
} from "@/lib/enums/enums";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { Icon } from "@/components/Icon";
import { StatPill } from "@/components/StatPill";
import { minutesToBestUnit } from "@/components/Form/DurationInput";

interface OverviewHeroProps {
  data: {
    identity: {
      id: string;
      title: string;
      slug: string;
      shortDesc: string | null;
      thumbnailUrl: string | null;
      category: { id: string; label: string; slug: string };
      badge: string | null;
      highlight: string | null;
      status: string;
    };
    publishing: { status: string; publishedAt: Date | null; publicUrl: string };
    metrics: {
      batchesCount: number;
      openBatchesCount: number;
      packagesCount: number;
      contentSectionsCount: number;
      enrollmentsCount: number;
      startingPrice: number | null;
      startingOriginalPrice: number | null;
    };
    configuration: {
      scheduleType: string;
      format: string;
      level: string;
      duration: number | null;
    };
  };
  programId: string;
  onEditDetails?: () => void;
}

interface HeroThumbnailProps {
  thumbnailUrl: string | null | undefined;
  title: string;
  badge?: string | null;
}

function HeroThumbnail2({
  thumbnailUrl,
  title,
  badge,
}: {
  thumbnailUrl: string | null;
  title: string;
  badge: string | null;
}) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl border border-neutral-200 shadow-sm",
        "w-full lg:w-[148px] aspect-[16/6] lg:aspect-[3/4]",
        "bg-neutral-100 flex-shrink-0",
      )}
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {thumbnailUrl ? (
        <>
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 148px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-neutral-50 to-neutral-100">
          <div className="rounded-xl bg-neutral-200/70 p-3">
            <ImageOff className="size-5 text-neutral-400" />
          </div>
          <span className="text-[11px] text-neutral-400 font-medium">
            Belum ada thumbnail
          </span>
        </div>
      )}
      {badge && (
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold shadow-sm uppercase tracking-wide">
            {badge}
          </span>
        </div>
      )}
    </motion.div>
  );
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

// export function HeroMeta({
//   format,
//   level,
//   scheduleType,
//   duration,
// }: HeroMetaProps) {
//   const items = [
//     { icon: null, label: FORMAT_LABELS[format] ?? format },
//     { icon: null, label: LEVEL_LABELS[level] ?? level },
//     {
//       icon:
//         scheduleType === "scheduled" ? (
//           <CalendarClock className="size-3" />
//         ) : (
//           <Repeat className="size-3" />
//         ),
//       label: scheduleType === "scheduled" ? "Scheduled" : "Permanent",
//     },
//     ...(duration
//       ? [{ icon: <Clock className="size-3" />, label: `${duration} days` }]
//       : []),
//   ];

//   return (
//     <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
//       {items.map((item, i) => (
//         <span key={i} className="flex items-center gap-1">
//           {i > 0 && (
//             <span className="text-neutral-300 select-none text-xs mr-1">·</span>
//           )}
//           {item.icon && (
//             <span className="text-neutral-400 shrink-0">{item.icon}</span>
//           )}
//           <span className="text-[13px] text-neutral-500 font-medium">
//             {item.label}
//           </span>
//         </span>
//       ))}
//     </div>
//   );
// }

/* ═══════════════════════════════════════════════════════════
   HeroStats — compact counters row
═══════════════════════════════════════════════════════════ */

// interface HeroStatsProps {
//   stats: OverviewData["stats"];
//   contentMeta: OverviewData["contentMeta"];
// }

// function StatItem({
//   icon,
//   label,
//   value,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: number | string;
// }) {
//   return (
//     <div className="flex items-center gap-2 min-w-0">
//       <span className="text-neutral-400 shrink-0">{icon}</span>
//       <div className="min-w-0">
//         <span className="text-sm font-semibold text-neutral-800 tabular-nums">
//           {value}
//         </span>
//         <span className="text-[12px] text-neutral-400 ml-1.5">{label}</span>
//       </div>
//     </div>
//   );
// }

// export function HeroStats({ stats, contentMeta }: HeroStatsProps) {
//   const contentUpdated = contentMeta?.updatedAt
//     ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
//         Math.round(
//           (new Date(contentMeta.updatedAt).getTime() - Date.now()) /
//             (1000 * 60 * 60 * 24),
//         ),
//         "day",
//       )
//     : null;

//   return (
//     <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-neutral-100">
//       <StatItem
//         icon={<Layers className="size-3.5" />}
//         label="batches"
//         value={stats.batchesCount}
//       />
//       <StatItem
//         icon={<Package className="size-3.5" />}
//         label="packages"
//         value={stats.packagesCount}
//       />
//       <StatItem
//         icon={<FileText className="size-3.5" />}
//         label="sections"
//         value={stats.contentSectionsCount}
//       />
//       {contentUpdated && (
//         <div className="flex items-center gap-1.5 text-[12px] text-neutral-400 ml-auto">
//           <RefreshCw className="size-3" />
//           <span>Content updated {contentUpdated}</span>
//         </div>
//       )}
//     </div>
//   );
// }

/* ═══════════════════════════════════════════════════════════
   HeroIdentity — title, desc, pills
═══════════════════════════════════════════════════════════ */

// interface HeroIdentityProps {
//   data: OverviewData;
// }

// export function HeroIdentity({ data }: HeroIdentityProps) {
//   return (
//     <div className="flex-1 min-w-0 flex flex-col gap-2.5">
//       {/* Status + Category row */}
//       <div className="flex flex-wrap items-center gap-2">
//         <ProgramStatusBadge status={data.status} />
//         {data.category && (
//           <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600 uppercase tracking-wide">
//             <BookOpen className="size-3" />
//             {data.category.label}
//           </span>
//         )}
//       </div>

//       {/* Title */}
//       <div>
//         <h2 className="text-xl font-bold text-neutral-900 leading-tight tracking-tight line-clamp-2">
//           {data.title}
//         </h2>
//         {data.shortDesc && (
//           <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed line-clamp-2">
//             {data.shortDesc}
//           </p>
//         )}
//       </div>

//       {/* Inline meta */}
//       <HeroMeta
//         format={data.format}
//         level={data.level}
//         scheduleType={data.scheduleType}
//         duration={data.duration}
//       />
//     </div>
//   );
// }

/* ═══════════════════════════════════════════════════════════
   HeroActions
═══════════════════════════════════════════════════════════ */

// interface HeroActionsProps {
//   href: string;
//   onEditDetails?: () => void;
// }

// export function HeroActions({ href, onEditDetails }: HeroActionsProps) {
//   return (
//     <div className="flex items-center gap-2 shrink-0 self-start">
//       <Button
//         variant="outline"
//         size="sm"
//         className="h-8 text-xs font-medium"
//         onClick={onEditDetails}
//       >
//         <Pencil className="size-3.5" />
//         Edit details
//       </Button>
//       <Button size="sm" className="h-8 text-xs font-medium" asChild>
//         <Link href={href} target="_blank" rel="noopener noreferrer">
//           <ExternalLink className="size-3.5" />
//           View live
//         </Link>
//       </Button>
//     </div>
//   );
// }

/* ═══════════════════════════════════════════════════════════
   OverviewHero — root
═══════════════════════════════════════════════════════════ */

export function OverviewHero({
  data,
  programId,
  onEditDetails,
}: OverviewHeroProps) {
  const { identity, publishing, metrics, configuration } = data;
  const metaItems = [
    {
      label:
        PROGRAM_FORMAT_META[configuration.format as ProgramFormat].label ??
        configuration.format,
    },
    {
      label:
        PROGRAM_LEVEL_META[configuration.level as ProgramLevel].label ??
        configuration.level,
    },
    {
      icon: (
        <Icon
          name={
            PROGRAM_SCHEDULE_TYPE_META[
              configuration.scheduleType as ProgramScheduleType
            ].icon
          }
          className="size-3"
        ></Icon>
      ),
      label:
        PROGRAM_SCHEDULE_TYPE_META[
          configuration.scheduleType as ProgramScheduleType
        ].label,
    },
    ...(configuration.duration
      ? [
          {
            icon: <Clock className="size-3" />,
            label: `${formatDuration(configuration.duration)}`,
          },
        ]
      : []),
  ];

  const Actions = () => (
    <div className="flex items-center gap-2 flex-shrink-0">
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 rounded-lg text-xs font-medium"
        asChild
      >
        <Link href={`/dashboard/programs/${programId}?tab=detail`}>
          <Pencil className="size-3.5" />
          Edit detail
        </Link>
      </Button>
      <Button
        size="sm"
        className="h-8 text-xs font-medium gap-1.5 rounded-lg"
        asChild
      >
        <Link
          href={publishing.publicUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className="size-3.5" />
          Lihat live
        </Link>
      </Button>
    </div>
  );
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="p-5 flex flex-col lg:flex-row gap-5 group">
        {/* Thumbnail */}
        <div className="w-full lg:w-auto">
          <HeroThumbnail
            thumbnailUrl={identity.thumbnailUrl}
            title={identity.title}
            badge={identity.badge}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <ProgramStatusBadge status={identity.status as ProgramStatus} />
                {identity.category && (
                  <MetaBadge
                    meta={{
                      label: identity.category.label,
                      icon: "book-open",
                      tone: "neutral",
                    }}
                  />
                )}
                {identity.highlight && (
                  <MetaBadge
                    meta={{
                      label: identity.highlight,
                      icon: "award",
                      tone: "neutral",
                    }}
                  />
                )}
              </div>
              <h2 className="text-[19px] font-bold text-neutral-900 leading-tight tracking-tight mb-1.5 line-clamp-2">
                {identity.title}
              </h2>
              {identity.shortDesc && (
                <p className="text-[13px] text-neutral-500 leading-relaxed line-clamp-2">
                  {identity.shortDesc}
                </p>
              )}

              {/* Meta chips */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2.5">
                {metaItems.map((item, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && (
                      <span className="text-neutral-300 select-none text-xs mr-1">
                        ·
                      </span>
                    )}
                    {item.icon && (
                      <span className="text-neutral-400">{item.icon}</span>
                    )}
                    <span className="text-[12px] text-neutral-500 font-medium">
                      {item.label}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Desktop actions */}
            <div className="hidden lg:flex">
              <Actions />
            </div>
          </div>

          {/* Public URL bar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 border border-neutral-100 rounded-lg">
            <Link2 className="size-3.5 text-neutral-400 flex-shrink-0" />
            <span className="flex-1 font-mono text-[11px] text-neutral-500 truncate">
              {publishing.publicUrl}
            </span>
            <CopyLinkButton text={publishing.publicUrl} />
            <Link
              href={publishing.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center size-7 rounded-lg border border-neutral-200 bg-white text-neutral-400 hover:text-neutral-700 hover:border-neutral-300 transition-all duration-150 flex-shrink-0"
              aria-label="Buka halaman publik"
            >
              <ExternalLink className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats footer */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 border-t border-neutral-100 bg-neutral-50/60">
        <StatPill
          icon={<Layers className="size-3.5" />}
          value={metrics.batchesCount}
          label="batch"
        />
        <StatPill
          icon={<Package className="size-3.5" />}
          value={metrics.packagesCount}
          label="paket"
        />
        <StatPill
          icon={<FileText className="size-3.5" />}
          value={metrics.contentSectionsCount}
          label="seksi konten"
        />
        <StatPill
          icon={<Users className="size-3.5" />}
          value={metrics.enrollmentsCount}
          label="pendaftar"
        />
        {/* Mobile actions */}
        <div className="lg:hidden ml-auto">
          <Actions />
        </div>
      </div>
    </div>
  );
}
