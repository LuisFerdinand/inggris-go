import { notFound } from "next/navigation";
import ProgramRegisterPageClient from "./client";
import { trpc } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  category?: string;
  program?: string;
  batch?: string;
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

  if (!categorySlug && !programSlug && !batchSlug) {
    return <ProgramRegisterPageClient initialData={null} />;
  }

  try {
    const data = await trpc.programs.getRegisterContext({
      categorySlug,
      programSlug,
      batchSlug,
    });

    return <ProgramRegisterPageClient initialData={data} />;
  } catch (error) {
    /**
     * Invalid category/program relation
     * should 404.
     */
    notFound();
  }
}
