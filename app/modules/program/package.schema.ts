// app/modules/program/package.schema.ts
import { z } from "zod";

const emptyToNull = (value: unknown) => (value === "" ? null : value);

export const packageInsertSchema = z.object({
  programId: z.string().min(1),
  batchId: z.preprocess(emptyToNull, z.string().nullable().optional()),

  title: z.string().min(2, "Judul minimal 2 karakter"),
  description: z.preprocess(emptyToNull, z.string().nullable().optional()),

  price: z.coerce.number().int().nonnegative("Harga tidak boleh negatif"),
  originalPrice: z.preprocess(
    emptyToNull,
    z.coerce.number().int().nonnegative("Harga coret tidak boleh negatif").nullable().optional(),
  ),

  isDefault: z.boolean().default(false),
  features: z.array(z.string().min(1)).optional().default([]),
});

export const packageUpdateSchema = packageInsertSchema
  .partial()
  .extend({ id: z.string().min(1) });

export type PackageFormValues = z.infer<typeof packageInsertSchema>;
