import { notFound } from "next/navigation";
import ProgramRegisterPageClient from "./client";
import { trpc } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  category?: string;
  program?: string;
  batch?: string;
  // ★ package param — used for permanent programs only
  package?: string;
}>;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  await trpc.programs.getRegisterCategories.prefetch();

  const categorySlug = params.category;
  const programSlug = params.program;
  const batchSlug = params.batch;
  const packageSlug = params.package;

  if (!categorySlug && !programSlug && !batchSlug) {
    return <ProgramRegisterPageClient initialData={null} />;
  }

  try {
    const data = await trpc.programs.getRegisterContext({
      categorySlug,
      programSlug,
      batchSlug,
      packageSlug,
    });

    return <ProgramRegisterPageClient initialData={data} />;
  } catch (error) {
    notFound();
  }
}
