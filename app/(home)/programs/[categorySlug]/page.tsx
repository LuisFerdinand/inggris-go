// app/(home)/programs/[categorySlug]/page.tsx
import { notFound } from "next/navigation";

import { CATEGORIES } from "./data";
import CategoryPageClient from "./client";
import { getPublicCaller, dbCategoryToMeta } from "./_adapters";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;

  let meta: ReturnType<typeof dbCategoryToMeta> | null = null;

  // 1) Try the backend.
  try {
    const caller = await getPublicCaller();
    const dbCategory = await caller.publicPrograms.categoryBySlug({
      slug: categorySlug,
    });

    if (dbCategory) {
      const dbPrograms = await caller.publicPrograms.programsByCategory({
        categorySlug,
      });
      meta = dbCategoryToMeta(dbCategory, dbPrograms as any, categorySlug);
    }
  } catch {
    // ignore → fall back to static
  }

  // 2) Static fallback.
  const resolved = meta ?? CATEGORIES[categorySlug] ?? null;
  if (!resolved) notFound();

  return <CategoryPageClient meta={resolved} />;
}