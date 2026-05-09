import { notFound } from "next/navigation";
import { CATEGORIES } from "./data";
import CategoryPageClient from "./client";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const meta = CATEGORIES[categorySlug];
  if (!meta) notFound();

  return <CategoryPageClient meta={meta} />;
}
