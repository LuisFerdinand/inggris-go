import z from "zod";

import { createLabelMap, createOptions } from "./enum.helpers";
import { EnumMetaRecord } from "./enum.types";

/* =========================================================
   PROGRAM STATUS
========================================================= */

export const PROGRAM_STATUS = ["draft", "published", "archived"] as const;

export type ProgramStatus = (typeof PROGRAM_STATUS)[number];

export const programStatusEnum = z.enum(PROGRAM_STATUS);

export const PROGRAM_STATUS_META = {
  draft: {
    label: "Draft",
    shortLabel: "Draft",
    icon: "file-edit",
    shortDesc: "Program masih dalam tahap penyusunan",
    color: "#f59e0b",
    tone: "warning",
  },

  published: {
    label: "Dipublikasikan",
    shortLabel: "Published",
    icon: "globe",
    shortDesc: "Program sudah tersedia untuk pengguna",
    color: "#22c55e",
    tone: "success",
  },

  archived: {
    label: "Diarsipkan",
    shortLabel: "Archived",
    icon: "archive",
    shortDesc: "Program disimpan dan tidak aktif",
    color: "#64748b",
    tone: "neutral",
  },
} satisfies EnumMetaRecord<ProgramStatus>;

export const PROGRAM_STATUS_LABEL = createLabelMap(
  PROGRAM_STATUS,
  PROGRAM_STATUS_META,
);

export const PROGRAM_STATUS_OPTIONS = createOptions(
  PROGRAM_STATUS,
  PROGRAM_STATUS_META,
);

/* =========================================================
   PROGRAM FORMAT
========================================================= */
export const PROGRAM_FORMAT = ["online", "offline", "hybrid"] as const;

export type ProgramFormat = (typeof PROGRAM_FORMAT)[number];

export const programFormatEnum = z.enum(PROGRAM_FORMAT);

export const PROGRAM_FORMAT_META = {
  online: {
    label: "Online",
    icon: "monitor-play",
    shortDesc: "Program dilakukan sepenuhnya secara daring",
    color: "#3b82f6",
    tone: "primary",
  },

  offline: {
    label: "Offline",
    icon: "map-pinned",
    shortDesc: "Program dilakukan secara tatap muka langsung",
    color: "#f97316",
    tone: "warning",
  },

  hybrid: {
    label: "Hybrid",
    icon: "layers-3",
    shortDesc: "Gabungan pembelajaran online dan offline",
    color: "#8b5cf6",
    tone: "info",
  },
} satisfies EnumMetaRecord<ProgramFormat>;

export const PROGRAM_FORMAT_LABEL = createLabelMap(
  PROGRAM_FORMAT,
  PROGRAM_FORMAT_META,
);

export const PROGRAM_FORMAT_OPTIONS = createOptions(
  PROGRAM_FORMAT,
  PROGRAM_FORMAT_META,
);

/* =========================================================
   PROGRAM LEVEL
========================================================= */

export const PROGRAM_LEVEL = ["beginner", "intermediate", "advanced"] as const;

export type ProgramLevel = (typeof PROGRAM_LEVEL)[number];

export const programLevelEnum = z.enum(PROGRAM_LEVEL);

export const PROGRAM_LEVEL_META = {
  beginner: {
    label: "Pemula",
    icon: "sparkles",
    shortDesc: "Cocok untuk peserta baru",
    color: "#22c55e",
    tone: "success",
  },

  intermediate: {
    label: "Menengah",
    icon: "trending-up",
    shortDesc: "Untuk peserta dengan dasar cukup",
    color: "#f59e0b",
    tone: "warning",
  },

  advanced: {
    label: "Lanjutan",
    icon: "graduation-cap",
    shortDesc: "Untuk peserta tingkat tinggi",
    color: "#ef4444",
    tone: "danger",
  },
} satisfies EnumMetaRecord<ProgramLevel>;

export const PROGRAM_LEVEL_LABEL = createLabelMap(
  PROGRAM_LEVEL,
  PROGRAM_LEVEL_META,
);

export const PROGRAM_LEVEL_OPTIONS = createOptions(
  PROGRAM_LEVEL,
  PROGRAM_LEVEL_META,
);

/* =========================================================
   PROGRAM SCHEDULE TYPE
========================================================= */

export const PROGRAM_SCHEDULE_TYPE = ["permanent", "scheduled"] as const;

export type ProgramScheduleType = (typeof PROGRAM_SCHEDULE_TYPE)[number];

export const programScheduleTypeEnum = z.enum(PROGRAM_SCHEDULE_TYPE);

export const PROGRAM_SCHEDULE_TYPE_META = {
  permanent: {
    label: "Permanent",
    icon: "repeat",
    shortDesc: "Peserta dapat mendaftar kapan saja tanpa batch tertentu",
    color: "#3b82f6",
    tone: "primary",
  },

  scheduled: {
    label: "Scheduled",
    icon: "calendar-clock",
    shortDesc: "Program menggunakan batch dengan periode belajar tertentu",
    color: "#22c55e",
    tone: "success",
  },
} satisfies EnumMetaRecord<ProgramScheduleType>;

