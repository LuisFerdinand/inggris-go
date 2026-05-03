import z from "zod";

export const PROGRAM_STATUS = ["draft", "published", "archived"] as const;
export type ProgramStatus = (typeof PROGRAM_STATUS)[number];
export const programStatusEnum = z.enum(PROGRAM_STATUS);
export const PROGRAM_STATUS_LABEL: Record<ProgramStatus, string> = {
  draft: "Draft",
  published: "Dipublikasikan",
  archived: "Diarsipkan",
};

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

export const PROGRAM_FORMAT = ["online", "offline", "hybrid"] as const;
export type ProgramFormat = (typeof PROGRAM_FORMAT)[number];
export const programFormatEnum = z.enum(PROGRAM_FORMAT);
export const PROGRAM_FORMAT_LABEL: Record<ProgramFormat, string> = {
  online: "Online",
  offline: "Offline",
  hybrid: "Hybrid",
};

export const PROGRAM_LEVEL = ["beginner", "intermediate", "advanced"] as const;
export type ProgramLevel = (typeof PROGRAM_LEVEL)[number];
export const programLevelEnum = z.enum(PROGRAM_LEVEL);
export const PROGRAM_LEVEL_LABEL: Record<ProgramLevel, string> = {
  beginner: "Pemula",
  intermediate: "Menengah",
  advanced: "Lanjutan",
};
