// app/(home)/programs/[categorySlug]/[programSlug]/page.tsx
import { permanentRedirect, redirect } from "next/navigation";
import ProgramDetailPageClient from "./client";
import { getPublicCaller, dbDetailToProgramDetail } from "../_adapters";

export const dynamic = "force-dynamic";

/**
 * The CMS database is the single source of truth. There is intentionally no
 * static fallback anymore: a program that is not published in the CMS must not
 * resurface with stale hard-coded content.
 */
export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ categorySlug: string; programSlug: string }>;
}) {
  const { categorySlug, programSlug } = await params;

  const caller = await getPublicCaller();
  const dbDetail = await caller.publicPrograms.programDetailBySlug({
    slug: programSlug,
  });

  if (!dbDetail) {
    // Unknown / unpublished / archived program: send visitors to the catalog.
    redirect("/programs");
  }

  // Wrong category in the URL → canonical URL.
  if (dbDetail.category && dbDetail.category.slug !== categorySlug) {
    permanentRedirect(`/programs/${dbDetail.category.slug}/${programSlug}`);
  }

  return (
    <ProgramDetailPageClient details={dbDetailToProgramDetail(dbDetail)} />
  );
}
