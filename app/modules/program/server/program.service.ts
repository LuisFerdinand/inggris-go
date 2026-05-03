import { db } from "@/app/db/db";
import { programs } from "@/app/db/schema/programs";
import { createUniqueSlug } from "./program.slug";

export async function createProgram(data: any) {
  const slug = await createUniqueSlug(data.title, data.categoryId);

  return db.insert(programs).values({
    ...data,
    slug,
  });
}
