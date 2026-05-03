import { z } from "zod";
import {
  PROGRAM_STATUS,
  programFormatEnum,
  programLevelEnum,
  programStatusEnum,
} from "./enums";

const required = (label: string) => `${label} wajib diisi`;
const min = (label: string, n: number) => `${label} minimal ${n} karakter`;
const max = (label: string, n: number) => `${label} maksimal ${n} karakter`;
const invalidNumber = (label: string) => `${label} harus berupa angka`;
const nonNegative = (label: string) => `${label} tidak boleh negatif`;

const priceTierSchema = z.object({
  label: z.string().min(1, required("Label paket")),
  price: z.coerce
    .number()
    .int("Harga harus berupa angka bulat")
    .nonnegative("Harga tidak boleh negatif"),
  description: z.string().optional(),
});

const programBaseObject = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10),
  shortDesc: z.string().max(200).optional(),
  categoryId: z.string().min(1),

  status: programStatusEnum.default("draft"),

  order: z.coerce.number().int().nonnegative().default(0),

  basePrice: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number().int().nonnegative().optional(),
  ),

  originalPrice: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number().int().nonnegative().optional(),
  ),

  priceTiers: z.array(priceTierSchema).optional(),

  badge: z.string().max(50).optional(),
  highlight: z.string().max(160).optional(),

  tags: z.array(z.string().min(1)).optional(),

  icon: z.string().url().optional(),
  thumbnail: z.string().url().optional(),

  duration: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number().int().nonnegative().optional(),
  ),

  format: programFormatEnum.default("online"),
  level: programLevelEnum.default("beginner"),
});

export const programBaseSchema = programBaseObject.refine(
  (data) =>
    !data.originalPrice ||
    !data.basePrice ||
    data.originalPrice >= data.basePrice,
  {
    message: "Harga promo harus ≥ harga utama",
    path: ["originalPrice"],
  },
);

export const programQuickCreateSchema = programBaseObject.pick({
  title: true,
  description: true,
  categoryId: true,
});

export const programCreateSchema = programBaseSchema;

export const programUpdateSchema = programBaseObject.partial();

export type ProgramCreateInput = z.input<typeof programCreateSchema>;
export type ProgramCreateOutput = z.output<typeof programCreateSchema>;
