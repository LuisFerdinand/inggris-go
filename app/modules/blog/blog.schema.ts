// app/modules/blog/blog.schema.ts
import { z } from "zod";

const emptyToNull = (v: unknown) => (v === "" ? null : v);

export const POST_STATUS = ["draft", "published", "archived"] as const;
export type PostStatus = (typeof POST_STATUS)[number];

export const postInsertSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan tanda hubung")
    .optional()
    .or(z.literal("")),

  excerpt: z.preprocess(emptyToNull, z.string().max(500).nullable().optional()),
  content: z.any().optional(),
  contentHtml: z.preprocess(emptyToNull, z.string().nullable().optional()),
  coverImage: z.preprocess(emptyToNull, z.string().nullable().optional()),

  authorId: z.string().min(1, "Penulis wajib dipilih"),

  // Optional FK to post_category
  categoryId: z.preprocess(emptyToNull, z.string().nullable().optional()),

  status: z.enum(POST_STATUS).default("draft"),

  // Featured = shows up in hero slider on the public blog page
  isFeatured: z.boolean().default(false),

  publishedAt: z.preprocess(emptyToNull, z.string().nullable().optional()),

  readTime: z.preprocess(
    emptyToNull,
    z.coerce.number().int().positive().nullable().optional(),
  ),

  tagIds: z.array(z.string()).optional(),
});

export const postUpdateSchema = postInsertSchema
  .partial()
  .extend({ id: z.string().min(1) });

export const postFilterSchema = z.object({
  status: z.enum(POST_STATUS).optional(),
  searchQuery: z.string().optional(),
  tagId: z.string().optional(),
  categoryId: z.string().optional(),
  isFeatured: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type PostFormValues = z.infer<typeof postInsertSchema>;
export type PostFilterInput = z.infer<typeof postFilterSchema>;