"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarPlus,
  Package,
  LayoutList,
  Send,
  Bolt,
  Settings2,
  Globe,
  Repeat,
  CalendarClock,
  Clock,
  Award,
  MousePointerClick,
  Activity,
  CalendarDays,
  RefreshCw,
  CheckCircle2,
  Circle,
  IdCard,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import { useState } from "react";
import toast from "react-hot-toast";

/* ═══════════════════════════════════════════════════════
   QUICK ACTIONS
═══════════════════════════════════════════════════════ */

interface QuickActionsProps {
  quickActions: {
    canPublish: boolean;
    canCreateBatch: boolean;
    canCreatePackage: boolean;
    canEditContent: boolean;
  };
  scheduleType: string;
  status: string;
  programId: string;
}

interface ActionItem {
  label: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  href?: string;
  disabled?: boolean;
  disabledReason?: string;
}

export function OverviewQuickActions({
  quickActions,
  scheduleType,
  status,
  programId,
}: QuickActionsProps) {
  const isPublished = status === "published";

  const actions: ActionItem[] = [
    ...(scheduleType === "scheduled"
      ? [
          {
            label: "Tambah Batch",
            description: "Jadwalkan cohort baru",
            icon: CalendarPlus,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            href: `/dashboard/programs/${programId}/batches/new`,
          },
        ]
      : []),
    {
      label: "Tambah Paket",
      description: "Buat tier harga baru",
      icon: Package,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      href: `/dashboard/programs/${programId}/packages/new`,
    },
    {
      label: "Edit Konten",
      description: "Kurikulum & materi",
      icon: LayoutList,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      href: `/dashboard/programs/${programId}/content`,
    },
    {
      label: isPublished ? "Program Live" : "Publikasi Program",
      description: isPublished
        ? "Sudah terlihat oleh calon peserta"
        : "Tampilkan ke halaman publik",
      icon: Send,
      iconBg: isPublished ? "bg-emerald-50" : "bg-amber-50",
      iconColor: isPublished ? "text-emerald-600" : "text-amber-600",
      disabled: isPublished || !quickActions.canPublish,
      disabledReason: !quickActions.canPublish
        ? "Selesaikan setup terlebih dahulu"
        : undefined,
    },
  ];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-100">
        <Bolt className="size-4 text-neutral-400" />
        <span className="text-[11px] font-bold uppercase tracking-[0.7px] text-neutral-400">
          Aksi Cepat
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-4">
        {actions.map((action, i) => {
          const Icon = action.icon;
          const inner = (
            <motion.div
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-150",
                action.disabled
                  ? "opacity-45 cursor-not-allowed bg-neutral-50 border-neutral-100"
                  : "bg-white border-neutral-200 cursor-pointer hover:border-neutral-300 hover:bg-neutral-50",
              )}
              whileHover={action.disabled ? {} : { y: -1, x: 0 }}
              title={action.disabledReason}
            >
              <div
                className={cn(
                  "size-9 rounded-xl flex items-center justify-center flex-shrink-0",
                  action.iconBg,
                )}
              >
                <Icon className={cn("size-[18px]", action.iconColor)} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-neutral-800 leading-tight">
                  {action.label}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {action.description}
                </p>
              </div>
            </motion.div>
          );

          if (action.href && !action.disabled) {
            return (
              <Link key={action.label} href={action.href}>
                {inner}
              </Link>
            );
          }
          return <div key={action.label}>{inner}</div>;
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CONFIGURATION SNAPSHOT
═══════════════════════════════════════════════════════ */

const FORMAT_MAP: Record<string, string> = {
  online: "Online",
  offline: "Offline",
  hybrid: "Hybrid",
};
const LEVEL_MAP: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
const LEVEL_COLOR: Record<string, string> = {
  beginner: "bg-emerald-50 text-emerald-700 border-emerald-100",
  intermediate: "bg-amber-50 text-amber-700 border-amber-100",
  advanced: "bg-red-50 text-red-700 border-red-100",
};

interface ConfigProps {
  configuration: {
    scheduleType: string;
    registrationType: string;
    format: string;
    level: string;
    duration: number | null;
  };
}

function ConfigRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-neutral-50 last:border-0">
      <div className="flex items-center gap-2 text-[12px] text-neutral-400 font-medium flex-shrink-0">
        <span className="text-neutral-300">{icon}</span>
        {label}
      </div>
      <div className="flex items-center justify-end">{children}</div>
    </div>
  );
}

function ConfigChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
        className ?? "bg-neutral-50 text-neutral-700 border-neutral-100",
      )}
    >
      {children}
    </span>
  );
}

export function OverviewConfiguration({ configuration }: ConfigProps) {
  const levelClass =
    LEVEL_COLOR[configuration.level] ??
    "bg-neutral-50 text-neutral-700 border-neutral-100";

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-100">
        <Settings2 className="size-4 text-neutral-400" />
        <span className="text-[11px] font-bold uppercase tracking-[0.7px] text-neutral-400">
          Konfigurasi
        </span>
      </div>
      <div className="px-5 pb-2 pt-1">
        <ConfigRow icon={<Globe className="size-3.5" />} label="Format">
          <ConfigChip>
            <Globe className="size-3" />
            {FORMAT_MAP[configuration.format] ?? configuration.format}
          </ConfigChip>
        </ConfigRow>
        <ConfigRow icon={<Award className="size-3.5" />} label="Level">
          <ConfigChip className={levelClass}>
            {LEVEL_MAP[configuration.level] ?? configuration.level}
          </ConfigChip>
        </ConfigRow>
        <ConfigRow icon={<CalendarClock className="size-3.5" />} label="Jadwal">
          <ConfigChip>
            {configuration.scheduleType === "scheduled" ? (
              <CalendarClock className="size-3" />
            ) : (
              <Repeat className="size-3" />
            )}
            {configuration.scheduleType === "scheduled"
              ? "Scheduled"
              : "Permanent"}
          </ConfigChip>
        </ConfigRow>
        <ConfigRow
          icon={<MousePointerClick className="size-3.5" />}
          label="Registrasi"
        >
          <ConfigChip>
            {configuration.registrationType === "online" ? "Online" : "Offline"}
          </ConfigChip>
        </ConfigRow>
        <ConfigRow icon={<Clock className="size-3.5" />} label="Durasi">
          {configuration.duration ? (
            <span className="text-[13px] font-semibold text-neutral-700">
              {formatDuration(configuration.duration)}
            </span>
          ) : (
            <span className="text-[12px] text-neutral-300 italic">
              Belum diatur
            </span>
          )}
        </ConfigRow>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ACTIVITY TIMELINE
═══════════════════════════════════════════════════════ */

interface ActivityProps {
  activity: {
    updatedAt: Date | null;
    contentUpdatedAt: Date | null;
    createdAt: Date;
  };
  publishedAt: Date | null;
}

function formatDateFull(d: Date | string | null | undefined) {
  if (!d) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

function formatRelative(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return formatDateFull(d);
}

interface ActivityItemProps {
  icon: React.ElementType;
  label: string;
  date: Date | string | null | undefined;
  filled?: boolean;
  iconColor?: string;
}

function TimelineItem({
  icon: Icon,
  label,
  date,
  filled,
  iconColor,
}: ActivityItemProps) {
  const relative = formatRelative(date);
  const full = formatDateFull(date);

  return (
    <div className="flex gap-3 items-start group relative">
      <div
        className={cn(
          "size-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 z-10",
          filled
            ? "bg-blue-500 border-blue-500"
            : "bg-white border-neutral-200",
        )}
      >
        <Icon
          className={cn(
            "size-3.5",
            filled ? "text-white" : (iconColor ?? "text-neutral-300"),
          )}
        />
      </div>
      <div className="flex-1 min-w-0 pb-3">
        <p className="text-[12px] font-semibold text-neutral-700">{label}</p>
        {relative ? (
          <p
            className="text-[11px] text-neutral-400 mt-0.5"
            title={full ?? undefined}
          >
            {relative}
          </p>
        ) : (
          <p className="text-[11px] text-neutral-300 italic mt-0.5">
            Belum terjadi
          </p>
        )}
      </div>
    </div>
  );
}

export function OverviewActivity({ activity, publishedAt }: ActivityProps) {
  const items: ActivityItemProps[] = [
    {
      icon: CalendarDays,
      label: "Program dibuat",
      date: activity.createdAt,
      filled: true,
    },
    {
      icon: RefreshCw,
      label: "Terakhir diperbarui",
      date: activity.updatedAt,
      filled: !!activity.updatedAt,
      iconColor: "text-blue-400",
    },
    {
      icon: LayoutList,
      label: "Konten diperbarui",
      date: activity.contentUpdatedAt,
      filled: !!activity.contentUpdatedAt,
      iconColor: "text-violet-400",
    },
    {
      icon: Send,
      label: "Dipublikasikan",
      date: publishedAt,
      filled: !!publishedAt,
      iconColor: "text-emerald-400",
    },
  ];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-100">
        <Activity className="size-4 text-neutral-400" />
        <span className="text-[11px] font-bold uppercase tracking-[0.7px] text-neutral-400">
          Aktivitas
        </span>
      </div>
      <div className="px-5 pt-4 pb-2 relative">
        {/* Timeline connector line */}
        <div className="absolute left-[33px] top-8 bottom-6 w-px bg-neutral-100" />
        <div className="flex flex-col gap-0">
          {items.map((item, i) => (
            <TimelineItem key={i} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   WORKSPACE META
═══════════════════════════════════════════════════════ */

interface WorkspaceMetaProps {
  programId: string;
  slug: string;
  publicUrl: string;
  categorySlug: string;
}

function MetaCopyRow({
  label,
  value,
  isLink,
  fullUrl,
}: {
  label: string;
  value: string;
  isLink?: boolean;
  fullUrl?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = fullUrl ?? value;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Disalin!");
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-[0.6px] text-neutral-400">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        {isLink ? (
          <Link
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 font-medium font-mono truncate transition-colors"
          >
            <ExternalLink className="size-3 flex-shrink-0" />
            <span className="truncate">{value}</span>
          </Link>
        ) : (
          <span className="font-mono text-[11px] text-neutral-600 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-100 truncate max-w-[180px]">
            {value}
          </span>
        )}
        <button
          onClick={handleCopy}
          className="inline-flex items-center justify-center size-6 rounded border border-neutral-100 bg-white text-neutral-300 hover:text-neutral-600 hover:border-neutral-200 transition-all flex-shrink-0"
          aria-label={`Salin ${label}`}
        >
          {copied ? (
            <Check className="size-3 text-emerald-500" />
          ) : (
            <Copy className="size-3" />
          )}
        </button>
      </div>
    </div>
  );
}

export function OverviewWorkspaceMeta({
  programId,
  slug,
  publicUrl,
  categorySlug,
}: WorkspaceMetaProps) {
  const fullPublicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${publicUrl}`
      : publicUrl;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-100">
        <IdCard className="size-4 text-neutral-400" />
        <span className="text-[11px] font-bold uppercase tracking-[0.7px] text-neutral-400">
          Info Workspace
        </span>
      </div>
      <div className="p-5 flex flex-col gap-4">
        <MetaCopyRow label="Program ID" value={programId} />
        <MetaCopyRow label="Slug" value={slug} />
        <MetaCopyRow
          label="URL Publik"
          value={publicUrl}
          isLink
          fullUrl={fullPublicUrl}
        />
      </div>
    </div>
  );
}
