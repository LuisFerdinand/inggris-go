"use client";

import { motion } from "framer-motion";
import {
  Package,
  CalendarCheck,
  Layers,
  Users,
  FileText,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsProps {
  metrics: {
    batchesCount: number;
    openBatchesCount: number;
    packagesCount: number;
    contentSectionsCount: number;
    enrollmentsCount: number;
    startingPrice: number | null;
    startingOriginalPrice: number | null;
  };
}

interface MetricConfig {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  accentColor: string;
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
}

function formatIDR(val: number | null) {
  if (val == null) return null;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    notation: "compact",
    compactDisplay: "short",
  }).format(val);
}

function MetricCard({
  config,
  index,
}: {
  config: MetricConfig;
  index: number;
}) {
  return (
    <motion.div
      className="relative bg-white rounded-xl border border-neutral-200 p-4 overflow-hidden cursor-default select-none"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-full"
        style={{ background: config.accentColor }}
      />
      <div
        className={cn(
          "size-8 rounded-lg flex items-center justify-center mb-3",
          config.iconBg,
        )}
      >
        <span className={config.iconColor}>{config.icon}</span>
      </div>
      <div className="text-[22px] font-bold text-neutral-900 leading-none mb-1 tabular-nums tracking-tight">
        {config.value}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-neutral-400">
        {config.label}
      </div>
      {config.sub && (
        <div
          className={cn(
            "text-[11px] mt-1.5",
            config.subColor ?? "text-neutral-400",
          )}
        >
          {config.sub}
        </div>
      )}
    </motion.div>
  );
}

export function OverviewMetrics({ metrics }: MetricsProps) {
  const price = formatIDR(metrics.startingPrice);

  const configs: MetricConfig[] = [
    {
      icon: <Package className="size-4" />,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      accentColor: "#2563eb",
      label: "Paket Harga",
      value: metrics.packagesCount,
      sub:
        metrics.packagesCount === 0
          ? "Belum ada paket"
          : `${metrics.packagesCount} paket tersedia`,
      subColor:
        metrics.packagesCount === 0 ? "text-red-400 font-medium" : undefined,
    },
    {
      icon: <CalendarCheck className="size-4" />,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      accentColor: "#16a34a",
      label: "Batch Aktif",
      value: metrics.openBatchesCount,
      sub:
        metrics.batchesCount > 0
          ? `dari ${metrics.batchesCount} total batch`
          : "Belum ada batch",
    },
    {
      icon: <Layers className="size-4" />,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      accentColor: "#7c3aed",
      label: "Total Batch",
      value: metrics.batchesCount,
      sub: "Scheduled program",
    },
    {
      icon: <Users className="size-4" />,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      accentColor: "#d97706",
      label: "Pendaftar",
      value: metrics.enrollmentsCount,
      sub:
        metrics.enrollmentsCount === 0
          ? "Belum ada pendaftar"
          : "Total pendaftar",
    },
    {
      icon: <FileText className="size-4" />,
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
      accentColor: "#0891b2",
      label: "Seksi Konten",
      value: metrics.contentSectionsCount,
      sub:
        metrics.contentSectionsCount === 0
          ? "Belum ada konten"
          : `${metrics.contentSectionsCount} seksi`,
      subColor:
        metrics.contentSectionsCount === 0
          ? "text-amber-400 font-medium"
          : undefined,
    },
    {
      icon: <DollarSign className="size-4" />,
      iconBg: "bg-pink-50",
      iconColor: "text-pink-600",
      accentColor: "#db2777",
      label: "Harga Mulai",
      value: price ?? "—",
      sub: price ? "Harga terendah" : "Belum ada paket",
      subColor: !price ? "text-neutral-400 italic" : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {configs.map((config, i) => (
        <MetricCard key={config.label} config={config} index={i} />
      ))}
    </div>
  );
}
