// app/modules/program/batch.schema.ts
import { z } from "zod";

import {
  PROGRAM_BATCH_MODE,
  PROGRAM_BATCH_STATUS,
} from "@/lib/enums/enums";

const emptyToNull = (v: unknown) => (v === "" ? null : v);

const scheduleSchema = z.object({
  type: z.enum(["weekly", "daily", "custom"]).optional(),
  label: z.string().optional(),
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
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  note: z.string().optional(),
});

export const batchInsertSchema = z.object({
  programId: z.string().min(1),

  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.preprocess(emptyToNull, z.string().nullable().optional()),

  status: z.enum(PROGRAM_BATCH_STATUS),
  mode: z.enum(PROGRAM_BATCH_MODE),

  teacherId: z.preprocess(emptyToNull, z.string().nullable().optional()),

  startDate: z.preprocess(emptyToNull, z.coerce.date().nullable().optional()),
  endDate: z.preprocess(emptyToNull, z.coerce.date().nullable().optional()),
  registrationDeadline: z.preprocess(
    emptyToNull,
    z.coerce.date().nullable().optional(),
  ),

  capacity: z.preprocess(
    emptyToNull,
    z.coerce.number().int().positive().nullable().optional(),
  ),

  location: z.preprocess(emptyToNull, z.string().nullable().optional()),
  timezone: z.string().default("WIB"),
  notes: z.preprocess(emptyToNull, z.string().nullable().optional()),

  schedules: z.array(scheduleSchema).optional(),

  // Missing fields from your component ProgramBatch data.
  brochureUrl: z.preprocess(emptyToNull, z.string().nullable().optional()),
  brochureLabel: z.preprocess(emptyToNull, z.string().nullable().optional()),

  primaryCtaLabel: z.preprocess(emptyToNull, z.string().nullable().optional()),
  primaryCtaHref: z.preprocess(emptyToNull, z.string().nullable().optional()),
  primaryCtaIcon: z.preprocess(emptyToNull, z.string().nullable().optional()),

  secondaryCtaLabel: z.preprocess(emptyToNull, z.string().nullable().optional()),
  secondaryCtaHref: z.preprocess(emptyToNull, z.string().nullable().optional()),
  secondaryCtaIcon: z.preprocess(emptyToNull, z.string().nullable().optional()),
});

export const batchUpdateSchema = batchInsertSchema
  .partial()
  .extend({ id: z.string().min(1) });

export type BatchFormValues = z.infer<typeof batchInsertSchema>;
