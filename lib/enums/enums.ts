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

/* =========================================================
   CLASS STATUS (Teaching LMS)
========================================================= */

export const CLASS_STATUS = [
  "draft",
  "active",
  "completed",
  "archived",
] as const;

export type ClassStatus = (typeof CLASS_STATUS)[number];

export const classStatusEnum = z.enum(CLASS_STATUS);

export const CLASS_STATUS_META = {
  draft: {
    label: "Draft",
    icon: "file-edit",
    shortDesc: "Kelas baru dibuat, roster belum berjalan",
    color: "#94a3b8",
    tone: "neutral",
  },

  active: {
    label: "Berlangsung",
    icon: "play-circle",
    shortDesc: "Kelas sedang berjalan, sesi & kehadiran dapat dicatat",
    color: "#22c55e",
    tone: "success",
  },

  completed: {
    label: "Selesai",
    icon: "check-circle-2",
    shortDesc: "Kelas selesai, penilaian & laporan dapat dibuat",
    color: "#3b82f6",
    tone: "primary",
  },

  archived: {
    label: "Diarsipkan",
    icon: "archive",
    shortDesc: "Kelas disimpan dan tidak aktif",
    color: "#64748b",
    tone: "neutral",
  },
} satisfies EnumMetaRecord<ClassStatus>;

export const CLASS_STATUS_LABEL = createLabelMap(CLASS_STATUS, CLASS_STATUS_META);

export const CLASS_STATUS_OPTIONS = createOptions(CLASS_STATUS, CLASS_STATUS_META);

/* =========================================================
   ATTENDANCE STATUS (Teaching LMS)
========================================================= */

export const ATTENDANCE_STATUS = [
  "present",
  "absent",
  "late",
  "excused",
] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[number];

export const attendanceStatusEnum = z.enum(ATTENDANCE_STATUS);

export const ATTENDANCE_STATUS_META = {
  present: {
    label: "Hadir",
    icon: "check-circle-2",
    shortDesc: "Siswa hadir pada sesi ini",
    color: "#22c55e",
    tone: "success",
  },

  absent: {
    label: "Tidak Hadir",
    icon: "x-circle",
    shortDesc: "Siswa tidak hadir tanpa keterangan",
    color: "#ef4444",
    tone: "danger",
  },

  late: {
    label: "Terlambat",
    icon: "clock",
    shortDesc: "Siswa hadir namun terlambat",
    color: "#f59e0b",
    tone: "warning",
  },

  excused: {
    label: "Izin",
    icon: "file-check",
    shortDesc: "Siswa tidak hadir dengan keterangan",
    color: "#3b82f6",
    tone: "info",
  },
} satisfies EnumMetaRecord<AttendanceStatus>;

export const ATTENDANCE_STATUS_LABEL = createLabelMap(
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_META,
);

export const ATTENDANCE_STATUS_OPTIONS = createOptions(
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_META,
);

/* =========================================================
   SCORE STATUS (Teaching LMS — approval workflow)
========================================================= */

export const SCORE_STATUS = [
  "draft",
  "pending_review",
  "approved",
  "rejected",
] as const;

export type ScoreStatus = (typeof SCORE_STATUS)[number];

export const scoreStatusEnum = z.enum(SCORE_STATUS);

export const SCORE_STATUS_META = {
  draft: {
    label: "Draf",
    icon: "file-edit",
    shortDesc: "Nilai sedang disusun oleh guru",
    color: "#94a3b8",
    tone: "neutral",
  },

  pending_review: {
    label: "Menunggu Persetujuan",
    icon: "clock",
    shortDesc: "Nilai menunggu persetujuan author/admin/super admin",
    color: "#f59e0b",
    tone: "warning",
  },

  approved: {
    label: "Disetujui",
    icon: "check-circle-2",
    shortDesc: "Nilai disetujui dan tampil di dashboard siswa",
    color: "#22c55e",
    tone: "success",
  },

  rejected: {
    label: "Ditolak",
    icon: "x-circle",
    shortDesc: "Nilai ditolak dan dikembalikan ke guru",
    color: "#ef4444",
    tone: "danger",
  },
} satisfies EnumMetaRecord<ScoreStatus>;

export const SCORE_STATUS_LABEL = createLabelMap(SCORE_STATUS, SCORE_STATUS_META);

export const SCORE_STATUS_OPTIONS = createOptions(SCORE_STATUS, SCORE_STATUS_META);

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

/* =========================================================
   TASK STATUS (Team Task Board)
========================================================= */

