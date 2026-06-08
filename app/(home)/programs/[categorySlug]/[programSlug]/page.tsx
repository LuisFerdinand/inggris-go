// app/(home)/programs/[categorySlug]/[programSlug]/page.tsx
import { redirect } from "next/navigation";

import { getProgramDetail } from "@/lib/utils";
import { CATEGORIES } from "../data";
import ProgramDetailPageClient from "./client";
import { getPublicCaller, dbDetailToProgramDetail } from "../_adapters";

export const dynamic = "force-dynamic";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ categorySlug: string; programSlug: string }>;
}) {
  const { categorySlug, programSlug } = await params;

  let details: ReturnType<typeof dbDetailToProgramDetail> | null = null;

  // 1) Try the backend.
  try {
    const caller = await getPublicCaller();
    const dbDetail = await caller.publicPrograms.programDetailBySlug({
      slug: programSlug,
    });
    if (dbDetail) details = dbDetailToProgramDetail(dbDetail);
  } catch {
    // ignore → fall back to static
  }

  // 2) Static fallback.
  if (!details) {
    const meta = CATEGORIES[categorySlug];
    if (!meta) return redirect("/programs");

    const staticProgram = getProgramDetail(programSlug);
    if (!staticProgram) return redirect(`/programs/${categorySlug}`);

    details = staticProgram;
  }

  return <ProgramDetailPageClient details={details} />;
}