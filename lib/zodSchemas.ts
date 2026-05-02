import { z } from "zod";
import { PROGRAM_STATUS } from "./enums";

const priceTierSchema = z.object({
  label: z.string().min(1),
  price: z.number().int().nonnegative(),
  description: z.string().optional(),
});

export const programStatusEnum = z.enum(PROGRAM_STATUS);

export const programBaseSchema = z.object({
  title: z.string().min(3).max(120),
  slug: z
    .string()
    .min(3)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase and URL-friendly"),
  description: z.string().min(10),
  shortDesc: z.string().max(200).optional(),
  categoryId: z.string().min(1),
  status: programStatusEnum.default("draft"),
  order: z.number().int().nonnegative().default(0),
  // 💰 Pricing
  basePrice: z.number().int().nonnegative().optional(),
  originalPrice: z.number().int().nonnegative().optional(),
  priceTiers: z.array(priceTierSchema).optional(),

  // 🎯 Marketing
  badge: z.string().max(50).optional(),
  highlight: z.string().max(160).optional(),

  // 🏷️ Metadata
  tags: z.array(z.string().min(1)).optional(),
  icon: z.string().url().optional(),
  thumbnail: z.string().url().optional(),

  // 📦 Info
  duration: z.string().max(50).optional(),
  format: z.string().max(50).optional(),
  level: z.string().max(50).optional(),
});

export const programQuickCreateSchema = programBaseSchema.pick({
  title: true,
  slug: true,
  description: true,
  categoryId: true,
});

export const programCreateSchema = programBaseSchema;

export const programUpdateSchema = programBaseSchema.partial();
