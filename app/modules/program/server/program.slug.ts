import slugify from "slugify";

import { db } from "@/app/db/db";
import { programs } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export function generateSlug(title: string) {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export async function createUniqueSlug(title: string, categoryId: string) {
  const baseSlug = generateSlug(title);

  const existing = await db.query.programs.findMany({
    where: eq(programs.categoryId, categoryId),
    columns: { slug: true },
  });

  const existingSlugs = new Set(existing.map((p) => p.slug));

  if (!existingSlugs.has(baseSlug)) return baseSlug;

  let counter = 1;
  let slug = `${baseSlug}-${counter}`;

  while (existingSlugs.has(slug)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}
