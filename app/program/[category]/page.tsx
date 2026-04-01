import { notFound } from "next/navigation";
import { CATEGORIES } from "./data";
import CategoryPageClient from "./client";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = CATEGORIES[category];
  if (!meta) notFound();

  return <CategoryPageClient meta={meta} />;
}
