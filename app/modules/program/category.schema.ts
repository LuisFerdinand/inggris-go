// app/modules/program/category.schema.ts
import { z } from "zod";
import { PROGRAM_CATEGORY_STATUS } from "@/lib/enums/enums";

const emptyToNull = (v: unknown) => (v === "" ? null : v);

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Warna harus berupa hex, mis. #4da3ff");

const slugField = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan tanda hubung")
  .optional()
  .or(z.literal(""));

export const categoryInsertSchema = z.object({
  label: z.string().min(2, "Label minimal 2 karakter").max(60),
  slug: slugField,
  shortLabel: z.preprocess(emptyToNull, z.string().max(40).nullable().optional()),

  status: z.enum(PROGRAM_CATEGORY_STATUS).default("draft"),

  icon: z.preprocess(emptyToNull, z.string().nullable().optional()),
  heroImage: z.preprocess(emptyToNull, z.string().nullable().optional()),
  themePrimary: hexColor.default("#4da3ff"),

  tagline: z.preprocess(emptyToNull, z.string().max(120).nullable().optional()),
  taglineAccent: z.preprocess(emptyToNull, z.string().max(120).nullable().optional()),
  description: z.preprocess(emptyToNull, z.string().nullable().optional()),
  forWho: z.preprocess(emptyToNull, z.string().nullable().optional()),

  quickDecisionLabel: z.preprocess(emptyToNull, z.string().nullable().optional()),
  quickDecisionDesc: z.preprocess(emptyToNull, z.string().nullable().optional()),

  // Landing-page content fields — accepted but managed elsewhere (kept flexible
  // so the form doesn't need to cover them and existing rows never get rejected).
  painPoints: z.array(z.any()).optional(),
  benefits: z.array(z.any()).optional(),
  steps: z.array(z.any()).optional(),
  experience: z.array(z.any()).optional(),
  comparison: z.array(z.any()).optional(),
  socialProof: z.array(z.any()).optional(),
  cta: z.any().optional(),
  emptyState: z.any().optional(),

  order: z.number().int().optional(),
});

export const categoryUpdateSchema = categoryInsertSchema
  .partial()
  .extend({ id: z.string().min(1) });

export const categoryFilterSchema = z.object({
  status: z.enum(PROGRAM_CATEGORY_STATUS).optional(),
  searchQuery: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryInsertSchema>;
export type CategoryFilterInput = z.infer<typeof categoryFilterSchema>;