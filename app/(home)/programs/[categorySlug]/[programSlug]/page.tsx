// app/(home)/programs/[categorySlug]/[programSlug]/page.tsx
import { cache } from "react";
import type { Metadata } from "next";
import { permanentRedirect, redirect } from "next/navigation";
import ProgramDetailPageClient from "./client";
import { getPublicCaller, dbDetailToProgramDetail } from "../_adapters";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageParams = { categorySlug: string; programSlug: string };

// Shared by generateMetadata and the page so a request hits the DB once.
const getProgramDetail = cache(async (programSlug: string) => {
  const caller = await getPublicCaller();
  return caller.publicPrograms.programDetailBySlug({ slug: programSlug });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { programSlug } = await params;
  const detail = await getProgramDetail(programSlug);

  // Unknown program: the page itself redirects to /programs.
  if (!detail) return {};

  const { program, category } = detail;

  // The canonical is always the program's own address under its real
  // category, even when the page was opened through a wrong-category URL.
  const categorySlug = category?.slug;
  const path = categorySlug
    ? `/programs/${categorySlug}/${program.slug}`
    : `/programs/${program.slug}`;

  return buildPageMetadata({
    path,
    title: program.title,
    description: program.shortDesc || program.description?.slice(0, 160),
    image: program.thumbnailUrl,
  });
}

/**
 * The CMS database is the single source of truth. There is intentionally no
 * static fallback anymore: a program that is not published in the CMS must not
 * resurface with stale hard-coded content.
 */
export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { categorySlug, programSlug } = await params;

  const dbDetail = await getProgramDetail(programSlug);

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
