import { z } from "zod";
import {
  PROGRAM_FORMAT,
  PROGRAM_LEVEL,
  PROGRAM_SCHEDULE_TYPE,
  PROGRAM_STATUS,
  programBatchModeEnum,
  programBatchStatusEnum,
  programFormatEnum,
  programLevelEnum,
  programScheduleTypeEnum,
  programStatusEnum,
} from "./enums/enums";
import { REGISTRATION_TYPE } from "@/app/db/schema";

export function makeResolver<T extends z.ZodType>(schema: T) {
  return async (values: unknown) => {
    const result = schema.safeParse(values);
    if (result.success)
      return { values: result.data as z.infer<T>, errors: {} };
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".");
      if (!errors[key])
        errors[key] = { type: issue.code, message: issue.message };
    }
    return { values: {}, errors };
  };
}
const requiredMsg = (label: string) => `${label} wajib diisi`;
// ─────────────────────────────────────────────────────────────────────────────
// Package schema
// ─────────────────────────────────────────────────────────────────────────────

const packageBaseObject = z.object({
  title: z
    .string()
    .min(1, requiredMsg("Nama paket"))
    .max(100, "Nama paket maksimal 100 karakter"),

  description: z
    .string()
    .max(500, "Deskripsi paket maksimal 500 karakter")
    .optional()
    .nullable(),

  price: z
    .number()
    .int("Harga harus berupa angka bulat")
    .min(0, "Harga tidak boleh negatif"),

  originalPrice: z
    .number()
    .int("Harga asli harus berupa angka bulat")
    .min(0, "Harga asli tidak boleh negatif")
    .optional()
    .nullable(),

  isDefault: z.boolean().default(false),

  enrollment: z.number().int().min(0).default(0),
});

// Cross-field: originalPrice must exceed price when both are set
const withPriceValidation = <
  T extends z.ZodType<{
    price?: number | null;
    originalPrice?: number | null;
  }>,
>(
  schema: T,
) =>
  schema.superRefine((data, ctx) => {
    if (
      data.originalPrice != null &&
      data.originalPrice > 0 &&
      data.price != null &&
      data.originalPrice <= data.price
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Harga asli harus lebih besar dari harga jual",
        path: ["originalPrice"],
      });
    }
  });

export const packageSchema = withPriceValidation(packageBaseObject);

export const packageCreateSchema = withPriceValidation(
  packageBaseObject.extend({
    programId: z.string().min(1, requiredMsg("Program")),
    batchId: z.string().optional().nullable(),
  }),
);

export const packageUpdateSchema = withPriceValidation(
  packageBaseObject.partial().extend({
    id: z.string().min(1),
    programId: z.string().optional(),
    batchId: z.string().optional().nullable(),
  }),
);

export type PackageData = z.infer<typeof packageSchema>;
export type PackageCreateData = z.infer<typeof packageCreateSchema>;
export type PackageUpdateData = z.infer<typeof packageUpdateSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Batch schema
// ─────────────────────────────────────────────────────────────────────────────

const batchScheduleSchema = z.object({
  type: z.enum(["weekly", "daily", "custom"]).optional(),

  label: z.string().max(100).optional(),

  days: z
    .array(
      z.enum([
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ]),
    )
    .optional(),

  startTime: z.string().max(20).optional(),

  endTime: z.string().max(20).optional(),

  location: z.string().max(300).optional(),

  note: z.string().max(500).optional(),
});

export const batchCreateSchema = z.object({
  programId: z.string().min(1, requiredMsg("Program")),

  title: z
    .string()
    .min(1, requiredMsg("Judul batch"))
    .max(200, "Judul batch maksimal 200 karakter"),

  status: programBatchStatusEnum.default("draft"),

  startDate: z.string().datetime().optional().nullable(),

  endDate: z.string().datetime().optional().nullable(),

  registrationDeadline: z.string().datetime().optional().nullable(),

  capacity: z.number().int().min(1).optional().nullable(),

  mode: programBatchModeEnum.default("online"),

  location: z.string().max(500).optional().nullable(),

  schedules: z.array(batchScheduleSchema).default([]),

  timezone: z.string().max(100).default("WIB"),

  notes: z.string().max(1000).optional().nullable(),

  brochureUrl: z.string().url().optional().nullable(),

  teacherId: z.string().optional().nullable(),

  primaryCtaLabel: z.string().max(100).optional().nullable(),

  primaryCtaHref: z.string().max(500).optional().nullable(),

  secondaryCtaLabel: z.string().max(100).optional().nullable(),

  secondaryCtaHref: z.string().max(500).optional().nullable(),

  packages: z.array(packageSchema).default([]),
});

export const batchUpdateSchema = batchCreateSchema
  .omit({ programId: true })
  .partial()
  .extend({
    id: z.string().min(1),
    programId: z.string().min(1),
  });

export type BatchCreateData = z.infer<typeof batchCreateSchema>;
export type BatchUpdateData = z.infer<typeof batchUpdateSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Program — shared content fields
// ─────────────────────────────────────────────────────────────────────────────
//
// These fields appear on both /create and /edit.
// Pricing and batch management live exclusively on /edit.

