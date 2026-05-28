"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthProps {
  health: {
    setupProgress: number;
    issues: string[];
    hasThumbnail: boolean;
    hasContent: boolean;
    hasPackages: boolean;
    hasBatches: boolean;
  };
  scheduleType: string;
}

type HealthType = "ok" | "warn" | "error" | "info";

interface HealthItem {
  type: HealthType;
  title: string;
  description: string;
}

const STYLE_MAP: Record<
  HealthType,
  {
    wrap: string;
    iconColor: string;
    titleColor: string;
    descColor: string;
    Icon: React.ElementType;
  }
> = {
  ok: {
    wrap: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-500",
    titleColor: "text-emerald-900",
    descColor: "text-emerald-700",
    Icon: CheckCircle2,
  },
  warn: {
    wrap: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-500",
    titleColor: "text-amber-900",
    descColor: "text-amber-700",
    Icon: AlertTriangle,
  },
  error: {
    wrap: "bg-red-50 border-red-200",
    iconColor: "text-red-500",
    titleColor: "text-red-900",
    descColor: "text-red-700",
    Icon: AlertCircle,
  },
  info: {
    wrap: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-500",
    titleColor: "text-blue-900",
    descColor: "text-blue-700",
    Icon: Info,
  },
};

function buildHealthItems(
  health: HealthProps["health"],
  scheduleType: string,
): HealthItem[] {
  const items: HealthItem[] = [];

  if (!health.hasThumbnail) {
    items.push({
      type: "error",
      title: "Thumbnail belum diunggah",
      description:
        "Thumbnail penting untuk tampilan di halaman katalog dan kartu program. Upload di tab Detail.",
    });
  } else {
    items.push({
      type: "ok",
      title: "Thumbnail tersedia",
      description: "Program sudah memiliki gambar cover.",
    });
  }

  if (!health.hasPackages) {
    items.push({
      type: "error",
      title: "Paket harga belum dibuat",
      description:
        "Calon peserta tidak bisa mendaftar tanpa paket harga. Buat minimal satu paket di tab Paket.",
    });
  } else {
    items.push({
      type: "ok",
      title: "Paket harga tersedia",
      description: "Program sudah memiliki minimal satu paket harga.",
    });
  }

  if (scheduleType === "scheduled" && !health.hasBatches) {
    items.push({
      type: "error",
      title: "Batch belum dibuat",
      description:
        "Program bertipe Scheduled membutuhkan minimal satu batch aktif agar bisa menerima pendaftaran.",
    });
  } else if (scheduleType === "scheduled" && health.hasBatches) {
    items.push({
      type: "ok",
      title: "Batch aktif tersedia",
      description:
        "Program sudah memiliki batch yang siap menerima pendaftaran.",
    });
  }

  if (!health.hasContent) {
    items.push({
      type: "warn",
      title: "Konten landing page kosong",
      description:
        "Halaman program belum memiliki konten. Tambahkan seksi di tab Konten untuk meningkatkan konversi.",
    });
  } else {
    items.push({
      type: "ok",
      title: "Konten landing page lengkap",
      description: "Halaman program sudah memiliki konten.",
    });
  }

  return items;
}

function getProgressColor(progress: number) {
  if (progress >= 80) return "bg-emerald-500";
  if (progress >= 50) return "bg-amber-400";
  return "bg-red-400";
}

function getProgressLabel(progress: number) {
  if (progress === 100) return "Setup lengkap";
  if (progress >= 80) return "Hampir siap dipublikasikan";
  if (progress >= 50) return "Perlu beberapa perbaikan";
  return "Perlu perhatian segera";
}

function HealthItemCard({ item, index }: { item: HealthItem; index: number }) {
  const s = STYLE_MAP[item.type];
  return (
    <motion.div
      className={cn(
        "flex gap-2.5 px-3.5 py-3 rounded-xl border transition-all duration-150",
        s.wrap,
      )}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.25, ease: "easeOut" }}
      whileHover={{ x: 2 }}
    >
      <s.Icon className={cn("size-4 flex-shrink-0 mt-0.5", s.iconColor)} />
      <div>
        <p className={cn("text-[13px] font-semibold", s.titleColor)}>
          {item.title}
        </p>
        <p className={cn("text-[12px] mt-0.5 leading-relaxed", s.descColor)}>
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}

export function OverviewHealth({ health, scheduleType }: HealthProps) {
  const items = buildHealthItems(health, scheduleType);
  const progressColor = getProgressColor(health.setupProgress);
  const progressLabel = getProgressLabel(health.setupProgress);
  const okCount = items.filter((i) => i.type === "ok").length;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-neutral-400" />
          <span className="text-[11px] font-bold uppercase tracking-[0.7px] text-neutral-400">
            Kesehatan Setup
          </span>
        </div>
        <span className="text-[11px] font-semibold text-neutral-400">
          {okCount} / {items.length} selesai
        </span>
      </div>

      <div className="p-5">
        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-neutral-600">
              {progressLabel}
            </span>
            <span className="text-[13px] font-bold text-neutral-900 tabular-nums">
              {health.setupProgress}%
            </span>
          </div>
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", progressColor)}
              initial={{ width: 0 }}
              animate={{ width: `${health.setupProgress}%` }}
              transition={{
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.2,
              }}
            />
          </div>
        </div>

        {/* Health items */}
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <HealthItemCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
