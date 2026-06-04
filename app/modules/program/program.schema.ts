// app/modules/program/program.schema.ts
import { z } from "zod";

import {
  PROGRAM_STATUS,
  PROGRAM_FORMAT,
  PROGRAM_LEVEL,
  PROGRAM_SCHEDULE_TYPE,
} from "@/lib/enums/enums";
import { REGISTRATION_TYPE } from "@/app/db/schema/programs";

/* =========================================================
   FILTER INPUT  (used by programs.getFiltered)
   Values arrive from the URL via nuqs, so we use .catch()
   to make invalid/tampered values gracefully no-op.
========================================================= */

export const programFilterSchema = z.object({
  status: z.enum(PROGRAM_STATUS).optional().catch(undefined),
  categoryId: z.string().optional().catch(undefined),
  format: z.enum(PROGRAM_FORMAT).optional().catch(undefined),
  level: z.enum(PROGRAM_LEVEL).optional().catch(undefined),
  scheduleType: z.enum(PROGRAM_SCHEDULE_TYPE).optional().catch(undefined),
  registrationType: z.enum(REGISTRATION_TYPE).optional().catch(undefined),
  searchQuery: z.string().optional().catch(undefined),
});

export type ProgramFilterInput = z.infer<typeof programFilterSchema>;

/* =========================================================
   CREATE / UPDATE INPUT
========================================================= */

const emptyToNull = (v: unknown) => (v === "" ? null : v);

export const programInsertSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9-]+$/, "Hanya huruf kecil, angka, dan tanda hubung"),

  description: z.string().min(1, "Deskripsi wajib diisi"),
  shortDesc: z.preprocess(emptyToNull, z.string().nullable().optional()),

  categoryId: z.string().min(1, "Kategori wajib dipilih"),

  status: z.enum(PROGRAM_STATUS),
  scheduleType: z.enum(PROGRAM_SCHEDULE_TYPE),
  registrationType: z.enum(REGISTRATION_TYPE),
  format: z.enum(PROGRAM_FORMAT),
  level: z.enum(PROGRAM_LEVEL),

  duration: z.preprocess(
    emptyToNull,
    z.coerce.number().int().nonnegative().nullable().optional(),
  ),
  startingPrice: z.preprocess(
    emptyToNull,
    z.coerce.number().int().nonnegative().nullable().optional(),
  ),
  startingOriginalPrice: z.preprocess(
    emptyToNull,
    z.coerce.number().int().nonnegative().nullable().optional(),
  ),

  badge: z.preprocess(emptyToNull, z.string().nullable().optional()),
  highlight: z.preprocess(emptyToNull, z.string().nullable().optional()),
  thumbnailUrl: z.preprocess(
    emptyToNull,
    z.string().url("URL tidak valid").nullable().optional(),
  ),

  order: z.coerce.number().int().optional(),
});

export const programUpdateSchema = programInsertSchema
  .partial()
  .extend({ id: z.string().min(1) });

export type ProgramFormValues = z.infer<typeof programInsertSchema>;