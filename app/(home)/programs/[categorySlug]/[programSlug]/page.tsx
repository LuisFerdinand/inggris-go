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

  try {
    const caller = await getPublicCaller(); // auth()/context errors isolate here
    const dbDetail = await caller.publicPrograms.programDetailBySlug({
      slug: programSlug,
    });

    console.log("[programDetail]", {
      slug: programSlug,
      found: !!dbDetail,
      sectionCount: dbDetail?.sections?.length ?? 0,
      hasContentRow: dbDetail ? dbDetail.theme !== null : false,
    });

    if (dbDetail) details = dbDetailToProgramDetail(dbDetail);
  } catch (err) {
    console.error("[programDetail] DB path threw, using static:", err);
  }

  if (!details) {
    const meta = CATEGORIES[categorySlug];
    if (!meta) return redirect("/programs");
    const staticProgram = getProgramDetail(programSlug);
    if (!staticProgram) return redirect(`/programs/${categorySlug}`);
    details = staticProgram;
  }

  return <ProgramDetailPageClient details={details} />;
}