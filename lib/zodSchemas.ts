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

export const onlineOrderSchema = z.object({
  type: z.literal("online"),

  programId: z.string(),
  batchId: z.string().optional(),

  fullName: z.string().min(1),
  whatsapp: z.string().min(1),
  email: z.string().email().optional(),
  age: z.number().optional(),
});

export const offlineOrderSchema = z.object({
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

export const orderSchema = z.discriminatedUnion("type", [
  onlineOrderSchema,
  offlineOrderSchema,
]);