export const TASK_STATUS = [
  "pending_review",
  "butuh_keputusan",
  "direncanakan",
  "in_progress",
  "review",
  "needs_fixing",
  "pending_director_approval",
  "done",
  "rejected",
] as const;

export type TaskStatus = (typeof TASK_STATUS)[number];

export const taskStatusEnum = z.enum(TASK_STATUS);

export const TASK_STATUS_META = {
  pending_review: {
    label: "Menunggu Verifikasi",
    shortLabel: "Menunggu",
    icon: "hourglass",
    shortDesc: "Tugas baru menunggu verifikasi admin atau super admin",
    color: "#f59e0b",
    tone: "warning",
  },

  butuh_keputusan: {
    label: "Butuh Keputusan Direktur",
    shortLabel: "Keputusan Direktur",
    icon: "gavel",
    shortDesc: "Diajukan admin untuk keputusan super admin (direktur)",
    color: "#8b5cf6",
    tone: "info",
  },

  direncanakan: {
    label: "Direncanakan",
    shortLabel: "Direncanakan",
    icon: "circle-dashed",
    shortDesc: "Tugas sudah diverifikasi dan siap dikerjakan",
    color: "#3b82f6",
    tone: "primary",
  },

  in_progress: {
    label: "Sedang Dikerjakan",
    shortLabel: "In Progress",
    icon: "loader",
    shortDesc: "Tugas sedang berjalan",
    color: "#6366f1",
    tone: "info",
  },

  review: {
    label: "Menunggu Review",
    shortLabel: "Review",
    icon: "eye",
    shortDesc: "Menunggu review admin atau super admin sebelum ditandai selesai",
    color: "#14b8a6",
    tone: "info",
  },

  needs_fixing: {
    label: "Perlu Perbaikan",
    shortLabel: "Perlu Perbaikan",
    icon: "wrench",
    shortDesc: "Dikembalikan oleh admin atau super admin untuk diperbaiki sebelum direview lagi",
    color: "#f97316",
    tone: "warning",
  },

  pending_director_approval: {
    label: "Butuh Persetujuan Done Direktur",
    shortLabel: "Persetujuan Direktur",
    icon: "gavel",
    shortDesc: "Diajukan admin untuk persetujuan direktur sebelum ditandai selesai",
    color: "#a855f7",
    tone: "info",
  },

  done: {
    label: "Selesai",
    shortLabel: "Done",
    icon: "check-circle-2",
    shortDesc: "Tugas telah selesai dikerjakan",
    color: "#22c55e",
    tone: "success",
  },

  rejected: {
    label: "Ditolak",
    shortLabel: "Ditolak",
    icon: "x-circle",
    shortDesc: "Tugas ditolak",
    color: "#ef4444",
    tone: "danger",
  },
} satisfies EnumMetaRecord<TaskStatus>;

export const TASK_STATUS_LABEL = createLabelMap(TASK_STATUS, TASK_STATUS_META);

export const TASK_STATUS_OPTIONS = createOptions(TASK_STATUS, TASK_STATUS_META);

/* =========================================================
   TASK PRIORITY (Team Task Board)
========================================================= */

export const TASK_PRIORITY = ["low", "medium", "high", "urgent"] as const;

export type TaskPriority = (typeof TASK_PRIORITY)[number];

export const taskPriorityEnum = z.enum(TASK_PRIORITY);

export const TASK_PRIORITY_META = {
  low: {
    label: "Rendah",
    icon: "arrow-down",
    shortDesc: "Tidak mendesak, bisa dikerjakan belakangan",
    color: "#64748b",
    tone: "neutral",
  },

  medium: {
    label: "Sedang",
    icon: "minus",
    shortDesc: "Prioritas standar",
    color: "#f59e0b",
    tone: "warning",
  },

  high: {
    label: "Tinggi",
    icon: "arrow-up",
    shortDesc: "Perlu dikerjakan lebih dulu",
    color: "#f97316",
    tone: "warning",
  },

  urgent: {
    label: "Mendesak",
    icon: "flame",
    shortDesc: "Butuh perhatian segera",
    color: "#ef4444",
    tone: "danger",
  },
} satisfies EnumMetaRecord<TaskPriority>;

export const TASK_PRIORITY_LABEL = createLabelMap(
  TASK_PRIORITY,
  TASK_PRIORITY_META,
);

export const TASK_PRIORITY_OPTIONS = createOptions(
  TASK_PRIORITY,
  TASK_PRIORITY_META,
);
