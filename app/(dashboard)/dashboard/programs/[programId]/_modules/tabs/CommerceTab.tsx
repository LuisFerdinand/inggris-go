// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/CommerceTab.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Edit3,
  Info,
  Layers,
  Loader2,
  Lock,
  Package,
  Plus,
  Repeat,
  Trash2,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { cn, generateTheme } from "@/lib/utils";

import { BatchForm } from "../ui/components/Batch/BatchForm";
import { PackageForm } from "../ui/components/Package/PackageForm";
import { DetailData, InfoNotice, MetaPill, ReadField } from "./detail";

type DrawerState =
  | { kind: "batch"; mode: "create"; id?: never }
  | { kind: "batch"; mode: "edit"; id: string }
  | { kind: "package"; mode: "create"; batchId?: string | null; id?: never }
  | { kind: "package"; mode: "edit"; id: string; batchId?: string | null }
  | null;

type Theme = ReturnType<typeof generateTheme>;

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

const PUBLIC_BATCH_STATUS = {
  open: {
    label: "Pendaftaran Dibuka",
    dot: "#16a34a",
    bg: "rgba(22,163,74,0.1)",
    border: "rgba(22,163,74,0.28)",
    text: "#15803d",
  },
  coming_soon: {
    label: "Segera Dibuka",
    dot: "#d97706",
    bg: "rgba(217,119,6,0.1)",
    border: "rgba(217,119,6,0.28)",
    text: "#b45309",
  },
  full: {
    label: "Kuota Penuh",
    dot: "#dc2626",
    bg: "rgba(220,38,38,0.08)",
    border: "rgba(220,38,38,0.22)",
    text: "#b91c1c",
  },
  closed: {
    label: "Ditutup",
    dot: "#94a3b8",
    bg: "rgba(148,163,184,0.12)",
    border: "rgba(148,163,184,0.25)",
    text: "#64748b",
  },
} as const;

const DAY_LABELS: Record<string, string> = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
  sunday: "Minggu",
};

function formatIDR(value: number | null | undefined) {
  if (value == null) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Belum diatur";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateShort(value: Date | string | null | undefined) {
  if (!value) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function getDurationDays(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined,
) {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  return Math.max(Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1, 1);
}

function getBatchPublicStatus(batch: any): keyof typeof PUBLIC_BATCH_STATUS {
  if (batch.ui?.isFull || batch.status === "full") return "full";

  if (batch.status === "open" || batch.status === "ongoing") {
    return "open";
  }

  if (batch.status === "draft") return "coming_soon";

  return "closed";
}

function formatScheduleItem(schedule: any) {
  if (!schedule) return null;

  if (schedule.label) return schedule.label;

  const days =
    Array.isArray(schedule.days) && schedule.days.length > 0
      ? schedule.days.map((day: string) => DAY_LABELS[day] ?? day).join(", ")
      : null;

  const time =
    schedule.startTime && schedule.endTime
      ? `${schedule.startTime}–${schedule.endTime}`
      : schedule.startTime || schedule.endTime || null;

  return [days, time, schedule.location].filter(Boolean).join(" · ") || null;
}

function formatBatchSchedule(batch: any) {
  const schedules = Array.isArray(batch.schedules) ? batch.schedules : [];

  const scheduleLabel = schedules
    .map(formatScheduleItem)
    .filter(Boolean)
    .join(" · ");

  if (scheduleLabel) return scheduleLabel;
  if (batch.location) return batch.location;
  if (batch.timezone) return `Timezone ${batch.timezone}`;

  return "Jadwal menyusul";
}

function getPackagePriceSummary(packages: any[]) {
  if (!packages.length) return null;

  const sorted = [...packages].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return (a.price ?? 0) - (b.price ?? 0);
  });

  const pkg = sorted[0];

  return {
    pkg,
    price: formatIDR(pkg.price),
    originalPrice:
      pkg.originalPrice && pkg.originalPrice > pkg.price
        ? formatIDR(pkg.originalPrice)
        : null,
  };
}

function ArrowIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none">
      <path
        d="M2.5 7h9M7.5 3.5l3.5 3.5-3.5 3.5"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
      <rect
        x="1.5"
        y="3"
        width="13"
        height="11"
        rx="2"
        stroke={color}
        strokeWidth={1.4}
      />
      <path
        d="M5 1.5v3M11 1.5v3M1.5 7.5h13"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </svg>
  );
}

function DetailButton({
  children,
  onClick,
  variant = "primary",
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "outline" | "danger";
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={variant === "primary" ? "default" : "outline"}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-7 rounded-lg px-2.5 text-[11px] font-semibold gap-1.5",
        variant === "primary" &&
          "bg-slate-900 text-white hover:bg-slate-800",
        variant === "outline" &&
          "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900",
        variant === "danger" &&
          "border-red-100 bg-white text-red-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600",
      )}
    >
      {children}
    </Button>
  );
}