export const PROGRAM_SCHEDULE_TYPE_LABEL = createLabelMap(
  PROGRAM_SCHEDULE_TYPE,
  PROGRAM_SCHEDULE_TYPE_META,
);

export const PROGRAM_SCHEDULE_TYPE_OPTIONS = createOptions(
  PROGRAM_SCHEDULE_TYPE,
  PROGRAM_SCHEDULE_TYPE_META,
);

export const PROGRAM_CATEGORY_STATUS = [
  "draft",
  "published",
  "archived",
] as const;
export type ProgramCategoryStatus = (typeof PROGRAM_CATEGORY_STATUS)[number];
export const programCategoryStatusEnum = z.enum(PROGRAM_CATEGORY_STATUS);
export const PROGRAM_CATEGORY_STATUS_LABEL: Record<
  ProgramCategoryStatus,
  string
> = {
  draft: "Draft",
  published: "Dipublikasikan",
  archived: "Diarsipkan",
};

export const PROGRAM_BATCH_STATUS = [
  "draft",
  "open",
  "ongoing",
  "full",
  "closed",
  "completed",
] as const;
export type ProgramBatchStatus = (typeof PROGRAM_BATCH_STATUS)[number];
export const programBatchStatusEnum = z.enum(PROGRAM_BATCH_STATUS);
export const PROGRAM_BATCH_STATUS_LABEL: Record<ProgramBatchStatus, string> = {
  draft: "Draft",
  open: "Terbuka",
  ongoing: "Berlangsung",
  full: "Penuh",
  closed: "Ditutup",
  completed: "Selesai",
};

export const PRICING_MODE = ["free", "single", "tiers"] as const;
export type PricingMode = (typeof PRICING_MODE)[number];
export const pricingModeEnum = z.enum(PRICING_MODE);
export const PRICING_MODE_LABEL: Record<PricingMode, string> = {
  free: "Gratis",
  single: "Harga Tetap",
  tiers: "Paket Harga",
};
// export const PRICING_MODE_OPTIONS: ModeCardDef[] = [
//   {
//     id: "free",
//     label: "Gratis",
//     icon: "gift",
//     description: "Program dapat diakses tanpa pembayaran",
//     gradient: "from-teal-500 to-emerald-500",
//     activeBorder: "border-teal-400",
//     activeGlow: "shadow-[0_0_0_4px_rgba(20,184,166,0.15)]",
//     activeBg: "bg-gradient-to-br from-teal-50 to-emerald-50",
//     checkColor: "bg-teal-500",
//     iconBg: "bg-teal-100",
//     iconColor: "text-teal-600",
//     activeText: "text-teal-700",
//   },
//   {
//     id: "single",
//     label: "Harga Tetap",
//     icon: "badge-dollar-sign",
//     description: "Menggunakan satu harga utama dengan opsi diskon",
//     gradient: "from-indigo-500 to-violet-500",
//     activeBorder: "border-indigo-400",
//     activeGlow: "shadow-[0_0_0_4px_rgba(99,102,241,0.15)]",
//     activeBg: "bg-gradient-to-br from-indigo-50 to-violet-50",
//     checkColor: "bg-indigo-500",
//     iconBg: "bg-indigo-100",
//     iconColor: "text-indigo-600",
//     activeText: "text-indigo-700",
//   },
//   {
//     id: "tiers",
//     label: "Paket Harga",
//     icon: "layers-3",
//     description: "Menyediakan beberapa pilihan paket atau tier harga",
//     gradient: "from-amber-400 to-orange-500",
//     activeBorder: "border-amber-400",
//     activeGlow: "shadow-[0_0_0_4px_rgba(251,191,36,0.2)]",
//     activeBg: "bg-gradient-to-br from-amber-50 to-orange-50",
//     checkColor: "bg-amber-500",
//     iconBg: "bg-amber-100",
//     iconColor: "text-amber-600",
//     activeText: "text-amber-700",
//   },
// ];

export const PROGRAM_BATCH_MODE = ["online", "offline", "hybrid"] as const;
export type ProgramBatchMode = (typeof PROGRAM_BATCH_MODE)[number];
export const programBatchModeEnum = z.enum(PROGRAM_BATCH_MODE);
export const PROGRAM_BATCH_MODE_LABEL: Record<ProgramBatchMode, string> = {
  online: "Online",
  offline: "Offline",
  hybrid: "Hybrid",
};

export const MATERIAL_TYPE = [
  "brochure",
  "guidebook",
  "schedule",
  "pricing",
  "rundown",
  "other",
] as const;
export type MaterialType = (typeof MATERIAL_TYPE)[number];
export const materialTypeEnum = z.enum(MATERIAL_TYPE);
export const MATERIAL_TYPE_LABEL: Record<MaterialType, string> = {
  brochure: "Brosur",
  guidebook: "Panduan",
  schedule: "Jadwal",
  pricing: "Daftar Harga",
  rundown: "Rundown Acara",
  other: "Lainnya",
};