const programContentObject = z.object({
  title: z
    .string()
    .min(3, "Judul program minimal 3 karakter")
    .max(100, "Judul program maksimal 100 karakter"),

  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter")
    .max(5000, "Deskripsi maksimal 5.000 karakter"),

  shortDesc: z
    .string()
    .max(200, "Deskripsi singkat maksimal 200 karakter")
    .optional()
    .nullable(),

  categoryId: z.string().min(1, requiredMsg("Kategori")),

  // Determines enrollment flow:
  //   permanent  → packages attached directly to the program
  //   scheduled  → packages attached to batches under the program
  scheduleType: programScheduleTypeEnum.default("permanent"),

  status: programStatusEnum.default("draft"),

  registrationType: z.enum(["online", "offline"]).default("online"),

  enrollment: z.coerce
    .number()
    .int("Urutan harus berupa angka bulat")
    .min(0, "Urutan tidak boleh negatif")
    .default(0),

  format: programFormatEnum.default("online"),

  level: programLevelEnum.default("beginner"),

  duration: z.coerce
    .number()
    .int("Durasi harus berupa angka bulat")
    .min(1, "Durasi wajib diisi")
    .optional()
    .nullable(),

  badge: z.string().max(50, "Badge maksimal 50 karakter").optional().nullable(),

  highlight: z
    .string()
    .max(160, "Highlight maksimal 160 karakter")
    .optional()
    .nullable(),

  tags: z.array(z.string().min(1)).optional().nullable(),

  icon: z.string().optional().nullable(),
});

// ─── Create schema ────────────────────────────────────────────────────────────
//
// /create collects the program shell only.
// No pricing, no batches, no packages.
// startingPrice is derived automatically once packages are added on /edit.

export const programCreateSchema = programContentObject;

export type ProgramCreateData = z.infer<typeof programCreateSchema>;

// ─── Update schema ────────────────────────────────────────────────────────────
//
// /edit allows changing all content fields.
// Pricing/packages/batches are managed through their own dedicated mutations.

export const programUpdateSchema = programContentObject.partial().extend({
  id: z.string().min(1),
});

export type ProgramUpdateData = z.infer<typeof programUpdateSchema>;

// ─── Quick-create (minimal, for inline dialogs) ───────────────────────────────

export const programQuickCreateSchema = programContentObject.pick({
  title: true,
  description: true,
  categoryId: true,
});

export type ProgramQuickCreateData = z.infer<typeof programQuickCreateSchema>;

export const onlineEnrollmentSchema = z.object({
  type: z.literal("online"),

  programId: z.string(),
  batchId: z.string().optional(),

  fullName: z.string().min(1),
  whatsapp: z.string().min(1),
  email: z.string().email().optional(),
  age: z.number().optional(),
});

export const offlineEnrollmentSchema = z.object({
  type: z.literal("offline"),

  programId: z.string(),
  batchId: z.string(),
  batchLabel: z.string(),

  nama: z.string(),
  panggilan: z.string(),
  jenisKelamin: z.enum(["L", "P"]),

  tempatLahir: z.string(),
  tanggalLahir: z.string(),

  usia: z.number(),

  kelas: z.string(),
  sekolah: z.string(),
  kotaAsal: z.string(),

  namaOrtu: z.string(),
  hpOrtu: z.string(),

  hpAnak: z.string().optional(),
  email: z.string().email().optional(),

  alumni: z.enum(["yes", "no"]),
  sumberInfo: z.string(),

  alergi: z.enum(["yes", "no"]),
  detailAlergi: z.string().optional(),

  catatan: z.string().optional(),
  harapan: z.string(),

  ukuranKaos: z.string(),
});

export const enrollmentSchema = z.discriminatedUnion("type", [
  onlineEnrollmentSchema,
  offlineEnrollmentSchema,
]);

// export const wizardProgramSchema = z.object({
//   step1: programCreateSchema,
//   step2: z.object({
//     batches: z.array(batchCreateSchema),
//     hasBatches: z.boolean().default(false),
//   }),
//   step3: z.object({
//     packages: z.array(packageSchemaWithCrossValidation),
//   }),
// });

// export type WizardProgramData = z.infer<typeof wizardProgramSchema>;

export const programIdentityUpdateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3, "Judul minimal 3 karakter").max(100),
  slug: z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug hanya boleh huruf kecil, angka, dan tanda hubung",
    ),
  shortDesc: z.string().max(200).optional().or(z.literal("")),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  categoryId: z.string().min(1, "Kategori wajib diisi"),
});

export type ProgramIdentityUpdateInput = z.infer<
  typeof programIdentityUpdateSchema
>;

export const programStructureUpdateSchema = z.object({
  id: z.string().min(1),
  scheduleType: z.enum(PROGRAM_SCHEDULE_TYPE),
  registrationType: z.enum(REGISTRATION_TYPE),
  format: z.enum(PROGRAM_FORMAT),
  level: z.enum(PROGRAM_LEVEL),
  duration: z.number().int().min(1).nullable().optional(),
});

export type ProgramStructureUpdateInput = z.infer<
  typeof programStructureUpdateSchema
>;

export const programMarketingUpdateSchema = z.object({
  id: z.string().min(1),
  badge: z.string().max(30).optional().or(z.literal("")),
  highlight: z.string().max(80).optional().or(z.literal("")),
  tags: z.array(z.string().max(30)).max(15),
});

export const programStatusUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(PROGRAM_STATUS),
});
export const programBrandingUpdateSchema = z.object({
  id: z.string().min(1),
  thumbnailUrl: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
});

export type ProgramMarketingUpdateInput = z.infer<
  typeof programMarketingUpdateSchema
>;
export type ProgramStatusUpdateInput = z.infer<
  typeof programStatusUpdateSchema
>;
export type ProgramBrandingUpdateInput = z.infer<
  typeof programBrandingUpdateSchema
>;