/* ─────────────────────────────────────────────────────────────
   STATS OVERVIEW
───────────────────────────────────────────────────────────── */

function StatTile({
  icon,
  accent,
  label,
  value,
  unit,
  sub,
}: {
  icon: React.ReactNode;
  accent: string;
  label: string;
  value: string;
  unit?: string;
  sub?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          accent,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.7px] text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 flex items-baseline gap-1 text-[15px] font-bold leading-none text-slate-800">
          <span className="truncate">{value}</span>
          {unit && (
            <span className="text-[11px] font-semibold text-slate-400">
              {unit}
            </span>
          )}
        </p>
        {sub && <div className="mt-1">{sub}</div>}
      </div>
    </div>
  );
}

type ScheduleType = "permanent" | "scheduled";

interface SegOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  disabled,
}: {
  value: T;
  onChange: (value: T) => void;
  options: SegOption<T>[];
  disabled?: boolean;
}) {
  return (
    <div className="relative flex items-center rounded-xl border border-neutral-200/80 bg-neutral-100 p-1">
      {options.map((opt) => {
        const active = value === opt.value;

        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled || opt.disabled}
            onClick={() => !disabled && !opt.disabled && onChange(opt.value)}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-[9px] px-3 py-2",
              "text-[12px] font-semibold transition-all duration-150",
              active
                ? "text-neutral-900"
                : "text-neutral-500 hover:text-neutral-700",
              (disabled || opt.disabled) && "cursor-not-allowed opacity-50",
            )}
          >
            {active && (
              <motion.span
                layoutId="commerce-schedule-type"
                className="absolute inset-0 rounded-[9px] border border-neutral-200 bg-white shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}

            <span className="relative z-10 flex items-center gap-1.5">
              {opt.icon}
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ScheduleTypeSwitcher({
  value,
  disabled,
  isPending,
  onChange,
}: {
  value: ScheduleType;
  disabled: boolean;
  isPending: boolean;
  onChange: (value: ScheduleType) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-neutral-100 bg-neutral-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
            {value === "scheduled" ? (
              <CalendarClock className="size-4" />
            ) : (
              <Repeat className="size-4" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-[13px] font-bold tracking-tight text-neutral-800">
              Tipe Jadwal Commerce
            </h3>
            <p className="mt-0.5 text-[12px] leading-relaxed text-neutral-400">
              Ubah antara permanent package dan scheduled batch langsung dari tab commerce.
            </p>
          </div>
        </div>

        {isPending && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-blue-600">
            <Loader2 className="size-3.5 animate-spin" />
            Menyimpan...
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-5">
        <SegmentedControl<ScheduleType>
          value={value}
          onChange={onChange}
          disabled={disabled || isPending}
          options={[
            {
              value: "permanent",
              label: "Permanent",
              icon: <Repeat className="size-3.5" />,
            },
            {
              value: "scheduled",
              label: "Scheduled",
              icon: <CalendarClock className="size-3.5" />,
            },
          ]}
        />

        {disabled && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
            <p className="text-[12px] leading-relaxed text-amber-800">
              Tipe jadwal tidak bisa diubah karena program sudah memiliki paket,
              batch, atau pendaftar. Hapus data commerce terlebih dahulu jika
              ingin mengganti tipe.
            </p>
          </div>
        )}

        {!disabled && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5">
            <p className="text-[12px] leading-relaxed text-blue-700">
              Permanent berarti paket langsung berada di bawah program.
              Scheduled berarti peserta memilih batch terlebih dahulu, lalu paket
              berada di dalam batch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatsOverview({
  data,
  isScheduled,
  totalPackages,
  totalBatches,
}: {
  data: DetailData;
  isScheduled: boolean;
  totalPackages: number;
  totalBatches: number;
}) {
  const hasDiscount =
    data.startingOriginalPrice &&
    data.startingPrice &&
    data.startingOriginalPrice > data.startingPrice;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 px-5 pt-5">
        <MetaPill className="border-slate-200 bg-white text-slate-700">
          {isScheduled ? (
            <CalendarClock className="size-3" />
          ) : (
            <Repeat className="size-3" />
          )}
          {isScheduled ? "Scheduled Program" : "Permanent Program"}
        </MetaPill>

        {data.hasPackages ? (
          <MetaPill className="border-emerald-200 bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="size-3" />
            Paket tersedia
          </MetaPill>
        ) : (
          <MetaPill className="border-amber-200 bg-amber-50 text-amber-700">
            <Info className="size-3" />
            Belum ada paket
          </MetaPill>
        )}
      </div>

      <div className="grid gap-3 px-5 py-4 sm:grid-cols-3">
        <StatTile
          icon={<CircleDollarSign className="size-5" />}
          accent="border border-indigo-100 bg-indigo-50 text-indigo-600"
          label="Harga Mulai"
          value={formatIDR(data.startingPrice)}
          sub={
            hasDiscount ? (
              <span className="text-[11px] text-slate-300 line-through">
                {formatIDR(data.startingOriginalPrice)}
              </span>
            ) : undefined
          }
        />
        <StatTile
          icon={<Package className="size-5" />}
          accent="border border-indigo-100 bg-indigo-50 text-indigo-600"
          label="Total Paket"
          value={String(totalPackages)}
          unit="paket"
        />
        <StatTile
          icon={
            isScheduled ? (
              <Layers className="size-5" />
            ) : (
              <Repeat className="size-5" />
            )
          }
          accent="border border-indigo-100 bg-indigo-50 text-indigo-600"
          label={isScheduled ? "Total Batch" : "Tipe Setup"}
          value={isScheduled ? String(totalBatches) : "Direct"}
          unit={isScheduled ? "batch" : undefined}
        />
      </div>

      <div className="px-5 pb-5">
        <InfoNotice icon={<Info className="size-3.5" />}>
          Data order/enrollment mengambil snapshot program, batch, dan package
          saat transaksi dibuat. Perubahan harga atau judul ke depannya tidak
          merusak riwayat transaksi lama.
        </InfoNotice>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MANAGEMENT SECTION
───────────────────────────────────────────────────────────── */

function ManagementSection({
  icon,
  title,
  description,
  count,
  countLabel,
  addLabel,
  onAdd,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  countLabel: string;
  addLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[13px] font-bold tracking-tight text-slate-800">
                {title}
              </h3>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold tabular-nums text-slate-500">
                {count} {countLabel}
              </span>
            </div>
            <p className="mt-0.5 text-[12px] leading-relaxed text-slate-400">
              {description}
            </p>
          </div>
        </div>

        <DetailButton onClick={onAdd}>
          <Plus className="size-3" />
          {addLabel}
        </DetailButton>
      </div>

      <div className="p-5">{children}</div>
    </div>
  );
}

function Drawer({
  open,
  title,
  description,
  icon,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Tutup drawer"
            className="fixed inset-0 z-40 bg-[rgba(6,15,46,0.40)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl sm:rounded-l-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/40 px-6 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm">
                  {icon}
                </div>
                <div className="min-w-0">
                  <h2 className="text-[13px] font-bold tracking-tight text-slate-800">
                    {title}
                  </h2>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-slate-400">
                    {description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:text-slate-700"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center">
      <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm">
        {icon}
      </div>
      <p className="text-[13px] font-bold text-slate-800">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-[12px] leading-relaxed text-slate-400">
        {description}
      </p>
      <div className="mt-4">{action}</div>
    </div>
  );
}

function PackageCard({
  pkg,
  onEdit,
  onDelete,
  deleting,
}: {
  pkg: any;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}) {
  const features = pkg.features ?? [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-[13px] font-bold text-slate-800">
              {pkg.title}
            </h4>
            {pkg.isDefault && (
              <MetaPill className="border-amber-200 bg-amber-50 text-amber-700">
                <CheckCircle2 className="size-3" />
                Default
              </MetaPill>
            )}
          </div>

          {pkg.description ? (
            <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-slate-400">
              {pkg.description}
            </p>
          ) : (
            <p className="mt-1 text-[12px] italic text-slate-300">
              Belum ada deskripsi
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm"
          >
            <Edit3 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ReadField label="Harga">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-800">
              {formatIDR(pkg.price)}
            </span>
            {pkg.originalPrice && pkg.originalPrice > pkg.price && (
              <span className="text-[11px] text-slate-300 line-through">
                {formatIDR(pkg.originalPrice)}
              </span>
            )}
          </div>
        </ReadField>

        <ReadField label="Fitur">
          <span className="text-slate-800">{features.length} fitur</span>
        </ReadField>
      </div>

      {features.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
          {features.slice(0, 4).map((feature: string, index: number) => (
            <div
              key={`${feature}-${index}`}
              className="flex items-start gap-2 text-[11px] text-slate-500"
            >
              <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-emerald-500" />
              <span>{feature}</span>
            </div>
          ))}

          {features.length > 4 && (
            <p className="text-[10px] font-medium text-slate-400">
              +{features.length - 4} fitur lainnya
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function BatchCard({
  batch,
  onEditBatch,
  onDeleteBatch,
  onAddPackage,
  onEditPackage,
  onDeletePackage,
  deletingBatch,
  deletingPackage,
  defaultOpen = true,
}: {
  batch: any;
  onEditBatch: () => void;
  onDeleteBatch: () => void;
  onAddPackage: () => void;
  onEditPackage: (pkg: any) => void;
  onDeletePackage: (pkg: any) => void;
  deletingBatch?: boolean;
  deletingPackage?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const capacity = batch.capacity
    ? `${batch.enrolledCount}/${batch.capacity}`
    : `${batch.enrolledCount ?? 0}`;

  const packageCount = batch.packages?.length ?? 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/40 px-5 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
          >
            <ChevronDown
              className={cn(
                "mt-0.5 size-4 shrink-0 text-slate-400 transition-transform",
                open && "rotate-180",
              )}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[13px] font-bold text-slate-800">
                  {batch.title}
                </h3>
                <MetaPill>
                  <span className="size-1.5 rounded-full bg-slate-400" />
                  {batch.status}
                </MetaPill>
                <MetaPill>
                  <Package className="size-3" />
                  {packageCount} paket
                </MetaPill>
              </div>

              {batch.description ? (
                <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-slate-400">
                  {batch.description}
                </p>
              ) : (
                <p className="mt-1 text-[12px] italic text-slate-300">
                  Belum ada deskripsi batch
                </p>
              )}
            </div>
          </button>

          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            <DetailButton variant="outline" onClick={onEditBatch}>
              <Edit3 className="size-3" />
              Edit
            </DetailButton>
            <DetailButton variant="outline" onClick={onAddPackage}>
              <Plus className="size-3" />
              Paket
            </DetailButton>
            <DetailButton
              variant="danger"
              onClick={onDeleteBatch}
              disabled={deletingBatch}
            >
              {deletingBatch ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Trash2 className="size-3" />
              )}
            </DetailButton>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <ReadField label="Tanggal">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-3.5 text-slate-400" />
              {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
            </span>
          </ReadField>
          <ReadField label="Peserta">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5 text-slate-400" />
              {capacity}
            </span>
          </ReadField>
          <ReadField label="Mode">
            <span className="capitalize">{batch.mode}</span>
          </ReadField>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="p-5">
              {packageCount ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {batch.packages.map((pkg: any) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      deleting={deletingPackage}
                      onEdit={() => onEditPackage(pkg)}
                      onDelete={() => onDeletePackage(pkg)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Package className="size-4" />}
                  title="Belum ada paket di batch ini"
                  description="Tambahkan paket harga agar peserta bisa mendaftar ke batch ini."
                  action={
                    <DetailButton onClick={onAddPackage}>
                      <Plus className="size-3" />
                      Tambah Paket
                    </DetailButton>
                  }
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PUBLIC-LIKE PREVIEW
───────────────────────────────────────────────────────────── */

function PreviewSectionHeader({
  theme,
  eyebrow,
  title,
  titleAccent,
  subtitle,
}: {
  theme: Theme;
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6 text-center">
      <div
        className="mb-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
        style={{
          background: theme.soft,
          border: `1px solid ${theme.border}`,
        }}
      >
        <CalendarIcon color={theme.primary} />
        <span
          className="font-display font-bold"
          style={{
            fontSize: "0.75rem",
            color: theme.primary,
            letterSpacing: "0.04em",
          }}
        >
          {eyebrow}
        </span>
      </div>

      <h3
        className="font-display font-extrabold"
        style={{
          fontSize: "1.45rem",
          color: "var(--blue-navy)",
          lineHeight: 1.15,
        }}
      >
        {title} <span style={{ color: theme.primary }}>{titleAccent}</span>
      </h3>

      <p
        className="mx-auto mt-2"
        style={{
          fontSize: "0.8125rem",
          color: "var(--text-muted)",
          maxWidth: "320px",
          lineHeight: "1.65",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

function PreviewBatchCard({
  batch,
  theme,
}: {
  batch: any;
  theme: Theme;
}) {
  const publicStatus = getBatchPublicStatus(batch);
  const cfg = PUBLIC_BATCH_STATUS[publicStatus];

  const packages = batch.packages ?? [];
  const priceSummary = getPackagePriceSummary(packages);
  const isOpen = publicStatus === "open";

  const hasDates = Boolean(batch.startDate || batch.endDate);
  const dateText = hasDates
    ? batch.startDate && batch.endDate
      ? `${formatDateShort(batch.startDate)} – ${formatDateShort(batch.endDate)}`
      : batch.startDate
        ? `Mulai ${formatDateShort(batch.startDate)}`
        : `Sampai ${formatDateShort(batch.endDate)}`
    : formatBatchSchedule(batch);

  const scheduleSub = hasDates ? formatBatchSchedule(batch) : "Jadwal pelaksanaan";
  const durationDays = getDurationDays(batch.startDate, batch.endDate);

  const hasCapacity = Boolean(batch.capacity && batch.enrolledCount != null);
  const enrolled = batch.enrolledCount ?? 0;
  const spotsLeft = hasCapacity ? Math.max(batch.capacity - enrolled, 0) : null;
  const pct = hasCapacity
    ? Math.min(Math.round((enrolled / batch.capacity) * 100), 100)
    : null;
  const almostFull = pct !== null && pct >= 80;

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-3xl"
      style={{
        background: "var(--surface)",
        border: `1.5px solid ${isOpen ? theme.border : "var(--border-soft)"}`,
        boxShadow: isOpen
          ? `0 8px 32px -12px ${theme.primary}33`
          : "0 1px 6px rgba(0,0,0,0.04)",
        opacity: publicStatus === "closed" ? 0.66 : 1,
      }}
    >
      <div
        className="px-5 pb-4 pt-5"
        style={{ borderBottom: "1px solid var(--border-soft)" }}
      >
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display font-bold"
          style={{
            fontSize: "0.625rem",
            letterSpacing: "0.04em",
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            color: cfg.text,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.dot }} />
          {cfg.label}
        </span>

        <p
          className="mt-3 font-display font-extrabold leading-tight"
          style={{ fontSize: "1.05rem", color: "var(--blue-navy)" }}
        >
          {batch.title}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 py-5">
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{
            background: isOpen
              ? `${theme.primary}0c`
              : "var(--bg-soft, rgba(0,0,0,0.03))",
            border: `1px solid ${
              isOpen ? `${theme.primary}22` : "var(--border-soft)"
            }`,
          }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: isOpen ? `${theme.primary}18` : "var(--border-soft)",
            }}
          >
            <CalendarIcon color={isOpen ? theme.primary : "var(--text-faint)"} />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="font-display font-bold leading-tight"
              style={{ fontSize: "0.875rem", color: "var(--blue-navy)" }}
            >
              {dateText}
            </p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>
              {scheduleSub}
            </p>
          </div>

          {durationDays !== null && (
            <span
              className="shrink-0 rounded-xl px-2.5 py-1.5 text-center font-display font-extrabold leading-none"
              style={{
                background: isOpen ? theme.primary : "var(--text-faint)",
                color: "white",
              }}
            >
              <span style={{ fontSize: "0.875rem", display: "block" }}>
                {durationDays}
              </span>
              <span
                style={{
                  fontSize: "0.52rem",
                  opacity: 0.85,
                  letterSpacing: "0.06em",
                }}
              >
                HARI
              </span>
            </span>
          )}
        </div>

        {priceSummary && (
          <div>
            <p
              style={{
                fontSize: "0.6875rem",
                color: "var(--text-faint)",
                marginBottom: "2px",
              }}
            >
              Biaya mulai dari
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className="font-display font-extrabold leading-none"
                style={{
                  fontSize: "1.35rem",
                  color: theme.primary,
                  letterSpacing: "-0.02em",
                }}
              >
                {priceSummary.price}
              </span>

              {priceSummary.originalPrice && (
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-faint)",
                    textDecoration: "line-through",
                  }}
                >
                  {priceSummary.originalPrice}
                </span>
              )}
            </div>
          </div>
        )}

        {pct !== null && (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
                {spotsLeft === 0 ? "Kuota penuh" : `${spotsLeft} kursi tersisa`}
              </span>
              <span
                className="font-display font-bold"
                style={{
                  fontSize: "0.75rem",
                  color: almostFull ? "#dc2626" : "var(--text-faint)",
                }}
              >
                {pct}% terisi
              </span>
            </div>

            <div
              className="h-1.5 w-full overflow-hidden rounded-full"
              style={{ background: "var(--border-soft)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background: almostFull ? "#ef4444" : theme.primary,
                }}
              />
            </div>
          </div>
        )}

        {batch.notes && (
          <p
            className="rounded-xl px-3 py-2 font-display font-semibold"
            style={{
              fontSize: "0.75rem",
              color: theme.primary,
              background: theme.soft,
            }}
          >
            {batch.notes}
          </p>
        )}

        <div className="flex-1" />

        <div
          className="flex items-center justify-center gap-2 rounded-2xl py-3 font-display font-bold text-white"
          style={{
            fontSize: "0.875rem",
            background: isOpen ? theme.primary : "var(--border-soft)",
            color: isOpen ? "white" : "var(--text-faint)",
            boxShadow: isOpen ? `0 4px 16px ${theme.primary}33` : undefined,
          }}
        >
          {isOpen ? "Daftar Online" : cfg.label}
          {isOpen && <ArrowIcon color="white" />}
        </div>
      </div>
    </div>
  );
}

function PreviewPackageCard({
  pkg,
  theme,
}: {
  pkg: any;
  theme: Theme;
}) {
  const featured = Boolean(pkg.isDefault);
  const features = pkg.features ?? [];

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-3xl"
      style={{
        background: "var(--surface)",
        border: `1.5px solid ${featured ? theme.primary : theme.border}`,
        boxShadow: featured
          ? `0 12px 40px -12px ${theme.primary}40`
          : `0 8px 28px -14px ${theme.primary}22`,
      }}
    >
      {featured && (
        <div
          className="py-1.5 text-center font-display font-bold text-white"
          style={{
            fontSize: "0.6875rem",
            letterSpacing: "0.06em",
            background: theme.primary,
          }}
        >
          Paket Rekomendasi
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-5">
        <div>
          <p
            className="font-display font-extrabold"
            style={{ fontSize: "1rem", color: "var(--blue-navy)" }}
          >
            {pkg.title}
          </p>

          {pkg.description && (
            <p
              className="mt-1 line-clamp-2"
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                lineHeight: 1.6,
              }}
            >
              {pkg.description}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <span
              className="font-display font-extrabold leading-none"
              style={{
                fontSize: "1.6rem",
                color: theme.primary,
                letterSpacing: "-0.02em",
              }}
            >
              {formatIDR(pkg.price)}
            </span>

            {pkg.originalPrice && pkg.originalPrice > pkg.price && (
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-faint)",
                  textDecoration: "line-through",
                }}
              >
                {formatIDR(pkg.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {features.length > 0 && (
          <div className="flex flex-col gap-2">
            {features.slice(0, 5).map((feature: string, index: number) => (
              <div
                key={`${feature}-${index}`}
                className="flex items-start gap-2"
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.5,
                }}
              >
                <span
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                  style={{ background: theme.soft }}
                >
                  <CheckCircle2
                    className="size-3"
                    style={{ color: theme.primary }}
                  />
                </span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1" />

        <div
          className="flex items-center justify-center gap-2 rounded-2xl py-3 font-display font-bold"
          style={{
            fontSize: "0.875rem",
            ...(featured
              ? {
                  background: theme.primary,
                  color: "white",
                  boxShadow: `0 4px 16px ${theme.primary}33`,
                }
              : {
                  background: `${theme.primary}10`,
                  color: theme.primary,
                  border: `1.5px solid ${theme.primary}28`,
                }),
          }}
        >
          Pilih Paket
          <ArrowIcon color={featured ? "white" : theme.primary} />
        </div>
      </div>
    </div>
  );
}

function PublicCommercePreview({
  data,
  batches,
  packages,
  isScheduled,
}: {
  data: DetailData;
  batches: any[];
  packages: any[];
  isScheduled: boolean;
}) {
  const theme = useMemo(
    () => generateTheme(data.category.themePrimary),
    [data.category.themePrimary],
  );

  const directPackages = useMemo(
    () => packages.filter((pkg) => !pkg.batchId),
    [packages],
  );

  return (
    <aside className="xl:sticky xl:top-[calc(var(--navbar-height,64px)+76px)]">
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Preview Publik
          </p>
          <p className="mt-0.5 text-xs text-neutral-500">
            Mengikuti schedule type dari tab Structure.
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
          {isScheduled ? "Scheduled" : "Permanent"}
        </span>
      </div>

      <div
        className="overflow-hidden rounded-[28px] border bg-white p-4 shadow-sm"
        style={{
          borderColor: theme.border,
          background:
            "linear-gradient(180deg, var(--surface) 0%, var(--bg-soft) 100%)",
        }}
      >
        {isScheduled ? (
          <>
            <PreviewSectionHeader
              theme={theme}
              eyebrow="Jadwal Batch"
              title="Pilih Batch yang"
              titleAccent="Sesuai Jadwalmu"
              subtitle="Batch dibuka secara berkala. Pilih sesi yang cocok, lalu daftar sebelum kuota habis."
            />

            {batches.length > 0 ? (
              <div className="flex flex-col gap-4">
                {batches.slice(0, 2).map((batch) => (
                  <PreviewBatchCard key={batch.id} batch={batch} theme={theme} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Layers className="size-4" />}
                title="Belum ada batch"
                description="Preview akan muncul setelah batch dibuat."
                action={null}
              />
            )}
          </>
        ) : (
          <>
            <PreviewSectionHeader
              theme={theme}
              eyebrow="Pilihan Paket"
              title="Pilih Paket yang"
              titleAccent="Sesuai Kebutuhanmu"
              subtitle="Program fleksibel tanpa jadwal batch. Pilih paket, daftar kapan saja, dan langsung mulai."
            />

            {directPackages.length > 0 ? (
              <div className="flex flex-col gap-4">
                {directPackages.slice(0, 3).map((pkg) => (
                  <PreviewPackageCard key={pkg.id} pkg={pkg} theme={theme} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Package className="size-4" />}
                title="Belum ada paket"
                description="Preview akan muncul setelah paket dibuat."
                action={null}
              />
            )}
          </>
        )}
      </div>

      <p className="mt-3 px-1 text-[11px] leading-relaxed text-neutral-400">
        Preview ini memakai data yang sudah tersimpan. Saat mengubah batch atau
        paket di drawer, klik simpan untuk memperbarui preview.
      </p>
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────── */

export default function CommerceTab({ programId }: { programId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const utils = trpc.useUtils();

  const detailQuery = trpc.programs.getDetail.useQuery(
    { id: programId },
    { staleTime: 30_000, placeholderData: (prev) => prev },
  );

  const batchesQuery = trpc.batches.listByProgram.useQuery({ programId });
  const packagesQuery = trpc.packages.listByProgram.useQuery({ programId });

  const removeBatch = trpc.batches.remove.useMutation({
    onSuccess: () => {
      utils.batches.listByProgram.invalidate({ programId });
      utils.packages.listByProgram.invalidate({ programId });
      utils.programs.getDetail.invalidate({ id: programId });
      toast.success("Batch dihapus");
    },
    onError: (err) => toast.error(err.message ?? "Gagal menghapus batch"),
  });

  const removePackage = trpc.packages.remove.useMutation({
    onSuccess: () => {
      utils.packages.listByProgram.invalidate({ programId });
      utils.batches.listByProgram.invalidate({ programId });
      utils.programs.getDetail.invalidate({ id: programId });
      toast.success("Paket dihapus");
    },
    onError: (err) => toast.error(err.message ?? "Gagal menghapus paket"),
  });

  const updateStructure = trpc.programs.updateStructure.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.programs.getDetail.invalidate({ id: programId }),
        utils.programs.getFiltered.invalidate(),
        utils.batches.listByProgram.invalidate({ programId }),
        utils.packages.listByProgram.invalidate({ programId }),
      ]);

      toast.success("Tipe jadwal program berhasil diperbarui");
      closeDrawer();
    },
    onError: (err) => {
      toast.error(err.message ?? "Gagal mengubah tipe jadwal");
    },
  });

  const data = detailQuery.data as DetailData | undefined;
  const isScheduled = data?.scheduleType === "scheduled";
  const scheduleType = (data?.scheduleType ?? "permanent") as ScheduleType;
  const isScheduleLocked =
    Boolean(data?.hasEnrollments) ||
    Boolean(data?.hasPackages) ||
    Boolean((batchesQuery.data ?? []).length > 0) ||
    Boolean((packagesQuery.data ?? []).length > 0);
  const isLoading =
    detailQuery.isLoading || batchesQuery.isLoading || packagesQuery.isLoading;

  const directPackages = useMemo(
    () => (packagesQuery.data ?? []).filter((pkg: any) => !pkg.batchId),
    [packagesQuery.data],
  );

  function closeDrawer() {
    setDrawer(null);

    const next = new URLSearchParams(searchParams.toString());
    next.delete("drawer");
    next.delete("batchId");
    next.delete("packageId");

    const qs = next.toString();
    router.replace(`/dashboard/programs/${programId}${qs ? `?${qs}` : ""}`, {
      scroll: false,
    });
  }

  useEffect(() => {
    const drawerParam = searchParams.get("drawer");
    const batchId = searchParams.get("batchId");
    const packageId = searchParams.get("packageId");

    if (!drawerParam) return;

    setDrawer((current) => {
      if (drawerParam === "batch-new") {
        if (current?.kind === "batch" && current.mode === "create") {
          return current;
        }
        return { kind: "batch", mode: "create" };
      }

      if (drawerParam === "batch-edit" && batchId) {
        if (
          current?.kind === "batch" &&
          current.mode === "edit" &&
          current.id === batchId
        ) {
          return current;
        }
        return { kind: "batch", mode: "edit", id: batchId };
      }

      if (drawerParam === "package-new") {
        const nextBatchId = batchId ?? null;
        if (
          current?.kind === "package" &&
          current.mode === "create" &&
          current.batchId === nextBatchId
        ) {
          return current;
        }
        return { kind: "package", mode: "create", batchId: nextBatchId };
      }

      if (drawerParam === "package-edit" && packageId) {
        const nextBatchId = batchId ?? null;
        if (
          current?.kind === "package" &&
          current.mode === "edit" &&
          current.id === packageId &&
          current.batchId === nextBatchId
        ) {
          return current;
        }
        return {
          kind: "package",
          mode: "edit",
          id: packageId,
          batchId: nextBatchId,
        };
      }

      return current;
    });
  }, [searchParams]);

  const drawerTitle =
    drawer?.kind === "batch"
      ? drawer.mode === "create"
        ? "Batch Baru"
        : "Edit Batch"
      : drawer?.kind === "package"
        ? drawer.mode === "create"
          ? "Paket Baru"
          : "Edit Paket"
        : "";

  const drawerDescription =
    drawer?.kind === "batch"
      ? "Atur cohort, jadwal, kapasitas, dan lokasi program."
      : "Atur harga, fitur, dan opsi pendaftaran yang bisa dibeli peserta.";

  const drawerIcon =
    drawer?.kind === "batch" ? (
      <Layers className="size-4" />
    ) : (
      <Package className="size-4" />
    );

  if (isLoading && !data) {
    return (
      <div className="flex max-w-7xl items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 text-slate-400 shadow-sm">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  function handleScheduleTypeChange(nextScheduleType: ScheduleType) {
    if (!data) return;
    if (data.scheduleType === nextScheduleType) return;

    updateStructure.mutate({
      id: programId,
      scheduleType: nextScheduleType,
      registrationType: data.registrationType,
      format: data.format,
      level: data.level,
      duration: data.duration,
    });
  }

  if (!data) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]"
    >
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-4">
          <motion.div variants={itemVariants}>
            <ScheduleTypeSwitcher
              value={scheduleType}
              disabled={isScheduleLocked}
              isPending={updateStructure.isPending}
              onChange={handleScheduleTypeChange}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatsOverview
              data={data}
              isScheduled={isScheduled}
              totalPackages={packagesQuery.data?.length ?? 0}
              totalBatches={batchesQuery.data?.length ?? 0}
            />
          </motion.div>

          ...
        </div>

        <motion.div variants={itemVariants}>
          <ManagementSection
            icon={
              isScheduled ? (
                <Layers className="size-4" />
              ) : (
                <Package className="size-4" />
              )
            }
            title={isScheduled ? "Daftar Batch" : "Daftar Paket"}
            description={
              isScheduled
                ? "Setiap batch bisa memiliki paket harga sendiri."
                : "Paket langsung berada di bawah program ini."
            }
            count={
              isScheduled
                ? (batchesQuery.data?.length ?? 0)
                : directPackages.length
            }
            countLabel={isScheduled ? "batch" : "paket"}
            addLabel={isScheduled ? "Batch Baru" : "Paket Baru"}
            onAdd={() =>
              isScheduled
                ? setDrawer({ kind: "batch", mode: "create" })
                : setDrawer({ kind: "package", mode: "create", batchId: null })
            }
          >
            {isScheduled ? (
              batchesQuery.data?.length ? (
                <div className="flex flex-col gap-4">
                  {batchesQuery.data.map((batch: any, i: number) => (
                    <BatchCard
                      key={batch.id}
                      batch={batch}
                      defaultOpen={i === 0}
                      deletingBatch={removeBatch.isPending}
                      deletingPackage={removePackage.isPending}
                      onEditBatch={() =>
                        setDrawer({
                          kind: "batch",
                          mode: "edit",
                          id: batch.id,
                        })
                      }
                      onDeleteBatch={() => {
                        if (
                          window.confirm(
                            "Hapus batch ini? Paket di dalamnya juga akan ikut terhapus.",
                          )
                        ) {
                          removeBatch.mutate({ id: batch.id });
                        }
                      }}
                      onAddPackage={() =>
                        setDrawer({
                          kind: "package",
                          mode: "create",
                          batchId: batch.id,
                        })
                      }
                      onEditPackage={(pkg) =>
                        setDrawer({
                          kind: "package",
                          mode: "edit",
                          id: pkg.id,
                          batchId: batch.id,
                        })
                      }
                      onDeletePackage={(pkg) => {
                        if (window.confirm("Hapus paket ini?")) {
                          removePackage.mutate({ id: pkg.id });
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Layers className="size-4" />}
                  title="Belum ada batch"
                  description="Untuk scheduled program, peserta memilih batch terlebih dahulu sebelum memilih paket harga."
                  action={
                    <DetailButton
                      onClick={() =>
                        setDrawer({ kind: "batch", mode: "create" })
                      }
                    >
                      <Plus className="size-3" />
                      Buat Batch Pertama
                    </DetailButton>
                  }
                />
              )
            ) : directPackages.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {directPackages.map((pkg: any) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    deleting={removePackage.isPending}
                    onEdit={() =>
                      setDrawer({
                        kind: "package",
                        mode: "edit",
                        id: pkg.id,
                        batchId: null,
                      })
                    }
                    onDelete={() => {
                      if (window.confirm("Hapus paket ini?")) {
                        removePackage.mutate({ id: pkg.id });
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Package className="size-4" />}
                title="Belum ada paket"
                description="Tambahkan minimal satu paket agar program permanent bisa dibeli atau didaftarkan."
                action={
                  <DetailButton
                    onClick={() =>
                      setDrawer({
                        kind: "package",
                        mode: "create",
                        batchId: null,
                      })
                    }
                  >
                    <Plus className="size-3" />
                    Buat Paket Pertama
                  </DetailButton>
                }
              />
            )}
          </ManagementSection>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="hidden xl:block">
        <PublicCommercePreview
          data={data}
          isScheduled={isScheduled}
          batches={batchesQuery.data ?? []}
          packages={packagesQuery.data ?? []}
        />
      </motion.div>

      <Drawer
        open={!!drawer}
        title={drawerTitle}
        description={drawerDescription}
        icon={drawerIcon}
        onClose={closeDrawer}
      >
        {drawer?.kind === "batch" && (
          <BatchForm
            mode={drawer.mode}
            programId={programId}
            batchId={drawer.mode === "edit" ? drawer.id : undefined}
            onCancel={closeDrawer}
            onDone={closeDrawer}
          />
        )}

        {drawer?.kind === "package" && (
          <PackageForm
            mode={drawer.mode}
            programId={programId}
            batchId={drawer.batchId ?? null}
            packageId={drawer.mode === "edit" ? drawer.id : undefined}
            onCancel={closeDrawer}
            onDone={closeDrawer}
          />
        )}
      </Drawer>
    </motion.div>
  );
}